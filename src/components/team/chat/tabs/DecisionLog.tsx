import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import type { ChannelDecision, MessageUser } from '../types';
import { 
  ScaleIcon, 
  PlusIcon,
  LinkIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../../lib/utils';
import { Avatar } from '../../../ui/Avatar';
import { Button } from '../../../ui/Button';

interface DecisionLogProps {
  channelId: string;
  teamId: string;
  isAdmin: boolean;
}

interface DecisionWithUser extends ChannelDecision {
  decider?: MessageUser;
  requires_acknowledgement?: boolean;
  is_acknowledged?: boolean;
  ack_count?: number;
}

export const DecisionLog: React.FC<DecisionLogProps> = ({
  channelId,
  teamId,
  isAdmin,
}) => {
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<DecisionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', requiresAcknowledgement: false });
  const [submitting, setSubmitting] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  useEffect(() => {
    fetchDecisions();
  }, [channelId]);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_decisions')
        .select('*, requires_acknowledgement')
        .eq('channel_id', channelId)
        .order('decided_at', { ascending: false });

      if (error) throw error;

      // Fetch user details for deciders
      const userIds = [...new Set((data || []).map(d => d.decided_by).filter(Boolean))];
      let userMap = new Map<string, MessageUser>();
      
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);
        
        (users || []).forEach(u => userMap.set(u.id, u));
      }

      // Get acknowledgements for current user
      const decisionIds = (data || []).map(d => d.id);
      let ackSet = new Set<string>();
      if (user && decisionIds.length > 0) {
        const { data: ackReceipts } = await supabase
          .from('read_receipts')
          .select('entity_id')
          .eq('user_id', user.id)
          .eq('entity_type', 'decision')
          .in('entity_id', decisionIds)
          .not('acknowledged_at', 'is', null);
        
        (ackReceipts || []).forEach(r => ackSet.add(r.entity_id));
      }

      // Get acknowledgement counts
      let ackCountMap = new Map<string, number>();
      if (decisionIds.length > 0) {
        const { data: allAcks } = await supabase
          .from('read_receipts')
          .select('entity_id')
          .eq('entity_type', 'decision')
          .in('entity_id', decisionIds)
          .not('acknowledged_at', 'is', null);
        
        (allAcks || []).forEach(r => {
          ackCountMap.set(r.entity_id, (ackCountMap.get(r.entity_id) || 0) + 1);
        });
      }

      const decisionsWithUsers = (data || []).map(decision => ({
        ...decision,
        related_entities: decision.related_entities || [],
        decider: decision.decided_by ? userMap.get(decision.decided_by) : undefined,
        is_acknowledged: ackSet.has(decision.id),
        ack_count: ackCountMap.get(decision.id) || 0,
      }));

      setDecisions(decisionsWithUsers);
    } catch (err) {
      console.error('Error fetching decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !user) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('channel_decisions')
        .insert({
          channel_id: channelId,
          team_id: teamId,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          decided_by: user.id,
          related_entities: [],
          requires_acknowledgement: formData.requiresAcknowledgement,
        });

      if (error) throw error;

      setFormData({ title: '', description: '', requiresAcknowledgement: false });
      setShowForm(false);
      fetchDecisions();
    } catch (err) {
      console.error('Error creating decision:', err);
      alert('Failed to record decision');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDelete = async (decisionId: string) => {
    if (!confirm('Are you sure you want to delete this decision? This is a permanent record.')) return;
    
    try {
      const { error } = await supabase
        .from('channel_decisions')
        .delete()
        .eq('id', decisionId);

      if (error) throw error;
      
      setDecisions(prev => prev.filter(d => d.id !== decisionId));
    } catch (err) {
      console.error('Error deleting decision:', err);
      alert('Failed to delete decision');
    }
  };

  const handleAcknowledge = async (decisionId: string) => {
    if (!user) return;
    setAcknowledging(decisionId);
    
    try {
      const { error } = await supabase.rpc('acknowledge_entity', {
        p_entity_type: 'decision',
        p_entity_id: decisionId,
        p_team_id: teamId,
      });

      if (error) throw error;

      setDecisions(prev => prev.map(d =>
        d.id === decisionId ? { ...d, is_acknowledged: true } : d
      ));
    } catch (err) {
      console.error('Error acknowledging:', err);
      alert('Failed to acknowledge');
    } finally {
      setAcknowledging(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Decision Log</h2>
          <p className="text-sm text-slate-500 mt-1">
            Permanent record of decisions made in this channel
          </p>
        </div>
        
        {isAdmin && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Record Decision
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Decision Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What was decided?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Context (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Why was this decision made? What alternatives were considered?"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting || !formData.title.trim()}>
              {submitting ? 'Recording...' : 'Record Decision'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => {
              setShowForm(false);
              setFormData({ title: '', description: '', requiresAcknowledgement: false });
            }}>
              Cancel
            </Button>
          </div>
          
          {/* Requires Acknowledgement Toggle */}
          <label className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requiresAcknowledgement}
              onChange={(e) => setFormData(prev => ({ ...prev, requiresAcknowledgement: e.target.checked }))}
              className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                Require Acknowledgement
              </span>
              <p className="text-xs text-slate-500">Team members must explicitly sign off on this decision</p>
            </div>
          </label>
        </form>
      )}

      {/* Decision List */}
      {decisions.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
          <ScaleIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No decisions recorded</h3>
          <p className="text-sm text-slate-500">
            {isAdmin 
              ? 'Record important decisions to create a permanent reference' 
              : 'No decisions have been recorded in this channel yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {decisions.map((decision, index) => (
            <div
              key={decision.id}
              className="bg-white rounded-lg border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                      Decision #{decisions.length - index}
                    </span>
                    {decision.requires_acknowledgement && decision.is_acknowledged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Acknowledged
                      </span>
                    )}
                    {decision.requires_acknowledgement && (decision.ack_count || 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {decision.ack_count} signed
                      </span>
                    )}
                    {decision.requires_acknowledgement && !decision.is_acknowledged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                        Requires Sign-off
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 text-lg">{decision.title}</h4>
                  
                  {decision.description && (
                    <p className="text-slate-600 mt-2">{decision.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                {/* Decided by */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {decision.decider ? (
                    <>
                      <Avatar 
                        src={decision.decider.avatar_url} 
                        name={decision.decider.full_name || decision.decider.email}
                        size="xs"
                      />
                      <span>{decision.decider.full_name || decision.decider.email}</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="h-4 w-4" />
                      <span>Unknown</span>
                    </>
                  )}
                </div>
                
                {/* Date */}
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(decision.decided_at)}</span>
                </div>
                
                {/* Related entities */}
                {decision.related_entities.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <LinkIcon className="h-4 w-4" />
                    <span>{decision.related_entities.length} linked</span>
                  </div>
                )}
                
                {/* Acknowledge Button */}
                {decision.requires_acknowledgement && !decision.is_acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(decision.id)}
                    disabled={acknowledging === decision.id}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    <HandRaisedIcon className="h-4 w-4" />
                    {acknowledging === decision.id ? 'Signing...' : 'I Acknowledge'}
                  </button>
                )}
                
                {/* Delete Button (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(decision.id)}
                    className="ml-auto p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete decision"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
