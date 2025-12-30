import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { UserGroupIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { RoleBadge } from './RoleBadge';
import { Button } from '../ui/Button';
import { UserProfileDropdown } from '../layout/UserProfileDropdown';
import { Avatar } from '../ui/Avatar';

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
  username?: string; // Add username
  full_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away' | 'banned';
  last_active_at: string;
  roles: Role[];
}



interface MembersSidebarProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MembersSidebar: React.FC<MembersSidebarProps> = ({ teamId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isOpen && teamId) {
      fetchMembers();
      checkAdminStatus();
    }
  }, [isOpen, teamId]);

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

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'get_team_members',
          team_id: teamId
        }
      });

      if (error) throw error;
      
      setMembers(data?.active_members || []);
      console.log('Fetched Members Data:', data); // Debugging avatars
      
      // Extract unique roles
      const allRoles: Role[] = [];
      const activeMembers = data?.active_members || [];
      
      activeMembers.forEach((member: Member) => {
        member.roles.forEach(role => {
          if (!allRoles.find(r => r.id === role.id)) {
            allRoles.push(role);
          }
        });
      });
      
      // Sort by position DESC
      allRoles.sort((a, b) => b.position - a.position);
      setRoles(allRoles);
      
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMembersByRole = (role: Role) => {
    return members.filter(member => 
      member.roles.some(r => r.id === role.id)
    );
  };

  const getUnassignedMembers = () => {
    return members.filter(member => member.roles.length === 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Team Members</h3>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {roles.map(role => {
              const roleMembers = getMembersByRole(role);
              if (roleMembers.length === 0) return null;
              
              return (
                <div key={role.id}>
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      {role.name}
                      {role.icon && <span>{role.icon}</span>}
                    </h4>
                    <span className="text-xs text-slate-400">{roleMembers.length}</span>
                  </div>
                  <div className="space-y-1">
                    {roleMembers.map(member => (
                      <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors group cursor-pointer">
                        <Avatar
                          src={member.avatar_url}
                          name={member.full_name}
                          email={member.email}
                          size="sm"
                          status={member.status}
                          showStatus={true}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {member.username || member.full_name || member.email.split('@')[0]}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {member.roles.map(r => (
                              <RoleBadge key={r.id} role={r} size="xs" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {getUnassignedMembers().length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 px-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Unassigned</h4>
                  <span className="text-xs text-slate-400">{getUnassignedMembers().length}</span>
                </div>
                <div className="space-y-1">
                  {getUnassignedMembers().map(member => (
                    <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors group">
                        <Avatar
                          src={member.avatar_url}
                          name={member.full_name}
                          email={member.email}
                          size="sm"
                          status={member.status}
                          showStatus={true}
                        />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {member.username || member.full_name || member.email.split('@')[0]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
        <button
          onClick={() => {
            onClose();
            navigate(`/app/team/${teamId}/chat`);
          }}
          className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors bg-white border border-slate-200"
        >
          <div className="w-6 h-6 rounded bg-primary-50 flex items-center justify-center text-primary-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium text-sm">Team Chat</span>
        </button>

        {isAdmin && (
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => {
              onClose();
              navigate(`/app/team/${teamId}/members`);
            }}
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
        )}
        
        <div className="pt-2 border-t border-slate-200">
             <UserProfileDropdown />
        </div>
      </div>
    </div>
  );
};
