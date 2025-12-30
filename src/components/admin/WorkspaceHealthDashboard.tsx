import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { Skeleton } from '../ui/Skeleton';

interface HealthMetrics {
  submissionRate: number;
  activeMembers: number;
  totalMembers: number;
  reportConsistency: number;
  channelActivity: number;
}

interface WorkspaceHealthDashboardProps {
  teamId?: string; // Optional - if not provided, shows aggregate
}

/**
 * WorkspaceHealthDashboard - Admin-only KPI overview
 * Read-only operational insight into team health
 */
export const WorkspaceHealthDashboard: React.FC<WorkspaceHealthDashboardProps> = ({ teamId }) => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthMetrics();
  }, [teamId]);

  const fetchHealthMetrics = async () => {
    setLoading(true);
    try {
      // Fetch team members
      let membersQuery = supabase.from('team_members').select('user_id, team_id');
      if (teamId) membersQuery = membersQuery.eq('team_id', teamId);
      const { data: members } = await membersQuery;

      // Fetch recent reports (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let reportsQuery = supabase
        .from('weekly_reports')
        .select('id, user_id, created_at, team_id')
        .gte('created_at', thirtyDaysAgo.toISOString());
      if (teamId) reportsQuery = reportsQuery.eq('team_id', teamId);
      const { data: reports } = await reportsQuery;

      // Fetch recent channel messages (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const messagesQuery = supabase
        .from('team_messages')
        .select('id, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());
      const { data: messages } = await messagesQuery;

      // Calculate metrics
      const totalMembers = members?.length || 0;
      const uniqueReporters = new Set(reports?.map(r => r.user_id) || []).size;
      const submissionRate = totalMembers > 0 
        ? Math.round((uniqueReporters / totalMembers) * 100) 
        : 0;

      // Active members = submitted at least 1 report in last 30 days
      const activeMembers = uniqueReporters;

      // Report consistency = avg reports per person (expecting ~4 per month)
      const avgReports = totalMembers > 0 
        ? (reports?.length || 0) / totalMembers 
        : 0;
      const reportConsistency = Math.min(100, Math.round((avgReports / 4) * 100));

      // Channel activity = messages per day per member
      const messagesPerDay = (messages?.length || 0) / 7;
      const channelActivity = totalMembers > 0 
        ? Math.min(100, Math.round((messagesPerDay / totalMembers) * 20)) 
        : 0;

      setMetrics({
        submissionRate,
        activeMembers,
        totalMembers,
        reportConsistency,
        channelActivity,
      });
    } catch (error) {
      console.error('Error fetching health metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (value: number) => {
    if (value >= 80) return 'text-emerald-600';
    if (value >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusBg = (value: number) => {
    if (value >= 80) return 'bg-emerald-50 border-emerald-200';
    if (value >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (value: number) => {
    if (value >= 80) return CheckCircleIcon;
    if (value >= 50) return ArrowTrendingUpIcon;
    return ExclamationTriangleIcon;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const kpis = [
    {
      label: 'Submission Rate',
      value: `${metrics.submissionRate}%`,
      description: 'Members who submitted this month',
      icon: DocumentTextIcon,
      status: metrics.submissionRate,
    },
    {
      label: 'Active Members',
      value: `${metrics.activeMembers}/${metrics.totalMembers}`,
      description: 'Active in last 30 days',
      icon: UsersIcon,
      status: metrics.totalMembers > 0 
        ? (metrics.activeMembers / metrics.totalMembers) * 100 
        : 0,
    },
    {
      label: 'Report Consistency',
      value: `${metrics.reportConsistency}%`,
      description: 'Avg weekly submissions',
      icon: ChartBarIcon,
      status: metrics.reportConsistency,
    },
    {
      label: 'Channel Activity',
      value: `${metrics.channelActivity}%`,
      description: 'Team engagement score',
      icon: ArrowTrendingUpIcon,
      status: metrics.channelActivity,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Workspace Health</h3>
            <p className="text-sm text-slate-500">Key operational metrics</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const StatusIcon = getStatusIcon(kpi.status);
            return (
              <div 
                key={kpi.label}
                className={`p-4 rounded-xl border ${getStatusBg(kpi.status)} transition-all`}
              >
                <div className="flex items-start justify-between mb-2">
                  <kpi.icon className={`w-5 h-5 ${getStatusColor(kpi.status)}`} />
                  <StatusIcon className={`w-4 h-4 ${getStatusColor(kpi.status)}`} />
                </div>
                <div className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}>
                  {kpi.value}
                </div>
                <div className="text-xs font-medium text-slate-700 mt-1">{kpi.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{kpi.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHealthDashboard;
