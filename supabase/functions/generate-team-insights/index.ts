import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TeamInsightsRequest {
    team_id: string;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { team_id }: TeamInsightsRequest = await req.json()

        if (!team_id) {
            return new Response(
                JSON.stringify({ error: 'team_id is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 1. Fetch team data for analysis
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get team members - removed users join since relation may not exist
        console.log('[generate-team-insights] Fetching data for team:', team_id);
        
        const { data: members, error: membersError } = await supabaseClient
            .from('team_members')
            .select('user_id')
            .eq('team_id', team_id);

        console.log('[generate-team-insights] Members:', { count: members?.length, error: membersError });

        const memberCount = members?.length || 0;
        const memberIds = members?.map(m => m.user_id) || [];

        // Get weekly reviews from team members (current month) - removed status column
        const { data: reviews, error: reviewsError } = await supabaseClient
            .from('team_weekly_reviews')
            .select('user_id, week_start, responses, created_at')
            .eq('team_id', team_id)
            .gte('week_start', monthStart.toISOString())
            .order('week_start', { ascending: false });

        console.log('[generate-team-insights] Reviews:', { count: reviews?.length, error: reviewsError });

        // Get tasks - using channel_tasks table (where tasks are actually stored)
        const { data: tasks, error: tasksError } = await supabaseClient
            .from('channel_tasks')
            .select('status, priority, created_at')
            .eq('team_id', team_id);

        console.log('[generate-team-insights] Tasks:', { count: tasks?.length, error: tasksError });

        // Skip decisions query - table doesn't exist
        const decisions: any[] = [];
        console.log('[generate-team-insights] Decisions: skipped (table does not exist)');

        // Calculate metrics
        const totalReviews = reviews?.length || 0;
        const expectedReviews = memberCount * 4; // 4 weeks per month
        const submissionRate = expectedReviews > 0 ? (totalReviews / expectedReviews) * 100 : 0;

        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
        const totalTasks = tasks?.length || 0;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Extract scores from responses (team_weekly_reviews format)
        const avgStress = reviews?.reduce((sum: number, r: any) => {
            const stress = r.responses?.stress_level || r.responses?.stress || r.scores?.stress || 5;
            return sum + stress;
        }, 0) / (totalReviews || 1);
        
        const avgFocus = reviews?.reduce((sum: number, r: any) => {
            const focus = r.responses?.focus_level || r.responses?.focus || r.scores?.focus || 5;
            return sum + focus;
        }, 0) / (totalReviews || 1);

        console.log('[generate-team-insights] Metrics:', { memberCount, totalReviews, totalTasks, decisions: decisions?.length });

        // Check if we have sufficient data
        if (memberCount === 0) {
            return new Response(
                JSON.stringify({ 
                    error: 'No team members found',
                    message: 'Add team members before generating insights'
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (totalReviews === 0 && totalTasks === 0 && (decisions?.length || 0) === 0) {
            return new Response(
                JSON.stringify({ 
                    error: 'Insufficient data',
                    message: 'Team needs to submit weekly reviews, create tasks, or log decisions before AI can generate insights'
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Build AI prompt
        const prompt = `You are an enterprise operations analyst reviewing team performance data.

TEAM METRICS (CURRENT MONTH):
• Team size: ${memberCount} members
• Review submission rate: ${submissionRate.toFixed(1)}% (${totalReviews}/${expectedReviews} expected)
• Task completion rate: ${taskCompletionRate.toFixed(1)}% (${completedTasks}/${totalTasks})
• Average stress score: ${avgStress.toFixed(1)}/10
• Average focus score: ${avgFocus.toFixed(1)}/10
• Decisions logged: ${decisions?.length || 0}

STRICT RULES:
• Analyze ONLY the provided metrics
• Do NOT add external knowledge
• Do NOT make assumptions beyond the data
• Use analytical, neutral, executive tone
• Be specific and concrete
• If data is insufficient, say so explicitly

REQUIRED OUTPUT (VALID JSON ONLY):
{
  "team_health_status": "stable | fragile | deteriorating",
  "primary_constraint": "What is limiting team execution based on metrics",
  "execution_gap": "Where plans break in practice (based on completion rates)",
  "risk_next_30_days": "Most probable failure mode if trends continue",
  "recommended_manager_action": "Specific intervention based on data",
  "warning_if_ignored": "Operational consequence if no action taken"
}

Return ONLY valid JSON. No markdown. No explanations.`

        // 2. Call OpenRouter
        const openrouterKey = Deno.env.get('OPENROUTER_API_KEY')
        if (!openrouterKey) {
            console.error('Missing OPENROUTER_API_KEY')
            return new Response(
                JSON.stringify({ error: 'AI service not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openrouterKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://spiretrack.app',
                'X-Title': 'SpireTrack'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 1500,
                response_format: { type: 'json_object' }
            })
        })

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text()
            console.error('OpenRouter error:', aiResponse.status, errorText)
            return new Response(
                JSON.stringify({ error: 'AI service error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const aiResult = await aiResponse.json()
        const content = aiResult.choices?.[0]?.message?.content

        if (!content) {
            return new Response(
                JSON.stringify({ error: 'No response from AI' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const parsedOutput = JSON.parse(content)

        // 3. Store AI context for follow-up chat
        const { data: context, error: contextError } = await supabaseClient
            .from('ai_contexts')
            .insert({
                context_type: 'team_insight',
                source_entity_id: team_id,
                team_id: team_id,
                ai_output: parsedOutput
            })
            .select('id')
            .single()

        if (contextError) {
            console.error('Failed to create AI context:', contextError)
        }

        // 4. Return response
        return new Response(
            JSON.stringify({
                insights: parsedOutput,
                context_id: context?.id || null,
                metrics: {
                    member_count: memberCount,
                    submission_rate: submissionRate,
                    task_completion_rate: taskCompletionRate,
                    avg_stress: avgStress,
                    avg_focus: avgFocus,
                    decisions_count: decisions?.length || 0
                }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: Error | unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error in generate-team-insights:', message)
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
