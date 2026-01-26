import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Attachment } from './types';

interface MessageInputProps {
  teamId: string;
  channelId: string;
  onSendMessage: (content: string, attachments: Attachment[]) => Promise<void>;
  isAdmin: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  teamId, 
  channelId, 
  onSendMessage,
  isAdmin 
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const quickRepliesRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Common emojis for quick access - Professional & Expressive
  const commonEmojis = [
    // Professional / Status
    '✅', '❌', '⚠️', 'ℹ️', '🆗', '🟢', '🔴', '🟡',
    '💼', '📅', '📊', '📈', '🤝', '👀', '👍', '👎',
    // Reactions / Feedback
    '👏', '🙌',  '💯', '🧠', '🤔', '🧐', '🫡',
    // Dynamic / Expressive ("Custom" feel)
    '🚀', '⚡', '🔥', '✨', '🎯', '💡', '🎨',
    '🛠️', '📢', '🔒', '🐛', '🏁', '🫂', '⭐'
  ];

  // Corporate Quick Replies
  const quickReplies = [
    "Good morning everyone! ☀️",
    "Good night team, see you tomorrow! 🌙",
    "Thanks for the update! 👍",
    "I'll look into this immediately. 👀",
    "Can you please review this when you have a chance?",
    "Let's circle back on this later.",
    "Great work team! 🚀",
    "Can we hop on a quick huddle?"
  ];

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      setContent(prev => prev + text);
    }
    setShowQuickReplies(false);
  };

  const insertEmoji = (emoji: string) => insertText(emoji);

  // Close popups when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Emoji Picker
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      // Quick Replies
      if (quickRepliesRef.current && !quickRepliesRef.current.contains(e.target as Node)) {
        setShowQuickReplies(false);
      }
    };
    if (showEmojiPicker || showQuickReplies) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showQuickReplies]);

  const handleSend = async () => {
    if ((!content.trim() && attachments.length === 0) || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(content, attachments);
      setContent('');
      setAttachments([]);
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    const files = Array.from(e.target.files);
    const newAttachments: Attachment[] = [];

    try {
      for (const file of files) {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${teamId}/${channelId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('team-chat-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('team-chat-files')
          .getPublicUrl(filePath);

        newAttachments.push({
          url: publicUrl,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          size: file.size
        });
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
  };

  // Formatting helpers
  const applyFormat = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent: string;
    let newCursorPos: number;

    if (selectedText) {
      // Wrap selected text
      newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
      newCursorPos = end + prefix.length + suffix.length;
    } else {
      // Insert format markers and place cursor between them
      newContent = content.substring(0, start) + prefix + suffix + content.substring(end);
      newCursorPos = start + prefix.length;
    }

    setContent(newContent);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBold = () => applyFormat('**');
  const handleItalic = () => applyFormat('*');
  const handleStrikethrough = () => applyFormat('~~');
  
  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const linkText = selectedText || 'link text';
    const newContent = content.substring(0, start) + `[${linkText}](url)` + content.substring(end);
    
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      // Select "url" so user can replace it
      const urlStart = start + linkText.length + 3;
      textarea.setSelectionRange(urlStart, urlStart + 3);
    }, 0);
  };

  const handleList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const newContent = content.substring(0, start) + '\n• ' + content.substring(start);
    
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 3, start + 3);
    }, 0);
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        handleBold();
      } else if (e.key === 'i') {
        e.preventDefault();
        handleItalic();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {attachments.map((att, i) => (
            <div key={i} className="relative group bg-gray-100 rounded-lg px-3 py-2 pr-8 text-sm flex items-center">
              <span className="truncate max-w-[180px] font-medium text-gray-700">{att.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="absolute top-1/2 -translate-y-1/2 right-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input - Simple like reference design */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors flex-shrink-0"
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />

        {/* Quick Replies Button */}
        <div className="relative" ref={quickRepliesRef}>
          <button 
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${showQuickReplies ? 'text-gray-600 bg-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            title="Quick replies"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          
          {/* Quick Replies Dropdown */}
          {showQuickReplies && (
            <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 w-64">
              <div className="flex flex-col gap-1">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => insertText(reply)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors truncate"
                    title={reply}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emoji Button with Picker */}
        <div className="relative" ref={emojiPickerRef}>
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${showEmojiPicker ? 'text-gray-600 bg-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
            title="Add emoji"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {/* Emoji Picker Dropdown */}
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-50 w-64">
              <div className="grid grid-cols-8 gap-1">
                {commonEmojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => insertEmoji(emoji)}
                    className="w-7 h-7 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-1 text-sm max-h-[150px] min-h-[24px] text-gray-800 placeholder:text-gray-400"
          rows={1}
        />

        {/* Send on Enter - no visible button, just hint */}
        {(content.trim() || attachments.length > 0) && (
          <button
            onClick={handleSend}
            disabled={isSending || isUploading}
            className="p-2 text-gray-900 hover:text-gray-700 rounded-full transition-colors flex-shrink-0"
          >
            {isSending ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
