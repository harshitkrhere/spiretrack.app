import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { UsernameInput } from './UsernameInput';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        reminder_time: '20:00',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const { error: usernameError } = await supabase.functions.invoke('user-profile-operations', {
                body: { 
                    action: 'set_username', 
                    username: formData.username 
                }
            });

            if (usernameError) throw usernameError;

            const { error } = await supabase
                .from('users')
                .update({
                    full_name: formData.full_name,
                    timezone: formData.timezone,
                    reminder_time: formData.reminder_time,
                })
                .eq('id', user.id);

            if (error) throw error;
            onComplete();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = isUsernameValid && formData.full_name.trim().length > 0;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
        >
            <div className="w-full max-w-md px-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-10"
                >
                    <h1 
                        className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-3"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
                    >
                        Set up your profile.
                    </h1>
                    <p className="text-lg text-gray-400">
                        Just a few details to get started.
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form 
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            placeholder="What should we call you?"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <UsernameInput 
                            value={formData.username}
                            onChange={(val) => setFormData({ ...formData, username: val })}
                            onValidityChange={setIsUsernameValid}
                        />
                    </div>

                    {/* Timezone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timezone
                        </label>
                        <select
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none cursor-pointer"
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        >
                            <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                                {Intl.DateTimeFormat().resolvedOptions().timeZone} (Detected)
                            </option>
                        </select>
                    </div>

                    {/* Reminder Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weekly reminder time
                        </label>
                        <input
                            type="time"
                            value={formData.reminder_time}
                            onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1.5">
                            We'll remind you to submit your weekly review on Sundays.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <motion.button 
                        type="submit" 
                        disabled={!isFormValid || loading}
                        className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        whileHover={{ scale: isFormValid && !loading ? 1.01 : 1 }}
                        whileTap={{ scale: isFormValid && !loading ? 0.99 : 1 }}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Setting up...
                            </span>
                        ) : (
                            'Continue'
                        )}
                    </motion.button>
                </motion.form>
            </div>
        </motion.div>
    );
};
