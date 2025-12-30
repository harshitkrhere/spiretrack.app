import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { ChannelTask, TaskStatus, TaskPriority, MessageUser } from '../types';
import { TaskDetailPanel } from '../../tasks/TaskDetailPanel';
import { 
  PlusIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '../../../../lib/utils';
import { Avatar } from '../../../ui/Avatar';

interface TasksTabProps {
  channelId: string;
  teamId: string;
  currentUserId: string;
  isAdmin: boolean;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-600', icon: ClockIcon },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: ClockIcon },
  done: { label: 'Done', color: 'bg-green-100 text-green-700', icon: CheckCircleSolidIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: XMarkIcon },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-slate-400' },
  medium: { label: 'Medium', color: 'text-yellow-500' },
  high: { label: 'High', color: 'text-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

export const TasksTab: React.FC<TasksTabProps> = ({
  channelId,
  teamId,
  currentUserId,
  isAdmin,
}) => {
  const [tasks, setTasks] = useState<ChannelTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [teamMembers, setTeamMembers] = useState<MessageUser[]>([]);
  const [editingTask, setEditingTask] = useState<ChannelTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<ChannelTask | null>(null);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = useState(false);

  // Form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assigned_to: '' as string,
    due_date: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [channelId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_tasks')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch assignee/creator details
      if (data && data.length > 0) {
        const userIds = [...new Set([
          ...data.map(t => t.assigned_to).filter(Boolean),
          ...data.map(t => t.created_by).filter(Boolean)
        ])];
        
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);

        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        
        const tasksWithUsers = data.map(task => ({
          ...task,
          assignee: task.assigned_to ? userMap.get(task.assigned_to) : null,
          creator: userMap.get(task.created_by),
        }));

        setTasks(tasksWithUsers);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    console.log('[TasksTab] Fetching team members for teamId:', teamId);
    
    try {
      // Step 1: Get all user IDs from team_members
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);
      
      console.log('[TasksTab] Team member IDs response:', { memberData, memberError });
      
      if (memberError) throw memberError;
      if (!memberData || memberData.length === 0) {
        console.log('[TasksTab] No team members found');
        setTeamMembers([]);
        return;
      }
      
      // Step 2: Get user details for these IDs
      const userIds = memberData.map(m => m.user_id);
      console.log('[TasksTab] User IDs to fetch:', userIds);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .in('id', userIds);
      
      console.log('[TasksTab] Users data:', { userData, userError });
      
      if (userError) throw userError;
      
      if (userData) {
        setTeamMembers(userData);
        console.log('[TasksTab] Set team members:', userData);
      }
    } catch (err) {
      console.error('[TasksTab] Error fetching team members:', err);
    }
  };

  const handleCreateTask = async () => {
    try {
      const { error } = await supabase
        .from('channel_tasks')
        .insert({
          channel_id: channelId,
          team_id: teamId,
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status,
          priority: newTask.priority,
          assigned_to: newTask.assigned_to || null,
          due_date: newTask.due_date || null,
          created_by: currentUserId,
        });

      if (error) throw error;

      setShowAddModal(false);
      setNewTask({ title: '', description: '', status: 'todo', priority: 'medium', assigned_to: '', due_date: '' });
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<ChannelTask>) => {
    try {
      const { error } = await supabase
        .from('channel_tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    
    try {
      const { error } = await supabase
        .from('channel_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const toggleTaskStatus = async (task: ChannelTask) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
      cancelled: 'todo',
    };
    await handleUpdateTask(task.id, { status: nextStatus[task.status] });
  };

  // Filter by status
  const statusFiltered = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);
  
  // Non-admins only see tasks assigned to them
  const filteredTasks = isAdmin 
    ? statusFiltered 
    : statusFiltered.filter(t => t.assigned_to === currentUserId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Tasks</h2>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
            <FunnelIcon className="w-4 h-4 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
              className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <CheckCircleIcon className="w-12 h-12 mb-2" />
          <p className="text-sm font-medium">No tasks yet</p>
          <p className="text-xs">Create your first task to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const StatusIcon = STATUS_CONFIG[task.status].icon;
            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              >
                {/* Status Toggle - Only for admins */}
                {isAdmin ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTaskStatus(task); }}
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      task.status === 'done' 
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-slate-300 hover:border-blue-500"
                    )}
                  >
                    {task.status === 'done' && <CheckCircleSolidIcon className="w-4 h-4" />}
                  </button>
                ) : (
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    task.status === 'done' 
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-slate-300"
                  )}>
                    {task.status === 'done' && <CheckCircleSolidIcon className="w-4 h-4" />}
                  </div>
                )}

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium",
                    task.status === 'done' ? "text-slate-400 line-through" : "text-slate-900"
                  )}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-slate-500 truncate">{task.description}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Priority */}
                  <ExclamationTriangleIcon className={cn("w-4 h-4", PRIORITY_CONFIG[task.priority].color)} />

                  {/* Assignee */}
                  {task.assignee ? (
                    <span className="text-xs text-slate-500">{task.assignee.full_name || task.assignee.email}</span>
                  ) : (
                    <UserCircleIcon className="w-5 h-5 text-slate-300" />
                  )}

                  {/* Due Date */}
                  {task.due_date && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}

                  {/* Status Badge */}
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    STATUS_CONFIG[task.status].color
                  )}>
                    {STATUS_CONFIG[task.status].label}
                  </span>

                  {/* Delete - Only for admins */}
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">New Task</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAssigneeDropdownOpen(!assigneeDropdownOpen)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left bg-white hover:border-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                  >
                    {newTask.assigned_to ? (() => {
                      const member = teamMembers.find(m => m.id === newTask.assigned_to);
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
                  
                  {/* Dropdown menu */}
                  {assigneeDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <div
                        onClick={() => { setNewTask(prev => ({ ...prev, assigned_to: '' })); setAssigneeDropdownOpen(false); }}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-slate-50",
                          !newTask.assigned_to && "bg-blue-50"
                        )}
                      >
                        <span className="text-sm text-slate-500">Unassigned</span>
                      </div>
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => { setNewTask(prev => ({ ...prev, assigned_to: member.id })); setAssigneeDropdownOpen(false); }}
                          className={cn(
                            "px-3 py-2 cursor-pointer hover:bg-slate-50 flex items-center gap-2",
                            newTask.assigned_to === member.id && "bg-blue-50"
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
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask as any}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          teamMembers={teamMembers as any}
          onClose={() => setSelectedTask(null)}
          onUpdate={(taskId, updates) => {
            handleUpdateTask(taskId, updates as any);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};
