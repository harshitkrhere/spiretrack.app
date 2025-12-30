import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarIcon, 
  ChartPieIcon, 
  UserGroupIcon, 
  ViewColumnsIcon,
  HashtagIcon,
  PlusIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface Team {
  id: string;
  name: string;
  logo_url?: string;
}

interface Channel {
    id: string;
    name: string;
    is_private?: boolean;
}

export const AppSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { teamId } = useParams<{ teamId: string }>();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [appsOpen, setAppsOpen] = useState(true);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);

  // Fetch Teams (Workspaces)
  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name)')
        .eq('user_id', user.id);
      
      if (data) {
        const userTeams = data.map((item: any) => item.teams).filter(Boolean);
        setTeams(userTeams);
        
        // Set active team object
        if (teamId) {
            const current = userTeams.find(t => t.id === teamId);
            if (current) setActiveTeam(current);
        }
      }
    };
    fetchTeams();
  }, [user, teamId]);

  // Fetch Channels for Active Team
  useEffect(() => {
    const fetchChannels = async () => {
        if (!teamId) {
            setChannels([]);
            return;
        }

        try {
            const { data, error } = await supabase.functions.invoke('team-operations', {
                body: { action: 'fetch_channels', team_id: teamId }
            });
            if (data) setChannels(data);
        } catch (err) {
            console.error('Error fetching channels:', err);
        }
    };
    fetchChannels();
  }, [teamId]);

  const navItemClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-2 px-4 py-1.5 text-[15px] rounded-md transition-colors mx-2
    ${isActive 
      ? 'bg-app-sidebarActive text-white' 
      : 'text-app-sidebarText hover:bg-app-sidebarHover hover:text-white'
    }
  `;

  return (
    <div className="flex h-full">
        {/* Workspace Rail (Leftmost Strip) */}
        <div className="w-[70px] bg-app-sidebar/80 hidden md:flex flex-col items-center py-4 gap-4 border-r border-white/10 z-20">
            {/* Home / Dashboard */}
            <div 
                onClick={() => navigate('/app')}
                className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 group relative ${!teamId ? 'bg-white border-2 border-white' : 'bg-white/10 hover:bg-white/20'}`}
                title="Home Dashboard"
            >
                 <img src="/logo.png" alt="Home" className="w-8 h-8 object-contain" />
                 {!teamId && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
            </div>

            <div className="w-8 h-[1px] bg-white/10" />

            {/* Teams List */}
            {teams.map(team => {
                const isActive = teamId === team.id;
                return (
                    <div 
                        key={team.id}
                        onClick={() => navigate(`/app/team/${team.id}`)}
                        className={`
                            w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 group relative font-bold text-lg select-none
                            ${isActive 
                                ? 'bg-white text-app-sidebar shadow-lg scale-105 border-2 border-white' 
                                : 'bg-app-sidebarHover text-white/80 hover:bg-white/20 hover:scale-105'
                            }
                        `}
                        title={team.name}
                    >
                        {team.name.charAt(0)}
                        {isActive && <div className="absolute -left-[11px] top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
                    </div>
                );
            })}

            {/* Add Team */}
            <div 
                onClick={() => navigate('/app/team')}
                className="w-12 h-12 rounded-xl bg-transparent border border-white/20 flex items-center justify-center cursor-pointer hover:border-white/50 text-white/50 hover:text-white transition-all"
                title="Add Team"
            >
                <PlusIcon className="w-6 h-6" />
            </div>
        </div>

        {/* Channels Sidebar Panel */}
        <div className="w-full md:w-[260px] bg-app-sidebar flex flex-col h-full border-r border-white/10 flex-shrink-0">
        
        {/* Workspace Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-app-sidebarHover hover:bg-app-sidebarHover cursor-pointer transition-colors shadow-sm">
            <h1 className="text-white font-bold text-lg truncate pr-2">
                {activeTeam ? activeTeam.name : 'SpireTrack'}
            </h1>
            <div className="w-8 h-8 rounded-full bg-white text-app-sidebar flex items-center justify-center font-bold text-xs border-2 border-app-sidebar">
                {user?.email?.charAt(0).toUpperCase()}
            </div>
        </div>

        {/* Quick Navigation / Scroll area */}
        <div className="py-2 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* If in Home Mode (No Team Selected) */}
            {!teamId && (
                <div className="mb-6">
                    <NavLink to="/app" end className={navItemClass}>
                        <HomeIcon className="h-4 w-4" />
                        <span>Home</span>
                    </NavLink>
                    <NavLink to="/app/team" className={navItemClass}>
                        <UserGroupIcon className="h-4 w-4" />
                        <span>All Teams</span>
                    </NavLink>
                </div>
            )}

            {/* Apps Section (Global) */}
            {!teamId && (
                 <div className="mb-4">
                    <div 
                        className="px-4 py-1 flex items-center gap-1 text-app-sidebarText hover:text-white cursor-pointer"
                        onClick={() => setAppsOpen(!appsOpen)}
                    >
                        <ChevronDownIcon className={`h-3 w-3 transition-transform ${!appsOpen ? '-rotate-90' : ''}`} />
                        <span className="text-[13px] font-medium opacity-90">Apps</span>
                    </div>
                
                    {appsOpen && (
                        <div className="mt-1 space-y-0.5">
                        <NavLink to="/app/review" className={navItemClass}>
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                            <span>Reviews</span>
                        </NavLink>
                        <NavLink to="/app/calendar" className={navItemClass}>
                            <CalendarIcon className="h-4 w-4" />
                            <span>Calendar</span>
                        </NavLink>
                        <NavLink to="/app/analytics" className={navItemClass}>
                            <ChartPieIcon className="h-4 w-4" />
                            <span>Analytics</span>
                        </NavLink>
                        <NavLink to="/admin" className={navItemClass}>
                            <ShieldCheckIcon className="h-4 w-4" />
                            <span>Admin</span>
                        </NavLink>
                        </div>
                    )}
                 </div>
            )}

            {/* Channels Section (Only if Team Selected) */}
            {teamId && (
                <div className="mb-4">
                    <NavLink to={`/app/team/${teamId}`} end className={navItemClass}>
                        <ChartPieIcon className="h-4 w-4" />
                        <span>Overview</span>
                    </NavLink>
                
                    <div 
                        className="px-4 py-1 mt-4 flex items-center justify-between text-app-sidebarText hover:text-white cursor-pointer group"
                        onClick={() => setChannelsOpen(!channelsOpen)}
                    >
                        <div className="flex items-center gap-1">
                        <ChevronDownIcon className={`h-3 w-3 transition-transform ${!channelsOpen ? '-rotate-90' : ''}`} />
                        <span className="text-[13px] font-medium opacity-90">Channels</span>
                        </div>
                        <PlusIcon 
                            className="h-4 w-4 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-600/50 rounded" 
                            title="Create Channel"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/app/team/${teamId}/chat`);
                            }}
                        />
                    </div>
                    
                    {channelsOpen && (
                        <div className="mt-1 space-y-0.5">
                             {channels.length === 0 && (
                                <div className="px-6 py-1 text-sm text-app-sidebarText/50 italic">No channels found</div>
                             )}
                             {channels.map(channel => (
                                <NavLink 
                                    key={channel.id} 
                                    to={`/app/team/${teamId}/channel/${channel.id}`}
                                    className={({ isActive }) => `
                                        flex items-center gap-2 px-4 py-1 text-[15px] transition-colors mx-2 rounded
                                        ${isActive 
                                            ? 'bg-app-sidebarActive text-white' 
                                            : 'text-app-sidebarText hover:bg-app-sidebarHover hover:text-white'
                                        }
                                    `}
                                >
                                    {channel.is_private ? <LockClosedIcon className="h-3.5 w-3.5 opacity-70" /> : <HashtagIcon className="h-3.5 w-3.5 opacity-70" />}
                                    <span className="truncate">{channel.name}</span>
                                </NavLink>
                             ))}
                             <div 
                                onClick={() => navigate(`/app/team/${teamId}/chat`)}
                                className="flex items-center gap-2 px-4 py-1 text-[13px] text-app-sidebarText/70 hover:text-white mx-2 mt-2 cursor-pointer"
                             >
                                <div className="w-4 h-4 flex items-center justify-center bg-app-sidebarHover rounded">
                                    <PlusIcon className="h-3 w-3" />
                                </div>
                                <span>Add Channel</span>
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>
        </div>
    </div>
);
};

