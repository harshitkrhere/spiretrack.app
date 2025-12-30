import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  XMarkIcon, 
  CheckIcon,
  AtSymbolIcon,
  UserPlusIcon,
  DocumentChartBarIcon,
  ClockIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface Notification {
  id: string;
  type: 'mention' | 'team_invite' | 'report_ready' | 'reminder' | 'system';
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

interface NotificationPanelProps {
  userId: string;
  onClose: () => void;
  onMarkAllRead: () => void;
  onRefresh: () => void;
}

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  mention: AtSymbolIcon,
  team_invite: UserPlusIcon,
  report_ready: DocumentChartBarIcon,
  reminder: ClockIcon,
  system: InformationCircleIcon,
};

const notificationColors: Record<string, string> = {
  mention: 'bg-blue-100 text-blue-600',
  team_invite: 'bg-green-100 text-green-600',
  report_ready: 'bg-purple-100 text-purple-600',
  reminder: 'bg-amber-100 text-amber-600',
  system: 'bg-slate-100 text-slate-600',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  userId,
  onClose,
  onMarkAllRead,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Close on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
      
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      onRefresh();
    }

    // Navigate if link provided
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    onRefresh();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-md transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-blue-600 rounded-full mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <InformationCircleIcon className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type] || InformationCircleIcon;
              const colorClass = notificationColors[notification.type] || notificationColors.system;
              
              return (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={cn(
                    "px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3",
                    !notification.read && "bg-blue-50/50"
                  )}
                >
                  {/* Icon */}
                  <div className={cn("flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center", colorClass)}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm leading-snug",
                        notification.read ? "text-slate-700" : "text-slate-900 font-medium"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(notification.created_at)}</span>
                    </div>
                    {notification.body && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.body}</p>
                    )}
                  </div>

                  {/* Mark as read button */}
                  {!notification.read && (
                    <button
                      onClick={(e) => handleMarkAsRead(e, notification.id)}
                      className="flex-shrink-0 p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              navigate('/app/notifications');
              onClose();
            }}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};
