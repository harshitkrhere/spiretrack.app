import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../ui/Button';
import { Switch } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Avatar } from '../../ui/Avatar';

interface WhitelistSettingsProps {
  teamId: string;
}

export const WhitelistSettings: React.FC<WhitelistSettingsProps> = ({ teamId }) => {
  const [enabled, setEnabled] = useState(false);
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [teamId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // 1. Get Team Status
      const { data: team } = await supabase
        .from('teams')
        .select('is_whitelist_enabled')
        .eq('id', teamId)
        .single();
      
      if (team) setEnabled(team.is_whitelist_enabled);

      // 2. Get Whitelist
      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'get_whitelist', team_id: teamId }
      });

      if (error) throw error;
      setWhitelist(data || []);
    } catch (err) {
      console.error('Error fetching whitelist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    try {
      setEnabled(checked); // Optimistic
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'update_whitelist_status', team_id: teamId, enabled: checked }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error toggling whitelist:', err);
      setEnabled(!checked); // Revert
      alert('Failed to update status');
    }
  };

  const handleAdd = async () => {
    if (!input.trim()) return;
    
    try {
      setAdding(true);
      setError(null);
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.trim());
      
      const payload: any = { 
        action: 'add_to_whitelist', 
        team_id: teamId 
      };
      
      if (isUuid) {
        payload.target_user_id = input.trim();
      } else {
        payload.username = input.trim();
      }

      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: payload
      });

      if (error) throw new Error(error.message || 'Failed to add user');
      
      setInput('');
      fetchSettings(); // Refresh list
    } catch (err: any) {
      console.error('Error adding user:', err);
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user from the whitelist?')) return;
    
    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'remove_from_whitelist', team_id: teamId, whitelist_id: id }
      });

      if (error) throw error;
      setWhitelist(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('Error removing user:', err);
      alert('Failed to remove user');
    }
  };

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Whitelist Only Mode</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Only users in the list below can join the team.</p>
        </div>
        <Switch
          checked={enabled}
          onChange={handleToggle}
          className={`${
            enabled ? 'bg-brand-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 flex-shrink-0`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>

      {enabled && (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-4 sm:space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter username or User ID"
              className="flex-1 rounded-md border-gray-200 bg-gray-50 px-3 sm:px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-all outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} isLoading={adding} disabled={!input.trim()} className="w-full sm:w-auto">
              Add User
            </Button>
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </p>}

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Whitelisted Users</h4>
            {whitelist.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 italic">No users whitelisted yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 bg-white rounded-lg border border-gray-200 overflow-hidden">
                {whitelist.map((item) => (
                  <li key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={item.avatar_url}
                        name={item.full_name}
                        email={item.username}
                        size="sm"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.full_name || item.username || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {item.user_id ? (
                            <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full text-[10px] font-medium border border-green-100">Registered</span>
                          ) : (
                            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full text-[10px] font-medium border border-amber-100">Pending</span>
                          )}
                          {item.username && <span className="text-gray-400">@{item.username}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
