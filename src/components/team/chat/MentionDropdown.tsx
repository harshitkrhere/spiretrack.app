import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { Avatar } from '../../ui/Avatar';

interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

interface MentionDropdownProps {
  teamId: string;
  searchQuery: string;
  isOpen: boolean;
  onSelect: (username: string) => void;
  onClose: () => void;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  teamId,
  searchQuery,
  isOpen,
  onSelect,
  onClose,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch team members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamId) return;

      try {
        setLoading(true);

        // Use the same endpoint as MembersSidebar for consistency
        const { data, error } = await supabase.functions.invoke('team-operations', {
          body: {
            action: 'get_team_members',
            team_id: teamId
          }
        });

        if (error) throw error;

        const activeMembers = data?.active_members || [];

        const memberList: TeamMember[] = activeMembers.map((m: any) => ({
          id: m.user_id,
          email: m.email,
          full_name: m.full_name,
          avatar_url: m.avatar_url,
          // Use username if available, otherwise generate from email
          username: m.username || m.email?.split('@')[0] || 'user',
        }));

        // Add SpireAI as a special mention at the beginning
        memberList.unshift({
          id: 'spireai',
          email: 'ai@spire.track',
          full_name: 'SpireAI',
          avatar_url: undefined,
          username: 'spireai',
        });

        setMembers(memberList);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [teamId, isOpen]);

  // Filter members based on search query
  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.username?.toLowerCase().includes(query) ||
      member.full_name?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  });

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredMembers.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredMembers[selectedIndex]) {
            onSelect(filteredMembers[selectedIndex].username || '');
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredMembers, selectedIndex, onSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full left-0 mb-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Members
        </span>
      </div>

      {/* Member List */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            Loading members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-400 text-center">
            No members found
          </div>
        ) : (
          filteredMembers.map((member, index) => (
            <button
              key={member.id}
              onClick={() => onSelect(member.username || '')}
              className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors ${index === selectedIndex
                  ? 'bg-teal-50'
                  : 'hover:bg-gray-50'
                }`}
            >
              {/* Avatar */}
              {member.id === 'spireai' ? (
                <img
                  src="/spire-ai-logo.png"
                  alt="SpireAI"
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <Avatar
                  src={member.avatar_url}
                  name={member.full_name}
                  email={member.email}
                  size="sm"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {member.full_name || member.email}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  @{member.username}
                </div>
              </div>

              {/* SpireAI badge */}
              {member.id === 'spireai' && (
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-semibold rounded-full">
                  AI
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
        <span>↑↓ to navigate</span>
        <span>↵ to select</span>
        <span>esc to close</span>
      </div>
    </div>
  );
};
