import React, { useRef, useEffect } from 'react';
import type { ReactionType } from './types';
import { cn } from '../../../lib/utils';

interface ReactionPickerProps {
  onReactionSelect: (type: ReactionType) => void;
  onClose: () => void;
  currentReactions?: ReactionType[];
}

const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string; description: string }> = {
  acknowledge: { emoji: '👍', label: 'Acknowledge', description: 'Agreement or acknowledgment' },
  seen: { emoji: '👀', label: 'Seen', description: 'Reviewing or seen' },
  completed: { emoji: '✅', label: 'Completed', description: 'Action completed' },
  important: { emoji: '❗', label: 'Important', description: 'Important or risk flag' },
};

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ 
  onReactionSelect, 
  onClose,
  currentReactions = []
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div 
      ref={pickerRef}
      className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 min-w-[280px] z-50 animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="space-y-1">
        {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((type) => {
          const config = REACTION_CONFIG[type];
          const isActive = currentReactions.includes(type);
          
          return (
            <button
              key={type}
              onClick={() => {
                onReactionSelect(type);
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-slate-50",
                isActive && "bg-blue-50 hover:bg-blue-100"
              )}
            >
              <span className="text-2xl">{config.emoji}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-slate-900">{config.label}</div>
                <div className="text-xs text-slate-500">{config.description}</div>
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
