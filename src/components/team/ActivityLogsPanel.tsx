import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ShieldCheckIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ListBulletIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { exportToCSV, formatActivityLogsForExport, activityLogColumns } from '../../lib/exportUtils';

interface ActivityLog {
  id: string;
  team_id: string;
  actor_id: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
  actor?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface ActivityLogsPanelProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
}

const actionConfig: Record<string, { icon: React.ComponentType<{ className?: string }>, label: string, color: string }> = {
  member_joined: { icon: UserPlusIcon, label: 'Member Joined', color: 'bg-green-100 text-green-600' },
  member_left: { icon: UserMinusIcon, label: 'Member Left', color: 'bg-slate-100 text-slate-600' },
  member_removed: { icon: XMarkIcon, label: 'Member Removed', color: 'bg-red-100 text-red-600' },
  role_changed: { icon: ShieldCheckIcon, label: 'Role Changed', color: 'bg-blue-100 text-blue-600' },
  report_generated: { icon: DocumentTextIcon, label: 'Report Generated', color: 'bg-purple-100 text-purple-600' },
  form_updated: { icon: DocumentTextIcon, label: 'Form Updated', color: 'bg-amber-100 text-amber-600' },
  settings_changed: { icon: Cog6ToothIcon, label: 'Settings Changed', color: 'bg-slate-100 text-slate-600' },
  channel_created: { icon: ChatBubbleLeftRightIcon, label: 'Channel Created', color: 'bg-indigo-100 text-indigo-600' },
  channel_deleted: { icon: XMarkIcon, label: 'Channel Deleted', color: 'bg-red-100 text-red-600' },
  // Phase 3.3: Compliance actions
  ownership_changed: { icon: ShieldCheckIcon, label: 'Ownership Changed', color: 'bg-blue-100 text-blue-600' },
  locked: { icon: ShieldCheckIcon, label: 'Locked', color: 'bg-amber-100 text-amber-600' },
  unlocked: { icon: ShieldCheckIcon, label: 'Unlocked', color: 'bg-green-100 text-green-600' },
  deadline_changed: { icon: ClockIcon, label: 'Deadline Changed', color: 'bg-amber-100 text-amber-600' },
  acknowledged: { icon: ShieldCheckIcon, label: 'Acknowledged', color: 'bg-emerald-100 text-emerald-600' },
};

