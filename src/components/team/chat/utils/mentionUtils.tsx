import React from 'react';
import { cn } from '../../../../lib/utils';

/**
 * Parse message content and return styled React nodes for @mentions
 * - @team, @everyone, @channel → Amber pill (special mentions)
 * - @username → Blue pill (user mentions)
 */
export const renderMentions = (content: string): React.ReactNode => {
  const mentionRegex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add the styled mention
    const mentionText = match[0];
    const username = match[1];
    const isTeamMention = ['team', 'everyone', 'channel', 'here'].includes(username.toLowerCase());
    
    parts.push(
      <span
        key={`mention-${match.index}`}
        className={cn(
          "inline-flex items-center px-1.5 py-0.5 rounded text-sm font-medium cursor-pointer transition-colors",
          isTeamMention 
            ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        )}
      >
        {mentionText}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : content;
};

/**
 * Check if a message contains any mentions
 */
export const hasMentions = (content: string): boolean => {
  return /@\w+/.test(content);
};

/**
 * Extract all usernames mentioned in the content
 */
export const extractMentions = (content: string): string[] => {
  const matches = content.match(/@(\w+)/g);
  return matches ? matches.map(m => m.slice(1).toLowerCase()) : [];
};
