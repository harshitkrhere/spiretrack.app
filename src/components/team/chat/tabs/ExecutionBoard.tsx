import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { ChannelTask, TaskStatus, TaskPriority, MessageUser } from '../types';
import { 
  FunnelIcon, 
  UserIcon, 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../../lib/utils';
import { Avatar } from '../../../ui/Avatar';

interface ExecutionBoardProps {
  channelId: string;
  teamId: string;
  isAdmin: boolean;
  currentUserId: string;
}

interface TaskWithUser extends ChannelTask {
  owner?: MessageUser;
  assignee?: MessageUser;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.FC<{className?: string}>; color: string }> = {
  todo: { label: 'To Do', icon: ClockIcon, color: 'text-slate-500 bg-slate-100' },
  in_progress: { label: 'In Progress', icon: ExclamationTriangleIcon, color: 'text-blue-600 bg-blue-50' },
  done: { label: 'Done', icon: CheckCircleIcon, color: 'text-green-600 bg-green-50' },
  cancelled: { label: 'Cancelled', icon: XCircleIcon, color: 'text-slate-400 bg-slate-50' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-slate-500' },
  medium: { label: 'Medium', color: 'text-amber-600' },
  high: { label: 'High', color: 'text-orange-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

export const ExecutionBoard: React.FC<ExecutionBoardProps> = ({
  channelId,
  teamId,
  isAdmin,
  currentUserId,
}) => {
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status: TaskStatus | 'all';
    showOverdue: boolean;
  }>({
    status: 'all',
    showOverdue: false,
  });

  useEffect(() => {
    fetchTasks();
  }, [channelId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_tasks')
        .select('*')
        .eq('channel_id', channelId)
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;

      // Fetch user details for owners and assignees
      const userIds = [...new Set([
        ...(data || []).map(t => t.owner_id).filter(Boolean),
        ...(data || []).map(t => t.assigned_to).filter(Boolean),
      ])];

      let userMap = new Map<string, MessageUser>();
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);
        
        (users || []).forEach(u => userMap.set(u.id, u));
      }

      const tasksWithUsers = (data || []).map(task => ({
        ...task,
        owner: task.owner_id ? userMap.get(task.owner_id) : undefined,
        assignee: task.assigned_to ? userMap.get(task.assigned_to) : undefined,
      }));

      setTasks(tasksWithUsers);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filter.status !== 'all' && task.status !== filter.status) return false;
    
    // Overdue filter
    if (filter.showOverdue && !isOverdue(task.due_date)) return false;
    
    // Exclude done/cancelled from default view
    if (filter.status === 'all' && ['done', 'cancelled'].includes(task.status)) return false;
    
    // Non-admins only see their assigned tasks
    if (!isAdmin && task.assigned_to !== currentUserId) return false;
    
    return true;
  });

  const formatDate = (date: string | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Execution Board</h2>
          <p className="text-sm text-slate-500 mt-1">
            {filteredTasks.length} active task{filteredTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-slate-400" />
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as TaskStatus | 'all' }))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Active Tasks</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.showOverdue}
              onChange={(e) => setFilter(prev => ({ ...prev, showOverdue: e.target.checked }))}
              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            Overdue only
          </label>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border border-slate-200">
          <ClockIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No tasks found</h3>
          <p className="text-sm text-slate-500">
            {filter.status === 'all' ? 'No active tasks in this channel' : `No ${filter.status.replace('_', ' ')} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const StatusIcon = STATUS_CONFIG[task.status].icon;
            const overdue = isOverdue(task.due_date) && !['done', 'cancelled'].includes(task.status);
            
            return (
              <div
                key={task.id}
                className={cn(
                  "p-4 bg-white rounded-lg border transition-colors",
                  overdue ? "border-red-200 bg-red-50/30" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        STATUS_CONFIG[task.status].color
                      )}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {STATUS_CONFIG[task.status].label}
                      </span>
                      <span className={cn("text-xs font-medium", PRIORITY_CONFIG[task.priority].color)}>
                        {PRIORITY_CONFIG[task.priority].label}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-slate-900 truncate">{task.title}</h4>
                    
                    {task.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">{task.description}</p>
                    )}
                  </div>
                  
                  {/* Right: Owner, Due Date */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {/* Owner */}
                    <div className="flex items-center gap-2">
                      {task.owner || task.assignee ? (
                        <>
                          <Avatar 
                            src={(task.owner || task.assignee)?.avatar_url} 
                            name={(task.owner || task.assignee)?.full_name || (task.owner || task.assignee)?.email}
                            size="sm"
                          />
                          <span className="text-sm text-slate-600 max-w-[100px] truncate">
                            {(task.owner || task.assignee)?.full_name || 'Unassigned'}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          Unassigned
                        </span>
                      )}
                    </div>
                    
                    {/* Due Date */}
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      overdue ? "text-red-600 font-medium" : "text-slate-500"
                    )}>
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(task.due_date)}
                      {overdue && <span className="text-xs ml-1">(Overdue)</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
