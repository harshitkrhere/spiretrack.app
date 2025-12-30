import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Message, ThreadData } from './types';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '../../../lib/utils';

interface ThreadPanelProps {
  parentMessage: Message;
  channelId: string;
  teamId: string;
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
}

export const ThreadPanel: React.FC<ThreadPanelProps> = ({
  parentMessage,
  channelId,
  teamId,
  currentUserId,
  isAdmin,
  onClose,
}) => {
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const repliesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch thread replies
  const fetchThread = async () => {
    try {
      setLoading(true);
      
      // Direct database query for thread replies
      const { data: replies, error } = await supabase
        .from('team_messages')
        .select('id, content, created_at, user_id, channel_id, parent_message_id, is_system_message, edited_at, attachments')
        .eq('parent_message_id', parentMessage.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user details for replies
      if (replies && replies.length > 0) {
        const userIds = [...new Set(replies.map(r => r.user_id).filter(Boolean))];
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);

        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        
        const repliesWithUsers = replies.map(reply => ({
          ...reply,
          team_id: teamId,
          mentions: [],
          updated_at: reply.created_at,
          last_thread_reply_at: null,
          system_event_type: null,
          system_event_data: null,
          user: userMap.get(reply.user_id) || null,
          reactions: [],
          thread_reply_count: 0,
        })) as Message[];

        setThreadData({
          parent: parentMessage,
          replies: repliesWithUsers as Message[],
          has_more: false,
        });
      } else {
        setThreadData({
          parent: parentMessage,
          replies: [],
          has_more: false,
        });
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();

    // Real-time subscription for new thread replies
    const channel = supabase
      .channel(`thread:${parentMessage.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `parent_message_id=eq.${parentMessage.id}`,
        },
        async (payload) => {
          // Fetch user data for the new message
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const newMessage = {
            ...payload.new,
            user: userData,
          } as Message;

          setThreadData((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              replies: [...prev.replies, newMessage],
            };
          });

          // Update parent message thread count in UI
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parentMessage.id]);

  // Auto-scroll to latest reply
  const scrollToBottom = () => {
    repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (threadData && threadData.replies.length > 0) {
      scrollToBottom();
    }
  }, [threadData?.replies.length]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSendReply = async (content: string, attachments: any[]) => {
    try {
      setSending(true);
      
      const { error } = await supabase
        .from('team_messages')
        .insert({
          team_id: teamId,
          channel_id: channelId,
          user_id: currentUserId,
          parent_message_id: parentMessage.id,
          content,
          attachments,
          mentions: [],
        });

      if (error) throw error;
      
      // Real-time will handle adding to UI
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Thread Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50",
          "flex flex-col border-l border-slate-200",
          "animate-in slide-in-from-right duration-300"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors sm:hidden"
              title="Back to channel"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Thread</h2>
              <p className="text-xs text-slate-500">
                {threadData ? `${threadData.replies.length} ${threadData.replies.length === 1 ? 'reply' : 'replies'}` : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors hidden sm:block"
            title="Close thread"
          >
            <XMarkIcon className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Parent Message (Pinned at top) */}
        <div className="px-6 py-4 bg-blue-50/30 border-b border-blue-100 flex-shrink-0">
          <div className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">Original Message</div>
          <MessageItem
            message={parentMessage}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onReply={() => {}}
            onReactionToggle={() => {}}
            onPin={() => {}}
            onEdit={() => {}}
            isInThread={true}
            showThreadButton={false}
          />
        </div>

        {/* Replies */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : threadData && threadData.replies.length > 0 ? (
            <>
              {threadData.replies.map((reply) => (
                <MessageItem
                  key={reply.id}
                  message={reply}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onReply={() => {}}
                  onReactionToggle={() => {}}
                  onPin={() => {}}
                  onEdit={() => {}}
                  isInThread={true}
                  showThreadButton={false}
                />
              ))}
              <div ref={repliesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-medium">No replies yet</p>
              <p className="text-xs">Be the first to reply</p>
            </div>
          )}
        </div>

        {/* Reply Input */}
        <div className="border-t border-slate-200 bg-white flex-shrink-0">
          <MessageInput
            teamId={teamId}
            channelId={channelId}
            onSendMessage={handleSendReply}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </>
  );
};
