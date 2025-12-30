import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftIcon, UserGroupIcon, Cog6ToothIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { RoleGroupSection } from '../components/team/RoleGroupSection';
import { RoleManagementModal } from '../components/team/RoleManagementModal';
import { AssignRoleModal } from '../components/team/AssignRoleModal';
import { MemberCard } from '../components/team/MemberCard';

interface Role {
  id: string;
  name: string;
  color: string;
  icon?: string;
  position: number;
  is_admin: boolean;
}

interface Member {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away' | 'banned';
  last_active_at: string;
  roles: Role[];
}

export const TeamMembersPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [bannedMembers, setBannedMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal States
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [assigningMember, setAssigningMember] = useState<Member | null>(null);

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
      fetchMembers();
      checkAdminStatus();
    }
  }, [teamId]);

  const checkAdminStatus = async () => {
    if (!user || !teamId) return;
    try {
      const { data } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();
      
      // Also check custom roles for admin permission
      const { data: memberRoles } = await supabase
        .from('team_member_roles')
        .select('team_roles(is_admin)')
        .eq('team_id', teamId)
        .eq('user_id', user.id);
      
      const hasAdminRole = memberRoles?.some((mr: any) => mr.team_roles?.is_admin);
      setIsAdmin(data?.role === 'admin' || hasAdminRole || false);
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const fetchTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();
      
      if (error) throw error;
      setTeamName(data.name);
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Update user's presence (for online/offline status)
      await supabase.functions.invoke('team-operations', {
        body: { action: 'update_presence', team_id: teamId }
      });
      
      // Fetch members with roles via Edge Function
      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'get_team_members',
          team_id: teamId
        }
      });

      if (error) throw error;
      
      const active = data.active_members || [];
      const banned = data.banned_members || [];
      
      setMembers(active);
      setBannedMembers(banned);
      
      // Extract unique roles from ACTIVE members
      const allRoles: Role[] = [];
      active.forEach((member: Member) => {
        member.roles.forEach(role => {
          if (!allRoles.find(r => r.id === role.id)) {
            allRoles.push(role);
          }
        });
      });
      
      // Sort by position DESC
      allRoles.sort((a, b) => b.position - a.position);
      setRoles(allRoles);
      
    } catch (err: any) {
      console.error('Error fetching members:', err);
      alert(`Failed to load team members: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Group members by their highest role
  const getMembersByRole = (role: Role) => {
    return members.filter(member => 
      member.roles.some(r => r.id === role.id)
    );
  };

  // Get members with no roles
  const getUnassignedMembers = () => {
    return members.filter(member => member.roles.length === 0);
  };

  // Handlers
  const handleKick = async (member: Member) => {
    if (!confirm(`Are you sure you want to kick ${member.full_name || member.email}? They will be able to rejoin after 5 minutes.`)) return;
    
    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'kick_member', team_id: teamId, user_id: member.user_id }
      });
      if (error) throw error;
      fetchMembers();
    } catch (err) {
      console.error('Error kicking member:', err);
      alert('Failed to kick member');
    }
  };

  const handleBan = async (member: Member) => {
    const reason = prompt('Enter ban reason (optional):');
    if (reason === null) return;

    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'ban_member', team_id: teamId, user_id: member.user_id, reason }
      });
      if (error) throw error;
      fetchMembers();
    } catch (err) {
      console.error('Error banning member:', err);
      alert('Failed to ban member');
    }
  };

  const handleUnban = async (member: Member) => {
    if (!confirm(`Unban ${member.full_name || member.email}?`)) return;

    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'unban_member', team_id: teamId, user_id: member.user_id }
      });
      if (error) throw error;
      fetchMembers();
    } catch (err) {
      console.error('Error unbanning member:', err);
      alert('Failed to unban member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <UserGroupIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate(`/app/team/${teamId}`)}
                className="flex-shrink-0 px-3 sm:px-4"
              >
                <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">Team Members</h1>
                <p className="text-xs sm:text-sm text-slate-600 truncate">{teamName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-xs sm:text-sm text-slate-600">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </div>
              
              {isAdmin && (
                <Button onClick={() => setShowRoleManager(true)} className="text-sm sm:text-base px-3 sm:px-4">
                  <Cog6ToothIcon className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Manage Roles</span>
                  <span className="sm:hidden">Roles</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Member List */}
          <div className="lg:col-span-2">
            {roles.length === 0 && members.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-slate-200">
                <UserGroupIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No members yet</h3>
                <p className="text-slate-600">Invite team members to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Role Groups */}
                {roles.map(role => {
                  const roleMembers = getMembersByRole(role);
                  if (roleMembers.length === 0) return null;
                  
                  return (
                    <div key={role.id} className="relative group">
                      <RoleGroupSection
                        role={role}
                        members={roleMembers}
                        onMemberClick={(member) => isAdmin && setAssigningMember(member)}
                        isAdmin={isAdmin}
                        onKick={handleKick}
                        onBan={handleBan}
                        onUnban={handleUnban}
                        onAssignRole={(m) => setAssigningMember(m)}
                      />
                      {/* Invisible overlay to capture clicks for admin assignment if needed, 
                          but for now we'll rely on a specific action or just clicking the member card 
                          if we update MemberCard to support onClick */}
                    </div>
                  );
                })}

                {/* Unassigned Members */}
                {getUnassignedMembers().length > 0 && (
                  <div className="mb-4">
                    <div className="px-4 py-2 bg-slate-50 rounded-lg">
                      <span className="font-semibold text-sm uppercase tracking-wide text-slate-600">
                        Unassigned ({getUnassignedMembers().length})
                      </span>
                    </div>
                    <div className="mt-2 space-y-2 pl-6">
                      {getUnassignedMembers().map(member => (
                        <MemberCard
                          key={member.user_id}
                          member={member}
                          isAdmin={isAdmin}
                          onKick={handleKick}
                          onBan={handleBan}
                          onUnban={handleUnban}
                          onAssignRole={(m) => setAssigningMember(m)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Banned Members Section */}
            {bannedMembers.length > 0 && (
              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <NoSymbolIcon className="h-5 w-5 text-red-500" />
                  Banned Members
                </h3>
                <div className="space-y-2">
                  {bannedMembers.map(member => (
                    <MemberCard
                      key={member.user_id}
                      member={member}
                      isAdmin={isAdmin}
                      onUnban={handleUnban}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Stats */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200 lg:sticky lg:top-8">
              <h3 className="font-semibold text-slate-900 mb-4">Team Overview</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Members</span>
                  <span className="font-semibold text-slate-900">{members.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Roles</span>
                  <span className="font-semibold text-slate-900">{roles.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Online</span>
                  <span className="font-semibold text-green-600">
                    {members.filter(m => m.status === 'online').length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Offline</span>
                  <span className="font-semibold text-slate-600">
                    {members.filter(m => m.status === 'offline').length}
                  </span>
                </div>
              </div>

              {roles.length > 0 && (
                <>
                  <div className="border-t border-slate-200 my-4" />
                  
                  <h4 className="font-semibold text-slate-900 mb-3 text-sm">Roles</h4>
                  <div className="space-y-2">
                    {roles.map(role => (
                      <div key={role.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{role.icon}</span>
                          <span className="text-sm text-slate-700">{role.name}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {getMembersByRole(role).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {isAdmin && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-3">
                    Tip: Click on any member to manage their roles.
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => setShowRoleManager(true)}
                  >
                    Manage Roles
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RoleManagementModal
        isOpen={showRoleManager}
        onClose={() => setShowRoleManager(false)}
        teamId={teamId!}
        onRolesUpdated={fetchMembers}
      />

      <AssignRoleModal
        isOpen={!!assigningMember}
        onClose={() => setAssigningMember(null)}
        teamId={teamId!}
        member={assigningMember}
        onRolesUpdated={fetchMembers}
      />
    </div>
  );
};
