import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ReminderEvent {
    id: string;
    title: string;
    start_datetime: string;
    reminder_minutes: number;
}

// Track which reminders we've already shown (persists across re-renders)
const shownReminders = new Set<string>();

export const useCalendarReminders = () => {
    const { user } = useAuth();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const checkReminders = useCallback(async () => {
        if (!user) {

            return;
        }

        // Check notification support
        if (!('Notification' in window)) {

            return;
        }

        // Request notification permission if not granted
        if (Notification.permission === 'default') {

            await Notification.requestPermission();
        }

        if (Notification.permission !== 'granted') {

            return;
        }

        const now = new Date();

        
        // Fetch events with reminders:
        // - Starting in the next 2 hours, OR
        // - Started within the last 30 minutes (catch missed reminders)
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
        
        const { data: events, error } = await supabase
            .from('calendar_events')
            .select('id, title, start_datetime, reminder_minutes')
            .eq('user_id', user.id)
            .not('reminder_minutes', 'is', null)
            .gte('start_datetime', thirtyMinutesAgo.toISOString())
            .lte('start_datetime', twoHoursFromNow.toISOString());

        if (error) {
            console.error('[Reminders] Error fetching:', error);
            return;
        }



        // Check each event
        (events as ReminderEvent[])?.forEach((event) => {
            const eventStart = new Date(event.start_datetime);
            const reminderTime = new Date(eventStart.getTime() - event.reminder_minutes * 60 * 1000);
            const reminderKey = `${event.id}-${event.reminder_minutes}`;
            
            // Time difference between now and when reminder should fire
            const timeSinceReminder = now.getTime() - reminderTime.getTime();
            

            
            // Fire reminder if:
            // 1. The reminder time has passed (timeSinceReminder >= 0)
            // 2. The event hasn't started yet (or started within last 5 min)
            // 3. We haven't shown this reminder
            const eventAlreadyOver = now.getTime() > eventStart.getTime() + 5 * 60 * 1000;
            
            if (timeSinceReminder >= 0 && !eventAlreadyOver && !shownReminders.has(reminderKey)) {

                
                // Show notification
                const notification = new Notification('📅 Calendar Reminder', {
                    body: `${event.title} starts in ${event.reminder_minutes} minutes`,
                    icon: '/favicon.ico',
                    tag: reminderKey,
                    requireInteraction: true, // Keep notification visible
                });

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
                
                shownReminders.add(reminderKey);
            }
        });
    }, [user]);

    useEffect(() => {
        if (!user) return;



        // Check immediately on mount
        checkReminders();

        // Check every 15 seconds (more responsive)
        intervalRef.current = setInterval(checkReminders, 15 * 1000);

        return () => {

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [user, checkReminders]);

    // Expose a method to manually trigger a check
    const forceCheck = () => {

        checkReminders();
    };

    // Expose a method to manually request permission
    const requestPermission = async () => {
        if (Notification.permission === 'default') {
            const result = await Notification.requestPermission();
            return result === 'granted';
        }
        return Notification.permission === 'granted';
    };

    return {
        requestPermission,
        forceCheck,
        isSupported: 'Notification' in window,
        permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
    };
};
