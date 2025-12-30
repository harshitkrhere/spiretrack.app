import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { TeamSettingsModal } from '../components/team/TeamSettingsModal';
import { ActivityLogsPanel } from '../components/team/ActivityLogsPanel';
import { EscalationPanel } from '../components/admin/EscalationPanel';
import { exportReportToExcel, exportTeamInsightsToPdf } from '../lib/exportUtils';
import ContextualChat from '../components/ai/ContextualChat';
import { LoadingScreen } from '../components/ui/LoadingScreen';

// Get Monday of current week
const getCurrentWeekStart = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return format(new Date(date.setDate(diff)), 'yyyy-MM-dd');
};

interface Team {
  id: string;
  name: string;
  description: string;
}

interface Report {
  morale_score?: number;
  productivity_score?: number;
  risk_score?: number;
  stress_score?: number;
  alignment_score?: number;
  summary_text?: string;
  collective_wins?: string[];
  collective_blockers?: string[];
  critical_path?: string[];
  meta?: {
    submitted_count: number;
    total_members: number;
    week_start: string;
  };
}

interface ReportHistoryItem {
  id: string;
  week_start: string;
  report: Report;
  created_at: string;
}

export const TeamDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState<Team | null>(null);
  const [role, setRole] = useState<string>('member');
  const [hasAdminRole, setHasAdminRole] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [memberCount, setMemberCount] = useState(0);

  // New state for settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showReportHistory, setShowReportHistory] = useState(false); // New state for history modal
  // AI Insights state - persist to localStorage so chat survives refresh
  const [showAIInsights, setShowAIInsights] = useState(() => {
    const saved = localStorage.getItem(`spire_ai_chat_open_${teamId}`);
    return saved === 'true';
  });
  const [aiInsights, setAIInsights] = useState<any>(() => {
    const saved = localStorage.getItem(`spire_ai_insights_${teamId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [aiContextId, setAIContextId] = useState<string | null>(() => {
    return localStorage.getItem(`spire_ai_context_${teamId}`);
  });
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Persist AI chat state to localStorage
  useEffect(() => {
    if (teamId) {
      localStorage.setItem(`spire_ai_chat_open_${teamId}`, showAIInsights.toString());
    }
  }, [showAIInsights, teamId]);

  useEffect(() => {
    if (teamId && aiInsights) {
      localStorage.setItem(`spire_ai_insights_${teamId}`, JSON.stringify(aiInsights));
    }
  }, [aiInsights, teamId]);

  useEffect(() => {
    if (teamId && aiContextId) {
      localStorage.setItem(`spire_ai_context_${teamId}`, aiContextId);
    }
  }, [aiContextId, teamId]);

  const fetchTeam = async () => {
    if (!teamId) {
      navigate('/app/team');
      return;
    }

    try {
      setLoading(true);
      
      // Get user's membership for this specific team
      const { data: membership, error: memberError } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user?.id)
        .single();

      if (memberError) {
        navigate('/app/team');
        return;
      }

      setRole(membership.role);


      // Check custom roles for admin permission
      const { data: memberRoles } = await supabase
        .from('team_member_roles')
        .select('team_roles(is_admin)')
        .eq('team_id', teamId)
        .eq('user_id', user?.id);
      
      const customAdminRole = memberRoles?.some((mr: any) => mr.team_roles?.is_admin);
      setHasAdminRole(customAdminRole || false);


      // Get team details
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name, description')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // Get member count
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      setMemberCount(count || 0);

      // Update user's presence (for online/offline status)
      await supabase.functions.invoke('team-operations', {
        body: { action: 'update_presence', team_id: teamId }
      });

      // Fetch report history
      await fetchReportHistory();
    } catch (err) {
      console.error('Error fetching team:', err);
      navigate('/app/team');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportHistory = async () => {
    if (!teamId) return;
    
    try {

      
      // Use Edge Function to bypass RLS
      const { data: response, error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'get_report_history', team_id: teamId }
      });


      
      if (error) throw error;
      
      const reports = response?.reports || [];
      setReportHistory(reports);
      
      // Set current week as default or most recent
      if (reports.length > 0) {
        const currentWeek = getCurrentWeekStart();
        
        // Check if current week exists in history
        const currentReport = reports.find((r: any) => r.week_start === currentWeek);
        if (currentReport) {
          setSelectedWeek(currentWeek);
          setReport(currentReport.report);
        } else {
          // Use most recent week
          setSelectedWeek(reports[0].week_start);
          setReport(reports[0].report);
        }
      }
    } catch (err) {
      console.error('Error fetching report history:', err);
    }
  };

  useEffect(() => {
    if (user && teamId) {
      fetchTeam();
      fetchReportHistory(); // Load report history on mount
    }
  }, [user, teamId]);

  // Load report when selected week changes
  useEffect(() => {
    if (selectedWeek && reportHistory.length > 0) {
      const weekReport = reportHistory.find(r => r.week_start === selectedWeek);
      if (weekReport) {
        setReport(weekReport.report);
      }
    }
  }, [selectedWeek, reportHistory]);

  const handleGenerateReport = async (weekToGenerate?: string) => {
    if (!team) return;
    
    // Determine week start: passed argument -> selectedWeek -> current week
    let weekStart = weekToGenerate || selectedWeek;
    
    if (!weekStart) {
      weekStart = getCurrentWeekStart();
    }

    // Check if report already exists for this week
    const existingReport = reportHistory.find(r => r.week_start === weekStart);
    if (existingReport) {
      alert(`A report for the week of ${format(new Date(weekStart), 'MMM d, yyyy')} already exists. Please select a different week or view the existing report.`);
      // Switch to the existing report
      setSelectedWeek(weekStart);
      setReport(existingReport.report);
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: { 
          action: 'consolidate_report', 
          team_id: team.id,
          week_start: weekStart
        }
      });

      if (error) throw error;
      setReport(data);
      setSelectedWeek(weekStart);
      
      // Refresh history
      await fetchReportHistory();
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report. Make sure team members have submitted reviews.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportReports = async () => {
    if (!report || !team) {
      alert('No report to export');
      return;
    }
    try {
      await exportReportToExcel({
        report,
        teamName: team.name,
        weekStart: selectedWeek || getCurrentWeekStart()
      });
      setShowExportMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handlePdfExport = async () => {
    if (!report || !team) {
      alert('No report to export');
      return;
    }
    try {
      await exportTeamInsightsToPdf(report, team.name, new Date());
      setShowExportMenu(false);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleGenerateAIInsights = async () => {
    if (!teamId) return;
    
    setLoadingInsights(true);
    try {
      const response = await supabase.functions.invoke('generate-team-insights', {
        body: { team_id: teamId }
      });

      if (response.error) {
        console.error('Error response:', response);
        
        // Try to extract meaningful error message
        let errorMessage = 'Failed to generate AI insights.';
        
        // Check if there's data with error info
        if (response.data && typeof response.data === 'object') {
          if (response.data.message) {
            errorMessage = response.data.message;
          } else if (response.data.error) {
            errorMessage = response.data.error;
          }
        }
        
        // Fallback to error message if available
        if (response.error.message && !errorMessage.includes('Failed')) {
          errorMessage = response.error.message;
        }
        
        alert(errorMessage);
        return;
      }

      if (!response.data) {
        alert('No data received from AI service.');
        return;
      }

      setAIInsights(response.data.insights);
      setAIContextId(response.data.context_id);
      setShowAIInsights(true);
    } catch (err: any) {
      console.error('Error generating AI insights:', err);
      alert(err.message || 'Failed to generate AI insights. Please try again.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const isAdmin = role === 'admin' || hasAdminRole;

  if (loading) {
    return <LoadingScreen message="Loading team dashboard" />;
  }

  if (!team) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate('/app/team')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 text-sm"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Teams
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{team.name}</h1>
            {team.description && (
              <p className="text-slate-600 mt-1 text-sm sm:text-base">{team.description}</p>
            )}
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              {memberCount} member{memberCount !== 1 ? 's' : ''} • You are {isAdmin ? 'an admin' : 'a member'}
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button variant="secondary" onClick={() => handleGenerateAIInsights()} className="text-sm">
                <LightBulbIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">AI Insights</span>
                <span className="sm:hidden">AI</span>
              </Button>
              <Button variant="secondary" onClick={() => setShowReportHistory(true)} className="text-sm">
                <ClipboardDocumentListIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">History</span>
              </Button>
              <Link to={`/app/team/${teamId}/form-builder`}>
                <Button variant="secondary" className="text-sm">
                  <DocumentTextIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  <span className="hidden sm:inline">Form Builder</span>
                  <span className="sm:hidden">Forms</span>
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => setShowActivityLogs(true)} className="text-sm">
                <ClipboardDocumentListIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Activity</span>
                <span className="sm:hidden">Logs</span>
              </Button>
              <Button variant="secondary" onClick={() => setShowSettings(true)} className="text-sm">
                <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">⚙️</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Vibrant Illustrated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-8 sm:mb-10">
        {/* Team Chat Card */}
        <Link to={`/app/team/${teamId}/chat`} className="block group">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100/50 p-4 sm:p-6 h-32 sm:h-44 transition-all duration-300 hover:shadow-lg hover:border-cyan-200">
            <div className="absolute -top-8 -right-8 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-cyan-100/50 to-teal-100/50 rounded-full blur-xl" />
            
            <div className="relative flex items-center justify-center h-16 sm:h-24 mb-2 sm:mb-3">
              <span className="text-3xl sm:text-5xl">🚀</span>
              <span className="absolute -left-2 sm:-left-4 top-0 text-base sm:text-xl opacity-60">💬</span>
              <span className="absolute -right-2 sm:-right-4 bottom-1 sm:bottom-2 text-base sm:text-xl opacity-60">💬</span>
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 text-center">Team Chat</h3>
          </div>
        </Link>
        
        {/* Members Card */}
        <Link to={`/app/team/${teamId}/members`} className="block group">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100/50 p-4 sm:p-6 h-32 sm:h-44 transition-all duration-300 hover:shadow-lg hover:border-emerald-200">
            <div className="absolute -top-8 -left-8 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-emerald-100/50 to-green-100/50 rounded-full blur-xl" />
            
            <div className="relative flex items-center justify-center h-16 sm:h-24 mb-2 sm:mb-3">
              <div className="flex -space-x-1.5 sm:-space-x-2">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-sm sm:text-lg shadow-sm">🧑</div>
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-sm sm:text-lg shadow-sm">👩</div>
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-sm sm:text-lg shadow-sm">👨</div>
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center text-sm sm:text-lg shadow-sm">👧</div>
              </div>
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 text-center">Members</h3>
          </div>
        </Link>
        
        {/* Submit Review Card */}
        <Link to={`/app/team/${teamId}/review`} className="block group">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100/50 p-4 sm:p-6 h-32 sm:h-44 transition-all duration-300 hover:shadow-lg hover:border-violet-200">
            <div className="absolute -bottom-8 -right-8 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-violet-100/50 to-purple-100/50 rounded-full blur-xl" />
            
            <div className="relative flex items-center justify-center h-16 sm:h-24 mb-2 sm:mb-3">
              <span className="text-3xl sm:text-5xl">📋</span>
              <span className="absolute right-2 sm:right-4 -top-0.5 sm:-top-1 text-base sm:text-xl">✏️</span>
              <span className="absolute left-4 sm:left-8 bottom-0 text-sm sm:text-lg">✅</span>
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 text-center">Submit Review</h3>
          </div>
        </Link>
      </div>

      {/* Report Section - Original "Technical Document" Design */}
      <div className="mb-8 sm:mb-12">
        {/* Report Header - Document Style */}
        <div className="border-b-2 border-slate-900 pb-4 sm:pb-6 mb-6 sm:mb-8 flex flex-col gap-4 sm:gap-6">
          <div>
            <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-1 sm:mb-2">
              Internal Document • Confidential
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-none mb-1 sm:mb-2">
              Weekly Performance Report
            </h2>
            {selectedWeek ? (
              <div className="font-mono text-xs sm:text-sm text-slate-600">
                Period: {format(new Date(selectedWeek), 'MMM d, yyyy')} — {format(new Date(new Date(selectedWeek).setDate(new Date(selectedWeek).getDate() + 6)), 'MMM d, yyyy')}
              </div>
            ) : (
              <div className="font-mono text-xs sm:text-sm text-slate-400">
                Period: Current Cycle
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => handleGenerateReport(getCurrentWeekStart())} 
                isLoading={generating}
                variant="secondary"
                className="font-mono text-xs uppercase tracking-wider"
              >
                {generating ? 'Processing...' : 'Generate New'}
              </Button>
              {report && (
                <div className="relative">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="font-mono text-xs uppercase tracking-wider flex items-center gap-2"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Export
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                      <button
                        onClick={handleExportReports}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel (.xlsx)
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={handlePdfExport}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        PDF Brief
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {report ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Gauge Charts Row */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {[
                  { label: 'Morale', value: report.morale_score || 0, color: '#22C55E', icon: '😊' },
                  { label: 'Productivity', value: report.productivity_score || 0, color: '#3B82F6', icon: '📊' },
                  { label: 'Stress', value: report.stress_score || 0, color: '#EAB308', icon: '😰' },
                  { label: 'Risk', value: report.risk_score || 0, color: '#EF4444', icon: '⚠️' },
                  { label: 'Alignment', value: report.alignment_score || 0, color: '#A855F7', icon: '🎯' },
                ].map((metric) => {
                  const percentage = Math.min(100, Math.max(0, metric.value));
                  const circumference = 2 * Math.PI * 40;
                  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.5;
                  
                  return (
                    <div key={metric.label} className="flex flex-col items-center">
                      {/* Gauge SVG */}
                      <div className="relative w-16 sm:w-20 lg:w-24 h-10 sm:h-12 lg:h-14 mb-1 sm:mb-2">
                        <svg className="w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 absolute -top-3 sm:-top-4 lg:-top-5 left-0" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * 0.5} transform="rotate(180 50 50)" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke={metric.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset + circumference * 0.5} transform="rotate(180 50 50)" />
                        </svg>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm sm:text-base lg:text-lg">{metric.icon}</div>
                      </div>
                      <div className="text-center">
                        <span className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900">{metric.value}</span>
                        <span className="text-slate-400 text-xs sm:text-sm ml-0.5">/ 100</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider mt-0.5 sm:mt-1">{metric.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Three Column Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Executive Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Executive Summary
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {report.summary_text || 'No summary available.'}
                </p>
              </div>

              {/* Achievements & Wins */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Achievements & Wins
                </h3>
                <div className="space-y-4">
                  {report.collective_wins && report.collective_wins.length > 0 ? (
                    report.collective_wins.slice(0, 3).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <span className="text-emerald-600 text-sm">🏆</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm italic">No achievements recorded.</p>
                  )}
                </div>
              </div>

              {/* Constraints & Risks */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Constraints & Risks
                </h3>
                <div className="space-y-4">
                  {report.collective_blockers && report.collective_blockers.length > 0 ? (
                    report.collective_blockers.slice(0, 3).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <span className="text-amber-600 text-sm">⚠️</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm italic">No significant blockers detected.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Priority Actions */}
            {report.critical_path && report.critical_path.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  Priority Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {report.critical_path.slice(0, 4).map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-semibold">
                        {i + 1}
                      </span>
                      <p className="text-slate-700 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Meta */}
            <div className="text-center text-xs text-slate-400 pt-4">
              SpireTrack • {team?.name} • Generated {format(new Date(), 'MMM d, yyyy')}
            </div>
          </div>
        ) : (
          /* Empty State - Technical */
          <div className="border border-dashed border-slate-300 rounded-sm p-12 text-center">
             <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
               <ChartBarIcon className="h-6 w-6 text-slate-400" />
             </div>
             <h3 className="text-base font-semibold text-slate-900 mb-2">No Report Active</h3>
             <p className="text-slate-500 mb-8 max-w-sm mx-auto">
               Generate a report for the current period or select a previous document from the archive.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               {isAdmin && (
                 <Button onClick={() => handleGenerateReport(getCurrentWeekStart())}>
                   Initialize Report
                 </Button>
               )}
               
               {/* Show History button even in empty state */}
               {reportHistory.length > 0 && (
                 <Button 
                   variant="secondary"
                   onClick={() => setShowReportHistory(true)}
                 >
                   Open Archive
                 </Button>
               )}
               
               <Link to={`/app/team/${teamId}/review`}>
                  <Button variant="secondary">
                    Input Data
                  </Button>
               </Link>
             </div>
          </div>
        )}
      </div>


      {/* Settings Modal */}
      {team && (
        <TeamSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          teamId={team.id}
          teamName={team.name}
        />
      )}

      {/* Activity Logs Panel */}
      {team && isAdmin && (
        <ActivityLogsPanel
          teamId={team.id}
          isOpen={showActivityLogs}
          onClose={() => setShowActivityLogs(false)}
        />
      )}

      {/* AI Insights Modal */}
      {showAIInsights && aiInsights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAIInsights(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">


            {/* Content - System Grade Analysis */}
            <div className="flex flex-col h-full bg-[#f5f5f7]">
              
              {/* Header */}
              <div className="px-6 py-4 bg-white border-b border-[#e5e5e7] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e5e5e7] flex items-center justify-center">
                    <img src="/spire-ai-logo.png" alt="" className="w-5 h-5 opacity-80" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Spire AI</h2>
                    <p className="text-[12px] text-[#86868b]">Team Intelligence</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button
                    onClick={() => {
                      if (teamId) {
                        localStorage.removeItem(`spire_ai_chat_open_${teamId}`);
                        localStorage.removeItem(`spire_ai_insights_${teamId}`);
                        localStorage.removeItem(`spire_ai_context_${teamId}`);
                      }
                      setShowAIInsights(false);
                      setAIInsights(null);
                      setAIContextId(null);
                      handleGenerateAIInsights();
                    }}
                    className="text-[13px] text-[#007aff] hover:opacity-70 font-medium px-2 py-1"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowAIInsights(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-[#e5e5e7] text-[#86868b] hover:bg-[#d1d1d6] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Health Status Block */}
                <div className="bg-white rounded-xl border border-[#e5e5e7] p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide mb-1">Current Status</p>
                    <h3 className="text-[17px] font-semibold text-[#1d1d1f] capitalize">
                      {aiInsights.team_health_status}
                    </h3>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium ${
                    aiInsights.team_health_status === 'stable' 
                      ? 'bg-[#e8f5e9] text-[#2e7d32]' 
                      : aiInsights.team_health_status === 'fragile'
                      ? 'bg-[#fff3e0] text-[#ef6c00]'
                      : 'bg-[#ffebee] text-[#c62828]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      aiInsights.team_health_status === 'stable' 
                        ? 'bg-[#2e7d32]' 
                        : aiInsights.team_health_status === 'fragile'
                        ? 'bg-[#ef6c00]'
                        : 'bg-[#c62828]'
                    }`} />
                    <span>{aiInsights.team_health_status}</span>
                  </div>
                </div>

                {/* Analysis Sections */}
                <div className="space-y-6">
                  {/* Constraint & Gap Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[13px] font-medium text-[#86868b] mb-2 uppercase tracking-wide">Primary Constraint</h4>
                      <div className="bg-white rounded-xl border border-[#e5e5e7] p-4 text-[15px] text-[#1d1d1f] leading-relaxed">
                        {aiInsights.primary_constraint}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-medium text-[#86868b] mb-2 uppercase tracking-wide">Execution Gap</h4>
                      <div className="bg-white rounded-xl border border-[#e5e5e7] p-4 text-[15px] text-[#1d1d1f] leading-relaxed">
                        {aiInsights.execution_gap}
                      </div>
                    </div>
                  </div>

                  {/* Operational Forecast (Risk) */}
                  <div>
                    <h4 className="text-[13px] font-medium text-[#86868b] mb-2 uppercase tracking-wide flex items-center gap-2">
                      Operational Forecast <span className="text-[#aeaeb2] font-normal">(30 Days)</span>
                    </h4>
                    <div className="bg-white rounded-xl border border-[#e5e5e7] p-4">
                      <p className="text-[15px] text-[#1d1d1f] leading-relaxed">
                        {aiInsights.risk_next_30_days}
                      </p>
                    </div>
                    {/* Warning Note - Subtle if exists */}
                    {aiInsights.warning_if_ignored && (
                      <div className="mt-2 flex items-start gap-2 px-1">
                        <span className="text-[#ff3b30] text-[13px]">⚠</span>
                        <p className="text-[13px] text-[#86868b]">
                          <span className="font-medium text-[#1d1d1f]">If ignored:</span> {aiInsights.warning_if_ignored}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Strategic Recommendation */}
                  <div>
                    <h4 className="text-[13px] font-medium text-[#86868b] mb-2 uppercase tracking-wide">Recommended Strategy</h4>
                    <div className="bg-white rounded-xl border border-[#e5e5e7] p-5 shadow-sm">
                      <p className="text-[15px] text-[#1d1d1f] leading-relaxed font-medium">
                        {aiInsights.recommended_manager_action}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer CTA - Integrated System Action */}
              {aiContextId && (
                <div className="px-6 py-4 bg-white border-t border-[#e5e5e7] flex items-center justify-between">
                  <p className="text-[13px] text-[#86868b]">
                    Need more details on this analysis?
                  </p>
                  <button
                    onClick={() => {
                      setShowAIInsights(false);
                      setTimeout(() => {
                        const chatButton = document.getElementById('ai-insights-chat-trigger');
                        chatButton?.click();
                      }, 100);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#007aff] hover:bg-[#0066d6] text-white rounded-lg text-[13px] font-medium transition-colors shadow-sm"
                  >
                    <span>Open Advisor Chat</span>
                    <svg className="w-3.5 h-3.5 text-white/90" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden trigger for contextual chat */}
      {aiContextId && aiInsights && (
        <button
          id="ai-insights-chat-trigger"
          onClick={() => {
            const chatModal = document.getElementById('team-insights-chat');
            if (chatModal) chatModal.style.display = 'block';
          }}
          className="hidden"
        />
      )}

      {/* Contextual Chat Modal */}
      {aiContextId && aiInsights && !showAIInsights && (
        <div id="team-insights-chat" style={{ display: 'none' }}>
          <ContextualChat
            contextId={aiContextId}
            contextType="team_insight"
            aiOutput={aiInsights}
            onClose={() => {
              const chatModal = document.getElementById('team-insights-chat');
              if (chatModal) chatModal.style.display = 'none';
            }}
          />
        </div>
      )}
      {/* Report History Modal - Clean Modal Design */}
      {showReportHistory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/10 max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
            
            {/* Header - Minimal */}
            <div className="px-6 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">Report History</h2>
                  <p className="text-[13px] text-[#86868b] mt-0.5">
                    {reportHistory.length} report{reportHistory.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowReportHistory(false)}
                  className="text-[#007aff] text-[15px] font-medium hover:opacity-70 transition-opacity"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e5e5e7] mx-6" />

            {/* Report List - Cards with soft shadows */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {reportHistory.map((item) => (
                  <button
                    key={item.week_start}
                    onClick={() => {
                      setSelectedWeek(item.week_start);
                      setReport(item.report);
                      setShowReportHistory(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      selectedWeek === item.week_start
                        ? 'bg-[#f5f5f7] shadow-sm'
                        : 'bg-white hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Primary: Week */}
                        <h3 className="text-[15px] font-semibold text-[#1d1d1f] tracking-tight">
                          Week of {format(new Date(item.week_start), 'MMM d, yyyy')}
                        </h3>
                        {/* Secondary: Generation date */}
                        <p className="text-[13px] text-[#86868b] mt-1">
                          {format(new Date(item.created_at), 'MMM d, yyyy')} at {format(new Date(item.created_at), 'h:mm a')}
                        </p>
                        {/* Tertiary: Submission count */}
                        {item.report?.meta && (
                          <p className="text-[12px] text-[#aeaeb2] mt-1">
                            {item.report.meta.submitted_count} of {item.report.meta.total_members} submitted
                          </p>
                        )}
                      </div>
                      
                      {/* Status indicator - subtle green dot */}
                      {selectedWeek === item.week_start && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-[#34c759]" />
                          <span className="text-[12px] text-[#86868b] font-medium">Current</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
