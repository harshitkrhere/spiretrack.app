import React from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { WhitelistSettings } from './settings/WhitelistSettings';
import { ReviewSettingsPanel } from '../admin/ReviewSettingsPanel';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export const TeamSettingsModal: React.FC<TeamSettingsModalProps> = ({ isOpen, onClose, teamId, teamName }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop - subtle */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <Dialog.Panel className="mx-auto max-w-[95vw] sm:max-w-xl w-full bg-[#f5f5f7] rounded-xl shadow-xl shadow-black/10 max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
          
          {/* Header - System style */}
          <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#e5e5e7]">
            <div className="w-16" /> {/* Spacer for centering */}
            <div className="text-center">
              <Dialog.Title className="text-[17px] font-semibold text-[#1d1d1f]">
                Settings
              </Dialog.Title>
              <p className="text-[13px] text-[#86868b]">{teamName}</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-16 text-right text-[#007aff] text-[17px] font-normal hover:opacity-70 transition-opacity"
            >
              Done
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Submission Deadline Section */}
            <div className="mt-8 mx-4">
              <p className="text-[13px] font-normal text-[#86868b] uppercase tracking-wide px-3 mb-2">
                Submission Deadline
              </p>
              <div className="bg-white rounded-xl overflow-hidden">
                <ReviewSettingsPanel teamId={teamId} />
              </div>
            </div>
            
            {/* Access Control Section */}
            <div className="mt-8 mx-4 mb-8">
              <p className="text-[13px] font-normal text-[#86868b] uppercase tracking-wide px-3 mb-2">
                Access Control
              </p>
              <div className="bg-white rounded-xl overflow-hidden">
                <WhitelistSettings teamId={teamId} />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
