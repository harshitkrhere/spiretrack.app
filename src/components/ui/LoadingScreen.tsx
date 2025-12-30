import React from 'react';

interface LoadingScreenProps {
    message?: string;
}

/**
 * SpireTrack Loading Screen
 * 
 * Design Philosophy:
 * - Calm and intentional, not urgent
 * - The "breath" animation mimics natural rhythm
 * - Three dots represent the system's continuous operation
 * - Slow timing (3s) designed to feel acceptable during both short and long waits
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
    message = 'Preparing workspace' 
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFBFC]">
            <div className="flex flex-col items-center gap-8">
                {/* 
                    Original Indicator: "The Pulse Line"
                    Three horizontal bars that breathe in sequence.
                    Unlike spinners, this suggests steady progress, not frantic activity.
                */}
                <div className="flex flex-col items-center gap-1.5">
                    <div 
                        className="w-8 h-0.5 bg-slate-300 rounded-full animate-pulse-bar"
                        style={{ animationDelay: '0s' }}
                    />
                    <div 
                        className="w-12 h-0.5 bg-slate-400 rounded-full animate-pulse-bar"
                        style={{ animationDelay: '0.2s' }}
                    />
                    <div 
                        className="w-8 h-0.5 bg-slate-300 rounded-full animate-pulse-bar"
                        style={{ animationDelay: '0.4s' }}
                    />
                </div>

                {/* Status message - factual, neutral */}
                {message && (
                    <p className="text-sm text-slate-500 tracking-wide">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

/**
 * Inline Loading indicator for smaller contexts
 * (e.g., within a panel or section)
 */
export const LoadingIndicator: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
    const barWidths = size === 'sm' 
        ? ['w-4', 'w-6', 'w-4'] 
        : ['w-8', 'w-12', 'w-8'];
    
    return (
        <div className="flex flex-col items-center gap-1">
            <div 
                className={`${barWidths[0]} h-0.5 bg-slate-300 rounded-full animate-pulse-bar`}
                style={{ animationDelay: '0s' }}
            />
            <div 
                className={`${barWidths[1]} h-0.5 bg-slate-400 rounded-full animate-pulse-bar`}
                style={{ animationDelay: '0.2s' }}
            />
            <div 
                className={`${barWidths[2]} h-0.5 bg-slate-300 rounded-full animate-pulse-bar`}
                style={{ animationDelay: '0.4s' }}
            />
        </div>
    );
};

export default LoadingScreen;
