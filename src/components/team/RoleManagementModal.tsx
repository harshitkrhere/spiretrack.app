import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PlusIcon, TrashIcon, PencilIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onRolesUpdated: () => void;
}

export const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  isOpen,
  onClose,
  teamId,
  onRolesUpdated
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [reordering, setReordering] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    color: '#94a3b8',
    icon: '',
    is_admin: false
  });
  const [saving, setSaving] = useState(false);

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
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#94a3b8',
      icon: '',
      is_admin: false
    });
    setEditingRole(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    
    try {
      setSaving(true);
      const action = editingRole ? 'update_role' : 'create_role';
      const payload = {
        action,
        team_id: teamId,
        role_id: editingRole?.id,
        ...formData,
        // For new roles, put them at the top (highest position + 1)
        position: editingRole ? editingRole.position : (roles.length > 0 ? Math.max(...roles.map(r => r.position)) + 1 : 1)
      };

      const { error } = await supabase.functions.invoke('team-operations', {
        body: payload
      });

      if (error) throw error;
      
      await fetchRoles();
      onRolesUpdated();
      resetForm();
    } catch (err: any) {
      console.error('Error saving role:', err);
      alert('Failed to save role: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This will remove it from all members.')) return;
    
    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'delete_role',
          role_id: roleId
        }
      });

      if (error) throw error;
      
      await fetchRoles();
      onRolesUpdated();
    } catch (err: any) {
      console.error('Error deleting role:', err);
      alert('Failed to delete role: ' + err.message);
    }
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    if (reordering) return;
    
    const newRoles = [...roles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap roles in array
    [newRoles[index], newRoles[targetIndex]] = [newRoles[targetIndex], newRoles[index]];
    
    // Update positions based on new index
    const maxPos = newRoles.length;
    const updatedRoles = newRoles.map((role, idx) => ({
      ...role,
      position: maxPos - idx
    }));
    
    setRoles(updatedRoles);
    
    try {
      setReordering(true);
      const { error } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'reorder_roles',
          team_id: teamId,
          role_positions: updatedRoles.map(r => ({ id: r.id, position: r.position }))
        }
      });

      if (error) throw error;
      onRolesUpdated();
    } catch (err: any) {
      console.error('Error reordering roles:', err);
      fetchRoles();
    } finally {
      setReordering(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <Dialog.Title className="text-lg font-bold text-slate-900">Manage Roles</Dialog.Title>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* List of Roles */}
            {!isCreating && !editingRole && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-slate-500">
                    Roles allow you to group members and assign permissions.
                  </p>
                  <Button size="sm" onClick={() => setIsCreating(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading roles...</div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    No roles created yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {roles.map((role, index) => (
                      <div key={role.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1 mr-2">
                            <button
                              onClick={() => handleReorder(index, 'up')}
                              disabled={index === 0 || reordering}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronUpIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReorder(index, 'down')}
                              disabled={index === roles.length - 1 || reordering}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <RoleBadge role={role} />
                          {role.is_admin && (
                            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                              Admin Access
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingRole(role);
                              setFormData({
                                name: role.name,
                                color: role.color,
                                icon: role.icon || '',
                                is_admin: role.is_admin
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(role.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Create/Edit Form */}
            {(isCreating || editingRole) && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {editingRole ? 'Edit Role' : 'Create New Role'}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Senior Developer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#94a3b8'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-slate-900' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Icon (Optional Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 👑"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      checked={formData.is_admin}
                      onChange={e => setFormData({ ...formData, is_admin: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="isAdmin" className="text-sm font-medium text-slate-700">
                      Administrator Access
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 ml-6">
                    Admins can manage team settings, roles, and members.
                  </p>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      isLoading={saving}
                      disabled={!formData.name.trim()}
                    >
                      {editingRole ? 'Save Changes' : 'Create Role'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
