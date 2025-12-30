import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { PinnedMessage } from './types';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { cn } from '../../../lib/utils';

interface PinnedMessagesPanelProps {
  channelId: string;
  teamId: string;
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
  onMessageClick?: (messageId: string) => void;
}

export const PinnedMessagesPanel: React.FC<PinnedMessagesPanelProps> = ({
  channelId,
  teamId,
  currentUserId,
  isAdmin,
  onClose,
  onMessageClick,
}) => {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPinnedMessages();
  }, [channelId]);

  const fetchPinnedMessages = async () => {
    try {
      setLoading(true);
      
      // Direct database query - fetch pinned messages
      const { data: pinnedData, error: pinnedError } = await supabase
        .from('pinned_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('pinned_at', { ascending: false });

      if (pinnedError) throw pinnedError;

      if (!pinnedData || pinnedData.length === 0) {
        setPinnedMessages([]);
        setLoading(false);
        return;
      }

      // Fetch message details for each pinned message
      const messageIds = pinnedData.map(pm => pm.message_id);
      const { data: messagesData, error: messagesError } = await supabase
        .from('team_messages')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .in('id', messageIds);

      if (messagesError) throw messagesError;

      // Fetch user details
      const userIds = messagesData?.map(m => m.user_id).filter(Boolean) || [];
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Combine the data
      const combined = pinnedData.map(pinned => ({
        ...pinned,
        message: {
          ...messagesData?.find(m => m.id === pinned.message_id),
          user: usersData?.find(u => u.id === messagesData?.find(m => m.id === pinned.message_id)?.user_id)
        }
      }));

      setPinnedMessages(combined as any);
    } catch (err) {
      console.error('Error fetching pinned messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (messageId: string) => {
    if (!isAdmin) return;

    try {
      // Direct database delete - RLS policy handles permissions
      const { error } = await supabase
        .from('pinned_messages')
        .delete()
        .eq('message_id', messageId);

      if (error) throw error;
      
      // Remove from local state
      setPinnedMessages(prev => prev.filter(pm => pm.message_id !== messageId));
    } catch (err: any) {
      console.error('Error unpinning message:', err);
      alert(err.message || 'Failed to unpin message');
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[500px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Pinned Messages</h3>
          <span className="text-xs text-slate-500">({pinnedMessages.length}/10)</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <XMarkIcon className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : pinnedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 p-4">
            <MapPinIcon className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">No pinned messages</p>
            <p className="text-xs text-center">Admins can pin important messages</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pinnedMessages.map((pinned) => (
              <div
                key={pinned.id}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => onMessageClick?.(pinned.message_id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                    {pinned.message?.user?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {pinned.message?.user?.full_name || pinned.message?.user?.email}
                      </span>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatDate(pinned.pinned_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {pinned.message?.content}
                    </p>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnpin(pinned.message_id);
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Unpin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
