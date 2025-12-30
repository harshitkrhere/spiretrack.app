import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { PencilIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';

import { UsernameInput } from '../components/auth/UsernameInput';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [updatingUsername, setUpdatingUsername] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users') // Or 'profiles' depending on your setup
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setNewUsername(data.username || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!isUsernameValid) return;
    setUpdatingUsername(true);
    try {
        const { error } = await supabase.functions.invoke('user-profile-operations', {
            body: { 
                action: 'update_username', 
                username: newUsername 
            }
        });

        if (error) throw error;
        
        setProfile({ ...profile, username: newUsername });
        setIsEditingUsername(false);
        alert('Username updated successfully!');
    } catch (err: any) {
        console.error('Error updating username:', err);
        alert(err.message || 'Failed to update username');
    } finally {
        setUpdatingUsername(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <img 
                    src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                    alt={user?.email} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-500">
                    {getInitials(user?.email || '')}
                  </div>
                )}
              </div>
            </div>
            <Link to="/app/settings">
              <Button variant="secondary" size="sm">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Unnamed User'}
              </h2>
              
              {/* Username Section */}
              <div className="mt-1 flex items-center gap-2">
                {!isEditingUsername ? (
                    <>
                        <p className="text-slate-500 font-medium">@{profile?.username || 'user'}</p>
                        <button 
                            onClick={() => setIsEditingUsername(true)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Change
                        </button>
                    </>
                ) : (
                    <div className="flex items-start gap-2 max-w-sm mt-2">
                        <div className="flex-1">
                            <UsernameInput 
                                value={newUsername}
                                onChange={setNewUsername}
                                onValidityChange={setIsUsernameValid}
                                currentUsername={profile?.username}
                            />
                        </div>
                        <div className="flex gap-1 mt-7">
                            <Button 
                                size="sm" 
                                onClick={handleUpdateUsername}
                                isLoading={updatingUsername}
                                disabled={!isUsernameValid}
                            >
                                Save
                            </Button>
                            <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => {
                                    setIsEditingUsername(false);
                                    setNewUsername(profile?.username || '');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
              </div>

              <p className="text-slate-500 mt-1">{user?.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center text-slate-600">
                <EnvelopeIcon className="h-5 w-5 mr-3 text-slate-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <CalendarIcon className="h-5 w-5 mr-3 text-slate-400" />
                <span>Joined {new Date(user?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
