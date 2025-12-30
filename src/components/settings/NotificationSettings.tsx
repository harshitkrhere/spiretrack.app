import React, { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { BellIcon, ChatBubbleLeftIcon, UserGroupIcon, ClipboardDocumentListIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';

interface NotificationPreferences {
    notifications_enabled: boolean;
    chat_mode: 'all' | 'mentions' | 'mute';
    team_activity: boolean;
    task_updates: boolean;
    system_alerts: boolean;
    account_security: boolean;
}

const defaultPreferences: NotificationPreferences = {
    notifications_enabled: true,
    chat_mode: 'all',
    team_activity: true,
    task_updates: true,
    system_alerts: true,
    account_security: true
};

export const NotificationSettings: React.FC = () => {
    const { user } = useAuth();
    const push = usePushNotifications();
    const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPreferences);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch preferences on mount
    useEffect(() => {
        const fetchPreferences = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('notification_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching notification preferences:', error);
                }

                if (data) {
                    setPrefs({
                        notifications_enabled: data.notifications_enabled ?? true,
                        chat_mode: data.chat_mode ?? 'all',
                        team_activity: data.team_activity ?? true,
                        task_updates: data.task_updates ?? true,
                        system_alerts: data.system_alerts ?? true,
                        account_security: data.account_security ?? true
                    });
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [user]);

    // Save preferences
    const savePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
        if (!user) return;

        setSaving(true);
        const updatedPrefs = { ...prefs, ...newPrefs };
        setPrefs(updatedPrefs);

        try {
            const { error } = await supabase
                .from('notification_preferences')
                .upsert({
                    user_id: user.id,
                    ...updatedPrefs,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) {
                console.error('Error saving preferences:', error);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    // Toggle component
    const Toggle: React.FC<{
        label: string;
        description?: string;
        enabled: boolean;
        onChange: (value: boolean) => void;
        disabled?: boolean;
        icon?: React.ReactNode;
    }> = ({ label, description, enabled, onChange, disabled, icon }) => (
        <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
                {icon && <div className="text-slate-400">{icon}</div>}
                <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                </div>
            </div>
            <Switch
                checked={enabled}
                onChange={onChange}
                disabled={disabled}
                className={`${enabled ? 'bg-emerald-600' : 'bg-slate-200'} 
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                    disabled:cursor-not-allowed`}
            >
                <span
                    className={`${enabled ? 'translate-x-6' : 'translate-x-1'}
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </Switch>
        </div>
    );

    // Chat mode selector
    const ChatModeSelector: React.FC = () => {
        const modes = [
            { value: 'all', label: 'All Messages', desc: 'Get notified for every message' },
            { value: 'mentions', label: 'Mentions Only', desc: 'Only when you\'re @mentioned' },
            { value: 'mute', label: 'Muted', desc: 'No chat notifications' }
        ] as const;

        return (
            <div className="space-y-2">
                {modes.map((mode) => (
                    <label
                        key={mode.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                            ${prefs.chat_mode === mode.value 
                                ? 'border-emerald-500 bg-emerald-50' 
                                : 'border-slate-200 hover:border-slate-300'}
                            ${!prefs.notifications_enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <input
                            type="radio"
                            name="chat_mode"
                            value={mode.value}
                            checked={prefs.chat_mode === mode.value}
                            onChange={() => savePreferences({ chat_mode: mode.value })}
                            disabled={!prefs.notifications_enabled}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                            <p className="text-sm font-medium text-slate-900">{mode.label}</p>
                            <p className="text-xs text-slate-500">{mode.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    <div className="h-10 bg-slate-100 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Master Toggle */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <BellIcon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                            <p className="text-sm text-slate-500">
                                {prefs.notifications_enabled ? 'Notifications are enabled' : 'All notifications are disabled'}
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={prefs.notifications_enabled}
                        onChange={(value) => savePreferences({ notifications_enabled: value })}
                        className={`${prefs.notifications_enabled ? 'bg-emerald-600' : 'bg-slate-200'} 
                            relative inline-flex h-7 w-14 items-center rounded-full transition-colors
                            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                    >
                        <span
                            className={`${prefs.notifications_enabled ? 'translate-x-8' : 'translate-x-1'}
                                inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
                        />
                    </Switch>
                </div>

                {!prefs.notifications_enabled && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            You won't receive any notifications while this is turned off.
                        </p>
                    </div>
                )}
            </div>

            {/* Push Notifications Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-2">Device Notifications</h3>
                <p className="text-sm text-slate-500 mb-4">
                    {!push.isSupported && 'Your browser does not support push notifications'}
                    {push.isSupported && push.permission === 'denied' && 'Notifications are blocked. Enable in browser settings.'}
                    {push.isSupported && push.isSubscribed && 'Push notifications are enabled for this device'}
                    {push.isSupported && !push.isSubscribed && push.permission !== 'denied' && 'Enable to receive notifications on this device'}
                </p>

                {push.isSupported && push.permission !== 'denied' && (
                    <button
                        onClick={push.isSubscribed ? push.unsubscribe : push.subscribe}
                        disabled={push.loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${push.isSubscribed 
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {push.loading ? 'Processing...' : push.isSubscribed ? 'Disable Push' : 'Enable Push Notifications'}
                    </button>
                )}
            </div>

            {/* Chat Notifications */}
            <div className={`bg-white rounded-xl border border-slate-200 p-6 ${!prefs.notifications_enabled ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-2 mb-4">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-slate-400" />
                    <h3 className="text-base font-semibold text-slate-900">Chat Notifications</h3>
                </div>
                <ChatModeSelector />
            </div>

            {/* Category Toggles */}
            <div className={`bg-white rounded-xl border border-slate-200 p-6 ${!prefs.notifications_enabled ? 'opacity-60' : ''}`}>
                <h3 className="text-base font-semibold text-slate-900 mb-4">Other Notifications</h3>
                <div className="divide-y divide-slate-100">
                    <Toggle
                        label="Team Activity"
                        description="Updates about team changes and announcements"
                        enabled={prefs.team_activity}
                        onChange={(value) => savePreferences({ team_activity: value })}
                        disabled={!prefs.notifications_enabled}
                        icon={<UserGroupIcon className="h-5 w-5" />}
                    />
                    <Toggle
                        label="Task Updates"
                        description="When tasks are assigned, completed, or changed"
                        enabled={prefs.task_updates}
                        onChange={(value) => savePreferences({ task_updates: value })}
                        disabled={!prefs.notifications_enabled}
                        icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
                    />
                    <Toggle
                        label="System Alerts"
                        description="Important system notifications"
                        enabled={prefs.system_alerts}
                        onChange={(value) => savePreferences({ system_alerts: value })}
                        disabled={!prefs.notifications_enabled}
                        icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                    />
                    <Toggle
                        label="Account Security"
                        description="Login alerts and security updates"
                        enabled={prefs.account_security}
                        onChange={(value) => savePreferences({ account_security: value })}
                        disabled={!prefs.notifications_enabled}
                        icon={<ShieldCheckIcon className="h-5 w-5" />}
                    />
                </div>
            </div>

            {/* Saving indicator */}
            {saving && (
                <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                    Saving...
                </div>
            )}
        </div>
    );
};

export default NotificationSettings;
