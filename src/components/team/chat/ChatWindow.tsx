import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Message, Attachment, ReactionType, ChannelTab, ChannelTabType, MessageUser } from './types';
import { MessageItem } from './MessageItem';
import { MessageInput } from './MessageInput';
import { ThreadPanel } from './ThreadPanel';
import { SearchPanel } from './SearchPanel';
import { PinnedMessagesPanel } from './PinnedMessagesPanel';
import { TabBar, OverviewTab, TasksTab, FilesTab, ActivityTab, ExecutionBoard, DecisionLog, AnnouncementPanel } from './tabs';
import { MembersSidebar } from '../MembersSidebar';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Avatar } from '../../ui/Avatar';

interface ChatWindowProps {
  teamId: string;
  channelId: string;
  currentUserId: string;
  isAdmin: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  teamId, 
  channelId, 
  currentUserId,
  isAdmin 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  // New state for Phase 1 features
  const [activeThread, setActiveThread] = useState<Message | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(1);
  const [channelName, setChannelName] = useState('');
  
  // Team Members for avatar display
  const [teamMembers, setTeamMembers] = useState<MessageUser[]>([]);
  const [adminUserIds, setAdminUserIds] = useState<Set<string>>(new Set());
  const [showMembersList, setShowMembersList] = useState(false);
  
