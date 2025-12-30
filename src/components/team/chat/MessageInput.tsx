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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

  return (
    <div className="bg-white">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 px-2">
          {attachments.map((att, i) => (
            <div key={i} className="relative group bg-slate-50 border border-slate-200 rounded-xl p-2 pr-8 text-xs flex items-center shadow-sm">
              <span className="truncate max-w-[150px] font-medium text-slate-700">{att.name}</span>
              <button
                onClick={() => removeAttachment(i)}
                className="absolute top-1.5 right-1.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end space-x-3 bg-slate-50 border border-slate-200 rounded-full p-2 pl-4 focus-within:ring-2 focus-within:ring-[#5D79A0]/20 focus-within:border-[#5D79A0] transition-all shadow-sm">
        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-slate-400 hover:text-[#5D79A0] transition-colors rounded-full hover:bg-white"
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelId ? 'channel' : '...'}`}
          className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none outline-none appearance-none shadow-none resize-none py-3 text-[15px] max-h-[150px] min-h-[24px] text-slate-700 placeholder:text-slate-400"
          rows={1}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!content.trim() && attachments.length === 0) || isSending || isUploading}
          className={`p-2.5 rounded-full transition-all duration-200 ${
            (!content.trim() && attachments.length === 0) || isSending
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#5D79A0] text-white hover:bg-[#4a6285] shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
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
      <div className="text-[11px] text-slate-400 mt-2 px-4 text-center">
        <strong>Tip:</strong> Use @username to mention someone. {isAdmin && 'Admins can use @team to notify everyone.'}
      </div>
    </div>
  );
};
