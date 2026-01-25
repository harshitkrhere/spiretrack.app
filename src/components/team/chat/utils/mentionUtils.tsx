import React from 'react';
import { cn } from '../../../../lib/utils';

/**
 * Parse message content and return styled React nodes for @mentions
 * - @team, @everyone, @channel → Amber pill (special mentions)
 * - @username → Blue pill (user mentions)
 */
/**
 * Parse message content and return styled React nodes for Markdown and @mentions
 * Supports: **bold**, *italic*, ~~strike~~, [link](url), and @mentions
 */
export const renderMentions = (content: string): React.ReactNode => {
  // 1. First, split by mentions to isolate them (mentions usually shouldn't be bolded/italicized inside internal logic, or handled separately)
  // Actually, to support nesting, we need a smarter approach. 
  // Given constraints, we'll do a simple multi-pass or single-pass regex for all tokens.
  
  // Regex for different tokens
  // Order matters! Links first, then Mention, then Styles
  const tokenRegex = /(\[.*?\]\(.*?\)|@\w+|\*\*.*?\*\*|~~.*?~~|\*.*?\*|\n• .*)/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(content)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const token = match[0];

    // Handle Link: [text](url)
    if (token.startsWith('[')) {
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
         parts.push(
           <a 
             key={`link-${match.index}`} 
             href={linkMatch[2]} 
             target="_blank" 
             rel="noopener noreferrer"
             className="text-blue-600 hover:underline cursor-pointer"
             onClick={(e) => e.stopPropagation()}
           >
             {linkMatch[1]}
           </a>
         );
      } else {
        parts.push(token);
      }
    }
    // Handle Mention: @user
    else if (token.startsWith('@')) {
      const username = token.slice(1);
      const isTeamMention = ['team', 'everyone', 'channel', 'here'].includes(username.toLowerCase());
      parts.push(
        <span
          key={`mention-${match.index}`}
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-sm font-medium cursor-pointer transition-colors mx-0.5",
            isTeamMention 
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          )}
        >
          {token}
        </span>
      );
    }
    // Handle Bold: **text**
    else if (token.startsWith('**')) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // Handle Strike: ~~text~~
    else if (token.startsWith('~~')) {
      parts.push(
        <span key={`strike-${match.index}`} className="line-through text-slate-500">
          {token.slice(2, -2)}
        </span>
      );
    }
    // Handle Italic: *text*
    else if (token.startsWith('*')) {
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    // Handle List: • text
    else if (token.startsWith('\n•')) {
       parts.push(
         <div key={`list-${match.index}`} className="pl-4 py-1 flex items-start">
           <span className="mr-2">•</span>
           <span>{token.slice(3)}</span>
         </div>
       );
    }
    else {
      parts.push(token);
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
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
