import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { review_id } = await req.json()

        if (!review_id) {
            throw new Error('Review ID is required')
        }

        // 1. Fetch the review data
        const { data: review, error: fetchError } = await supabaseClient
            .from('weekly_reviews')
            .select('*, users(full_name, language, email, email_preferences)')
            .eq('id', review_id)
            .single()

        if (fetchError || !review) {
            throw new Error('Review not found')
        }

        // RATE LIMITING: Max 5 review submissions per day
        const MAX_REVIEWS_PER_DAY = 5;
        const adminClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count } = await adminClient
            .from('ai_usage_log')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', review.user_id)
            .eq('function_name', 'submit-review')
            .gte('created_at', oneDayAgo)

        if ((count ?? 0) >= MAX_REVIEWS_PER_DAY) {
            return new Response(
                JSON.stringify({ 
                    error: 'Rate limit exceeded. You can submit up to 5 reviews per day.',
                    retry_after: '24 hours'
                }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Construct Professional Analysis Prompt
        const answers = review.answers || {};
        const userScores = {
            focus: parseInt(answers.focus_score) || null,
            mood: parseInt(answers.mood_score) || null,
            stress: parseInt(answers.stress_score) || null,
            sleep: parseInt(answers.sleep_score) || null
        };

        const prompt = `You are an analytical performance advisor for professionals.

You are given structured weekly review data filled by a user.
DO NOT repeat what the user wrote.
DO NOT paraphrase their answers.
DO NOT summarize inputs.
DO NOT say "you said" or "you mentioned".

Your job is to produce NEW insights the user did not explicitly state.

----------------------------
USER DATA (for analysis only - do not restate)
----------------------------
Scores: Focus=${userScores.focus || '?'}/10, Mood=${userScores.mood || '?'}/10, Stress=${userScores.stress || '?'}/10, Sleep=${userScores.sleep || '?'}/10
Raw Inputs: ${JSON.stringify(answers)}

----------------------------
ANALYSIS RULES (STRICT)
----------------------------
1. Every insight must add value beyond the form.
2. Be specific, concrete, and actionable.
3. Use causal language (because, therefore, leading to).
4. Think like a manager reviewing performance, not a therapist.
5. No emojis. No hype. No shaming. No therapy language.

----------------------------
OUTPUT (valid JSON only)
----------------------------
{
  "executive_summary": "6-7 sentences focusing on performance trajectory and tradeoffs. Explain what actually limited results this week.",
  "key_patterns": ["Cross-metric pattern 1", "Pattern 2", "Pattern 3"],
  "root_causes": ["Systemic reason 1 (not surface behavior)", "Reason 2"],
  "hidden_risks": ["Forward-looking risk 1", "Risk 2"],
  "leverage_points": ["Small change with high impact 1", "Point 2"],
  "next_week_actions": {
    "must_do": ["Non-negotiable action 1", "Action 2"],
    "stop_doing": ["Behavior to remove"],
    "experiment": "ONE specific experiment to test next week"
  },
  "accountability_statement": "One firm, direct sentence holding user accountable",
  "focus_score": ${userScores.focus || 5},
  "mood_score": ${userScores.mood || 5},
  "stress_score": ${userScores.stress || 5},
  "sleep_score": ${userScores.sleep || 5}
}

Return ONLY valid JSON. No markdown. No explanations.`

        // 3. Call AI via abstraction layer
        const { generateText } = await import('../_shared/ai/aiClient.ts');
        let generatedText = await generateText(prompt, {
            responseFormat: 'json',
            temperature: 0.2
        });
        
        // Clean up markdown code blocks if present
        generatedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
        
        const parsedOutput = JSON.parse(generatedText)

        // Ensure we use the user's scores if they exist, overriding AI if it hallucinated something else
        if (userScores.focus) parsedOutput.focus_score = userScores.focus;
        if (userScores.mood) parsedOutput.mood_score = userScores.mood;
        if (userScores.stress) parsedOutput.stress_score = userScores.stress;
        if (userScores.sleep) parsedOutput.sleep_score = userScores.sleep;

        // 4. Update Database
        const { error: updateError } = await supabaseClient
            .from('weekly_reviews')
            .update({
                ai_output: parsedOutput,
                scores: {
                    focus: parsedOutput.focus_score,
                    mood: parsedOutput.mood_score,
                    stress: parsedOutput.stress_score,
                    sleep: parsedOutput.sleep_score
                },
                status: 'completed'
            })
            .eq('id', review_id)

        if (updateError) throw updateError

        // 4b. Log AI usage for rate limiting
        await adminClient
            .from('ai_usage_log')
            .insert({
                user_id: review.user_id,
                function_name: 'submit-review',
                tokens_used: 0 // Token count not available from abstraction layer
            })

        // 5. Send Report Email via Resend (respecting user preferences)
        const resendKey = Deno.env.get('RESEND_API_KEY')
        const userEmail = review.users?.email
        const emailPrefs = review.users?.email_preferences || {};
        const wantsReportEmails = emailPrefs.report_notifications !== false; // Default to true
        
        if (resendKey && userEmail && wantsReportEmails) {
            console.log(`Attempting to send email to ${userEmail} via Resend...`);
            const emailResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'SpireTrack <info@spiretrack.app>',
                    to: [userEmail],
                    subject: 'Your Weekly Review Report',
                    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Review</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background: #18181b; padding: 32px; text-align: center; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; text-decoration: none; }
    .content { padding: 40px 32px; }
    .h1 { font-size: 24px; font-weight: 700; color: #18181b; margin: 0 0 16px; letter-spacing: -0.5px; }
    .p { font-size: 16px; line-height: 1.6; color: #52525b; margin: 0 0 24px; }
    .summary-box { background: #f4f4f5; border-left: 4px solid #2563eb; padding: 20px; border-radius: 4px; margin-bottom: 32px; }
    .summary-text { font-style: italic; color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0; }
    .scores-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px; }
    .score-card { background: #fafafa; padding: 16px; border-radius: 12px; text-align: center; border: 1px solid #e4e4e7; }
    .score-val { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
    .score-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; }
    .action-list { list-style: none; padding: 0; margin: 0 0 32px; }
    .action-item { padding: 12px 0; border-bottom: 1px solid #e4e4e7; color: #3f3f46; font-size: 16px; display: flex; align-items: flex-start; }
    .action-item:before { content: "→"; color: #2563eb; font-weight: bold; margin-right: 12px; }
    .btn-container { text-align: center; margin-top: 40px; }
    .btn { background: #18181b; color: #ffffff; padding: 16px 32px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; transition: background 0.2s; }
    .footer { background: #fafafa; padding: 24px; text-align: center; font-size: 12px; color: #a1a1aa; border-top: 1px solid #e4e4e7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://spiretrack.app" class="logo">Spire Track</a>
    </div>
    <div class="content">
      <h1 class="h1">Your Weekly Insight 🧠</h1>
      <p class="p">Here is the AI analysis of your week. Take a moment to reflect on these patterns.</p>
      
      <div class="summary-box">
        <p class="summary-text">"${parsedOutput.executive_summary || parsedOutput.summary || 'Your weekly analysis is ready.'}"</p>
      </div>

      <div class="scores-grid">
        <div class="score-card">
          <div class="score-val" style="color: #2563eb;">${parsedOutput.focus_score || '-'}</div>
          <div class="score-label">Focus</div>
        </div>
        <div class="score-card">
          <div class="score-val" style="color: #9333ea;">${parsedOutput.mood_score || '-'}</div>
          <div class="score-label">Mood</div>
        </div>
        <div class="score-card">
          <div class="score-val" style="color: #f97316;">${parsedOutput.stress_score || '-'}</div>
          <div class="score-label">Stress</div>
        </div>
      </div>

      <h3 style="font-size: 18px; font-weight: 600; color: #18181b; margin-bottom: 16px;">This Week's Actions</h3>
      <ul class="action-list">
        ${(parsedOutput.next_week_actions?.must_do || parsedOutput.fix_plan || []).map((item: string) => `<li class="action-item">${item}</li>`).join('')}
      </ul>

      <div class="btn-container">
        <a href="https://spiretrack.app/app/report/${review_id}" class="btn">View Full Report</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Spire Track. Keep growing.</p>
    </div>
  </div>
</body>
</html>
                        `
                })
            })

            if (!emailResponse.ok) {
                const errorData = await emailResponse.text();
                console.error('Resend Error:', emailResponse.status, errorData);
            } else {
                const result = await emailResponse.json();
                console.log('Email sent successfully via Resend:', result.id);
            }
        } else {
            console.warn('Missing RESEND_API_KEY or User Email');
        }

        return new Response(
            JSON.stringify(parsedOutput),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
