import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  DocumentChartBarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../../lib/utils';

interface ReportsTabProps {
  channelId: string;
  teamId: string;
  currentUserId: string;
  isAdmin: boolean;
}

interface SubmissionStatus {
  user_id: string;
  full_name: string;
  email: string;
  submitted: boolean;
  submitted_at?: string;
}

interface WeeklyData {
  week_start: string;
  total_members: number;
  submitted_count: number;
  submissions: SubmissionStatus[];
  generated_report?: any;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  channelId,
  teamId,
  currentUserId,
  isAdmin,
}) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );

  // Generate last 8 weeks for navigation
  const weeks = Array.from({ length: 8 }).map((_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
    return format(weekStart, 'yyyy-MM-dd');
  });

  useEffect(() => {
    fetchWeeklyData();
  }, [selectedWeek, teamId]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);

      // Fetch team members
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id, users!inner(id, email, full_name)')
        .eq('team_id', teamId);

      // Fetch submissions for this week
      const { data: submissions } = await supabase
        .from('team_weekly_reviews')
        .select('user_id, created_at')
        .eq('team_id', teamId)
        .eq('week_start', selectedWeek);

      // Fetch generated report
      const { data: report } = await supabase
        .from('team_consolidated_reports')
        .select('report')
        .eq('team_id', teamId)
        .eq('week_start', selectedWeek)
        .single();

      const submissionMap = new Map(
        submissions?.map(s => [s.user_id, s.created_at]) || []
      );

      const memberStatuses: SubmissionStatus[] = (members || []).map((m: any) => ({
        user_id: m.user_id,
        full_name: m.users.full_name || m.users.email,
        email: m.users.email,
        submitted: submissionMap.has(m.user_id),
        submitted_at: submissionMap.get(m.user_id),
      }));

      setWeeklyData({
        week_start: selectedWeek,
        total_members: memberStatuses.length,
        submitted_count: memberStatuses.filter(m => m.submitted).length,
        submissions: memberStatuses,
        generated_report: report?.report,
      });
    } catch (err) {
      console.error('Error fetching weekly data:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentIndex = weeks.indexOf(selectedWeek);
    if (direction === 'prev' && currentIndex < weeks.length - 1) {
      setSelectedWeek(weeks[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedWeek(weeks[currentIndex - 1]);
    }
  };

  const formatWeekLabel = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const completionRate = weeklyData 
    ? Math.round((weeklyData.submitted_count / Math.max(weeklyData.total_members, 1)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Weekly Reports</h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            disabled={weeks.indexOf(selectedWeek) >= weeks.length - 1}
            className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"
          >
            <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
          </button>
          
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium"
          >
            {weeks.map((week) => (
              <option key={week} value={week}>
                {formatWeekLabel(week)}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => navigateWeek('next')}
            disabled={weeks.indexOf(selectedWeek) <= 0}
            className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"
          >
            <ChevronRightIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCircleIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Team Members</p>
              <p className="text-xl font-bold text-slate-900">{weeklyData?.total_members || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Submitted</p>
              <p className="text-xl font-bold text-slate-900">{weeklyData?.submitted_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              completionRate === 100 ? "bg-green-100" : "bg-yellow-100"
            )}>
              <ClockIcon className={cn(
                "w-5 h-5",
                completionRate === 100 ? "text-green-600" : "text-yellow-600"
              )} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completion</p>
              <p className="text-xl font-bold text-slate-900">{completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Status */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Submission Status</h3>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {weeklyData?.submissions.map((member) => (
              <div key={member.user_id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                    {member.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{member.full_name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                {member.submitted ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircleIcon className="w-4 h-4" />
                    Submitted
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-600 text-sm">
                    <ExclamationCircleIcon className="w-4 h-4" />
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Generated Report Preview */}
        <div className="bg-white border border-slate-200 rounded-lg">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Generated Report</h3>
          </div>
          <div className="p-4">
            {weeklyData?.generated_report ? (
              <div className="space-y-4">
                {/* Morale Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Team Morale</span>
                  <span className={cn(
                    "text-lg font-bold",
                    (weeklyData.generated_report.morale_score || 0) >= 70 
                      ? "text-green-600" 
                      : "text-yellow-600"
                  )}>
                    {weeklyData.generated_report.morale_score || 'N/A'}%
                  </span>
                </div>

                {/* Key Themes */}
                {weeklyData.generated_report.themes?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Key Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {weeklyData.generated_report.themes.slice(0, 5).map((theme: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Critical Actions */}
                {weeklyData.generated_report.critical_actions?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Critical Actions</p>
                    <ul className="space-y-1">
                      {weeklyData.generated_report.critical_actions.slice(0, 3).map((action: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="w-4 h-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                            {i + 1}
                          </span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <DocumentChartBarIcon className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">No report generated</p>
                <p className="text-xs">Generate a report from the team dashboard</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
