import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { MemberCard } from './MemberCard';

interface Role {
  id: string;
  name: string;
  color: string;
  icon?: string;
  position: number;
  is_admin: boolean;
}

interface Member {
  user_id: string;
  email: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away' | 'banned';
  last_active_at: string;
  roles: Role[];
}

interface RoleGroupSectionProps {
  role: Role;
  members: Member[];
  onMemberClick?: (member: Member) => void;
  isAdmin?: boolean;
  onKick?: (member: Member) => void;
  onBan?: (member: Member) => void;
  onUnban?: (member: Member) => void;
  onAssignRole?: (member: Member) => void;
}

export const RoleGroupSection: React.FC<RoleGroupSectionProps> = ({ 
  role, 
  members, 
  onMemberClick, 
  isAdmin,
  onKick,
  onBan,
  onUnban,
  onAssignRole
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDownIcon className="h-4 w-4 text-slate-600" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-slate-600" />
        )}
        
        <span className="text-lg">{role.icon}</span>
        
        <span 
          className="font-semibold text-sm uppercase tracking-wide"
          style={{ color: role.color }}
        >
          {role.name}
        </span>
        
        <span className="text-xs text-slate-500">
          ({members.length})
        </span>
      </button>

      {/* Members */}
      {isExpanded && (
        <div className="mt-2 space-y-2 pl-6">
          {members.map(member => (
            <MemberCard 
              key={member.user_id} 
              member={member} 
              onClick={() => onMemberClick?.(member)}
              isAdmin={isAdmin}
              onKick={onKick}
              onBan={onBan}
              onUnban={onUnban}
              onAssignRole={onAssignRole}
            />
          ))}
        </div>
      )}
    </div>
  );
};
