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
        await supabase
          .from('channel_tab_content')
          .update({ content, updated_by: currentUserId })
          .eq('tab_id', tabId);
      } else {
        await supabase
          .from('channel_tab_content')
          .insert({ tab_id: tabId, content, updated_by: currentUserId });
      }

      setEditing(false);
    } catch (err) {
      console.error('Error saving overview:', err);
      alert('Failed to save changes');
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
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Project Brief</p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setEditing(false); fetchContent(); }}
                className="text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status - Text Only, No Badge */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Status</h2>
        {editing ? (
          <select
            value={content.status}
            onChange={(e) => setContent(prev => ({ ...prev, status: e.target.value as OverviewContent['status'] }))}
            className="px-2 py-1.5 border border-slate-200 rounded-sm text-sm text-slate-800 focus:ring-1 focus:ring-slate-300 focus:border-slate-300"
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        ) : (
          <p className="text-slate-800 text-[15px] font-medium">{statusText}</p>
        )}
      </section>

      {/* Purpose - Mission Statement */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Purpose</h2>
        {editing ? (
          <textarea
            value={content.purpose}
            onChange={(e) => setContent(prev => ({ ...prev, purpose: e.target.value }))}
            placeholder="Describe the purpose of this project..."
            className="w-full px-3 py-2 border border-slate-200 rounded-sm text-[15px] text-slate-800 focus:ring-1 focus:ring-slate-300 focus:border-slate-300 resize-none leading-relaxed"
            rows={3}
          />
        ) : (
          <p className="text-slate-700 text-[15px] leading-relaxed max-w-prose">
            {content.purpose || <span className="text-slate-400 italic">No purpose defined.</span>}
          </p>
        )}
      </section>

      {/* Goals - Numbered List */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">Goals</h2>
        {content.goals.length > 0 ? (
          <ol className="space-y-2 list-decimal list-inside">
            {content.goals.map((goal, idx) => (
              <li key={idx} className="text-slate-700 text-[15px] leading-relaxed flex items-start gap-2">
                <span className="text-slate-400 font-mono text-xs mt-0.5">{idx + 1}.</span>
                <span className="flex-1">{goal}</span>
                {editing && (
                  <button onClick={() => removeGoal(idx)} className="text-slate-400 hover:text-red-500 ml-2">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-400 text-sm italic">No goals defined.</p>
        )}
        {editing && (
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a goal..."
              className="flex-1 px-2 py-1.5 border border-slate-200 rounded-sm text-sm text-slate-800"
              onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            />
            <button onClick={addGoal} className="text-slate-500 hover:text-slate-800">
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Owners - Simple Text List */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">Owners</h2>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => toggleOwner(member.id)}
                className={cn(
                  "text-sm px-2 py-1 rounded-sm transition-colors",
                  content.owners.includes(member.id)
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {member.full_name || member.email}
              </button>
            ))}
          </div>
        ) : ownerUsers.length > 0 ? (
          <ul className="space-y-1">
            {ownerUsers.map((user) => (
              <li key={user.id} className="text-slate-700 text-[15px]">
                {user.full_name || user.email}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-sm italic">No owners assigned.</p>
        )}
      </section>

      {/* Links & Resources - Clean List */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">Links & Resources</h2>
        {content.links.length > 0 ? (
          <ul className="space-y-1.5">
            {content.links.map((link, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[15px]">
                <span className="text-slate-400">→</span>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900 hover:underline">
                  {link.label}
                </a>
                {editing && (
                  <button onClick={() => removeLink(idx)} className="text-slate-400 hover:text-red-500 ml-auto">
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-sm italic">No links added.</p>
        )}
        {editing && (
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={newLink.label}
              onChange={(e) => setNewLink(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Label"
              className="flex-1 px-2 py-1.5 border border-slate-200 rounded-sm text-sm text-slate-800"
            />
            <input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
              placeholder="URL"
              className="flex-1 px-2 py-1.5 border border-slate-200 rounded-sm text-sm text-slate-800"
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
            />
            <button onClick={addLink} className="text-slate-500 hover:text-slate-800">
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* Footer Meta */}
      <div className="pt-6 border-t border-slate-100 text-[10px] font-mono text-slate-300 uppercase tracking-widest">
        Project Overview • Internal Reference
      </div>
    </div>
  );
};
