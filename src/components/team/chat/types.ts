// ========================================
// CORE TYPES
// ========================================

export interface Attachment {
  url: string;
  type: 'image' | 'video' | 'file';
  name: string;
  size: number;
}

export interface Channel {
  id: string;
  team_id: string;
  name: string;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  unread_count?: number; // UI state
}

export interface MessageUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// ========================================
// MESSAGE TYPES
// ========================================

export interface Message {
  id: string;
  team_id: string;
  channel_id: string;
  user_id: string | null; // null for system messages
  content: string;
  attachments: Attachment[];
  mentions: string[];
  created_at: string;
  updated_at: string;
  
  // Threading
  parent_message_id: string | null;
  thread_reply_count: number;
  last_thread_reply_at: string | null;
  thread_participants?: MessageUser[]; // Up to 3 users who replied
  
  // System messages
  is_system_message: boolean;
  system_event_type: string | null;
  system_event_data: Record<string, any> | null;
  
  // Editing
  edited_at: string | null;
  
  // Relations (populated on fetch)
  user?: MessageUser;
  reactions?: MessageReaction[];
  is_pinned?: boolean;
}

// ========================================
// REACTION TYPES
// ========================================

export type ReactionType = 'acknowledge' | 'seen' | 'completed' | 'important';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
  user?: MessageUser; // Populated for UI
}

export interface ReactionGroup {
  type: ReactionType;
  count: number;
  users: MessageUser[];
  has_current_user: boolean;
}

// ========================================
// PINNED MESSAGES
// ========================================

export interface PinnedMessage {
  id: string;
  message_id: string;
  channel_id: string;
  team_id: string;
  pinned_by: string;
  pinned_at: string;
  message?: Message; // Populated on fetch
}

// ========================================
// SYSTEM MESSAGE TYPES
// ========================================

export type SystemEventType = 
  | 'report_submitted'
  | 'report_generated'
  | 'form_updated'
  | 'member_joined'
  | 'member_left'
  | 'channel_created'
  | 'settings_updated';

export interface SystemEventData {
  user_name?: string;
  report_week?: string;
  form_name?: string;
  setting_name?: string;
  [key: string]: any;
}

// ========================================
// SEARCH TYPES
// ========================================

export interface SearchFilters {
  channel_ids?: string[];
  user_ids?: string[];
  date_from?: string;
  date_to?: string;
  include_threads?: boolean;
  include_system?: boolean;
}

export interface SearchResult {
  results: Message[];
  query: string;
  has_more: boolean;
}

// ========================================
// THREAD TYPES
// ========================================

export interface ThreadData {
  parent: Message;
  replies: Message[];
  has_more: boolean;
}

// ========================================
// CHANNEL TABS TYPES (Phase 1.5)
// ========================================

export type ChannelTabType = 'messages' | 'overview' | 'tasks' | 'files' | 'reports' | 'execution' | 'decisions' | 'announcements';

export interface ChannelTab {
  id: string;
  channel_id: string;
  team_id: string;
  type: ChannelTabType;
  label?: string; // Custom label override
  position: number;
  is_default: boolean;
  is_removable: boolean;
  created_by: string | null;
  created_at: string;
}

export interface ChannelTabContent {
  id: string;
  tab_id: string;
  content: OverviewContent;
  updated_at: string;
  updated_by: string | null;
}

export interface OverviewContent {
  purpose: string;
  goals: string[];
  owners: string[]; // user IDs
  links: { label: string; url: string }[];
  status: 'active' | 'on_hold' | 'completed' | 'archived';
}

// ========================================
// CHANNEL TASKS TYPES
// ========================================

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ChannelTask {
  id: string;
  channel_id: string;
  team_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  owner_id: string | null; // Phase 3.2: Explicit ownership
  due_date: string | null;
  linked_message_id: string | null;
  linked_report_id: string | null; // Phase 3.2: Task traceability
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations (populated on fetch)
  assignee?: MessageUser;
  creator?: MessageUser;
  owner?: MessageUser; // Phase 3.2
}

// ========================================
// CHANNEL DECISIONS TYPES (Phase 3.2)
// ========================================

export interface ChannelDecision {
  id: string;
  channel_id: string;
  team_id: string;
  title: string;
  description?: string;
  decided_by: string;
  decided_at: string;
  related_entities: RelatedEntity[];
  created_at: string;
  // Relations (populated on fetch)
  decider?: MessageUser;
}

export interface RelatedEntity {
  type: 'task' | 'message' | 'report';
  id: string;
  label?: string;
}

// ========================================
// CHANNEL ANNOUNCEMENTS TYPES (Phase 3.2)
// ========================================

export interface ChannelAnnouncement {
  id: string;
  channel_id: string;
  team_id: string;
  title: string;
  body: string;
  created_by: string;
  created_at: string;
  // Relations (populated on fetch)
  creator?: MessageUser;
  // UI state
  is_read?: boolean;
  read_count?: number;
  total_members?: number;
}

// ========================================
// CHANNEL FILES TYPES
// ========================================

export interface ChannelFile {
  id: string;
  channel_id: string;
  team_id: string;
  name: string;
  url: string;
  file_type?: string;
  size_bytes?: number;
  is_pinned: boolean;
  is_external_link: boolean;
  version: number;
  description?: string;
  uploaded_by: string;
  uploaded_at: string;
  // Relations (populated on fetch)
  uploader?: MessageUser;
}

// Default tab configuration for new channels
export const DEFAULT_CHANNEL_TABS: Omit<ChannelTab, 'id' | 'channel_id' | 'team_id' | 'created_by' | 'created_at'>[] = [
  { type: 'messages', position: 0, is_default: true, is_removable: false },
  { type: 'overview', position: 1, is_default: false, is_removable: true },
  { type: 'tasks', position: 2, is_default: false, is_removable: true },
  { type: 'files', position: 3, is_default: false, is_removable: true },
  { type: 'reports', position: 4, is_default: false, is_removable: true },
  { type: 'execution', position: 5, is_default: false, is_removable: true },
  { type: 'decisions', position: 6, is_default: false, is_removable: true },
  { type: 'announcements', position: 7, is_default: false, is_removable: true },
];

// Tab display configuration
export const TAB_CONFIG: Record<ChannelTabType, { label: string; icon: string }> = {
  messages: { label: 'Messages', icon: 'ChatBubbleLeftRightIcon' },
  overview: { label: 'Overview', icon: 'DocumentTextIcon' },
  tasks: { label: 'Tasks', icon: 'ClipboardDocumentListIcon' },
  files: { label: 'Files', icon: 'FolderIcon' },
  reports: { label: 'Reports', icon: 'ChartBarIcon' },
  execution: { label: 'Execution', icon: 'BriefcaseIcon' },
  decisions: { label: 'Decisions', icon: 'ScaleIcon' },
  announcements: { label: 'Announcements', icon: 'MegaphoneIcon' },
};
