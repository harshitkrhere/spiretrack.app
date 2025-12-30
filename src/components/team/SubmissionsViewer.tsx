import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { Avatar } from '../ui/Avatar';

interface MemberSubmission {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  submitted: boolean;
  submission_date?: string;
  responses?: Record<string, any>;
}

interface SubmissionsViewerProps {
  teamId: string;
}

export const SubmissionsViewer: React.FC<SubmissionsViewerProps> = ({ teamId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [submissions, setSubmissions] = useState<MemberSubmission[]>([]);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);

  // Get current week start (Monday) - must match TeamDashboard's format
  const getWeekStart = (date: Date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return format(d, 'yyyy-MM-dd');
  };

  // Generate last 8 weeks
  useEffect(() => {
    const weeks: string[] = [];
    const today = new Date();
    for (let i = 0; i < 8; i++) {
      const weekDate = new Date(today);
      weekDate.setDate(weekDate.getDate() - (i * 7));
      weeks.push(getWeekStart(weekDate));
    }
    setAvailableWeeks(weeks);
    setSelectedWeek(weeks[0]);
  }, []);

  // Fetch submissions when week changes
  useEffect(() => {
    if (!selectedWeek || !teamId) return;
    fetchSubmissions();
  }, [selectedWeek, teamId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all team members (just user_ids)
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      if (!members || members.length === 0) {
        setSubmissions([]);
        return;
      }

      // Get user details from users table
      const userIds = members.map(m => m.user_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, avatar_url, email')
        .in('id', userIds);

      if (usersError) throw usersError;

      // Get submissions for this week
      const { data: reviews, error: reviewsError } = await supabase
        .from('team_weekly_reviews')
        .select('user_id, created_at, responses')
        .eq('team_id', teamId)
        .eq('week_start', selectedWeek);

      if (reviewsError) throw reviewsError;

      // Map members with their submission status
      const memberSubmissions: MemberSubmission[] = members.map((member: any) => {
        const userProfile = users?.find(u => u.id === member.user_id);
        const review = reviews?.find(r => r.user_id === member.user_id);
        
        return {
          user_id: member.user_id,
          full_name: userProfile?.full_name || 'Unknown User',
          avatar_url: userProfile?.avatar_url || null,
          email: userProfile?.email || '',
          submitted: !!review,
          submission_date: review?.created_at,
          responses: review?.responses
        };
      });

      // Sort: submitted first, then by name
      memberSubmissions.sort((a, b) => {
        if (a.submitted !== b.submitted) return a.submitted ? -1 : 1;
        return a.full_name.localeCompare(b.full_name);
      });

      setSubmissions(memberSubmissions);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submittedCount = submissions.filter(s => s.submitted).length;
  const totalCount = submissions.length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWeekLabel = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <div className="flex items-center gap-4">
        <CalendarIcon className="h-5 w-5 text-slate-400" />
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {availableWeeks.map(week => (
            <option key={week} value={week}>
              {formatWeekLabel(week)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{submittedCount}</p>
          <p className="text-sm text-slate-600">Submitted</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{totalCount - submittedCount}</p>
          <p className="text-sm text-slate-600">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-slate-600">{totalCount}</p>
          <p className="text-sm text-slate-600">Total Members</p>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {submissions.map(member => (
          <Card 
            key={member.user_id}
            className="overflow-hidden"
          >
            {/* Member Header */}
            <div 
              className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${
                member.submitted ? 'bg-white' : 'bg-slate-50'
              }`}
              onClick={() => member.submitted && setExpandedUserId(
                expandedUserId === member.user_id ? null : member.user_id
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={member.avatar_url}
                  name={member.full_name}
                  email={member.email}
                  size="md"
                />
                <div>
                  <p className="font-medium text-slate-900">{member.full_name}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {member.submitted ? (
                  <>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Submitted</span>
                      </div>
                      {member.submission_date && (
                        <p className="text-xs text-slate-500">
                          {formatDate(member.submission_date)}
                        </p>
                      )}
                    </div>
                    {expandedUserId === member.user_id ? (
                      <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <XCircleIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Not Submitted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Responses */}
            {member.submitted && expandedUserId === member.user_id && member.responses && (
              <div className="border-t border-slate-100 p-4 bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Responses</h4>
                <div className="space-y-3">
                  {Object.entries(member.responses).map(([question, answer], index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-600 mb-1">{question}</p>
                      <p className="text-slate-900">
                        {answer?.toString() || <span className="text-slate-400 italic">No answer</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        {submissions.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-slate-500">No team members found.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
