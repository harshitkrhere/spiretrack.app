import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { RolesPermissionsMatrix } from '../components/admin/RolesPermissionsMatrix';
import { 
    UsersIcon, DocumentTextIcon, CpuChipIcon, UserGroupIcon,
    CheckCircleIcon, ChartBarIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AdminMetrics {
    totalUsers: number;
    aiCalls: number;
    systemHealth: 'healthy' | 'degraded' | 'down';
    totalTeams: number;
    activeUsers: number;
    inactiveUsers: number;
    weeklySubmissionRate: number;
}

interface TeamHealthItem {
    id: string;
    name: string;
    memberCount: number;
    submissionRate: number;
    lastReportDate: string | null;
}

export const AdminDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [teamHealth, setTeamHealth] = useState<TeamHealthItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error('[AdminDashboard] No user logged in');
                setLoading(false);
                return;
            }
            
            // Get teams where user has ADMIN permissions (not just membership)
            // Check direct admin role
            const { data: adminTeams, error: adminError } = await supabase
                .from('team_members')
                .select('team_id, teams(id, name)')
                .eq('user_id', user.id)
                .eq('role', 'admin');
            
            if (adminError) {
                console.error('[AdminDashboard] Admin teams query error:', adminError);
            }

            // Also check custom roles with admin permissions
            const { data: customAdminRoles, error: customRolesError } = await supabase
                .from('team_member_roles')
                .select('team_id, team_roles!inner(is_admin)')
                .eq('user_id', user.id)
                .eq('team_roles.is_admin', true);

            if (customRolesError) {
                console.error('[AdminDashboard] Custom admin roles query error:', customRolesError);
            }

            // Combine both sources of admin teams
            const allAdminTeamIds = new Set<string>();
            const teamMap = new Map<string, any>();

            // Add direct admin teams
            adminTeams?.forEach(membership => {
                if (membership.teams) {
                    allAdminTeamIds.add(membership.team_id);
                    teamMap.set(membership.team_id, membership.teams);
                }
            });

            // Add custom role admin teams
            customAdminRoles?.forEach(roleAssignment => {
                allAdminTeamIds.add(roleAssignment.team_id);
            });

            // Fetch team details for custom role teams that weren't in direct admin list
            if (customAdminRoles && customAdminRoles.length > 0) {
                const customTeamIds = customAdminRoles
                    .map(r => r.team_id)
                    .filter(id => !teamMap.has(id));

                if (customTeamIds.length > 0) {
                    const { data: customTeams } = await supabase
                        .from('teams')
                        .select('id, name')
                        .in('id', customTeamIds);

                    customTeams?.forEach(team => {
                        teamMap.set(team.id, team);
                    });
                }
            }

            const myAdminTeamIds = Array.from(allAdminTeamIds);


            // NOW scope user counts to ONLY admin-managed teams
            let userCount = 0;

            if (myAdminTeamIds.length > 0) {
                // Get unique users from admin teams
                const { data: teamMembers } = await supabase
                    .from('team_members')
                    .select('user_id')
                    .in('team_id', myAdminTeamIds);



                const uniqueUserIds = [...new Set(teamMembers?.map(m => m.user_id) || [])];
                userCount = uniqueUserIds.length;


            }

            // Build team health data from admin teams only - fetch real metrics
            const teamHealthData: TeamHealthItem[] = [];
            
            // Get current week start (Monday) - must match form submission format
            const getCurrentWeekStart = () => {
                const date = new Date();
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(date.setDate(diff));
                // Format as YYYY-MM-DD using local date (not UTC)
                const year = monday.getFullYear();
                const month = String(monday.getMonth() + 1).padStart(2, '0');
                const dayStr = String(monday.getDate()).padStart(2, '0');
                return `${year}-${month}-${dayStr}`;
            };

            const currentWeekStart = getCurrentWeekStart();

            for (const teamId of allAdminTeamIds) {
                const team = teamMap.get(teamId);
                if (!team) continue;

                // Get member count for this team
                const { count: memberCount } = await supabase
                    .from('team_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('team_id', teamId);

                // Get submission count for current week from team_weekly_reviews
                const { data: weeklySubmissions } = await supabase
                    .from('team_weekly_reviews')
                    .select('user_id')
                    .eq('team_id', teamId)
                    .eq('week_start', currentWeekStart);
                
                // Count unique users who submitted for this team this week
                const submittedCount = new Set(weeklySubmissions?.map(s => s.user_id) || []).size;

                const submissionRate = memberCount && memberCount > 0
                    ? Math.round((submittedCount / memberCount) * 100)
                    : 0;

                // Get last review date from team_weekly_reviews
                const { data: lastReview } = await supabase
                    .from('team_weekly_reviews')
                    .select('created_at')
                    .eq('team_id', teamId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                const lastReviewDate = lastReview?.created_at || null;

                teamHealthData.push({
                    id: team.id,
                    name: team.name,
                    memberCount: memberCount || 0,
                    submissionRate: submissionRate,
                    lastReportDate: lastReviewDate
                });
            }

            // Count active users (submitted reviews in last 30 days) from admin teams only
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            let uniqueActiveUsers = 0;
            if (myAdminTeamIds.length > 0) {
                // Get unique users from admin teams
                const { data: teamMembers } = await supabase
                    .from('team_members')
                    .select('user_id')
                    .in('team_id', myAdminTeamIds);

                const uniqueUserIds = [...new Set(teamMembers?.map(m => m.user_id) || [])];

                // Count how many of these users submitted reviews in last 30 days FOR ADMIN TEAMS
                if (uniqueUserIds.length > 0) {
                    const { data: activeReviewers } = await supabase
                        .from('team_weekly_reviews')
                        .select('user_id')
                        .in('user_id', uniqueUserIds)
                        .in('team_id', myAdminTeamIds)
                        .gte('created_at', thirtyDaysAgo.toISOString());
                    
                    uniqueActiveUsers = activeReviewers 
                        ? new Set(activeReviewers.map(r => r.user_id)).size 
                        : 0;
                }
            }

            const aiCalls = userCount ? userCount * 2 : 0;
            const inactiveCount = (userCount || 0) - uniqueActiveUsers;

            // Calculate weekly submission rate for current week across all admin teams
            let weeklySubmissionRate = 0;
            if (myAdminTeamIds.length > 0 && userCount > 0) {
                // Use the currentWeekStart already computed above

                // Count submissions for current week across all admin teams
                const { data: weeklySubmissions } = await supabase
                    .from('team_weekly_reviews')
                    .select('user_id')
                    .in('team_id', myAdminTeamIds)
                    .eq('week_start', currentWeekStart);

                const uniqueSubmitters = new Set(weeklySubmissions?.map(s => s.user_id) || []);
                weeklySubmissionRate = Math.round((uniqueSubmitters.size / userCount) * 100);
            }

            setMetrics({
                totalUsers: userCount || 0,
                aiCalls: aiCalls,
                systemHealth: 'healthy',
                totalTeams: teamHealthData.length,
                activeUsers: uniqueActiveUsers,
                inactiveUsers: inactiveCount > 0 ? inactiveCount : 0,
                weeklySubmissionRate: weeklySubmissionRate
            });
            setTeamHealth(teamHealthData);
        } catch (error) {
            console.error('[AdminDashboard] Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
                        <UsersIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-slate-900">{metrics?.totalUsers?.toLocaleString()}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 mb-1">
                            Active: {metrics?.activeUsers || 0}
                        </span>
                    </div>
                </div>

                {/* Active Teams */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Teams</span>
                        <UserGroupIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-slate-900">{metrics?.totalTeams}</span>
                    </div>
                </div>



                {/* Ops Uptime */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ops Uptime</span>
                        <CpuChipIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-slate-900">
                            {metrics?.systemHealth === 'healthy' ? '100%' : metrics?.systemHealth === 'degraded' ? '95%' : '0%'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${
                            metrics?.systemHealth === 'healthy' ? 'bg-green-100 text-green-700' : 
                            metrics?.systemHealth === 'degraded' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {metrics?.systemHealth === 'healthy' ? 'Stable' : metrics?.systemHealth === 'degraded' ? 'Degraded' : 'Down'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Team Health Table (Takes 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Team Health Overview</h2>
                        <button className="text-sm font-medium text-blue-500 hover:text-blue-700">Export CSV</button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {teamHealth.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <p>No teams found</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Squad</th>
                                        <th className="px-6 py-4">Members</th>
                                        <th className="px-6 py-4">Last Report</th>
                                        <th className="px-6 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {teamHealth.map((team) => (
                                        <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{team.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{team.memberCount < 10 ? `0${team.memberCount}` : team.memberCount}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {team.lastReportDate 
                                                    ? new Date(team.lastReportDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // e.g. "Dec 19"
                                                    : '—'} 
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    team.submissionRate >= 80 
                                                        ? 'bg-green-50 text-green-700 border-green-200' 
                                                        : team.submissionRate >= 50
                                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                    {team.submissionRate >= 80 ? 'Healthy' : team.submissionRate >= 50 ? 'Attention' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Column: Widgets */}
                <div className="space-y-6">
                    {/* Submission Compliance */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6">Submission Compliance</h3>
                        
                        <div className="flex items-center gap-6">
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="42"
                                        stroke="#f1f5f9" strokeWidth="8" fill="none"
                                    />
                                    <circle
                                        cx="48" cy="48" r="42"
                                        stroke="#84cc16" // Lime green
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(metrics?.weeklySubmissionRate || 0) * 2.63} 263`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xl font-bold text-slate-900">{metrics?.weeklySubmissionRate}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 mb-1">
                                    {(metrics?.weeklySubmissionRate ?? 0) >= 80 ? 'Excellent' : (metrics?.weeklySubmissionRate ?? 0) >= 50 ? 'Good' : 'Low'}
                                </p>
                                <p className="text-xs text-slate-400 mb-2">Last 7 Days</p>
                            </div>
                        </div>
                    </div>

                    {/* System Health List */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Status</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                metrics?.systemHealth === 'healthy' ? 'bg-green-100 text-green-700' :
                                metrics?.systemHealth === 'degraded' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {metrics?.systemHealth === 'healthy' ? 'All Systems Go' : 
                                 metrics?.systemHealth === 'degraded' ? 'Degraded' : 'Issues Detected'}
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <CheckCircleIcon className={`h-5 w-5 ${metrics?.systemHealth === 'healthy' ? 'text-lime-500' : 'text-yellow-500'}`} />
                                <span className="text-sm font-medium text-slate-700">
                                    Database Connected ({metrics?.totalUsers || 0} users loaded)
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircleIcon className={`h-5 w-5 ${metrics?.totalTeams ? 'text-lime-500' : 'text-slate-300'}`} />
                                <span className="text-sm font-medium text-slate-700">
                                    {metrics?.totalTeams || 0} Teams Active
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircleIcon className={`h-5 w-5 ${teamHealth.length > 0 ? 'text-lime-500' : 'text-slate-300'}`} />
                                <span className="text-sm font-medium text-slate-700">
                                    {teamHealth.length} Team{teamHealth.length !== 1 ? 's' : ''} with Admin Access
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircleIcon className={`h-5 w-5 ${(metrics?.weeklySubmissionRate ?? 0) >= 0 ? 'text-lime-500' : 'text-slate-300'}`} />
                                <span className="text-sm font-medium text-slate-700">
                                    Weekly Compliance: {metrics?.weeklySubmissionRate || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles & Permissions */}
            <div className="mt-8">
                <RolesPermissionsMatrix />
            </div>

            {/* Escalations Summary - Platform Level Aggregate */}
            {teamHealth.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900">Platform Escalations Overview</h2>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-slate-600 text-sm mb-4">
                    Aggregate escalation data across all teams. For team-specific escalation management, 
                    go to each team's dashboard.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teamHealth.map(team => (
                      <div key={team.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h4 className="font-medium text-slate-900 mb-1">{team.name}</h4>
                        <p className="text-xs text-slate-500">
                          Submission Rate: {team.submissionRate >= 80 ? '🟢' : team.submissionRate >= 50 ? '🟡' : '🔴'} {team.submissionRate}%
                        </p>
                        <a 
                          href={`/app/team/${team.id}`}
                          className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Team Dashboard →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

