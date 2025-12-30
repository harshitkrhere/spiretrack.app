import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CustomFormRenderer } from '../components/team/CustomFormRenderer';

export const TeamReviewPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamName, setTeamName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) {
        navigate('/app/team');
        return;
      }

      try {
        // Verify user is a member
        const { error: memberError } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', user?.id)
          .single();

        if (memberError) {
          navigate('/app/team');
          return;
        }

        // Get team name
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('name')
          .eq('id', teamId)
          .single();

        if (teamError) throw teamError;
        setTeamName(team.name);
      } catch (err) {
        console.error('Error:', err);
        navigate('/app/team');
      } finally {
        setLoading(false);
      }
    };

    if (user && teamId) fetchTeam();
  }, [user, teamId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!teamId || !teamName) return null;

  return <CustomFormRenderer teamId={teamId} teamName={teamName} />;
};
