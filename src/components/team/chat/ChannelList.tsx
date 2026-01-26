import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Channel } from './types';
import { Button } from '../../ui/Button';

interface ChannelListProps {
  teamId: string;
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  isAdmin: boolean;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  teamId,
  activeChannelId,
  onChannelSelect,
  isAdmin
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  // Fetch Channels
  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'fetch_channels', team_id: teamId }
      });
      if (error) throw error;
      setChannels(data || []);
      
      // Auto-select first channel if none selected
      if (!activeChannelId && data && data.length > 0) {
        onChannelSelect(data[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching channels:', err);
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [teamId]);

  // Create Channel
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: { 
          action: 'create_channel', 
          team_id: teamId,
          name: newChannelName.trim()
        }
      });
      
      if (error) throw error;
      
      setChannels(prev => [...prev, data]);
      setNewChannelName('');
      setIsCreating(false);
      onChannelSelect(data.id);
    } catch (err: any) {
      console.error('Error creating channel:', err);
      alert('Failed to create channel');
    }
  };

  // Delete Channel
  const handleDeleteChannel = async (channelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this channel? Messages will be lost.')) return;

    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { 
          action: 'delete_channel', 
          team_id: teamId,
          channel_id: channelId
        }
      });
      
      if (error) throw error;
      
      setChannels(prev => prev.filter(c => c.id !== channelId));
      if (activeChannelId === channelId) {
        onChannelSelect(channels.find(c => c.id !== channelId)?.id || '');
      }
    } catch (err: any) {
      console.error('Error deleting channel:', err);
      alert('Failed to delete channel');
    }
  };

  if (loading) return <div className="p-4 text-gray-400 text-sm">Loading channels...</div>;

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-400 text-sm cursor-pointer hover:border-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Search</span>
        </div>
      </div>

      {/* Groups Section Header */}
      <div className="px-4 py-2 flex justify-between items-center">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Groups</h3>
        {isAdmin && (
          <button 
            onClick={() => setIsCreating(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded"
            title="Create Channel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreateChannel} className="px-3 pb-3">
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Channel name..."
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="text-xs bg-gray-900 text-white font-medium px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {channels.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400 italic">No channels yet</div>
        ) : (
          <ul className="space-y-1">
            {channels.map(channel => (
              <li key={channel.id}>
                <button
                  onClick={() => onChannelSelect(channel.id)}
                  className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between group rounded-lg transition-all duration-200 ${
                    activeChannelId === channel.id 
                      ? 'bg-white text-gray-900 font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <span className="truncate flex items-center gap-2">
                    <span className="text-gray-400">#</span> 
                    {channel.name}
                  </span>
                  
                  {isAdmin && (
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center`}>
                      <span 
                        onClick={(e) => handleDeleteChannel(channel.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-100"
                        title="Delete Channel"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