  // Phase 1.5: Channel Tabs
  const [tabs, setTabs] = useState<ChannelTab[]>([]);
  const [activeTab, setActiveTab] = useState<ChannelTabType>('messages');
  const [tabsLoading, setTabsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url')
        .eq('id', currentUserId)
        .single();
      if (data) setCurrentUserProfile(data);
    };
    fetchProfile();
  }, [currentUserId]);

  useEffect(() => {
    const fetchChannel = async () => {
      const { data } = await supabase.from('team_channels').select('name').eq('id', channelId).single();
      if (data) setChannelName(data.name);
    };
    fetchChannel();
  }, [channelId]);

  // Fetch team members for avatar display and admin detection
  useEffect(() => {
    const fetchTeamMembers = async () => {
      // First, get team members with base roles
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('user_id, role')
        .eq('team_id', teamId);
      
      if (memberError) {
        console.error('[DEBUG] team_members fetch error:', memberError);
        return;
      }
      
      const admins = new Set<string>();
      
      if (memberData && memberData.length > 0) {
        // Add users with role='admin' from team_members
        memberData.forEach((m: any) => {
          if (m.role === 'admin') {
            admins.add(m.user_id);
          }
        });
        
        // Now fetch user details
        const userIds = memberData.map((m: any) => m.user_id);
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);
        
        if (usersData && !usersError) {
          setTeamMembers(usersData as MessageUser[]);
          setMemberCount(usersData.length);
        }
      }
      
      // Also check for custom roles with is_admin=true
      const { data: customAdminData, error: customAdminError } = await supabase
        .from('team_member_roles')
        .select('user_id, role:team_roles!inner(is_admin)')
        .eq('team_id', teamId);
      
      if (!customAdminError && customAdminData) {
        customAdminData.forEach((m: any) => {
          // role is the team_roles object with is_admin field
          if (m.role?.is_admin === true) {
            admins.add(m.user_id);
          }
        });
      }
      
      setAdminUserIds(admins);
    };
    fetchTeamMembers();
  }, [teamId]);

  // Get 3 random members for avatar display
  const displayAvatars = useMemo(() => {
    if (teamMembers.length <= 3) return teamMembers;
    const shuffled = [...teamMembers].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [teamMembers]);

  // Phase 1.5: Ensure default tabs exist for this channel
  useEffect(() => {
    const ensureDefaultTabs = async () => {
      try {
        setTabsLoading(true);
        
        // Fetch existing tabs
        const { data: existingTabs, error } = await supabase
          .from('channel_tabs')
          .select('*')
          .eq('channel_id', channelId)
          .order('position', { ascending: true });

        if (error) throw error;

        if (existingTabs && existingTabs.length > 0) {
          // Check if we need to add new Phase 3.2 tabs to existing channels
          const existingTypes = existingTabs.map(t => t.type);
          const newTabs: any[] = [];
          
          // Phase 3.2 tabs that might be missing
          const phase32Tabs = [
            { type: 'execution', position: 5, is_default: false, is_removable: true },
            { type: 'decisions', position: 6, is_default: false, is_removable: true },
            { type: 'announcements', position: 7, is_default: false, is_removable: true },
          ];
          
          for (const tab of phase32Tabs) {
            if (!existingTypes.includes(tab.type as any)) {
              newTabs.push({
                ...tab,
                channel_id: channelId,
                team_id: teamId,
                created_by: currentUserId,
              });
            }
          }
          
          if (newTabs.length > 0) {
            // Backfill missing tabs
            const { data: addedTabs } = await supabase
              .from('channel_tabs')
              .insert(newTabs)
              .select();
            
            setTabs([...existingTabs, ...(addedTabs || [])]);
          } else {
            setTabs(existingTabs);
          }
        } else {
          const defaultTabConfigs = [
            { type: 'messages', position: 0, is_default: true, is_removable: false },
            { type: 'overview', position: 1, is_default: false, is_removable: true },
            { type: 'tasks', position: 2, is_default: false, is_removable: true },
            { type: 'files', position: 3, is_default: false, is_removable: true },
            { type: 'execution', position: 4, is_default: false, is_removable: true },
            { type: 'decisions', position: 5, is_default: false, is_removable: true },
            { type: 'announcements', position: 6, is_default: false, is_removable: true },
          ];

          const tabsToInsert = defaultTabConfigs.map(config => ({
            ...config,
            channel_id: channelId,
            team_id: teamId,
            created_by: currentUserId,
          }));

          const { data: newTabs, error: insertError } = await supabase
            .from('channel_tabs')
            .insert(tabsToInsert)
            .select();

          if (insertError) {
            console.error('Error creating default tabs:', insertError);
            // Fallback: create in-memory tabs for UI
            const fallbackTabs = defaultTabConfigs.map((config, idx) => ({
              ...config,
              id: `temp-${idx}`,
              channel_id: channelId,
              team_id: teamId,
              created_by: currentUserId,
              created_at: new Date().toISOString(),
            })) as ChannelTab[];
            setTabs(fallbackTabs);
          } else {
            setTabs(newTabs || []);
          }
        }
      } catch (err) {
        console.error('Error ensuring default tabs:', err);
      } finally {
        setTabsLoading(false);
      }
    };

    ensureDefaultTabs();
  }, [channelId, teamId, currentUserId]);

  // Fetch Messages
  const fetchMessages = async (pageNum: number, isRefresh = false) => {
    try {
      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: { 
          action: 'fetch_messages', 
          team_id: teamId, 
          channel_id: channelId,
          page: pageNum,
          limit: 50
        }
      });
      
      if (error) throw error;
      
      const newMessages = data || [];
      if (newMessages.length < 50) setHasMore(false);
      
      // Fetch thread participants for messages with replies
      const messagesWithThreads = newMessages.filter((m: Message) => m.thread_reply_count > 0);
      
      if (messagesWithThreads.length > 0) {
        // For each message with threads, fetch up to 3 unique reply authors
        const threadParticipantsPromises = messagesWithThreads.map(async (msg: Message) => {
          const { data: replies } = await supabase
            .from('team_messages')
            .select('user_id')
            .eq('parent_message_id', msg.id)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (!replies || replies.length === 0) return { messageId: msg.id, participants: [] };
          
          // Get unique user IDs (up to 3)
          const uniqueUserIds = [...new Set(replies.map((r: any) => r.user_id).filter(Boolean))].slice(0, 3);
          
          if (uniqueUserIds.length === 0) return { messageId: msg.id, participants: [] };
          
          const { data: users } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .in('id', uniqueUserIds);
          
          return { messageId: msg.id, participants: users || [] };
        });
        
        const threadParticipantsResults = await Promise.all(threadParticipantsPromises);
        const participantsMap = new Map(threadParticipantsResults.map(r => [r.messageId, r.participants]));
        
        // Add participants to messages
        newMessages.forEach((msg: Message) => {
          if (participantsMap.has(msg.id)) {
            msg.thread_participants = participantsMap.get(msg.id);
          }
        });
      }
      
      // Fetch reactions for all messages directly from database
      const messageIds = newMessages.map((m: Message) => m.id);
      if (messageIds.length > 0) {
        const { data: allReactions } = await supabase
          .from('message_reactions')
          .select('id, message_id, user_id, reaction_type, created_at')
          .in('message_id', messageIds);
        
        if (allReactions && allReactions.length > 0) {
          // Get user info for reactions
          const reactionUserIds = [...new Set(allReactions.map(r => r.user_id))];
          const { data: reactionUsers } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .in('id', reactionUserIds);
          
          const userMap = new Map(reactionUsers?.map(u => [u.id, u]) || []);
          
          // Group reactions by message_id
          const reactionsMap = new Map<string, any[]>();
          allReactions.forEach(reaction => {
            if (!reactionsMap.has(reaction.message_id)) {
              reactionsMap.set(reaction.message_id, []);
            }
            reactionsMap.get(reaction.message_id)!.push({
              ...reaction,
              user: userMap.get(reaction.user_id) || null
            });
          });
          
          // Attach reactions to messages
          newMessages.forEach((msg: Message) => {
            if (reactionsMap.has(msg.id)) {
              msg.reactions = reactionsMap.get(msg.id);
            }
          });
        }
      }
      
      // Reverse to show oldest first
      const orderedMessages = [...newMessages].reverse();
      
      if (isRefresh) {
        setMessages(orderedMessages);
        scrollToBottom();
      } else {
        setMessages(prev => [...orderedMessages, ...prev]);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberCount = async () => {
    const { count } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);
    if (count) setMemberCount(count);
  };

  // Initial Load & Channel Change
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setPage(0);
    setHasMore(true);
    fetchMessages(0, true);
    fetchMemberCount();

    // Real-time Subscription - Filter out thread replies from main channel
    const channel = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Only show main messages (not thread replies) in main view
          if (payload.new.parent_message_id) return;

          const { data: message } = await supabase
            .from('team_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (!message) return;

          const { data: profile } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url')
            .eq('id', message.user_id)
            .single();

          const formattedMessage = {
            ...message,
            user: profile || { id:message.user_id, email: 'Unknown', full_name: 'Unknown User' }
          };
          
          // Show browser notification for messages from OTHER users
          if (formattedMessage.user_id !== currentUserId) {
            console.log('[Notification] Message from other user:', formattedMessage.user_id);
            console.log('[Notification] Permission:', 'Notification' in window ? Notification.permission : 'Not supported');
            
            if ('Notification' in window && Notification.permission === 'granted') {
              const senderName = profile?.full_name || profile?.email || 'Someone';
              const messagePreview = message.content.length > 100 
                ? message.content.substring(0, 100) + '...' 
                : message.content;
              
              try {
                const notification = new Notification(`${senderName} in ${channelName || 'Chat'}`, {
                  body: messagePreview,
                  icon: '/logo.png',
                  tag: `chat-${channelId}-${Date.now()}`, // Unique tag to allow multiple notifications
                  silent: false
                });
                console.log('[Notification] Shown successfully');

                // Auto-close after 5 seconds
                setTimeout(() => notification.close(), 5000);
              } catch (err) {
                console.error('[Notification] Error showing:', err);
              }
            }
          }
          
          setMessages(prev => {
            // Check for duplicates first
            if (prev.some(m => m.id === formattedMessage.id)) return prev;
            
            // If it's our own message, remove any recent temp messages
            if (formattedMessage.user_id === currentUserId) {
              const now = Date.now();
              const filtered = prev.filter(m => {
                if (!m.id.startsWith('temp-')) return true;
                const tempTime = parseInt(m.id.replace('temp-', ''));
                return (now - tempTime) > 5000; // Keep temp messages older than 5s
              });
              return [...filtered, formattedMessage];
            }
            
            return [...prev, formattedMessage];
          });
          scrollToBottom();
        }
      )
      // Listen for thread count updates
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'team_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => {
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
          ));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        setOnlineCount(Object.keys(newState).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, teamId, currentUserId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (content: string, attachments: Attachment[]) => {
    const tempId = 'temp-' + Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      team_id: teamId,
      channel_id: channelId,
      user_id: currentUserId,
      content,
      attachments,
      mentions: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_message_id: null,
      thread_reply_count: 0,
      last_thread_reply_at: null,
      is_system_message: false,
      system_event_type: null,
      system_event_data: null,
      edited_at: null,
      user: currentUserProfile || { id: currentUserId, email: 'You', full_name: 'You' }
    };

    setMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    // Insert directly into database (RLS handles permissions)
    const { error } = await supabase
      .from('team_messages')
      .insert({
        team_id: teamId,
        channel_id: channelId,
        user_id: currentUserId,
        content,
        attachments,
        mentions: [],
      });

    if (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('Failed to send message: ' + error.message);
    } else {
      // Trigger notification processing (fire and forget)
      supabase.functions.invoke('process-notifications').catch(err => {
        console.log('[Notifications] Queue processing triggered', err ? `with warning: ${err.message}` : '');
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;
      if (scrollTop === 0 && hasMore && !loading) {
        const prevHeight = scrollContainerRef.current.scrollHeight;
        setPage(prev => prev + 1);
        fetchMessages(page + 1).then(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight - prevHeight;
          }
        });
      }
    }
  };

  // Phase 1 Feature Handlers
  const handleOpenThread = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setActiveThread(message);
    }
  };

  const handleReactionToggle = async (messageId: string, reactionType: ReactionType) => {
    try {
      // First, try to delete the reaction (if it exists)
      const { data: deleted, error: deleteError } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .eq('reaction_type', reactionType)
        .select();

      if (deleteError) throw deleteError;

      // If we deleted something, update UI to remove it
      if (deleted && deleted.length > 0) {
        setMessages(prev => prev.map(msg => {
          if (msg.id !== messageId) return msg;
          const reactions = msg.reactions || [];
          return { ...msg, reactions: reactions.filter(r => !(r.user_id === currentUserId && r.reaction_type === reactionType)) };
        }));
      } else {
        // Nothing was deleted, so add the reaction
        const { error: insertError } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            reaction_type: reactionType,
          });

        if (insertError) throw insertError;

        // Update UI to add the reaction
        setMessages(prev => prev.map(msg => {
          if (msg.id !== messageId) return msg;
          const reactions = msg.reactions || [];
          return { ...msg, reactions: [...reactions, { id: 'temp', message_id: messageId, user_id: currentUserId, reaction_type: reactionType, created_at: new Date().toISOString() }] };
        }));
      }
    } catch (err: any) {
      console.error('Failed to toggle reaction:', err);
      // Don't show alert for minor errors, just log them
    }
  };

  const handlePin = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      if (message.is_pinned) {
        // Unpin - direct database delete
        const { error } = await supabase
          .from('pinned_messages')
          .delete()
          .eq('message_id', messageId);

        if (error) throw error;

        // Optimistically update
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, is_pinned: false } : msg
        ));
      } else {
        // Pin - direct database insert
        const { error } = await supabase
          .from('pinned_messages')
          .insert({
            message_id: messageId,
            channel_id: channelId,
            team_id: teamId,
            pinned_by: currentUserId,
          });

        if (error) {
          // Handle specific errors
          if (error.code === '23505' || error.message?.includes('duplicate')) {
            // Message is already pinned but UI doesn't show it - refresh state
            setMessages(prev => prev.map(msg => 
              msg.id === messageId ? { ...msg, is_pinned: true } : msg
            ));
            return;
          }
          if (error.message?.includes('Maximum 10')) {
            throw new Error('Maximum 10 pinned messages per channel. Unpin a message first.');
          }
          throw error;
        }

        // Optimistically update
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, is_pinned: true } : msg
        ));
      }
    } catch (err: any) {
      console.error('Failed to pin/unpin:', err);
      alert(err.message || 'Failed to pin message');
    }
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    try {
      // Direct database update - RLS policy enforces 15-minute window
      const { error } = await supabase
        .from('team_messages')
        .update({
          content: newContent,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      // Optimistically update UI
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent, edited_at: new Date().toISOString() } : msg
      ));
    } catch (err: any) {
      console.error('Failed to edit message:', err);
      alert('Failed to edit message. You can only edit your own messages within 15 minutes.');
    }
  };

  const handleMessageClick = (messageId: string) => {
    // Jump to message (from search or pins)
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('bg-yellow-100');
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100');
      }, 2000);
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      // Optimistically remove from UI first
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      const { error } = await supabase
        .from('team_messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', currentUserId);

      if (error) {
        // Restore message if delete failed
        fetchMessages(0, true);
        throw error;
      }
    } catch (err: any) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col border-b border-slate-200 bg-white z-20 relative">
        {/* Top Row: Channel Info & Actions */}
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-md -ml-2 transition-colors">
              <span className="text-xl font-bold text-slate-900 leading-none">#</span>
              <h2 className="text-lg font-bold text-slate-900 leading-none">{channelName || 'Loading...'}</h2>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-500 mt-0.5">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 border-l border-slate-300 pl-3 h-5">
              <span className="truncate max-w-sm">Track and coordinate social media</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Member Avatars - Clickable to open member list */}
            <button 
              onClick={() => setShowMembersList(true)}
              className="flex items-center mr-2 cursor-pointer hover:opacity-80 transition-opacity"
              title="View team members"
            >
              <div className="flex -space-x-2">
                {displayAvatars.map((member, i) => (
                  <Avatar
                    key={member.id || i}
                    src={member.avatar_url}
                    name={member.full_name}
                    email={member.email}
                    size="xs"
                    className="border-2 border-white"
                  />
                ))}
                {teamMembers.length > 3 && (
                  <div className="w-7 h-7 rounded-sm border-2 border-white bg-slate-300 flex items-center justify-center text-[10px] font-medium text-slate-600">
                    +{teamMembers.length - 3}
                  </div>
                )}
              </div>
              <div className="ml-2 px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-600">
                {memberCount}
              </div>
            </button>

            <div className="h-5 border-l border-slate-200 mx-1"></div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors ${showSearch ? 'bg-slate-100 text-slate-900' : ''}`}
                title="Search messages"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowPinned(!showPinned)}
                className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors ${showPinned ? 'bg-slate-100 text-slate-900' : ''}`}
                title="Pinned messages"
              >
                <MapPinIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Phase 1.5: Dynamic Tab Bar */}
        {!tabsLoading && tabs.length > 0 && (
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAdmin={isAdmin}
          />
        )}

        {/* Panels */}
        <div className="relative">
          {showSearch && (
            <SearchPanel
              teamId={teamId}
              channelId={channelId}
              currentUserId={currentUserId}
              onClose={() => setShowSearch(false)}
              onMessageClick={handleMessageClick}
            />
          )}
          {showPinned && (
            <PinnedMessagesPanel
              teamId={teamId}
              channelId={channelId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onClose={() => setShowPinned(false)}
              onMessageClick={handleMessageClick}
            />
          )}
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <>
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-white"
            >
              {loading && page === 0 && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5D79A0]"></div>
                </div>
              )}
              
              {hasMore && !loading && (
                <div className="text-center py-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Scroll up to load more
                </div>
              )}

              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="bg-slate-50 p-8 rounded-[2rem] mb-6 border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-slate-900">No messages yet</p>
                  <p className="text-sm text-slate-500 mt-2">Start the conversation!</p>
                </div>
              )}

              {messages.filter(m => !m.parent_message_id).map((msg, index, sectionMessages) => {
                const prevMsg = index > 0 ? sectionMessages[index - 1] : null;
                const isGrouped = prevMsg && 
                  prevMsg.user_id === msg.user_id && 
                  (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 2 * 60 * 1000);

                return (
                  <div key={msg.id} id={`message-${msg.id}`} className="transition-colors duration-200">
                    <MessageItem 
                      message={msg} 
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      senderIsAdmin={adminUserIds.has(msg.user_id || '')}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReactionToggle={handleReactionToggle}
                      onPin={handlePin}
                      onReply={handleOpenThread}
                      showThreadButton={true}
                      isInThread={false}
                      isGrouped={!!isGrouped}
                    />
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
              <MessageInput 
                teamId={teamId}
                channelId={channelId}
                onSendMessage={handleSendMessage}
                isAdmin={isAdmin}
              />
            </div>
          </>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto">
            <OverviewTab
              channelId={channelId}
              teamId={teamId}
              tabId={tabs.find(t => t.type === 'overview')?.id || ''}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="flex-1 overflow-y-auto">
            <TasksTab
              channelId={channelId}
              teamId={teamId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="flex-1 overflow-y-auto">
            <FilesTab
              channelId={channelId}
              teamId={teamId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          </div>
        )}



        {/* Execution Board Tab (Phase 3.2) */}
        {activeTab === 'execution' && (
          <div className="flex-1 overflow-y-auto">
            <ExecutionBoard
              channelId={channelId}
              teamId={teamId}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
            />
          </div>
        )}
        {activeTab === 'decisions' && (
          <div className="flex-1 overflow-y-auto">
            <DecisionLog
              channelId={channelId}
              teamId={teamId}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Announcements Tab (Phase 3.2) */}
        {activeTab === 'announcements' && (
          <div className="flex-1 overflow-y-auto">
            <AnnouncementPanel
              channelId={channelId}
              teamId={teamId}
              isAdmin={isAdmin}
            />
          </div>
        )}

      </div>

      {/* Thread Panel */}
      {activeThread && (
        <ThreadPanel
          parentMessage={activeThread}
          channelId={channelId}
          teamId={teamId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setActiveThread(null)}
        />
      )}

      {/* Members Sidebar */}
      <MembersSidebar
        teamId={teamId}
        isOpen={showMembersList}
        onClose={() => setShowMembersList(false)}
      />
    </div>
  );
};
