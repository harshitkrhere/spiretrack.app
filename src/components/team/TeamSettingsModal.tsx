import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, Cog6ToothIcon, ClockIcon, ShieldCheckIcon, ClipboardIcon, CheckIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { WhitelistSettings } from './settings/WhitelistSettings';
import { ReviewSettingsPanel } from '../admin/ReviewSettingsPanel';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export const TeamSettingsModal: React.FC<TeamSettingsModalProps> = ({ isOpen, onClose, teamId, teamName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(teamId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = teamId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
          
          {/* Header - Modern gradient */}
          <div className="relative px-6 py-5 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Cog6ToothIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold text-white">
                    Team Settings
                  </Dialog.Title>
                  <p className="text-sm text-slate-400">{teamName}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50">
            {/* Team Invite Code Section */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <UserPlusIcon className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Team Invite Code
                </h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <p className="text-xs text-slate-500 mb-3">
                  Share this code with others to let them join your team.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-mono text-sm text-slate-700 select-all overflow-x-auto">
                    {teamId}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      copied 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Submission Deadline Section */}
            <div className="px-5">
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Submission Deadline
                </h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <ReviewSettingsPanel teamId={teamId} />
              </div>
            </div>
            
            {/* Access Control Section */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Access Control
                </h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <WhitelistSettings teamId={teamId} />
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-white border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
