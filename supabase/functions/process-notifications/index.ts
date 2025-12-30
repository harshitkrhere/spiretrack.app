import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { encode as base64UrlEncode } from "https://deno.land/std@0.168.0/encoding/base64url.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types
interface NotificationQueueItem {
    id: string;
    user_id: string;
    notification_type: string;
    title: string;
    body: string;
    url: string;
    data: Record<string, unknown>;
    attempts: number;
}

interface NotificationPreferences {
    notifications_enabled: boolean;
    chat_mode: 'all' | 'mentions' | 'mute';
    team_activity: boolean;
    task_updates: boolean;
    system_alerts: boolean;
    account_security: boolean;
}

interface PushSubscription {
    endpoint: string;
    p256dh: string;
    auth: string;
    delivery_type: string;
}

// ============================================
// VAPID JWT CREATION (for web push auth)
// ============================================
async function createVapidJwt(endpoint: string, vapidPrivateKey: string): Promise<string> {
    const audience = new URL(endpoint).origin;
    const expiration = Math.floor(Date.now() / 1000) + (12 * 60 * 60);

    const header = { alg: 'ES256', typ: 'JWT' };
    const payload = {
        aud: audience,
        exp: expiration,
        sub: 'mailto:info@spiretrack.app'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
    const key = await crypto.subtle.importKey(
        'raw',
        privateKeyBytes,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        key,
        new TextEncoder().encode(unsignedToken)
    );

    const signatureBytes = new Uint8Array(signature);
    const encodedSignature = base64UrlEncode(signatureBytes);

    return `${unsignedToken}.${encodedSignature}`;
}

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

// ============================================
// SEND WEB PUSH NOTIFICATION
// ============================================
async function sendWebPush(
    subscription: PushSubscription,
    payload: string,
    vapidPublicKey: string,
    vapidPrivateKey: string
): Promise<boolean> {
    try {
        const jwt = await createVapidJwt(subscription.endpoint, vapidPrivateKey);

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
        console.error('[Push] Error:', error);
        return false;
    }
}

// ============================================
// CHECK USER PREFERENCES
// ============================================
function shouldSendNotification(
    prefs: NotificationPreferences | null,
    notificationType: string
): boolean {
    // Default preferences if none exist
    if (!prefs) {
        prefs = {
            notifications_enabled: true,
            chat_mode: 'all',
            team_activity: true,
            task_updates: true,
            system_alerts: true,
            account_security: true
        };
    }

    // Global master toggle check
    if (!prefs.notifications_enabled) {
        console.log('[Prefs] Master toggle OFF - skipping');
        return false;
    }

    // Check by notification type
    switch (notificationType) {
        case 'chat_message':
            // Only send if chat_mode is 'all'
            if (prefs.chat_mode === 'mute') {
                console.log('[Prefs] Chat muted - skipping chat_message');
                return false;
            }
            if (prefs.chat_mode === 'mentions') {
                console.log('[Prefs] Mentions only - skipping chat_message');
                return false;
            }
            return true;

        case 'chat_mention':
            // Send if chat_mode is 'all' or 'mentions' (not 'mute')
            if (prefs.chat_mode === 'mute') {
                console.log('[Prefs] Chat muted - skipping chat_mention');
                return false;
            }
            return true;

        case 'team_activity':
            return prefs.team_activity;

        case 'task_update':
            return prefs.task_updates;

        case 'system_alert':
            return prefs.system_alerts;

        case 'account_security':
            return prefs.account_security;

        default:
            console.log(`[Prefs] Unknown type: ${notificationType} - allowing`);
            return true;
    }
}

// ============================================
// MAIN HANDLER
// ============================================
serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
        const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')

        if (!vapidPublicKey || !vapidPrivateKey) {
            console.error('[process-notifications] Missing VAPID keys');
            return new Response(
                JSON.stringify({ error: 'Push service not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Fetch pending notifications (batch of 50)
        const { data: pendingQueue, error: fetchError } = await supabaseClient
            .from('notification_queue')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(50)

        if (fetchError) throw fetchError

        if (!pendingQueue || pendingQueue.length === 0) {
            return new Response(
                JSON.stringify({ message: 'No pending notifications', processed: 0 }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[process-notifications] Processing ${pendingQueue.length} notifications`);

        const results = {
            sent: 0,
            skipped: 0,
            failed: 0,
            details: [] as { id: string; status: string; reason?: string }[]
        }

        for (const item of pendingQueue as NotificationQueueItem[]) {
            try {
                // 1. Fetch user preferences
                const { data: prefs } = await supabaseClient
                    .from('notification_preferences')
                    .select('*')
                    .eq('user_id', item.user_id)
                    .single()

                // 2. Check if should send based on preferences
                if (!shouldSendNotification(prefs, item.notification_type)) {
                    // Mark as skipped
                    await supabaseClient
                        .from('notification_queue')
                        .update({
                            status: 'skipped',
                            processed_at: new Date().toISOString(),
                            error_message: 'User preferences blocked'
                        })
                        .eq('id', item.id)

                    results.skipped++
                    results.details.push({ id: item.id, status: 'skipped', reason: 'preferences' })
                    continue
                }

                // 3. Fetch user's push subscriptions (web only for now)
                const { data: subscriptions } = await supabaseClient
                    .from('push_subscriptions')
                    .select('endpoint, p256dh, auth, delivery_type')
                    .eq('user_id', item.user_id)

                if (!subscriptions || subscriptions.length === 0) {
                    // No subscriptions - mark as skipped
                    await supabaseClient
                        .from('notification_queue')
                        .update({
                            status: 'skipped',
                            processed_at: new Date().toISOString(),
                            error_message: 'No push subscriptions'
                        })
                        .eq('id', item.id)

                    results.skipped++
                    results.details.push({ id: item.id, status: 'skipped', reason: 'no_subscription' })
                    continue
                }

                // 4. Send to all subscriptions
                const pushPayload = JSON.stringify({
                    title: item.title || 'SpireTrack',
                    body: item.body,
                    url: item.url || '/app',
                    tag: item.notification_type, // For grouping
                    data: item.data
                })

                let anySent = false
                for (const sub of subscriptions as PushSubscription[]) {
                    if (sub.delivery_type === 'web') {
                        const success = await sendWebPush(sub, pushPayload, vapidPublicKey, vapidPrivateKey)
                        if (success) anySent = true
                    }
                    // Future: handle 'ios' and 'android' delivery types
                }

                // 5. Update queue status
                if (anySent) {
                    await supabaseClient
                        .from('notification_queue')
                        .update({
                            status: 'sent',
                            processed_at: new Date().toISOString(),
                            attempts: item.attempts + 1
                        })
                        .eq('id', item.id)

                    results.sent++
                    results.details.push({ id: item.id, status: 'sent' })
                } else {
                    // All delivery attempts failed
                    const newAttempts = item.attempts + 1
                    const maxRetries = 3

                    if (newAttempts >= maxRetries) {
                        await supabaseClient
                            .from('notification_queue')
                            .update({
                                status: 'failed',
                                processed_at: new Date().toISOString(),
                                attempts: newAttempts,
                                error_message: 'Max retries exceeded'
                            })
                            .eq('id', item.id)

                        results.failed++
                        results.details.push({ id: item.id, status: 'failed', reason: 'max_retries' })
                    } else {
                        // Keep as pending for retry
                        await supabaseClient
                            .from('notification_queue')
                            .update({ attempts: newAttempts })
                            .eq('id', item.id)

                        results.failed++
                        results.details.push({ id: item.id, status: 'retry', reason: 'delivery_failed' })
                    }
                }

            } catch (itemError) {
                console.error(`[process-notifications] Error processing ${item.id}:`, itemError)
                
                await supabaseClient
                    .from('notification_queue')
                    .update({
                        status: 'failed',
                        processed_at: new Date().toISOString(),
                        attempts: item.attempts + 1,
                        error_message: itemError instanceof Error ? itemError.message : 'Unknown error'
                    })
                    .eq('id', item.id)

                results.failed++
                results.details.push({ id: item.id, status: 'failed', reason: 'exception' })
            }
        }

        console.log(`[process-notifications] Complete: sent=${results.sent}, skipped=${results.skipped}, failed=${results.failed}`);

        return new Response(
            JSON.stringify({
                message: 'Queue processed',
                processed: pendingQueue.length,
                ...results
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: Error | unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[process-notifications] Fatal error:', message)
        return new Response(
            JSON.stringify({ error: message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
