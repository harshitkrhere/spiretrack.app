import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../ui/Card';
import { RoleBadge } from './RoleBadge';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format, subWeeks, startOfWeek } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { Avatar } from '../ui/Avatar';

interface SubmissionStatusPanelProps {
  teamId: string;
}

interface MemberStatus {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  roles: any[];
  submitted_at?: string;
  responses?: Record<string, string>;
}

interface SubmissionData {
  week_start: string;
  total_members: number;
  submitted_count: number;
  missing_count: number;
  submitted: MemberStatus[];
  missing: MemberStatus[];
}

export const SubmissionStatusPanel: React.FC<SubmissionStatusPanelProps> = ({ teamId }) => {
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
  const [data, setData] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<MemberStatus | null>(null);

  // Generate last 8 weeks for dropdown
  const weeks = Array.from({ length: 8 }).map((_, i) => {
    const date = subWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    return format(date, 'yyyy-MM-dd');
  });

  useEffect(() => {
    if (teamId && selectedWeek) {
      fetchStatus();
    }
  }, [teamId, selectedWeek]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: result, error: apiError } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'get_weekly_submission_status',
          team_id: teamId,
          week_start: selectedWeek
        }
      });

      if (apiError) throw apiError;
      setData(result);
    } catch (err: any) {
      console.error('Error fetching submission status:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Weekly Submission Tracker</h2>
          <p className="text-sm text-slate-500">Track who has submitted their weekly review.</p>
        </div>
        
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="block w-full sm:w-auto rounded-md border-slate-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
        >
          {weeks.map(week => (
            <option key={week} value={week}>
              Week of {format(new Date(week), 'MMM d, yyyy')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-500">Loading status...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          <p className="font-medium">Error loading status</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : data ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <CheckCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Submitted</p>
                  <p className="text-2xl font-bold text-green-700">{data.submitted_count}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-red-50 border-red-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                  <XCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-900">Missing</p>
                  <p className="text-2xl font-bold text-red-700">{data.missing_count}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-50 border-slate-100">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-slate-100 text-slate-600 mr-4">
                  <ClockIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Completion Rate</p>
                  <p className="text-2xl font-bold text-slate-700">
                    {data.total_members > 0 
                      ? Math.round((data.submitted_count / data.total_members) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Submitted List */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Submitted ({data.submitted_count})
              </h3>
              <div className="space-y-3">
                {data.submitted.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No submissions yet.</p>
                ) : (
                  data.submitted.map(member => (
                    <div key={member.user_id} className="flex items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <Avatar
                        src={member.avatar_url}
                        name={member.name}
                        email={member.email}
                        size="md"
                        className="mr-3"
                      />
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          Submitted {member.submitted_at ? format(new Date(member.submitted_at), 'MMM d, h:mm a') : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {member.roles.slice(0, 1).map((role: any) => (
                            <RoleBadge key={role.id} role={role} size="sm" />
                          ))}
                        </div>
                        <button
                          onClick={() => setSelectedReport(member)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                          title="View Report"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Missing List */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Not Submitted ({data.missing_count})
              </h3>
              <div className="space-y-3">
                {data.missing.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Everyone has submitted!</p>
                ) : (
                  data.missing.map(member => (
                    <div key={member.user_id} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200 opacity-75">
                      <Avatar
                        src={member.avatar_url}
                        name={member.name}
                        email={member.email}
                        size="md"
                        className="mr-3 grayscale"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 italic">Pending submission</p>
                      </div>
                      <div className="flex gap-1 opacity-50">
                        {member.roles.slice(0, 1).map((role: any) => (
                          <RoleBadge key={role.id} role={role} size="sm" />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Individual Report Modal */}
      <Dialog open={!!selectedReport} onClose={() => setSelectedReport(null)} className="relative z-[60]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900">
                  {selectedReport?.name}'s Report
                </Dialog.Title>
                <p className="text-sm text-slate-500">
                  Submitted on {selectedReport?.submitted_at ? format(new Date(selectedReport.submitted_at), 'PPP p') : ''}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedReport?.responses ? (
                Object.entries(selectedReport.responses).map(([question, answer], index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">{question}</h4>
                    <p className="text-slate-900 whitespace-pre-wrap">{String(answer)}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No content available for this report.
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};
