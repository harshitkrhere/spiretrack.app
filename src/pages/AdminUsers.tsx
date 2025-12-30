import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui/Avatar';
import { 
    EnvelopeIcon, 
    CalendarIcon,
    UserGroupIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface User {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    teamCount: number;
}

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Get current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                console.error('[AdminUsers] No user logged in');
                setLoading(false);
                return;
            }



            // Get teams where current user has ADMIN permissions (not just membership)
            // Check direct admin role
            const { data: adminTeams, error: adminError } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', currentUser.id)
                .eq('role', 'admin');

            // Also check custom roles with admin permissions
            const { data: customAdminRoles, error: customRolesError } = await supabase
                .from('team_member_roles')
                .select('team_id, team_roles!inner(is_admin)')
                .eq('user_id', currentUser.id)
                .eq('team_roles.is_admin', true);

            // Combine both sources
            const allAdminTeamIds = new Set<string>();
            adminTeams?.forEach(t => allAdminTeamIds.add(t.team_id));
            customAdminRoles?.forEach(r => allAdminTeamIds.add(r.team_id));

            const myTeamIds = Array.from(allAdminTeamIds);



            if (myTeamIds.length === 0) {
                // User is not an admin of any teams
                setUsers([]);
                setLoading(false);
                return;
            }

            // Get all users who are members of these admin-managed teams
            // DO NOT filter by status - same RLS issue
            const { data: teamMembersData, error: membersError } = await supabase
                .from('team_members')
                .select('user_id')
                .in('team_id', myTeamIds);



            if (membersError) throw membersError;

            // Get unique user IDs
            const uniqueUserIds = [...new Set(teamMembersData?.map(m => m.user_id) || [])];


            if (uniqueUserIds.length === 0) {
                setUsers([]);
                setLoading(false);
                return;
            }

            // Get user details for these users
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, email, full_name, avatar_url, created_at')
                .in('id', uniqueUserIds)
                .order('created_at', { ascending: false });



            if (usersError) throw usersError;

            // Get team counts and review counts for each user
            const usersWithData: User[] = [];
            
            for (const user of usersData || []) {
                // Count team memberships (no status filter - just count all memberships)
                const { count: teamCount } = await supabase
                    .from('team_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                usersWithData.push({
                    ...user,
                    last_sign_in_at: null, // Not accessible from client
                    teamCount: teamCount || 0,
                });
            }

            setUsers(usersWithData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.email.toLowerCase().includes(query) ||
            (user.full_name?.toLowerCase().includes(query) || false)
        );
    });

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12" />
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                <p className="text-sm text-slate-500 mt-1">View all registered users and their activity</p>
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-slate-500">Total Users</div>
                    <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-slate-500">Users with Teams</div>
                    <div className="text-2xl font-bold text-slate-900">
                        {users.filter(u => u.teamCount > 0).length}
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-slate-500">Active Contributors</div>
                    <div className="text-2xl font-bold text-slate-900">
                        {users.filter(u => u.teamCount > 0).length}
                    </div>
                </Card>
            </div>

            {/* User List */}
            <Card className="overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Teams
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar 
                                                src={user.avatar_url} 
                                                name={user.full_name || user.email}
                                                size="md"
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">
                                                    {user.full_name || 'No name'}
                                                </div>
                                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                                    <EnvelopeIcon className="h-3.5 w-3.5" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <CalendarIcon className="h-4 w-4" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <UserGroupIcon className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-900">
                                                {user.teamCount}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
