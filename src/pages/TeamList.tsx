import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TeamCreateJoin } from '../components/team/TeamCreateJoin';
import { Button } from '../components/ui/Button';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';
import { LoadingScreen } from '../components/ui/LoadingScreen';

interface TeamMembership {
  team_id: string;
  role: 'admin' | 'member';
  team_name: string;
  team_description: string;
}

export const TeamList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateJoin, setShowCreateJoin] = useState(false);

  useEffect(() => {
    if (user) fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      const { data: memberships, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user?.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setTeams([]);
        return;
      }

      const teamIds = memberships.map(m => m.team_id);
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, description')
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      const combined = memberships.map(m => {
        const team = teamsData?.find(t => t.id === m.team_id);
        return {
          team_id: m.team_id,
          role: m.role,
          team_name: team?.name || 'Unknown Team',
          team_description: team?.description || ''
        };
      });

      setTeams(combined);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchTeams();
    } catch (err) {
      console.error('Error leaving team:', err);
      alert('Failed to leave team');
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to DELETE the entire team "${teamName}"? This will remove all members and cannot be undone!`)) return;

    try {
      const { error } = await supabase.functions.invoke('team-operations', {
        body: { action: 'delete_team', team_id: teamId }
      });

      if (error) throw error;
      await fetchTeams();
      alert('Team deleted successfully!');
    } catch (err) {
      console.error('Error deleting team:', err);
      alert('Failed to delete team');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading teams" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Global Background Blobs - Subtle */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-slate-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Welcome to Your Team
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage your teams and collaborate effectively.
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateJoin(true)} 
            className="bg-[#FF6B4A] hover:bg-[#E85A3A] text-white rounded-full px-8 py-3 shadow-lg transform transition-all hover:-translate-y-0.5"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Team
          </Button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-xl max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <PlusIcon className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No teams yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
              Get started by creating a new team or joining an existing one with an invite code.
            </p>
            <Button 
              onClick={() => setShowCreateJoin(true)}
              className="bg-[#FF6B4A] hover:bg-[#E85A3A] text-white rounded-full px-8 py-3 shadow-lg"
            >
              Create or Join Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {teams.map((team) => (
              <div key={team.team_id} className="relative group">
                {/* The "Orange in Grey Behind" Blob Effect */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-orange-200/60 to-slate-200/0 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                
                {/* Static Orange Blob for the "Orange in Grey" look */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-orange-100/40 via-transparent to-blue-100/40 rounded-[3rem] blur-2xl -z-10 opacity-60"></div>

                <div 
                  className="relative h-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/80 via-blue-50/30 to-white/60 backdrop-blur-2xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 p-8 flex flex-col"
                  onClick={() => navigate(`/app/team/${team.team_id}`)}
                >
                  <div className="flex justify-between items-start mb-6">
                    {/* Icon */}
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl font-bold text-slate-800">
                      <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-purple-600">
                        {team.team_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Role Badge */}
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm backdrop-blur-md",
                      team.role === 'admin' 
                        ? "bg-purple-100/80 text-purple-600" 
                        : "bg-slate-100/80 text-slate-600"
                    )}>
                      {team.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                    {team.team_name}
                  </h3>
                  <p className="text-slate-500 mb-8 line-clamp-2 flex-grow">
                    {team.team_description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/team/${team.team_id}`);
                      }}
                      className="bg-[#FF6B4A] hover:bg-[#E85A3A] text-white font-medium px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center"
                    >
                      View Dashboard <span className="ml-2">→</span>
                    </button>
                    
                    <div onClick={(e) => e.stopPropagation()}>
                      {team.role === 'admin' ? (
                         <button 
                           onClick={() => handleDeleteTeam(team.team_id, team.team_name)}
                           className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                           title="Delete Team"
                         >
                           <TrashIcon className="h-5 w-5" />
                         </button>
                      ) : (
                        <button 
                           onClick={() => handleLeaveTeam(team.team_id)}
                           className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                           title="Leave Team"
                         >
                           <TrashIcon className="h-5 w-5" />
                         </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateJoin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
                   <button 
                      onClick={() => setShowCreateJoin(false)}
                      className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                   >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                   </button>
                   <h2 className="text-2xl font-bold text-slate-900 mb-6">Create or Join Team</h2>
                   <TeamCreateJoin onTeamJoined={() => {
                      setShowCreateJoin(false);
                      fetchTeams();
                   }} />
               </div>
            </div>
        )}
      </div>
    </div>
  );
};
