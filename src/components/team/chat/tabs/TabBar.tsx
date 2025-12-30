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

const TAB_ICONS: Record<ChannelTabType, React.FC<{ className?: string }>> = {
  messages: ChatBubbleLeftRightIcon,
  overview: DocumentTextIcon,
  tasks: ClipboardDocumentListIcon,
  files: FolderIcon,
  reports: ChartBarIcon,
  execution: BriefcaseIcon,
  decisions: ScaleIcon,
  announcements: MegaphoneIcon,
};

const TAB_LABELS: Record<ChannelTabType, string> = {
  messages: 'Messages',
  overview: 'Overview',
  tasks: 'Tasks',
  files: 'Files',
  reports: 'Reports',
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
  const ADMIN_ONLY_TABS: ChannelTabType[] = ['reports'];
  const sortedTabs = [...tabs]
    .filter((tab) => TAB_ICONS[tab.type] !== undefined)
    .filter((tab) => !ADMIN_ONLY_TABS.includes(tab.type) || isAdmin)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-white overflow-x-auto scrollbar-hide">
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
              "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all relative",
              "hover:bg-slate-50",
              isActive
                ? "text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        );
      })}

      {/* Add Tab Button (admin only, placeholder for extensibility) */}
      {isAdmin && onAddTab && (
        <button
          onClick={onAddTab}
          className="flex items-center justify-center w-8 h-8 ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
          title="Add tab"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
