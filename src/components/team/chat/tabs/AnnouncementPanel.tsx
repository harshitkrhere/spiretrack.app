import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import type { ChannelAnnouncement, MessageUser } from '../types';
import { 
  MegaphoneIcon, 
  PlusIcon,
  CalendarIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HandRaisedIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../../lib/utils';
import { Avatar } from '../../../ui/Avatar';
import { Button } from '../../../ui/Button';

interface AnnouncementPanelProps {
  channelId: string;
  teamId: string;
  isAdmin: boolean;
}

interface AnnouncementWithUser extends ChannelAnnouncement {
  creator?: MessageUser;
  is_read?: boolean;
  read_count?: number;
  requires_acknowledgement?: boolean;
  is_acknowledged?: boolean;
  ack_count?: number;
}

export const AnnouncementPanel: React.FC<AnnouncementPanelProps> = ({
  channelId,
  teamId,
  isAdmin,
}) => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', body: '', requiresAcknowledgement: false });
  const [submitting, setSubmitting] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [channelId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_announcements')
        .select('*, requires_acknowledgement')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user details for creators
      const userIds = [...new Set((data || []).map(a => a.created_by).filter(Boolean))];
      let userMap = new Map<string, MessageUser>();
      
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);
        
        (users || []).forEach(u => userMap.set(u.id, u));
      }

      // Get read receipts for current user
      const announcementIds = (data || []).map(a => a.id);
      let readSet = new Set<string>();
      
      if (user && announcementIds.length > 0) {
        const { data: receipts } = await supabase
          .from('read_receipts')
          .select('entity_id')
          .eq('user_id', user.id)
          .eq('entity_type', 'announcement')
          .in('entity_id', announcementIds);
        
        (receipts || []).forEach(r => readSet.add(r.entity_id));
      }

      // Get acknowledgements for current user
      let ackSet = new Set<string>();
      if (user && announcementIds.length > 0) {
        const { data: ackReceipts } = await supabase
          .from('read_receipts')
          .select('entity_id')
          .eq('user_id', user.id)
          .eq('entity_type', 'announcement')
          .in('entity_id', announcementIds)
          .not('acknowledged_at', 'is', null);
        
        (ackReceipts || []).forEach(r => ackSet.add(r.entity_id));
      }

      // Get acknowledgement counts for each announcement (admin view)
      let ackCountMap = new Map<string, number>();
      if (announcementIds.length > 0) {
        const { data: allAcks } = await supabase
          .from('read_receipts')
          .select('entity_id')
          .eq('entity_type', 'announcement')
          .in('entity_id', announcementIds)
          .not('acknowledged_at', 'is', null);
        
        (allAcks || []).forEach(r => {
          ackCountMap.set(r.entity_id, (ackCountMap.get(r.entity_id) || 0) + 1);
        });
      }

      const announcementsWithUsers = (data || []).map(announcement => ({
        ...announcement,
        creator: announcement.created_by ? userMap.get(announcement.created_by) : undefined,
        is_read: readSet.has(announcement.id),
        is_acknowledged: ackSet.has(announcement.id),
        ack_count: ackCountMap.get(announcement.id) || 0,
      }));

      setAnnouncements(announcementsWithUsers);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!user) return;
    
    try {
      await supabase.from('read_receipts').upsert({
        user_id: user.id,
        entity_type: 'announcement',
        entity_id: announcementId,
        team_id: teamId,
      }, {
        onConflict: 'user_id,entity_type,entity_id'
      });

      setAnnouncements(prev => prev.map(a => 
        a.id === announcementId ? { ...a, is_read: true } : a
      ));
    } catch (err) {
      console.error('Error marking announcement as read:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim() || !user) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('channel_announcements')
        .insert({
          channel_id: channelId,
          team_id: teamId,
          title: formData.title.trim(),
          body: formData.body.trim(),
          created_by: user.id,
          requires_acknowledgement: formData.requiresAcknowledgement,
        });

      if (error) throw error;

      setFormData({ title: '', body: '', requiresAcknowledgement: false });
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error creating announcement:', err);
      alert('Failed to post announcement');
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

  const unreadCount = announcements.filter(a => !a.is_read).length;

  const handleDelete = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const { error } = await supabase
        .from('channel_announcements')
        .delete()
        .eq('id', announcementId);

      if (error) throw error;
      
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Failed to delete announcement');
    }
  };

  const handleAcknowledge = async (announcementId: string) => {
    if (!user) return;
    setAcknowledging(announcementId);
    
    try {
      const { error } = await supabase.rpc('acknowledge_entity', {
        p_entity_type: 'announcement',
        p_entity_id: announcementId,
        p_team_id: teamId,
      });

      if (error) throw error;

      setAnnouncements(prev => prev.map(a =>
        a.id === announcementId ? { ...a, is_acknowledged: true, is_read: true } : a
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
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            Announcements
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Important updates that should not be missed
          </p>
        </div>
        
        {isAdmin && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Post Announcement
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAdmin && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Announcement title"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Content
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Write your announcement..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting || !formData.title.trim() || !formData.body.trim()}>
              {submitting ? 'Posting...' : 'Post Announcement'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => {
              setShowForm(false);
              setFormData({ title: '', body: '', requiresAcknowledgement: false });
            }}>
              Cancel
            </Button>
          </div>
          
          {/* Requires Acknowledgement Toggle */}
          <label className="flex items-center gap-3 mt-4 pt-4 border-t border-blue-200 cursor-pointer">
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
              <p className="text-xs text-slate-500">Team members must explicitly sign off on this announcement</p>
            </div>
          </label>
        </form>
      )}

      {/* Announcement List */}
      {announcements.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
          <MegaphoneIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No announcements yet</h3>
          <p className="text-sm text-slate-500">
            {isAdmin 
              ? 'Post important updates for your team' 
              : 'No announcements have been posted yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={cn(
                "bg-white rounded-lg border p-5 transition-colors",
                announcement.is_read 
                  ? "border-slate-200" 
                  : "border-blue-300 bg-blue-50/30"
              )}
              onClick={() => !announcement.is_read && markAsRead(announcement.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {!announcement.is_read && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        New
                      </span>
                    )}
                    {announcement.requires_acknowledgement && announcement.is_acknowledged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Acknowledged
                      </span>
                    )}
                    {announcement.requires_acknowledgement && (announcement.ack_count || 0) > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {announcement.ack_count} signed
                      </span>
                    )}
                    {announcement.requires_acknowledgement && !announcement.is_acknowledged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                        Requires Sign-off
                      </span>
                    )}
                    {!announcement.requires_acknowledgement && announcement.is_read && (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Read
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-slate-900 text-lg">{announcement.title}</h4>
                  <p className="text-slate-600 mt-2 whitespace-pre-wrap">{announcement.body}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                {/* Posted by */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {announcement.creator ? (
                    <>
                      <Avatar 
                        src={announcement.creator.avatar_url} 
                        name={announcement.creator.full_name || announcement.creator.email}
                        size="xs"
                      />
                      <span>{announcement.creator.full_name || announcement.creator.email}</span>
                    </>
                  ) : (
                    <span>Unknown</span>
                  )}
                </div>
                
                {/* Date */}
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(announcement.created_at)}</span>
                </div>
                
                {/* Acknowledge Button */}
                {announcement.requires_acknowledgement && !announcement.is_acknowledged && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcknowledge(announcement.id);
                    }}
                    disabled={acknowledging === announcement.id}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    <HandRaisedIcon className="h-4 w-4" />
                    {acknowledging === announcement.id ? 'Signing...' : 'I Acknowledge'}
                  </button>
                )}
                
                {/* Delete Button (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(announcement.id);
                    }}
                    className="ml-auto p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete announcement"
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
