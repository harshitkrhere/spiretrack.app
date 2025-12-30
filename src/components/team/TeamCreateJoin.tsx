import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface TeamCreateJoinProps {
  onTeamJoined: () => void;
}

export const TeamCreateJoin: React.FC<TeamCreateJoinProps> = ({ onTeamJoined }) => {
  const [mode, setMode] = useState<'create' | 'join'>('join');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'create_team', name: teamName, description: teamDesc }
      });
      if (error) throw error;
      
      // Call the callback to refresh
      onTeamJoined();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'join_team', team_id: inviteCode }
      });
      if (error) throw error;
      onTeamJoined();
    } catch (err: any) {
      console.error('Join Error:', err);
      let errorMessage = err.message || 'Failed to join team';
      
      // Try to extract specific error message from response body
      if (err && typeof err === 'object' && 'context' in err) {
        try {
          const response = await err.context.json();
          if (response && response.error) {
            errorMessage = response.error;
          }
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <div className="flex space-x-4 mb-8 border-b border-slate-100 pb-4">
        <button
          onClick={() => setMode('join')}
          className={`flex-1 pb-2 text-sm font-medium transition-colors ${
            mode === 'join' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Join Existing Team
        </button>
        <button
          onClick={() => setMode('create')}
          className={`flex-1 pb-2 text-sm font-medium transition-colors ${
            mode === 'create' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Create New Team
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {mode === 'join' ? (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team Invite Code (ID)</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. 123e4567-e89b..."
              required
            />
          </div>
          <Button type="submit" isLoading={loading} className="w-full">
            Join Team
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g. Engineering Squad"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="What is this team about?"
              rows={3}
            />
          </div>
          <Button type="submit" isLoading={loading} className="w-full">
            Create Team
          </Button>
        </form>
      )}
    </div>
  );
};
