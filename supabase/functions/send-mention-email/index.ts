import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
    user_id: string;
    type: string;
    title: string;
    body: string;
    link: string;
    metadata: {
        team_id?: string;
        channel_id?: string;
        message_id?: string;
        sender_id?: string;
    };
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

        // Parse the notification payload
        const notification: NotificationPayload = await req.json()
        
        // Only handle 'mention' type notifications
        if (notification.type !== 'mention') {
            return new Response(
                JSON.stringify({ message: 'Not a mention notification, skipping' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Fetch the mentioned user's email and preferences
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('email, full_name, email_preferences')
            .eq('id', notification.user_id)
            .single()

        if (userError || !user) {
            console.error('Error fetching user:', userError)
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check if user wants mention emails (default to true if not set)
        const emailPrefs = user.email_preferences || {}
        if (emailPrefs.mentions === false) {
            return new Response(
                JSON.stringify({ message: 'User has disabled mention notifications' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Send email via Resend
        const resendKey = Deno.env.get('RESEND_API_KEY')
        if (!resendKey || !user.email) {
            console.warn('Missing RESEND_API_KEY or user email')
            return new Response(
                JSON.stringify({ error: 'Email configuration missing' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const userName = user.full_name || 'there'
        const baseUrl = 'https://spiretrack.app'

        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'SpireTrack <info@spiretrack.app>',
                to: [user.email],
                subject: notification.title,
                html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 500px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
      <div style="margin-bottom: 32px;">
        <img src="https://i.ibb.co/fYG4b0bc/spiretracklogo.png" alt="SpireTrack" width="40" height="40" style="display: block;">
      </div>
      
      <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px;">
        ${notification.title}
      </h1>
      
      <p style="font-size: 15px; color: #525252; line-height: 1.6; margin: 0 0 28px;">
        Hey ${userName}, someone mentioned you in a conversation:
      </p>
      
      <div style="background: #f5f5f5; border-left: 3px solid #10b981; padding: 16px; border-radius: 0 6px 6px 0; margin-bottom: 28px;">
        <p style="margin: 0; color: #525252; font-size: 14px; line-height: 1.6; font-style: italic;">
          "${notification.body}"
        </p>
      </div>
      
      <div style="margin-bottom: 28px;">
        <a href="${baseUrl}${notification.link}" style="display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">
          View Conversation
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e5e5; padding-top: 20px;">
        <p style="font-size: 13px; color: #737373; margin: 0;">
          You can <a href="${baseUrl}/app/settings" style="color: #10b981;">manage notification settings</a> anytime.
        </p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 24px;">
      <p style="color: #a3a3a3; font-size: 12px; margin: 0;">© SpireTrack. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
                `
            })
        })

        if (!emailResponse.ok) {
            const errorData = await emailResponse.text()
            console.error('Resend error:', emailResponse.status, errorData)
            return new Response(
                JSON.stringify({ error: 'Failed to send email' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const result = await emailResponse.json()
        console.log('Mention email sent:', result.id)

        return new Response(
            JSON.stringify({ success: true, email_id: result.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: Error | unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Error in send-mention-email:', message)
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
