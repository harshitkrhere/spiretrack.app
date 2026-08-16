import React from 'react';
import type { SpireAIMode } from './types';

export interface ModeConfig {
    id: SpireAIMode;
    label: string;
}

const MODES: ModeConfig[] = [
    {
        id: 'summary',
        label: 'Summary',
    },
    {
        id: 'history_answer',
        label: 'Context',
    },
    {
        id: 'general',
        label: 'General',
    },
    {
        id: 'hybrid',
        label: 'Hybrid',
    },
];

const ModeIcon: React.FC<{ mode: SpireAIMode; className?: string }> = ({ mode, className = "w-5 h-5" }) => {
    switch (mode) {
        case 'summary':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
                </svg>
            );
        case 'history_answer':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        case 'general':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            );
        case 'hybrid':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="9" cy="12" r="5" />
                    <circle cx="15" cy="12" r="5" />
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
            className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-56 overflow-hidden"
        >
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Select Mode</span>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-1.5 grid grid-cols-2 gap-1.5">
                {MODES.map((mode) => {
                    const isSelected = selectedMode === mode.id;

                    return (
                        <button
                            key={mode.id}
                            onClick={() => {
                                onSelectMode(mode.id);
                                onClose();
                            }}
                            className={`flex flex-col items-center justify-center p-3 gap-2 rounded-md transition-all duration-200 ease-out active:scale-95 ${
                                isSelected
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.03]'
                            }`}
                        >
                            <ModeIcon mode={mode.id} className="w-5 h-5" />
                            <span className="text-xs font-medium">{mode.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

interface SpireAIModeBadgeProps {
    mode: SpireAIMode;
    onClear: () => void;
}

export const SpireAIModeBadge: React.FC<SpireAIModeBadgeProps> = ({ mode, onClear }) => {
    const modeConfig = MODES.find(m => m.id === mode);
    if (!modeConfig) return null;

    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 rounded-full shadow-sm">
            <ModeIcon mode={mode} className="w-3 h-3 text-white" />
            <span className="text-xs font-medium text-white">
                {modeConfig.label}
            </span>
            <button
                onClick={onClear}
                className="ml-0.5 p-0.5 rounded-full text-gray-300 hover:text-white hover:bg-white/20 transition-colors"
            >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export const getModeConfig = (mode: SpireAIMode) => {
    return MODES.find(m => m.id === mode);
};
