import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { Message } from '../types';
import { 
  BellIcon,
  UserPlusIcon,
  UserMinusIcon,
  DocumentTextIcon,
  CogIcon,
  HashtagIcon,
  ChartBarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../../lib/utils';

interface ActivityTabProps {
  channelId: string;
  teamId: string;
  currentUserId: string;
  isAdmin: boolean;
}

const EVENT_CONFIG: Record<string, { icon: React.FC<{ className?: string }>; color: string; label: string }> = {
  member_joined: { icon: UserPlusIcon, color: 'bg-green-100 text-green-600', label: 'Member Joined' },
  member_left: { icon: UserMinusIcon, color: 'bg-red-100 text-red-600', label: 'Member Left' },
  report_submitted: { icon: DocumentTextIcon, color: 'bg-blue-100 text-blue-600', label: 'Report Submitted' },
  report_generated: { icon: ChartBarIcon, color: 'bg-purple-100 text-purple-600', label: 'Report Generated' },
  form_updated: { icon: DocumentTextIcon, color: 'bg-yellow-100 text-yellow-600', label: 'Form Updated' },
  channel_created: { icon: HashtagIcon, color: 'bg-slate-100 text-slate-600', label: 'Channel Created' },
  settings_updated: { icon: CogIcon, color: 'bg-slate-100 text-slate-600', label: 'Settings Updated' },
  default: { icon: BellIcon, color: 'bg-slate-100 text-slate-600', label: 'Event' },
};

export const ActivityTab: React.FC<ActivityTabProps> = ({
  channelId,
  teamId,
  currentUserId,
  isAdmin,
}) => {
  const [events, setEvents] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, [channelId, teamId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch system messages from team_messages
      const { data, error } = await supabase
        .from('team_messages')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_system_message', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getEventConfig = (eventType: string | null) => {
    return EVENT_CONFIG[eventType || 'default'] || EVENT_CONFIG.default;
  };

  const eventTypes = ['all', ...Object.keys(EVENT_CONFIG).filter(k => k !== 'default')];

  const filteredEvents = filterType === 'all'
    ? events
    : events.filter(e => e.system_event_type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Activity Log</h2>
        
        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
          <FunnelIcon className="w-4 h-4 text-slate-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
          >
            <option value="all">All Events</option>
            <option value="member_joined">Member Joined</option>
            <option value="member_left">Member Left</option>
            <option value="report_submitted">Report Submitted</option>
            <option value="report_generated">Report Generated</option>
            <option value="form_updated">Form Updated</option>
            <option value="channel_created">Channel Created</option>
            <option value="settings_updated">Settings Updated</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <BellIcon className="w-12 h-12 mb-2" />
          <p className="text-sm font-medium">No activity yet</p>
          <p className="text-xs">System events will appear here</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const config = getEventConfig(event.system_event_type);
              const Icon = config.icon;

              return (
                <div key={event.id} className="relative flex items-start gap-4 pl-12">
                  {/* Icon */}
                  <div className={cn(
                    "absolute left-3 w-7 h-7 rounded-full flex items-center justify-center",
                    config.color
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {event.content}
                    </p>
                    {event.system_event_data && (
                      <div className="mt-2 text-xs text-slate-500">
                        {event.system_event_data.user_name && (
                          <span className="mr-3">User: {event.system_event_data.user_name}</span>
                        )}
                        {event.system_event_data.report_week && (
                          <span className="mr-3">Week: {event.system_event_data.report_week}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
