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
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get all users
        const { data: users, error: userError } = await supabaseClient
            .from('users')
            .select('id')

        if (userError) throw userError

        if (!users || users.length === 0) {
            return new Response(JSON.stringify({ message: 'No users' }), { headers: corsHeaders })
        }

        const results = []

        // 2. Analyze each user
        for (const user of users) {
            // Fetch last 4 reviews
            const { data: reviews } = await supabaseClient
                .from('weekly_reviews')
                .select('ai_output')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .order('week_start_date', { ascending: false })
                .limit(4)

            if (!reviews || reviews.length < 2) continue

            // Construct Prompt for Pattern Analysis
            const prompt = `
        Analyze these ${reviews.length} weekly reviews for patterns.
        Reviews: ${JSON.stringify(reviews)}
        
        Identify:
        1. Recurring blockers
        2. Positive streaks
        3. One key suggestion for next month
        
        Output JSON: { "summary_tags": ["tag1", "tag2"], "suggestions": "text" }
      `

            const { generateText } = await import('../_shared/ai/aiClient.ts');
            const generatedText = await generateText(prompt, {
                responseFormat: 'json',
                temperature: 0.2
            });

            const parsed = JSON.parse(generatedText);

            // Save to patterns table
            await supabaseClient
                .from('patterns')
                .insert({
                    user_id: user.id,
                    analysis_date: new Date().toISOString(),
                    summary_tags: parsed.summary_tags,
                    suggestions: parsed.suggestions
                })

            results.push({ user_id: user.id, status: 'analyzed' })
        }

        return new Response(
            JSON.stringify({ processed: results.length, details: results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
