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
    <div className="bg-white px-4 py-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att, i) => (
            <div key={i} className="relative group bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm flex items-center">
              <span className="truncate max-w-[180px] font-medium text-slate-700">{att.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="absolute top-1/2 -translate-y-1/2 right-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input Container - Slack Style */}
      <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 bg-slate-50">
          <button 
            onClick={handleBold}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded transition-colors font-bold text-sm"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button 
            onClick={handleItalic}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded transition-colors italic text-sm"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button 
            onClick={handleStrikethrough}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded transition-colors line-through text-sm"
            title="Strikethrough"
          >
            S
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button 
            onClick={handleLink}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded transition-colors"
            title="Add link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button 
            onClick={handleList}
            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white rounded transition-colors"
            title="Bulleted list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Text Input Row */}
        <div className="flex items-end gap-2 p-3">
          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
            title="Attach file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Message #team-chat"
            className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none py-1 text-[15px] max-h-[150px] min-h-[24px] text-slate-800 placeholder:text-slate-400"
            rows={1}
          />

          {/* Emoji Button */}
          <button 
            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors flex-shrink-0"
            title="Add emoji"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Send Button - Blue Circle */}
          <button
            onClick={handleSend}
            disabled={(!content.trim() && attachments.length === 0) || isSending || isUploading}
            className={`p-2.5 rounded-full transition-all duration-200 flex-shrink-0 ${
              (!content.trim() && attachments.length === 0) || isSending
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
            }`}
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
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className="text-[11px] text-slate-400 mt-2 text-center">
        <span className="text-slate-500 font-medium">Return</span> to send · <span className="text-slate-500 font-medium">Shift + Return</span> to add a new line
      </div>
    </div>
  );
};
