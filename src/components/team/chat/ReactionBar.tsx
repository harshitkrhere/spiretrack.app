import React, { useState } from 'react';
import type { ReactionGroup, ReactionType } from './types';
import { ReactionPicker } from './ReactionPicker';
import { cn } from '../../../lib/utils';

interface ReactionBarProps {
  messageId: string;
  reactionGroups: ReactionGroup[];
  currentUserId: string;
  onReactionToggle: (messageId: string, reactionType: ReactionType) => void;
  isSystemMessage?: boolean;
}

const REACTION_EMOJI: Record<ReactionType, string> = {
  acknowledge: '👍',
  seen: '👀',
  completed: '✅',
  important: '❗',
};

export const ReactionBar: React.FC<ReactionBarProps> = ({ 
  messageId, 
  reactionGroups, 
  currentUserId,
  onReactionToggle,
  isSystemMessage = false
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // System messages cannot be reacted to
  if (isSystemMessage) {
    return null;
  }

  const hasReactions = reactionGroups && reactionGroups.length > 0;

  const getCurrentUserReactions = (): ReactionType[] => {
    if (!reactionGroups) return [];
    return reactionGroups
      .filter(group => group.has_current_user)
      .map(group => group.type);
  };

  const handleReactionClick = (type: ReactionType) => {
    onReactionToggle(messageId, type);
  };

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {/* Existing reactions */}
      {hasReactions && reactionGroups.map((group) => (
        <button
          key={group.type}
          onClick={() => handleReactionClick(group.type)}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105",
            group.has_current_user
              ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          )}
          title={group.users.map(u => u.full_name || u.email).join(', ')}
        >
          <span className="text-sm">{REACTION_EMOJI[group.type]}</span>
          <span className="font-semibold">{group.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all",
            showPicker && "bg-slate-100 text-slate-600"
          )}
          title="Add reaction"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {showPicker && (
          <ReactionPicker
            onReactionSelect={handleReactionClick}
            onClose={() => setShowPicker(false)}
            currentReactions={getCurrentUserReactions()}
          />
        )}
      </div>
    </div>
  );
};
