import React from 'react';
import type { Message } from './types';
import { 
  ClockIcon, 
  ExclamationCircleIcon,
  DocumentTextIcon,
  UserPlusIcon,
  UserMinusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface SystemMessageProps {
  message: Message;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ message }) => {
  const getIcon = () => {
    switch (message.system_event_type) {
      case 'report_submitted':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'report_generated':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'form_updated':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'member_joined':
        return <UserPlusIcon className="h-5 w-5" />;
      case 'member_left':
        return <UserMinusIcon className="h-5 w-5" />;
      case 'channel_created':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'settings_updated':
        return <ExclamationCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-center py-3 px-4">
      <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200/60">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200/50 text-slate-500">
          {getIcon()}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 font-medium">{message.content}</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-400">{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
