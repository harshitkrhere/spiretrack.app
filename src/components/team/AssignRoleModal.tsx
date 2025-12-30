import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { RoleBadge } from './RoleBadge';

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
  roles: Role[];
}

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  member: Member | null;
  onRolesUpdated: () => void;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  onClose,
  teamId,
  member,
  onRolesUpdated
}) => {
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && teamId) {
      fetchRoles();
    }
  }, [isOpen, teamId]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_roles')
        .select('*')
        .eq('team_id', teamId)
        .order('position', { ascending: false });

      if (error) throw error;
      setAllRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (role: Role) => {
    if (!member) return;
    
    const hasRole = member.roles.some(r => r.id === role.id);
    const action = hasRole ? 'unassign_role' : 'assign_role';
    
    try {
      setProcessing(role.id);
      
      const { error } = await supabase.functions.invoke('team-operations', {
        body: {
          action,
          team_id: teamId,
          user_id: member.user_id,
          role_id: role.id
        }
      });

      if (error) throw error;
      
      onRolesUpdated();
    } catch (err: any) {
      console.error('Error toggling role:', err);
      alert('Failed to update role: ' + err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-lg flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <Dialog.Title className="text-lg font-bold text-slate-900">Assign Roles</Dialog.Title>
              <p className="text-sm text-slate-500">{member.email}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-4">Loading roles...</div>
            ) : allRoles.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                No roles available. Create some roles first.
              </div>
            ) : (
              <div className="space-y-2">
                {allRoles.map(role => {
                  const isAssigned = member.roles.some(r => r.id === role.id);
                  const isProcessing = processing === role.id;
                  
                  return (
                    <div
                      key={role.id}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isAssigned 
                          ? 'bg-blue-50/50 border-blue-100' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <RoleBadge role={role} />
                        {role.is_admin && (
                          <span className="text-xs text-slate-500 italic">Admin</span>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isAssigned ? "danger" : "secondary"}
                        onClick={() => toggleRole(role)}
                        isLoading={isProcessing}
                        className={isAssigned ? "hover:bg-red-100 hover:text-red-700 hover:border-red-200 bg-white text-red-600 border-red-100" : ""}
                      >
                        {isAssigned ? "Remove" : "Assign"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
