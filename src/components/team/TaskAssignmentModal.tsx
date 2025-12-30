import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  report: any;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  teamId,
  report
}) => {
  const [tasks, setTasks] = useState<Array<{ title: string; assignee: string; priority: string }>>([
    { title: '', assignee: '', priority: 'medium' }
  ]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const addTask = () => {
    setTasks([...tasks, { title: '', assignee: '', priority: 'medium' }]);
  };

  const updateTask = (index: number, field: string, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const validTasks = tasks.filter(t => t.title.trim() !== '');
      
      for (const task of validTasks) {
        const { error } = await supabase.functions.invoke('team-operations', {
          body: {
            action: 'create_task',
            team_id: teamId,
            title: task.title,
            assignee: task.assignee || null,
            priority: task.priority,
            status: 'pending'
          }
        });

        if (error) throw error;
      }

      alert(`${validTasks.length} task(s) created successfully!`);
      onClose();
    } catch (err: any) {
      console.error('Error creating tasks:', err);
      alert('Failed to create tasks: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Assign Tasks</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-slate-600 mb-6">
            Create and assign tasks based on this week's report. Tasks will be tracked in the team dashboard.
          </p>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Task {index + 1}</span>
                  {tasks.length > 1 && (
                    <button
                      onClick={() => removeTask(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => updateTask(index, 'title', e.target.value)}
                      placeholder="e.g., Resolve deployment blocker"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Assignee (optional)
                      </label>
                      <input
                        type="text"
                        value={task.assignee}
                        onChange={(e) => updateTask(index, 'assignee', e.target.value)}
                        placeholder="Team member name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(index, 'priority', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addTask}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            + Add Another Task
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving}>
            Create {tasks.filter(t => t.title.trim()).length} Task(s)
          </Button>
        </div>
      </div>
    </div>
  );
};
