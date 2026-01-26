import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { ChannelTab, ChannelTabContent, OverviewContent, MessageUser } from '../types';
import { PencilIcon, CheckIcon, XMarkIcon, PlusIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../../../lib/utils';

interface OverviewTabProps {
  channelId: string;
  teamId: string;
  tabId: string;
  currentUserId: string;
  isAdmin: boolean;
}

const DEFAULT_CONTENT: OverviewContent = {
  purpose: '',
  goals: [],
  owners: [],
  links: [],
  status: 'active',
};

export const OverviewTab: React.FC<OverviewTabProps> = ({
  channelId,
  teamId,
  tabId,
  currentUserId,
  isAdmin,
}) => {
  const [content, setContent] = useState<OverviewContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ownerUsers, setOwnerUsers] = useState<MessageUser[]>([]);
  const [teamMembers, setTeamMembers] = useState<MessageUser[]>([]);

  // New input states
  const [newGoal, setNewGoal] = useState('');
  const [newLink, setNewLink] = useState({ label: '', url: '' });

  useEffect(() => {
    fetchContent();
    fetchTeamMembers();
  }, [tabId]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_tab_content')
        .select('*')
        .eq('tab_id', tabId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setContent(data.content as OverviewContent);
        // Fetch owner user details
        if (data.content.owners?.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .in('id', data.content.owners);
          setOwnerUsers(users || []);
        }
      }
    } catch (err) {
      console.error('Error fetching overview content:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('user_id, users!inner(id, email, full_name, avatar_url)')
      .eq('team_id', teamId);
    
    if (data) {
      setTeamMembers(data.map((m: any) => m.users));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check if content exists
      const { data: existing } = await supabase
        .from('channel_tab_content')
        .select('id')
        .eq('tab_id', tabId)
        .single();

      if (existing) {
        // Update existing content
        const { error: updateError } = await supabase
          .from('channel_tab_content')
          .update({ content, updated_by: currentUserId, updated_at: new Date().toISOString() })
          .eq('tab_id', tabId);
        
        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
      } else {
        // Insert new content
        const { error: insertError } = await supabase
          .from('channel_tab_content')
          .insert({ tab_id: tabId, content, updated_by: currentUserId });
        
        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      }

      setEditing(false);
    } catch (err: any) {
      console.error('Error saving overview:', err);
      alert(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setContent(prev => ({ ...prev, goals: [...prev.goals, newGoal.trim()] }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setContent(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }));
  };

  const addLink = () => {
    if (newLink.label.trim() && newLink.url.trim()) {
      setContent(prev => ({ ...prev, links: [...prev.links, { ...newLink }] }));
      setNewLink({ label: '', url: '' });
    }
  };

  const removeLink = (index: number) => {
    setContent(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  };

  const toggleOwner = (userId: string) => {
    setContent(prev => ({
      ...prev,
      owners: prev.owners.includes(userId)
        ? prev.owners.filter(id => id !== userId)
        : [...prev.owners, userId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400" />
      </div>
    );
  }

  // Status display helper
  const statusText = content.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Document Header */}
      <div className="border-b border-gray-100 pb-8 mb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 tracking-wide mb-3">Project Brief</p>
            <h1 className="text-3xl font-light text-gray-900 tracking-tight">Overview</h1>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setEditing(false); fetchContent(); }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-full disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <section className="mb-10">
        <h2 className="text-xs text-gray-400 tracking-wide mb-3">Status</h2>
        {editing ? (
          <select
            value={content.status}
            onChange={(e) => setContent(prev => ({ ...prev, status: e.target.value as OverviewContent['status'] }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        ) : (
          <p className="text-gray-800 text-base font-medium">{statusText}</p>
        )}
      </section>

      {/* Purpose */}
      <section className="mb-10">
        <h2 className="text-xs text-gray-400 tracking-wide mb-3">Purpose</h2>
        {editing ? (
          <textarea
            value={content.purpose}
            onChange={(e) => setContent(prev => ({ ...prev, purpose: e.target.value }))}
            placeholder="Describe the purpose of this project..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base text-gray-800 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 resize-none leading-relaxed"
            rows={3}
          />
        ) : (
          <p className="text-gray-600 text-base leading-relaxed max-w-prose">
            {content.purpose || <span className="text-gray-400 italic">No purpose defined.</span>}
          </p>
        )}
      </section>

      {/* Goals */}
      <section className="mb-10">
        <h2 className="text-xs text-gray-400 tracking-wide mb-4">Goals</h2>
        {content.goals.length > 0 ? (
          <div className="space-y-3">
            {content.goals.map((goal, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                  {idx + 1}
                </div>
                <span className="flex-1 text-gray-700 text-sm leading-relaxed pt-0.5">{goal}</span>
                {editing && (
                  <button onClick={() => removeGoal(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No goals defined.</p>
        )}
        {editing && (
          <div className="flex items-center gap-3 mt-4">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a goal..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-1 focus:ring-gray-300"
              onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            />
            <button 
              onClick={addGoal} 
              className="p-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Owners */}
      <section className="mb-10">
        <h2 className="text-xs text-gray-400 tracking-wide mb-4">Owners</h2>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => toggleOwner(member.id)}
                className={cn(
                  "text-sm px-4 py-2 rounded-full transition-colors",
                  content.owners.includes(member.id)
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {member.full_name || member.email}
              </button>
            ))}
          </div>
        ) : ownerUsers.length > 0 ? (
          <div className="space-y-2">
            {ownerUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span className="text-gray-700 text-sm">{user.full_name || user.email}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No owners assigned.</p>
        )}
      </section>

      {/* Links & Resources */}
      <section className="mb-10">
        <h2 className="text-xs text-gray-400 tracking-wide mb-4">Links & Resources</h2>
        {content.links.length > 0 ? (
          <div className="space-y-2">
            {content.links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 text-sm flex-1">
                  {link.label}
                </a>
                {editing && (
                  <button onClick={() => removeLink(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No links added.</p>
        )}
        {editing && (
          <div className="flex items-center gap-3 mt-4">
            <input
              type="text"
              value={newLink.label}
              onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Label"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800"
            />
            <input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
              placeholder="URL"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800"
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
            />
            <button 
              onClick={addLink} 
              className="p-2.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Footer Meta */}
      <div className="pt-8 border-t border-gray-100 text-xs text-gray-300 tracking-wide">
        Project Overview • Internal Reference
      </div>
    </div>
  );
};
