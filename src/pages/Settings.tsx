import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Switch } from '@headlessui/react';
import { NotificationSettings as NotificationSettingsPanel } from '../components/settings/NotificationSettings';

import { UsernameInput } from '../components/auth/UsernameInput';

interface EmailPreferences {
    team_invites: boolean;
    weekly_reminders: boolean;
    report_notifications: boolean;
    mentions: boolean;
}

const defaultEmailPrefs: EmailPreferences = {
    team_invites: true,
    weekly_reminders: true,
    report_notifications: true,
    mentions: true,
};



export const Settings: React.FC = () => {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isUsernameValid, setIsUsernameValid] = useState(true);

    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        timezone: '',
        reminder_time: ''
    });

    const [originalUsername, setOriginalUsername] = useState('');
    const [emailPrefs, setEmailPrefs] = useState<EmailPreferences>(defaultEmailPrefs);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        const { data } = await supabase
            .from('users')
            .select('full_name, username, timezone, reminder_time, email_preferences')
            .eq('id', user!.id)
            .single();

        if (data) {
            setFormData({
                full_name: data.full_name || '',
                username: data.username || '',
                timezone: data.timezone || 'UTC',
                reminder_time: data.reminder_time || '20:00'
            });
            setOriginalUsername(data.username || '');
            // Parse email preferences from JSONB or use defaults
            if (data.email_preferences) {
                setEmailPrefs({ ...defaultEmailPrefs, ...data.email_preferences });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (formData.username && formData.username !== originalUsername) {
                 const { data, error: usernameError } = await supabase.functions.invoke('user-profile-operations', {
                    body: { 
                        action: 'update_username', 
                        username: formData.username 
                    }
                });
                // Check for error in response data (Edge Function returns error in body)
                if (usernameError) throw usernameError;
                if (data?.error) throw new Error(data.error);
            }

            const { error } = await supabase
                .from('users')
                .update({
                    full_name: formData.full_name,
                    timezone: formData.timezone,
                    reminder_time: formData.reminder_time,
                    email_preferences: emailPrefs
                })
                .eq('id', user!.id);

            if (error) throw error;

            // Update original username after successful save
            setOriginalUsername(formData.username);
            setMessage({ type: 'success', text: 'Settings updated successfully.' });
        } catch (error: any) {
            console.error('Error updating settings:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to update settings.' });
        } finally {
            setLoading(false);
        }
    };

    // Save email preferences to database
    const saveEmailPrefs = async (newPrefs: EmailPreferences) => {
        try {
            await supabase
                .from('users')
                .update({ email_preferences: newPrefs })
                .eq('id', user!.id);
        } catch (error) {
            console.error('Error saving email preferences:', error);
        }
    };

    const handleEmailPrefChange = (key: keyof EmailPreferences, value: boolean) => {
        const newPrefs = { ...emailPrefs, [key]: value };
        setEmailPrefs(newPrefs);
        saveEmailPrefs(newPrefs); // Save immediately
    };

    const ToggleSwitch = ({ label, description, enabled, onChange }: { 
        label: string; 
        description: string; 
        enabled: boolean; 
        onChange: (val: boolean) => void 
    }) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-slate-900">{label}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <Switch
                checked={enabled}
                onChange={onChange}
                className={`${enabled ? 'bg-green-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
            >
                <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
            </Switch>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>

            <Card>
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Profile & Preferences</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />

                    <UsernameInput 
                        value={formData.username}
                        onChange={(val) => setFormData({ ...formData, username: val })}
                        onValidityChange={setIsUsernameValid}
                        currentUsername={originalUsername}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Timezone</label>
                            <select
                                className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time (US)</option>
                                <option value="America/Los_Angeles">Pacific Time (US)</option>
                                <option value="Europe/London">London</option>
                                <option value="Asia/Kolkata">India (IST)</option>
                            </select>
                        </div>

                        <Input
                            type="time"
                            label="Reminder Time (Sunday)"
                            value={formData.reminder_time}
                            onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" isLoading={loading} disabled={!isUsernameValid}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Email Notifications */}
            <Card>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Email Notifications</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Choose which email notifications you'd like to receive. We only send transactional emails—no marketing.
                </p>
                <div className="divide-y divide-slate-100">
                    <ToggleSwitch
                        label="Team Invitations"
                        description="Get notified when you're invited to join a team"
                        enabled={emailPrefs.team_invites}
                        onChange={(val) => handleEmailPrefChange('team_invites', val)}
                    />
                    <ToggleSwitch
                        label="Weekly Review Reminders"
                        description="Receive a reminder to submit your weekly review"
                        enabled={emailPrefs.weekly_reminders}
                        onChange={(val) => handleEmailPrefChange('weekly_reminders', val)}
                    />
                    <ToggleSwitch
                        label="Report Notifications"
                        description="Get notified when a team report is generated"
                        enabled={emailPrefs.report_notifications}
                        onChange={(val) => handleEmailPrefChange('report_notifications', val)}
                    />
                    <ToggleSwitch
                        label="Mentions"
                        description="Get notified when someone @mentions you"
                        enabled={emailPrefs.mentions}
                        onChange={(val) => handleEmailPrefChange('mentions', val)}
                    />
                </div>
                <p className="mt-4 text-xs text-slate-400">Changes save automatically</p>
            </Card>

            {/* Notification Settings */}
            <NotificationSettingsPanel />

            <Card className="border-red-100">
                <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
                <p className="text-slate-600 text-sm mb-6">
                    Sign out of your account or manage sensitive data.
                </p>
                <Button variant="danger" onClick={() => signOut()}>
                    Sign Out
                </Button>
            </Card>
            </div>
        </div>
    );
};
