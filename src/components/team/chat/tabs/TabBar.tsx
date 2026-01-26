import React from 'react';
import type { ChannelTab, ChannelTabType } from '../types';
import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon,
  FolderIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ScaleIcon,
  MegaphoneIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../../../lib/utils';

interface TabBarProps {
  tabs: ChannelTab[];
  activeTab: ChannelTabType;
  onTabChange: (tab: ChannelTabType) => void;
  isAdmin?: boolean;
  onAddTab?: () => void;
}

const TAB_ICONS: Record<string, React.FC<{ className?: string }>> = {
  messages: ChatBubbleLeftRightIcon,
  overview: DocumentTextIcon,
  tasks: ClipboardDocumentListIcon,
  files: FolderIcon,
  execution: BriefcaseIcon,
  decisions: ScaleIcon,
  announcements: MegaphoneIcon,
};

const TAB_LABELS: Record<string, string> = {
  messages: 'Messages',
  overview: 'Overview',
  tasks: 'Tasks',
  files: 'Files',
  execution: 'Execution',
  decisions: 'Decisions',
  announcements: 'Announcements',
};

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  isAdmin = false,
  onAddTab,
}) => {
  // Sort tabs by position and filter out unknown tab types (e.g. 'activity' was removed)
  // Also filter out admin-only tabs (reports) for non-admins - decisions are viewable by all
  const sortedTabs = [...tabs]
    .filter((tab) => TAB_ICONS[tab.type] !== undefined)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="flex items-center gap-1 px-6 border-b border-gray-100 bg-white overflow-x-auto scrollbar-hide">
      {sortedTabs.map((tab) => {
        const Icon = TAB_ICONS[tab.type];
        const label = tab.label || TAB_LABELS[tab.type];
        const isActive = activeTab === tab.type;
        
        if (!Icon) return null; // Extra safeguard

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.type)}
            className={cn(
              "flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap transition-all relative",
              "hover:bg-gray-50",
              isActive
                ? "text-gray-900 font-medium"
                : "text-gray-400 hover:text-gray-600 font-normal"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gray-900 rounded-full" />
            )}
          </button>
        );
      })}

      {/* Add Tab Button (admin only, placeholder for extensibility) */}
      {isAdmin && onAddTab && (
        <button
          onClick={onAddTab}
          className="flex items-center justify-center w-8 h-8 ml-2 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
          title="Add tab"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
