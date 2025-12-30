import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
    created_at: string;
}

export const TaskBoard: React.FC<{ teamId: string }> = ({ teamId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, [teamId]);

    const fetchTasks = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('team_tasks')
            .select('*')
            .eq('team_id', teamId)
            .order('created_at', { ascending: false });
            
        if (data) setTasks(data as Task[]);
        setLoading(false);
    };

    const updateStatus = async (taskId: string, newStatus: string) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
        
        await supabase.functions.invoke('team-operations', {
            body: { action: 'update_task_status', task_id: taskId, status: newStatus }
        });
    };

    const columns = [
        { id: 'todo', title: 'To Do', color: 'bg-gray-100/50 border-gray-200' },
        { id: 'in_progress', title: 'In Progress', color: 'bg-blue-50/50 border-blue-100' },
        { id: 'done', title: 'Done', color: 'bg-green-50/50 border-green-100' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-x-auto p-6">
            <div className="flex gap-6 h-full min-w-[1000px]">
                {columns.map(col => (
                    <div key={col.id} className={`flex-1 rounded-xl border ${col.color} p-4 flex flex-col`}>
                        <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
                            {col.title}
                            <span className="bg-white px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-500 shadow-sm border border-gray-100">
                                {tasks.filter(t => t.status === col.id).length}
                            </span>
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                            task.priority === 'urgent' ? 'bg-red-50 text-red-700 border border-red-100' :
                                            task.priority === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                            task.priority === 'medium' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            'bg-gray-50 text-gray-600 border border-gray-100'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1 leading-snug">{task.title}</h4>
                                    {task.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>}
                                    
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                        <div className="text-xs text-gray-400 font-medium">
                                            {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                        
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {col.id !== 'todo' && (
                                                <button 
                                                    onClick={() => updateStatus(task.id, 'todo')} 
                                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors" 
                                                    title="Move to To Do"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                                </button>
                                            )}
                                            {col.id !== 'in_progress' && (
                                                <button 
                                                    onClick={() => updateStatus(task.id, 'in_progress')} 
                                                    className="p-1.5 hover:bg-blue-50 rounded text-blue-500 hover:text-blue-700 transition-colors" 
                                                    title="Move to In Progress"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                </button>
                                            )}
                                            {col.id !== 'done' && (
                                                <button 
                                                    onClick={() => updateStatus(task.id, 'done')} 
                                                    className="p-1.5 hover:bg-green-50 rounded text-green-500 hover:text-green-700 transition-colors" 
                                                    title="Move to Done"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.status === col.id).length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-400">No tasks</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
