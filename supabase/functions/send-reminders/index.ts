import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { encode as base64UrlEncode } from "https://deno.land/std@0.168.0/encoding/base64url.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface User {
    id: string;
    email: string;
    full_name: string | null;
    email_preferences: { weekly_reminders?: boolean } | null;
}

interface PushSubscription {
    endpoint: string;
    p256dh: string;
    auth: string;
}

// Helper to create VAPID JWT for Web Push authentication
async function createVapidJwt(endpoint: string, vapidPrivateKey: string, vapidPublicKey: string): Promise<string> {
    const audience = new URL(endpoint).origin;
    const expiration = Math.floor(Date.now() / 1000) + (12 * 60 * 60); // 12 hours

    const header = { alg: 'ES256', typ: 'JWT' };
    const payload = {
        aud: audience,
        exp: expiration,
        sub: 'mailto:info@spiretrack.app'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    // Import the private key for signing
    const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
    const key = await crypto.subtle.importKey(
        'raw',
        privateKeyBytes,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
    );

    // Sign the token
    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        key,
        new TextEncoder().encode(unsignedToken)
    );

    // Convert signature from DER to raw format if needed
    const signatureBytes = new Uint8Array(signature);
    const encodedSignature = base64UrlEncode(signatureBytes);

    return `${unsignedToken}.${encodedSignature}`;
}

// Helper to decode base64url
function base64UrlDecode(input: string): Uint8Array {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Send a single Web Push notification
async function sendPushNotification(
    subscription: PushSubscription, 
    payload: string, 
    vapidPublicKey: string, 
    vapidPrivateKey: string
): Promise<boolean> {
    try {
        const jwt = await createVapidJwt(subscription.endpoint, vapidPrivateKey, vapidPublicKey);

        const response = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Encoding': 'aes128gcm',
                'TTL': '86400',
                'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
                'Urgency': 'normal'
            },
            body: payload
        });

        if (!response.ok) {
            console.error(`[Push] Failed: ${response.status} ${response.statusText}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Push] Error sending notification:', error);
        return false;
    }
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

        // 1. Get all users with their email preferences
        const { data: users, error: fetchError } = await supabaseClient
            .from('users')
            .select('id, email, full_name, email_preferences')

        if (fetchError) throw fetchError

        // Filter to users who want weekly reminders (default to true if not set)
        const usersWantingReminders = (users as User[] || []).filter(user => {
            const prefs = user.email_preferences || {};
            return prefs.weekly_reminders !== false;
        });

        if (usersWantingReminders.length === 0) {
            return new Response(
                JSON.stringify({ message: 'No users to remind' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const resendKey = Deno.env.get('RESEND_API_KEY')
        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
        
        const emailResults: { email: string; status: number }[] = []
        const pushResults: { userId: string; success: boolean }[] = []

        for (const user of usersWantingReminders) {
            const email = user.email
            const name = user.full_name || 'Friend'

            // 2. Send Email
            if (email && resendKey) {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: 'SpireTrack <info@spiretrack.app>',
                        to: [email],
                        subject: 'Time for your Weekly Review',
                        html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h1 style="font-size: 24px; color: #1a1a1a; margin-bottom: 16px;">Hey ${name},</h1>
                <p style="font-size: 16px; color: #6b7280; line-height: 1.6; margin-bottom: 24px;">Another week has passed. Take 10 minutes to reflect, reset, and plan for a better next week.</p>
                <a href="https://spiretrack.app/app/review" style="display: inline-block; background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Review</a>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
                  You set this reminder for Sunday evenings. <a href="https://spiretrack.app/app/settings" style="color: #6b7280;">Manage settings</a>
                </p>
              </div>
            `
                    })
                })
                emailResults.push({ email, status: response.status })
            }

            // 3. Send Push Notification
            if (vapidPublicKey && vapidPrivateKey) {
                const { data: subscriptions } = await supabaseClient
                    .from('push_subscriptions')
                    .select('endpoint, p256dh, auth')
                    .eq('user_id', user.id)

                for (const sub of (subscriptions as PushSubscription[] || [])) {
                    try {
                        // Create push payload
                        const pushPayload = JSON.stringify({
                            title: 'Weekly Review Reminder',
                            body: 'Time to reflect on your week. Tap to start your review.',
                            url: '/app/review'
                        })

                        // Send the actual push notification
                        const success = await sendPushNotification(
                            sub, 
                            pushPayload, 
                            vapidPublicKey, 
                            vapidPrivateKey
                        );
                        
                        console.log(`[send-reminders] Push to ${sub.endpoint}: ${success ? 'success' : 'failed'}`);
                        pushResults.push({ userId: user.id, success });
                    } catch (pushError) {
                        console.error('[send-reminders] Push failed:', pushError)
                        pushResults.push({ userId: user.id, success: false })
                    }
                }
            }
        }

        return new Response(
            JSON.stringify({ 
                emails: { sent: emailResults.length, details: emailResults },
                push: { sent: pushResults.filter(r => r.success).length, details: pushResults }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: Error | unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

