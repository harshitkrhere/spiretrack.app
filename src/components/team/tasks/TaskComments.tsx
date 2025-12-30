import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Avatar } from '../../ui/Avatar';
import { 
  PaperAirplaneIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../lib/utils';

interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  attachments: Attachment[];
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Attachment {
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: number;
}

interface TaskCommentsProps {
  taskId: string;
  currentUserId: string;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, currentUserId }) => {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
    
    // Subscribe to new comments
    const subscription = supabase
      .channel(`task-comments-${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'task_comments',
        filter: `task_id=eq.${taskId}`
      }, (payload) => {
        fetchCommentWithUser(payload.new.id);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [taskId]);

  useEffect(() => {
    // Scroll to bottom when new comments are added
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user details for each comment
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);

        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        
        const commentsWithUsers = data.map(comment => ({
          ...comment,
          user: userMap.get(comment.user_id)
        }));
        
        setComments(commentsWithUsers);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentWithUser = async (commentId: string) => {
    const { data: comment } = await supabase
      .from('task_comments')
      .select('*')
      .eq('id', commentId)
      .single();

    if (comment) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .eq('id', comment.user_id)
        .single();

      setComments(prev => [...prev, { ...comment, user }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && attachments.length === 0) return;

    try {
      const { error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: currentUserId,
          content: newComment.trim(),
          attachments: attachments
        });

      if (error) throw error;

      setNewComment('');
      setAttachments([]);
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `task-attachments/${taskId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        // Determine file type
        let type: 'image' | 'video' | 'file' = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';

        setAttachments(prev => [...prev, {
          type,
          url: publicUrl,
          name: file.name,
          size: file.size
        }]);
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment on this task</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <Avatar 
                src={comment.user?.avatar_url} 
                name={comment.user?.full_name || comment.user?.email}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {comment.user?.full_name || comment.user?.email || 'Unknown'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatTime(comment.created_at)}
                  </span>
                </div>
                
                {comment.content && (
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}

                {/* Attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {comment.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {att.type === 'image' ? (
                          <img 
                            src={att.url} 
                            alt={att.name}
                            className="max-w-[200px] max-h-[150px] rounded-lg border border-slate-200 object-cover"
                          />
                        ) : att.type === 'video' ? (
                          <video 
                            src={att.url}
                            className="max-w-[200px] max-h-[150px] rounded-lg border border-slate-200"
                            controls
                          />
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                            <DocumentIcon className="h-5 w-5 text-slate-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-700 truncate max-w-[150px]">
                                {att.name}
                              </p>
                              {att.size && (
                                <p className="text-xs text-slate-400">
                                  {formatFileSize(att.size)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-200 flex flex-wrap gap-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative group">
              {att.type === 'image' ? (
                <img src={att.url} alt={att.name} className="h-16 w-16 object-cover rounded-lg" />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center bg-slate-100 rounded-lg">
                  <DocumentIcon className="h-6 w-6 text-slate-400" />
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <PhotoIcon className="h-5 w-5" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newComment.trim() && attachments.length === 0}
            className={cn(
              "p-2 rounded-lg transition-colors",
              newComment.trim() || attachments.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
