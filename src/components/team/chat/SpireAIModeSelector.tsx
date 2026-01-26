import React from 'react';
import type { SpireAIMode } from './types';

// Mode configuration with custom emojis and colors
interface ModeConfig {
  id: SpireAIMode;
  label: string;
  shortLabel: string;
  description: string;
  emoji: string;
  gradient: string;
  color: string;
  bgColor: string;
  borderColor: string;
  shadowColor: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'history_summary',
    label: 'History Summary',
    shortLabel: 'Summary',
    description: 'Summarize past team conversations',
    emoji: '📝',
    gradient: 'from-violet-500 to-purple-600',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    shadowColor: 'shadow-violet-200/50',
  },
  {
    id: 'history_question',
    label: 'History-Based Question',
    shortLabel: 'History',
    description: 'Answer only from chat history',
    emoji: '💬',
    gradient: 'from-blue-500 to-cyan-500',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-200/50',
  },
  {
    id: 'general_question',
    label: 'General Question',
    shortLabel: 'General',
    description: 'Answer using general knowledge',
    emoji: '💡',
    gradient: 'from-amber-400 to-orange-500',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    shadowColor: 'shadow-amber-200/50',
  },
  {
    id: 'history_general',
    label: 'History + General',
    shortLabel: 'Combined',
    description: 'Combine chat context with reasoning',
    emoji: '✨',
    gradient: 'from-teal-400 to-emerald-500',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    shadowColor: 'shadow-teal-200/50',
  },
];

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

  // Close on click outside
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
      className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/60 overflow-hidden z-50 w-[340px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50">
            <span className="text-sm">⚡</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">SpireAI Mode</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Mode Options */}
      <div className="p-2 space-y-1">
        {MODES.map((mode) => {
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-center gap-3 group ${
                isSelected
                  ? `${mode.bgColor} ${mode.borderColor} border-2 ${mode.shadowColor} shadow-md`
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
            >
              {/* Emoji with gradient background */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected 
                  ? `bg-gradient-to-br ${mode.gradient} shadow-lg ${mode.shadowColor}` 
                  : 'bg-gray-100 group-hover:bg-gray-200'
              }`}>
                <span className={`text-lg ${isSelected ? 'drop-shadow-sm' : ''}`}>
                  {mode.emoji}
                </span>
              </div>
              
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold transition-colors ${
                  isSelected ? mode.color : 'text-gray-800 group-hover:text-gray-900'
                }`}>
                  {mode.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {mode.description}
                </div>
              </div>
              
              {/* Checkmark */}
              {isSelected && (
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${mode.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Footer hint */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Select a mode to use <span className="font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">@SpireAI</span>
        </p>
      </div>
    </div>
  );
};

// Badge component to show selected mode
interface SpireAIModeBadgeProps {
  mode: SpireAIMode;
  onClear: () => void;
}

export const SpireAIModeBadge: React.FC<SpireAIModeBadgeProps> = ({ mode, onClear }) => {
  const modeConfig = MODES.find(m => m.id === mode);
  if (!modeConfig) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 ${modeConfig.bgColor} border ${modeConfig.borderColor} rounded-full text-xs font-medium ${modeConfig.color} shadow-sm ${modeConfig.shadowColor}`}>
      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${modeConfig.gradient} flex items-center justify-center`}>
        <span className="text-[10px]">{modeConfig.emoji}</span>
      </div>
      <span className="pr-0.5">{modeConfig.shortLabel}</span>
      <button 
        onClick={onClear}
        className={`p-0.5 rounded-full hover:bg-white/60 transition-colors ${modeConfig.color}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