export const ActivityLogsPanel: React.FC<ActivityLogsPanelProps> = ({ teamId, isOpen, onClose }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [teamMembers, setTeamMembers] = useState<{ id: string; name: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      fetchTeamMembers();
    }
  }, [isOpen, teamId, filter, dateRange, userFilter]);

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('user_id, users!inner(id, full_name, email)')
      .eq('team_id', teamId);
    
    if (data) {
      setTeamMembers(data.map((m: any) => ({
        id: m.users.id,
        name: m.users.full_name || m.users.email
      })));
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const startDate = new Date();
      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      else startDate.setDate(startDate.getDate() - 90);

      let query = supabase
        .from('team_activity_logs')
        .select('*')
        .eq('team_id', teamId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      if (filter !== 'all') query = query.eq('action', filter);
      if (userFilter !== 'all') query = query.eq('actor_id', userFilter);

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const actorIds = [...new Set(data.map(l => l.actor_id).filter(Boolean))];
        
        if (actorIds.length > 0) {
          const { data: actors } = await supabase
            .from('users')
            .select('id, full_name, email, avatar_url')
            .in('id', actorIds);

          const actorMap = new Map(actors?.map(a => [a.id, a]) || []);
          setLogs(data.map(log => ({
            ...log,
            actor: log.actor_id ? actorMap.get(log.actor_id) : undefined
          })));
        } else {
          setLogs(data);
        }
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getActionDescription = (log: ActivityLog) => {
    const actorName = log.actor?.full_name || log.actor?.email || 'Someone';
    const details = log.details || {};

    switch (log.action) {
      case 'member_joined': return `${actorName} joined the team`;
      case 'member_left': return `${actorName} left the team`;
      case 'member_removed': return `${details.removed_user_name || 'A member'} was removed by ${actorName}`;
      case 'role_changed': return `${actorName} changed role from ${details.old_role || '?'} to ${details.new_role || '?'}`;
      case 'report_generated': return `${actorName} generated a weekly report`;
      case 'form_updated': return `${actorName} updated the team form`;
      case 'settings_changed': return `${actorName} updated team settings`;
      case 'channel_created': return `${actorName} created channel "${details.channel_name || 'unknown'}"`;
      case 'channel_deleted': return `${actorName} deleted channel "${details.channel_name || 'unknown'}"`;
      // Phase 3.3: Compliance actions
      case 'ownership_changed': return `${actorName} changed ownership of ${details.entity_type || 'item'}`;
      case 'locked': return `${actorName} locked ${details.entity_type || 'item'} #${details.entity_id?.slice(0, 8) || ''}`;
      case 'unlocked': return `${actorName} unlocked ${details.entity_type || 'item'} #${details.entity_id?.slice(0, 8) || ''}`;
      case 'deadline_changed': return `${actorName} changed deadline for ${details.entity_type || 'review'}`;
      case 'acknowledged': return `${actorName} acknowledged ${details.entity_type || 'item'}`;
      default: return `${actorName} performed action: ${log.action}`;
    }
  };

  // Render before/after diff for compliance actions
  const renderDiffView = (log: ActivityLog) => {
    const details = log.details || {};
    if (!details.before_state && !details.after_state) return null;

    return (
      <div className="mt-2 text-xs bg-slate-50 rounded border border-slate-200 p-2">
        <div className="flex gap-4">
          {details.before_state && (
            <div className="flex-1">
              <span className="font-medium text-red-600">Before:</span>
              <pre className="mt-1 text-slate-600 whitespace-pre-wrap overflow-hidden">
                {JSON.stringify(details.before_state, null, 2)}
              </pre>
            </div>
          )}
          {details.after_state && (
            <div className="flex-1">
              <span className="font-medium text-green-600">After:</span>
              <pre className="mt-1 text-slate-600 whitespace-pre-wrap overflow-hidden">
                {JSON.stringify(details.after_state, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Activity Logs</h2>
            <p className="text-sm text-slate-500">Audit trail for compliance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button onClick={() => setViewMode('timeline')} className={cn('p-1.5 rounded-md', viewMode === 'timeline' ? 'bg-white shadow-sm' : 'text-slate-500')}>
                <ClockIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={cn('p-1.5 rounded-md', viewMode === 'table' ? 'bg-white shadow-sm' : 'text-slate-500')}>
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <XMarkIcon className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <FunnelIcon className="h-4 w-4" /> Filters {(filter !== 'all' || userFilter !== 'all') && '(Active)'}
            </button>
            <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button key={range} onClick={() => setDateRange(range)} className={cn('px-3 py-1 text-xs font-medium rounded-md', dateRange === range ? 'bg-slate-900 text-white' : 'text-slate-600')}>
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
          {showFilters && (
            <div className="flex items-center gap-4 pt-3 border-t border-slate-200 mt-3">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                <option value="all">All Actions</option>
                {Object.entries(actionConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
              </select>
              <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                <option value="all">All Users</option>
                {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><ArrowPathIcon className="h-6 w-6 text-slate-400 animate-spin" /></div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <DocumentTextIcon className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-medium">No activity logs found</p>
            </div>
          ) : viewMode === 'timeline' ? (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => {
                const config = actionConfig[log.action] || { icon: DocumentTextIcon, label: log.action, color: 'bg-slate-100 text-slate-600' };
                const Icon = config.icon;
                return (
                    <div key={log.id} className="px-6 py-4 hover:bg-slate-50">
                      <div className="flex items-start gap-3">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", config.color)}><Icon className="h-5 w-5" /></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">{getActionDescription(log)}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatTime(log.created_at)}</p>
                          {/* Show diff view for actions with before/after state */}
                          {renderDiffView(log)}
                          {/* Show additional details */}
                          {log.details && Object.keys(log.details).length > 0 && !log.details.before_state && (
                            <details className="mt-2">
                              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                                View details
                              </summary>
                              <pre className="mt-1 text-xs bg-slate-50 rounded border border-slate-200 p-2 text-slate-600 overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b"><tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Actor</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{formatFullDate(log.created_at)}</td>
                    <td className="px-4 py-3 text-slate-900">{log.actor?.full_name || 'System'}</td>
                    <td className="px-4 py-3"><span className={cn("px-2 py-1 rounded-md text-xs font-medium", actionConfig[log.action]?.color || 'bg-slate-100')}>{actionConfig[log.action]?.label || log.action}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">{logs.length} entries • Retained 90 days</p>
          {logs.length > 0 && (
            <button onClick={() => { exportToCSV(formatActivityLogsForExport(logs), activityLogColumns, `activity_logs_${new Date().toISOString().split('T')[0]}`); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg">
              <ArrowDownTrayIcon className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>
      </div>
    </>
  );
};
