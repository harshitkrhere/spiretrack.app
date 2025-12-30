import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface NotificationPayload {
    id: string;
    notification_type: string;
    title: string;
    body: string;
    url: string;
    data: Record<string, unknown>;
}

/**
 * Hook to listen for real-time notifications and show them via browser Notification API
 */
export function useNotificationListener() {
    const { user } = useAuth();

    const showNotification = useCallback((payload: NotificationPayload) => {
        // Check if browser supports notifications
        if (!('Notification' in window)) {

            return;
        }

        // Check permission
        if (Notification.permission !== 'granted') {

            return;
        }

        // Show the notification
        const notification = new Notification(payload.title || 'SpireTrack', {
            body: payload.body,
            icon: '/logo.png',
            badge: '/logo.png',
            tag: payload.notification_type, // Group by type
            data: { url: payload.url, ...payload.data }
        });

        // Handle click
        notification.onclick = () => {
            window.focus();
            if (payload.url) {
                window.location.href = payload.url;
            }
            notification.close();
        };

        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);
    }, []);

    useEffect(() => {
        if (!user) return;



        // Subscribe to new notifications in the queue for this user
        const channel = supabase
            .channel('notification-listener')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notification_queue',
                    filter: `user_id=eq.${user.id}`
                },
                async (payload) => {

                    
                    const notification = payload.new as NotificationPayload;
                    
                    // Check user preferences first
                    const { data: prefs } = await supabase
                        .from('notification_preferences')
                        .select('notifications_enabled, chat_mode')
                        .eq('user_id', user.id)
                        .single();

                    // Check master toggle
                    if (prefs && !prefs.notifications_enabled) {

                        return;
                    }

                    // Check chat mode
                    if (notification.notification_type === 'chat_message' && prefs?.chat_mode === 'mentions') {

                        return;
                    }
                    if (notification.notification_type === 'chat_message' && prefs?.chat_mode === 'mute') {

                        return;
                    }
                    if (notification.notification_type === 'chat_mention' && prefs?.chat_mode === 'mute') {

                        return;
                    }

                    // Show the notification
                    showNotification(notification);

                    // Mark as sent in queue
                    await supabase
                        .from('notification_queue')
                        .update({ 
                            status: 'sent', 
                            processed_at: new Date().toISOString() 
                        })
                        .eq('id', notification.id);
                }
            )
            .subscribe();

        return () => {

            supabase.removeChannel(channel);
        };
    }, [user, showNotification]);
}
