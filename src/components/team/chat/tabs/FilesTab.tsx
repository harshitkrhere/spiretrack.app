import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../lib/supabase';
import type { ChannelFile, MessageUser } from '../types';
import { 
  PlusIcon,
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  LinkIcon,
  ArrowUpTrayIcon,
  StarIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  GlobeAltIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { cn } from '../../../../lib/utils';

interface FilesTabProps {
  channelId: string;
  teamId: string;
  currentUserId: string;
  isAdmin: boolean;
}

const FILE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  image: PhotoIcon,
  video: FilmIcon,
  document: DocumentIcon,
  default: FolderIcon,
};

const getFileIcon = (fileType?: string) => {
  if (!fileType) return FILE_ICONS.default;
  if (fileType.startsWith('image/')) return FILE_ICONS.image;
  if (fileType.startsWith('video/')) return FILE_ICONS.video;
  return FILE_ICONS.document;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FilesTab: React.FC<FilesTabProps> = ({
  channelId,
  teamId,
  currentUserId,
  isAdmin,
}) => {
  const [files, setFiles] = useState<ChannelFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [channelId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('channel_files')
        .select('*')
        .eq('channel_id', channelId)
        .order('is_pinned', { ascending: false })
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Fetch uploader details
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(f => f.uploaded_by))];
        const { data: users } = await supabase
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);

        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        
        const filesWithUsers = data.map(file => ({
          ...file,
          uploader: userMap.get(file.uploaded_by),
        }));

        setFiles(filesWithUsers);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Upload to Supabase Storage
      const fileName = `${teamId}/${channelId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('channel-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('channel-files')
        .getPublicUrl(fileName);

      // Create file record
      const { error } = await supabase
        .from('channel_files')
        .insert({
          channel_id: channelId,
          team_id: teamId,
          name: file.name,
          url: publicUrl,
          file_type: file.type,
          size_bytes: file.size,
          is_external_link: false,
          uploaded_by: currentUserId,
        });

      if (error) throw error;
      fetchFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddLink = async () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;

    try {
      const { error } = await supabase
        .from('channel_files')
        .insert({
          channel_id: channelId,
          team_id: teamId,
          name: newLink.name,
          url: newLink.url,
          description: newLink.description || null,
          is_external_link: true,
          uploaded_by: currentUserId,
        });

      if (error) throw error;
      
      setShowLinkModal(false);
      setNewLink({ name: '', url: '', description: '' });
      fetchFiles();
    } catch (err) {
      console.error('Error adding link:', err);
      alert('Failed to add link');
    }
  };

  const togglePin = async (file: ChannelFile) => {
    try {
      const { error } = await supabase
        .from('channel_files')
        .update({ is_pinned: !file.is_pinned })
        .eq('id', file.id);

      if (error) throw error;
      fetchFiles();
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleDelete = async (file: ChannelFile) => {
    if (!confirm('Delete this file?')) return;

    try {
      // Delete from storage if it's an uploaded file
      if (!file.is_external_link) {
        const path = file.url.split('/channel-files/')[1];
        if (path) {
          await supabase.storage.from('channel-files').remove([path]);
        }
      }

      const { error } = await supabase
        .from('channel_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const pinnedFiles = files.filter(f => f.is_pinned);
  const unpinnedFiles = files.filter(f => !f.is_pinned);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Files & Resources</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLinkModal(true)}
            className="flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Add Link
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>

      {/* Empty State */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <FolderIcon className="w-12 h-12 mb-2" />
          <p className="text-sm font-medium">No files yet</p>
          <p className="text-xs">Upload files or add external links</p>
        </div>
      ) : (
        <>
          {/* Pinned Files */}
          {pinnedFiles.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
                <StarSolidIcon className="w-4 h-4 text-yellow-500" />
                Pinned
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pinnedFiles.map((file) => (
                  <FileCard 
                    key={file.id} 
                    file={file} 
                    onPin={togglePin} 
                    onDelete={handleDelete}
                    canEdit={file.uploaded_by === currentUserId || isAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Files */}
          <div>
            {pinnedFiles.length > 0 && (
              <h3 className="text-sm font-medium text-slate-500 mb-2">All Files</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {unpinnedFiles.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  onPin={togglePin} 
                  onDelete={handleDelete}
                  canEdit={file.uploaded_by === currentUserId || isAdmin}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add External Link</h3>
              <button onClick={() => setShowLinkModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Resource name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL *</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newLink.description}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Optional description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                disabled={!newLink.name.trim() || !newLink.url.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// File Card Component
const FileCard: React.FC<{
  file: ChannelFile;
  onPin: (file: ChannelFile) => void;
  onDelete: (file: ChannelFile) => void;
  canEdit: boolean;
}> = ({ file, onPin, onDelete, canEdit }) => {
  const Icon = file.is_external_link ? GlobeAltIcon : getFileIcon(file.file_type);

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow group">
      <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>

      <div className="flex-1 min-w-0">
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-medium text-slate-900 hover:text-blue-600 truncate block"
        >
          {file.name}
        </a>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {file.uploader && <span>{file.uploader.full_name || file.uploader.email}</span>}
          {file.size_bytes && <span>• {formatFileSize(file.size_bytes)}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onPin(file)}
          className="p-1.5 hover:bg-slate-100 rounded"
          title={file.is_pinned ? 'Unpin' : 'Pin'}
        >
          {file.is_pinned ? (
            <StarSolidIcon className="w-4 h-4 text-yellow-500" />
          ) : (
            <StarIcon className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {!file.is_external_link && (
          <a
            href={file.url}
            download
            className="p-1.5 hover:bg-slate-100 rounded"
            title="Download"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-slate-400" />
          </a>
        )}

        {canEdit && (
          <button
            onClick={() => onDelete(file)}
            className="p-1.5 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4 text-slate-400 hover:text-red-500" />
          </button>
        )}
      </div>
    </div>
  );
};
