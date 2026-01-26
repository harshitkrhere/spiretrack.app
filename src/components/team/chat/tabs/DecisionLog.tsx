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
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 tracking-wide mb-2">Record Keeping</p>
          <h2 className="text-2xl font-light text-gray-900">Decision Log</h2>
          <p className="text-sm text-gray-400 mt-2">
            Permanent record of decisions made in this channel
          </p>
        </div>
        
        {isAdmin && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            Record Decision
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs text-gray-400 tracking-wide mb-2">
              Decision Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What was decided?"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-300 focus:border-gray-300 bg-white"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 tracking-wide mb-2">
              Context (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Why was this decision made? What alternatives were considered?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-gray-300 focus:border-gray-300 bg-white"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="submit" 
              disabled={submitting || !formData.title.trim()}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Recording...' : 'Record Decision'}
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowForm(false);
                setFormData({ title: '', description: '', requiresAcknowledgement: false });
              }}
              className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
          
          {/* Requires Acknowledgement Toggle */}
          <label className="flex items-center gap-3 pt-5 border-t border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requiresAcknowledgement}
              onChange={(e) => setFormData(prev => ({ ...prev, requiresAcknowledgement: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            <div>
              <span className="text-sm text-gray-700 flex items-center gap-1">
                Require Acknowledgement
              </span>
              <p className="text-xs text-gray-400">Team members must explicitly sign off on this decision</p>
            </div>
          </label>
        </form>
      )}

      {/* Decision List */}
      {decisions.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <ScaleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-600 mb-2">No decisions recorded</h3>
          <p className="text-sm text-gray-400">
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
              className="bg-gray-50 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400 tracking-wide">
                      Decision #{decisions.length - index}
                    </span>
                    {decision.requires_acknowledgement && decision.is_acknowledged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Acknowledged
                      </span>
                    )}
                    {decision.requires_acknowledgement && (decision.ack_count || 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        {decision.ack_count} signed
                      </span>
                    )}
                    {decision.requires_acknowledgement && !decision.is_acknowledged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                        Requires Sign-off
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 text-lg">{decision.title}</h4>
                  
                  {decision.description && (
                    <p className="text-gray-600 mt-2">{decision.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-200">
                {/* Decided by */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(decision.decided_at)}</span>
                </div>
                
                {/* Related entities */}
                {decision.related_entities.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <LinkIcon className="h-4 w-4" />
                    <span>{decision.related_entities.length} linked</span>
                  </div>
                )}
                
                {/* Acknowledge Button */}
                {decision.requires_acknowledgement && !decision.is_acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(decision.id)}
                    disabled={acknowledging === decision.id}
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <HandRaisedIcon className="h-4 w-4" />
                    {acknowledging === decision.id ? 'Signing...' : 'I Acknowledge'}
                  </button>
                )}
                
                {/* Delete Button (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(decision.id)}
                    className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
