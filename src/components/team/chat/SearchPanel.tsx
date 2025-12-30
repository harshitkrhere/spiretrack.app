import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import type { SearchResult, SearchFilters, Message } from './types';
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { debounce } from '../../../lib/utils';

interface SearchPanelProps {
  teamId: string;
  channelId?: string; // Optional: if provided, defaults to searching this channel
  currentUserId: string;
  onClose: () => void;
  onMessageClick?: (messageId: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  teamId,
  channelId,
  currentUserId,
  onClose,
  onMessageClick,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    channel_ids: channelId ? [channelId] : [],
    include_threads: true,
    include_system: true,
  });

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: SearchFilters) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        
        // Direct database query using ilike for simple text matching
        let query = supabase
          .from('team_messages')
          .select('id, content, created_at, user_id, channel_id, parent_message_id, is_system_message')
          .eq('team_id', teamId)
          .ilike('content', `%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        // Apply channel filter if specified
        if (searchFilters.channel_ids && searchFilters.channel_ids.length > 0) {
          query = query.in('channel_id', searchFilters.channel_ids);
        }

        // Filter out threads if not included
        if (!searchFilters.include_threads) {
          query = query.is('parent_message_id', null);
        }

        // Filter out system messages if not included
        if (!searchFilters.include_system) {
          query = query.eq('is_system_message', false);
        }

        const { data: messages, error } = await query;

        if (error) throw error;

        // Fetch user details separately
        if (messages && messages.length > 0) {
          const userIds = [...new Set(messages.map(m => m.user_id).filter(Boolean))];
          const { data: users } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .in('id', userIds);

          const userMap = new Map(users?.map(u => [u.id, u]) || []);
          
          const resultsWithUsers = messages.map(msg => ({
            ...msg,
            user: userMap.get(msg.user_id) || null
          }));
          
          setResults(resultsWithUsers);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error searching messages:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    [teamId]
  );

  useEffect(() => {
    performSearch(query, filters);
  }, [query, filters, performSearch]);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-slate-900">{part}</mark>
      ) : (
        part
      )
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[600px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Search Input */}
      <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-600'
            }`}
            title="Filters"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            title="Close search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.include_threads}
                onChange={(e) => setFilters({ ...filters, include_threads: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">Include thread replies</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.include_system}
                onChange={(e) => setFilters({ ...filters, include_system: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700">Include system messages</span>
            </label>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !query ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 p-4">
            <MagnifyingGlassIcon className="w-8 h-8 mb-2" />
            <p className="text-sm font-medium">Start typing to search</p>
            <p className="text-xs text-center">Search through all messages and threads</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 p-4">
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs text-center">Try different keywords or adjust filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {results.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  onMessageClick?.(message.id);
                  onClose();
                }}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                    {message.user?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {message.user?.full_name || message.user?.email}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0">
                        {message.parent_message_id && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            Thread
                          </span>
                        )}
                        {message.is_system_message && (
                          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            System
                          </span>
                        )}
                        <span>{formatTime(message.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {highlightMatch(message.content, query)}
                    </p>
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
