import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ChannelList } from './ChannelList';
import { ChatWindow } from './ChatWindow';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export const ChatLayout: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        if (teamId) {
          const { data: member, error: memberError } = await supabase
            .from('team_members')
            .select('role')
            .eq('team_id', teamId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (!member || memberError) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
            
          const { data: memberRoles } = await supabase
            .from('team_member_roles')
            .select('team_roles(is_admin)')
            .eq('team_id', teamId)
            .eq('user_id', user.id);
            
          const hasAdminRole = memberRoles?.some((mr: any) => mr.team_roles?.is_admin) || false;
          setIsAdmin(member?.role === 'admin' || hasAdminRole);
        }
      } else {
        setAccessDenied(true);
      }
      setLoading(false);
    };

    checkUser();
  }, [teamId]);

  // Close channel list when selecting a channel on mobile
  const handleChannelSelect = (channelId: string | null) => {
    setActiveChannelId(channelId);
    setShowChannelList(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !teamId || !currentUserId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-sm text-gray-600 mb-4">
            You are not a member of this team. Please join the team first to access its content.
          </p>
          <button
            onClick={() => navigate('/app/team')}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Mobile Channel Toggle Button */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-40 w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center"
        onClick={() => setShowChannelList(!showChannelList)}
      >
        {showChannelList ? (
          <XMarkIcon className="w-5 h-5" />
        ) : (
          <Bars3Icon className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {showChannelList && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setShowChannelList(false)}
        />
      )}

      {/* Sidebar - Channel List */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        w-64 sm:w-72 md:w-64 
        border-r border-gray-200 bg-gray-50 
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${showChannelList ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg z-10"
          onClick={() => setShowChannelList(false)}
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>

        <ChannelList 
          teamId={teamId}
          activeChannelId={activeChannelId}
          onChannelSelect={handleChannelSelect}
          isAdmin={isAdmin}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeChannelId ? (
          <ChatWindow 
            teamId={teamId}
            channelId={activeChannelId}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50/50 p-4">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-medium text-sm sm:text-base">Select a channel to start chatting</p>
              <p className="text-xs text-gray-400 mt-1 md:hidden">
                Tap the menu button to see channels
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
