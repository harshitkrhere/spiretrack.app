import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { TaskComments } from './TaskComments';
import { Avatar } from '../../ui/Avatar';
import { 
  XMarkIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '../../../lib/utils';

interface TaskStatus {
  todo: string;
  in_progress: string;
  done: string;
  cancelled: string;
}

interface TaskPriority {
  low: string;
  medium: string;
  high: string;
  urgent: string;
}

interface TaskUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: keyof TaskStatus;
  priority: keyof TaskPriority;
  assigned_to?: string | null;
  due_date?: string | null;
  created_at: string;
  created_by: string;
  assignee?: TaskUser | null;
  creator?: TaskUser | null;
}

interface TaskDetailPanelProps {
  task: Task;
  currentUserId: string;
  isAdmin: boolean;
  teamMembers: TaskUser[];
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-600', icon: ClockIcon },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: ClockIcon },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', icon: CheckCircleSolidIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: XMarkIcon },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-slate-400' },
  medium: { label: 'Medium', color: 'text-yellow-500' },
  high: { label: 'High', color: 'text-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  currentUserId,
  isAdmin,
  teamMembers,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assigned_to: task.assigned_to || '',
    due_date: task.due_date || '',
  });

  // Only admins can edit
  const canEdit = isAdmin;

  const handleSave = () => {
    onUpdate(task.id, {
      title: editedTask.title,
      description: editedTask.description || null,
      status: editedTask.status as keyof TaskStatus,
      priority: editedTask.priority as keyof TaskPriority,
      assigned_to: editedTask.assigned_to || null,
      due_date: editedTask.due_date || null,
    });
    setIsEditing(false);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              STATUS_CONFIG[task.status].color
            )}>
              {STATUS_CONFIG[task.status].label}
            </span>
            <span className={cn("text-sm font-medium", PRIORITY_CONFIG[task.priority].color)}>
              {PRIORITY_CONFIG[task.priority].label} Priority
            </span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editedTask.description}
                    onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={editedTask.status}
                      onChange={(e) => setEditedTask(prev => ({ ...prev, status: e.target.value as keyof TaskStatus }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select
                      value={editedTask.priority}
                      onChange={(e) => setEditedTask(prev => ({ ...prev, priority: e.target.value as keyof TaskPriority }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left bg-white hover:border-slate-400 flex items-center justify-between"
                      >
                        {editedTask.assigned_to ? (() => {
                          const member = teamMembers.find(m => m.id === editedTask.assigned_to);
                          return member ? (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar src={member.avatar_url} name={member.full_name || member.email} size="xs" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900 truncate">{member.full_name || 'Unknown'}</div>
                                <div className="text-xs text-slate-500 truncate">@{member.email?.split('@')[0]}</div>
                              </div>
                            </div>
                          ) : <span className="text-slate-500">Unassigned</span>;
                        })() : (
                          <span className="text-slate-500">Unassigned</span>
                        )}
                        <svg className={cn("w-4 h-4 text-slate-400 transition-transform", assigneeDropdownOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {assigneeDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <div
                            onClick={() => { setEditedTask(prev => ({ ...prev, assigned_to: '' })); setAssigneeDropdownOpen(false); }}
                            className={cn(
                              "px-3 py-2 cursor-pointer hover:bg-slate-50",
                              !editedTask.assigned_to && "bg-blue-50"
                            )}
                          >
                            <span className="text-sm text-slate-500">Unassigned</span>
                          </div>
                          {teamMembers.map(member => (
                            <div
                              key={member.id}
                              onClick={() => { setEditedTask(prev => ({ ...prev, assigned_to: member.id })); setAssigneeDropdownOpen(false); }}
                              className={cn(
                                "px-3 py-2 cursor-pointer hover:bg-slate-50 flex items-center gap-2",
                                editedTask.assigned_to === member.id && "bg-blue-50"
                              )}
                            >
                              <Avatar src={member.avatar_url} name={member.full_name || member.email} size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-900 truncate">{member.full_name || 'Unknown'}</div>
                                <div className="text-xs text-slate-500 truncate">@{member.email?.split('@')[0]}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editedTask.due_date}
                      onChange={(e) => setEditedTask(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editedTask.title.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-4">{task.title}</h2>
                
                {task.description && (
                  <p className="text-slate-600 whitespace-pre-wrap mb-6">{task.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <span>Assignee:</span>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar 
                          src={task.assignee.avatar_url} 
                          name={task.assignee.full_name || task.assignee.email}
                          size="xs"
                        />
                        <span className="font-medium">{task.assignee.full_name || task.assignee.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <span>Due:</span>
                    <span className="font-medium">{formatDate(task.due_date ?? null)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Comments Section */}
          <div className="h-80">
            <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Comments</h3>
            </div>
            <TaskComments taskId={task.id} currentUserId={currentUserId} />
          </div>
        </div>
      </div>
    </div>
  );
};
