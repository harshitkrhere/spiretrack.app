import React from 'react';
import { RoleBadge } from './RoleBadge';
import { Avatar } from '../ui/Avatar';

interface Member {
  user_id: string;
  email: string;
  username?: string; // Add username
  full_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away' | 'banned';
  last_active_at: string;
  roles: Array<{
    id: string;
    name: string;
    color: string;
    icon?: string;
    position: number;
    is_admin: boolean;
  }>;
}



interface MemberCardProps {
  member: Member;
  onClick?: () => void;
  isAdmin?: boolean;
}

import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, UserMinusIcon, NoSymbolIcon, ArrowPathIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

interface MemberCardProps {
  member: Member;
  onClick?: () => void;
  isAdmin?: boolean;
  onKick?: (member: Member) => void;
  onBan?: (member: Member) => void;
  onUnban?: (member: Member) => void;
  onAssignRole?: (member: Member) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ 
  member, 
  onClick, 
  isAdmin,
  onKick,
  onBan,
  onUnban,
  onAssignRole
}) => {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-slate-400',
    away: 'bg-yellow-500',
    banned: 'bg-red-600'
  };

  const getLastActive = (timestamp: string) => {
    if (member.status === 'banned') return 'Banned';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const isBanned = member.status === 'banned';

  return (
    <div 
      className={`bg-white rounded-lg p-4 border ${isBanned ? 'border-red-200 bg-red-50' : 'border-slate-200'} hover:shadow-sm transition-all flex items-center justify-between`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0" onClick={onClick}>
        {/* Avatar with automatic fallback */}
        <Avatar
          src={member.avatar_url}
          name={member.full_name}
          email={member.email}
          size="md"
          status={member.status}
          showStatus={true}
          className={isBanned ? 'opacity-75 grayscale' : ''}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`font-medium truncate ${isBanned ? 'text-red-700' : 'text-slate-900'}`}>
              {member.full_name || member.username || member.email}
            </div>
            {isBanned && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wide">
                Banned
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {isBanned ? (member as any).ban_reason || 'No reason provided' : `@${member.username || 'user'} • ${getLastActive(member.last_active_at)}`}
          </div>
          
          {/* Roles */}
          {!isBanned && member.roles.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {member.roles.map(role => (
                <RoleBadge key={role.id} role={role} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions Dropdown */}
      {isAdmin && (
        <Menu as="div" className="relative ml-4">
          <Menu.Button className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                {isBanned ? (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onUnban?.(member)}
                        className={`${active ? 'bg-slate-50' : ''} group flex w-full items-center px-4 py-2 text-sm text-slate-700`}
                      >
                        <ArrowPathIcon className="mr-3 h-4 w-4 text-slate-400" />
                        Unban Member
                      </button>
                    )}
                  </Menu.Item>
                ) : (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onAssignRole?.(member)}
                          className={`${active ? 'bg-slate-50' : ''} group flex w-full items-center px-4 py-2 text-sm text-slate-700`}
                        >
                          <IdentificationIcon className="mr-3 h-4 w-4 text-slate-400" />
                          Manage Roles
                        </button>
                      )}
                    </Menu.Item>
                    <div className="border-t border-slate-100 my-1"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onKick?.(member)}
                          className={`${active ? 'bg-red-50' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600`}
                        >
                          <UserMinusIcon className="mr-3 h-4 w-4 text-red-400" />
                          Kick Member
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => onBan?.(member)}
                          className={`${active ? 'bg-red-50' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-700 font-medium`}
                        >
                          <NoSymbolIcon className="mr-3 h-4 w-4 text-red-500" />
                          Ban Member
                        </button>
                      )}
                    </Menu.Item>
                  </>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </div>
  );
};
