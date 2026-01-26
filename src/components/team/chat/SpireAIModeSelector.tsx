import React from 'react';
import type { SpireAIMode } from './types';

// Custom colorful mode configuration
interface ModeConfig {
    id: SpireAIMode;
    label: string;
    description: string;
    gradient: string;
    iconBg: string;
    textColor: string;
    borderColor: string;
}

const MODES: ModeConfig[] = [
    {
        id: 'summary',
        label: 'Summary',
        description: 'Summarize team discussions',
        gradient: 'from-amber-500 to-orange-500',
        iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-300',
    },
    {
        id: 'history_answer',
        label: 'Context',
        description: 'Answer from chat history',
        gradient: 'from-blue-500 to-indigo-500',
        iconBg: 'bg-gradient-to-br from-blue-100 to-indigo-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-300',
    },
    {
        id: 'general',
        label: 'General',
        description: 'Use AI knowledge base',
        gradient: 'from-emerald-500 to-teal-500',
        iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-300',
    },
    {
        id: 'hybrid',
        label: 'Hybrid',
        description: 'Combine context + AI',
        gradient: 'from-purple-500 to-pink-500',
        iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-300',
    },
];

// Custom SVG icons for each mode
const ModeIcon: React.FC<{ mode: SpireAIMode; isSelected: boolean }> = ({ mode, isSelected }) => {
    const iconClass = `w-5 h-5 ${isSelected ? 'text-white' : 'text-current'}`;

    switch (mode) {
        case 'summary':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6" />
                </svg>
            );
        case 'history_answer':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            );
        case 'general':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            );
        case 'hybrid':
            return (
                <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            );
    }
};

interface SpireAIModeSelectorProps {
    selectedMode: SpireAIMode | null;
    onSelectMode: (mode: SpireAIMode) => void;
    onClose: () => void;
    isOpen: boolean;
}

export const SpireAIModeSelector: React.FC<SpireAIModeSelectorProps> = ({
    selectedMode,
    onSelectMode,
    onClose,
    isOpen,
}) => {
    const selectorRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={selectorRef}
            className="absolute bottom-full left-0 mb-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 w-80 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
            {/* Header with SpireAI Logo */}
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src="/spire-ai-logo.png"
                        alt="SpireAI"
                        className="w-8 h-8 rounded-lg shadow-sm"
                    />
                    <div>
                        <div className="text-sm font-bold text-gray-900">SpireAI</div>
                        <div className="text-[10px] text-gray-500">Choose your mode</div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Mode Options */}
            <div className="p-2">
                {MODES.map((mode) => {
                    const isSelected = selectedMode === mode.id;

                    return (
                        <button
                            key={mode.id}
                            onClick={() => onSelectMode(mode.id)}
                            className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 mb-1 last:mb-0 ${isSelected
                                ? `bg-gradient-to-r ${mode.gradient} text-white shadow-lg scale-[1.02]`
                                : `hover:bg-gray-50 border border-transparent hover:border-gray-200`
                                }`}
                        >
                            {/* Icon Container */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected
                                ? 'bg-white/20 backdrop-blur-sm'
                                : mode.iconBg
                                }`}>
                                <div className={isSelected ? '' : mode.textColor}>
                                    <ModeIcon mode={mode.id} isSelected={isSelected} />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                    {mode.label}
                                </div>
                                <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                    {mode.description}
                                </div>
                            </div>

                            {/* Checkmark */}
                            {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center">
                    Select a mode to change how SpireAI responds
                </p>
            </div>
        </div>
    );
};

// Colorful Badge component
interface SpireAIModeBadgeProps {
    mode: SpireAIMode;
    onClear: () => void;
}

export const SpireAIModeBadge: React.FC<SpireAIModeBadgeProps> = ({ mode, onClear }) => {
    const modeConfig = MODES.find(m => m.id === mode);
    if (!modeConfig) return null;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${modeConfig.iconBg} border ${modeConfig.borderColor} rounded-full`}>
            <div className={modeConfig.textColor}>
                <ModeIcon mode={mode} isSelected={false} />
            </div>
            <span className={`text-xs font-semibold ${modeConfig.textColor}`}>
                {modeConfig.label}
            </span>
            <button
                onClick={onClear}
                className={`p-0.5 rounded-full hover:bg-white/50 transition-colors ${modeConfig.textColor}`}
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const getModeConfig = (mode: SpireAIMode) => {
    return MODES.find(m => m.id === mode);
};
