import React, { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface UserProfileDropdownProps {
  variant?: 'light' | 'dark';
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ variant = 'light' }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  const colors = variant === 'light' ? {
    bg: 'transparent',
    hover: '#EFEEE9',
    text: '#1A1A1A',
    textMuted: '#6B7280',
    accent: '#1F8A4C',
  } : {
    bg: 'transparent',
    hover: '#3A4F63',
    text: '#FFFFFF',
    textMuted: '#B8C5D0',
    accent: '#00A884',
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('full_name, avatar_url')
      .eq('id', user!.id)
      .single();
    
    if (data) setProfile(data);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!user) return null;

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'User';
  const email = user.email || '';

  return (
    <Menu as="div" className="relative w-full">
      <div>
        <Menu.Button 
          className="group flex items-center gap-3 w-full p-2 rounded-lg transition-all duration-200 focus:outline-none"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.bg}
        >
          {/* Avatar */}
          <div 
            className="h-9 w-9 rounded-full flex items-center justify-center font-semibold text-white overflow-hidden flex-shrink-0"
            style={{ backgroundColor: colors.accent }}
          >
            {profile?.avatar_url || user.user_metadata?.avatar_url ? (
              <img 
                src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                alt="" 
                className="h-full w-full object-cover" 
              />
            ) : (
              <span className="text-sm">{getInitials(displayName)}</span>
            )}
          </div>
          
          {/* Name & Email */}
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
              {displayName}
            </p>
            <p className="text-xs truncate" style={{ color: colors.textMuted }}>
              {email}
            </p>
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute bottom-full left-0 mb-2 w-full origin-bottom-left divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/app/profile"
                  className="group flex w-full items-center rounded-md px-3 py-2 text-sm"
                  style={{
                    backgroundColor: active ? '#E8F5E9' : 'transparent',
                    color: active ? '#1F8A4C' : '#374151'
                  }}
                >
                  <UserCircleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Your Profile
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/app/settings"
                  className="group flex w-full items-center rounded-md px-3 py-2 text-sm"
                  style={{
                    backgroundColor: active ? '#E8F5E9' : 'transparent',
                    color: active ? '#1F8A4C' : '#374151'
                  }}
                >
                  <Cog6ToothIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Settings
                </Link>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className="group flex w-full items-center rounded-md px-3 py-2 text-sm"
                  style={{
                    backgroundColor: active ? '#FEE2E2' : 'transparent',
                    color: active ? '#DC2626' : '#374151'
                  }}
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
