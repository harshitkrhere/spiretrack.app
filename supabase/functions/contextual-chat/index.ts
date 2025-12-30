import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
    context_id: string;
    message: string;
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

        const { context_id, message }: ChatRequest = await req.json()

        if (!context_id || !message) {
            return new Response(
                JSON.stringify({ error: 'context_id and message are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // RATE LIMITING: Check if user has exceeded token quota (1000 tokens per 2 hours)
        const MAX_TOKENS_PER_WINDOW = 1000;
        const WINDOW_HOURS = 2;
        
        // First, get the user from the context
        const { data: contextForUser } = await supabaseClient
            .from('ai_contexts')
            .select('user_id')
            .eq('id', context_id)
            .single()

        if (contextForUser?.user_id) {
            // Sum tokens used in the last 2 hours
            const windowStart = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString()
            const { data: usageData } = await supabaseClient
                .from('ai_usage_log')
                .select('tokens_used')
                .eq('user_id', contextForUser.user_id)
                .eq('function_name', 'contextual-chat')
                .gte('created_at', windowStart)

            const tokensConsumed = usageData?.reduce((sum, row) => sum + (row.tokens_used || 0), 0) ?? 0

            if (tokensConsumed >= MAX_TOKENS_PER_WINDOW) {
                return new Response(
                    JSON.stringify({ 
                        error: `Token limit reached. You have used ${tokensConsumed} of ${MAX_TOKENS_PER_WINDOW} tokens. Limit resets every ${WINDOW_HOURS} hours.`,
                        tokens_used: tokensConsumed,
                        tokens_limit: MAX_TOKENS_PER_WINDOW,
                        retry_after: `${WINDOW_HOURS} hours`
                    }),
                    { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        }

        // 1. Fetch AI context
        const { data: context, error: contextError } = await supabaseClient
            .from('ai_contexts')
            .select('*')
            .eq('id', context_id)
            .single()

        if (contextError || !context) {
            console.error('Context fetch error:', contextError)
            return new Response(
                JSON.stringify({ error: 'Context not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Fetch conversation history
        const { data: messages, error: messagesError } = await supabaseClient
            .from('ai_context_messages')
            .select('role, content, created_at')
            .eq('context_id', context_id)
            .order('created_at', { ascending: true })
            .limit(20) // Last 20 messages

        if (messagesError) {
            console.error('Messages fetch error:', messagesError)
        }

        const conversationHistory = messages || []

        // 3. Build system prompt - Make AI a helpful advisor, not restrictive
        const systemPrompt = `You are Spire AI, an expert team performance coach and operations strategist built into SpireTrack, a team productivity platform.

You are having a conversation with a team leader who wants to understand their team's performance and get actionable advice.

YOUR ROLE:
• You are a wise, experienced advisor who genuinely wants to help
• You have deep knowledge of team dynamics, productivity, management best practices
• You understand their team's current data and can provide specific, contextual advice
• You can discuss strategies, solutions, and recommendations freely
• You should be conversational, supportive, and insightful

TEAM DATA & ANALYSIS:
${JSON.stringify(context.ai_output, null, 2)}

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role === 'user' ? 'Team Leader' : 'You'}: ${m.content}`).join('\n')}

GUIDELINES:
• Use the team data as your foundation, but feel free to offer broader management insights
• Give specific, actionable recommendations when asked
• Explain the "why" behind your suggestions
• If they ask about something not in the data, use your expertise to provide general best practices
• Be warm but professional - like a mentor
• Use bullet points and clear structure for complex advice
• Don't be afraid to give detailed, thorough responses

CURRENT QUESTION FROM TEAM LEADER:
${message}

Respond as a helpful advisor who genuinely wants this team to succeed:`

        // 4. Call OpenRouter
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
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,  // More creative responses
                max_tokens: 1000   // Limited to control costs
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
        const assistantMessage = aiResult.choices?.[0]?.message?.content

        if (!assistantMessage) {
            return new Response(
                JSON.stringify({ error: 'No response from AI' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 5. Store both messages
        const messagesToInsert = [
            {
                context_id,
                role: 'user',
                content: message
            },
            {
                context_id,
                role: 'assistant',
                content: assistantMessage
            }
        ]

        const { error: insertError } = await supabaseClient
            .from('ai_context_messages')
            .insert(messagesToInsert)

        if (insertError) {
            console.error('Message insert error:', insertError)
        }

        // 5b. Log AI usage for rate limiting
        if (context.user_id) {
            await supabaseClient
                .from('ai_usage_log')
                .insert({
                    user_id: context.user_id,
                    function_name: 'contextual-chat',
                    tokens_used: aiResult.usage?.total_tokens ?? 0
                })
        }

        // 6. Return response
        return new Response(
            JSON.stringify({
                message: assistantMessage,
                context_type: context.context_type
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: Error | unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error in contextual-chat:', message)
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
