import React, { useState } from 'react';
import type { Message, ReactionType, ReactionGroup } from './types';
import { SystemMessage } from './SystemMessage';
import { ReactionBar } from './ReactionBar';
import { 
  ChatBubbleLeftRightIcon, 
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../../lib/utils';
import { Avatar } from '../../ui/Avatar';
import { renderMentions } from './utils/mentionUtils';

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  isAdmin: boolean;
  senderIsAdmin?: boolean; // Whether the message SENDER is an admin
  onReply: (messageId: string) => void;
  onReactionToggle: (messageId: string, reactionType: ReactionType) => void;
  onPin?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  isInThread?: boolean;
  showThreadButton?: boolean;
  isGrouped?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  isAdmin,
  senderIsAdmin = false,
  onReply,
  onReactionToggle,
  onPin,
  onEdit,
  onDelete,
  isInThread = false,
  showThreadButton = true,
  isGrouped = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // System messages use different component
  if (message.is_system_message) {
    return <SystemMessage message={message} />;
  }

  const isOwnMessage = message.user_id === currentUserId;
  const canEdit = isOwnMessage && !message.is_system_message && isWithinEditWindow(message.created_at);
  const canDelete = isOwnMessage && !message.is_system_message;
  const canPin = isAdmin && !isInThread;

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // Group reactions by type
  const reactionGroups: ReactionGroup[] = message.reactions
    ? Object.values(
        message.reactions.reduce((acc, reaction) => {
          if (!acc[reaction.reaction_type]) {
            acc[reaction.reaction_type] = {
              type: reaction.reaction_type,
              count: 0,
              users: [],
              has_current_user: false,
            };
          }
          acc[reaction.reaction_type].count++;
          if (reaction.user) {
            acc[reaction.reaction_type].users.push(reaction.user);
          }
          if (reaction.user_id === currentUserId) {
            acc[reaction.reaction_type].has_current_user = true;
          }
          return acc;
        }, {} as Record<ReactionType, ReactionGroup>)
      )
    : [];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  // Subtle highlight for admin @team messages only
  // Must be: sender is admin + contains @team + not in thread + not a reply
  const isAdminTeamMention = 
    senderIsAdmin && 
    message.content.toLowerCase().includes('@team') && 
    !isInThread && 
    !message.parent_message_id;

  return (
    <div
      className={cn(
        "group px-6 hover:bg-slate-50/50 transition-colors relative",
        isGrouped ? "py-0.5" : "py-2",
        isInThread && "py-1",
        // Subtle left border for admin @team messages - green accent
        isAdminTeamMention && "border-l-[3px] border-l-emerald-500 bg-emerald-50/40"
      )}
      id={`message-${message.id}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Avatar - Hidden if grouped */}
        {!isGrouped && (
          <div className="flex-shrink-0 mt-0.5">
            <Avatar
              src={message.user?.avatar_url}
              name={message.user?.full_name}
              email={message.user?.email}
              size="sm"
              className="rounded-md"
            />
          </div>
        )}
        
        {/* Spacer when grouped to maintain alignment */}
        {isGrouped && <div className="w-9 flex-shrink-0" />}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-slate-900 text-[15px]">
                {message.user?.full_name || 'Unknown User'}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {formatTime(message.created_at)}
              </span>
              {message.edited_at && (
                <span className="text-[10px] text-slate-400 italic">(edited)</span>
              )}
              {message.is_pinned && (
                <MapPinIcon className="w-3 h-3 text-amber-500 rotate-45" />
              )}
            </div>
          )}

          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-[15px] min-h-[60px] bg-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSave();
                  } else if (e.key === 'Escape') {
                    handleEditCancel();
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={handleEditCancel}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEditSave}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-800 text-[15px] leading-normal whitespace-pre-wrap break-words">
              {renderMentions(message.content)}
            </div>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 max-w-md">
              {message.attachments.map((att, i) => (
                <div key={i} className="relative group/att rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  {att.type === 'image' ? (
                    <>
                      {/* Clickable Image */}
                      <button
                        onClick={() => setLightboxImage({ url: att.url, name: att.name })}
                        className="w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <img 
                          src={att.url} 
                          alt={att.name} 
                          className="w-full h-32 object-cover transition-transform group-hover/att:scale-105" 
                        />
                      </button>
                      {/* Hover Overlay with Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover/att:pointer-events-auto">
                        <button
                          onClick={() => setLightboxImage({ url: att.url, name: att.name })}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                          title="View full size"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </button>
                        <a
                          href={att.url}
                          download={att.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                          title="Download"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </>
                  ) : (
                    /* File Attachment with Download Button */
                    <div className="p-3 bg-slate-50 flex items-center gap-2 group-hover/att:bg-slate-100 transition-colors">
                      <span className="text-xl">📄</span>
                      <span className="text-sm truncate flex-1 font-medium text-slate-700">{att.name}</span>
                      <a
                        href={att.url}
                        download={att.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-full transition-colors"
                        title="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Reaction Bar */}
          {reactionGroups.length > 0 && (
            <div className="mt-1.5">
              <ReactionBar 
                messageId={message.id}
                reactionGroups={reactionGroups}
                currentUserId={currentUserId}
                onReactionToggle={onReactionToggle}
              />
            </div>
          )}

          {/* Thread Button */}
          {message.thread_reply_count > 0 && showThreadButton && (
            <div className="mt-1.5">
              <button 
                onClick={() => onReply(message.id)}
                className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded-sm shadow-sm hover:bg-slate-50 transition-colors group/thread"
              >
                <div className="flex -space-x-1.5">
                  {message.thread_participants && message.thread_participants.length > 0 ? (
                    message.thread_participants.slice(0, 3).map((participant, idx) => (
                      <Avatar
                        key={participant.id || idx}
                        src={participant.avatar_url}
                        name={participant.full_name}
                        email={participant.email}
                        size="xs"
                        className="ring-2 ring-white w-5 h-5 text-[9px]"
                      />
                    ))
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-200"></div>
                      <div className="w-5 h-5 rounded-full ring-2 ring-white bg-slate-300"></div>
                    </>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover/thread:text-slate-900">
                  {message.thread_reply_count} replies
                </span>
                <span className="text-[10px] text-slate-400">
                  Last: {formatTime(message.last_thread_reply_at!)}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons (visible on hover) */}
        {!isEditing && (
          <div className={cn(
            "absolute right-4 top-1 flex items-center bg-white shadow-sm border border-slate-200 rounded-sm p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10",
            showActions && "opacity-100"
          )}>
            <button 
              onClick={() => onReactionToggle(message.id, 'acknowledge')}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-sm transition-colors"
              title="Like"
            >
              👍
            </button>
            <button 
              onClick={() => onReply(message.id)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
              title="Reply"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
            </button>
            {(canEdit || canPin || canDelete) && (
              <>
                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                {canEdit && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-sm transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                )}
                {canPin && (
                  <button 
                    onClick={() => onPin?.(message.id)}
                    className={cn(
                      "p-1.5 rounded-sm transition-colors",
                      message.is_pinned 
                        ? "text-amber-600 bg-amber-50" 
                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    )}
                    title={message.is_pinned ? "Unpin" : "Pin"}
                  >
                    <MapPinIcon className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this message?')) {
                        onDelete?.(message.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightboxImage(null)}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
            title="Close (Esc)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Download Button */}
          <a
            href={lightboxImage.url}
            download={lightboxImage.name}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          
          {/* Image */}
          <img
            src={lightboxImage.url}
            alt={lightboxImage.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Image Name */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white/90 rounded-full text-sm font-medium max-w-xs truncate">
            {lightboxImage.name}
          </div>
        </div>
      )}
    </div>
  );
};

function isWithinEditWindow(timestamp: string): boolean {
  const messageTime = new Date(timestamp).getTime();
  const now = new Date().getTime();
  const editWindow = 15 * 60 * 1000; // 15 minutes
  return (now - messageTime) < editWindow;
}
