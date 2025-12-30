import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { UserProfileDropdown } from './UserProfileDropdown';

export const TeamLayout = () => {
  return (
    <div className="h-screen flex bg-white font-sans overflow-hidden">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Header */}
        <div className="h-11 bg-app-sidebar flex items-center justify-between px-4 border-b border-app-sidebar shadow-sm flex-shrink-0 z-10">
          {/* Spacer to align search */}
          <div className="w-[100px] hidden md:block" />

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl px-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-white/70" />
              </div>
              <input
                type="text"
                placeholder="Search SpireTrack"
                className="block w-full rounded-[6px] border-0 py-1 pl-10 bg-app-sidebarHover text-white placeholder:text-white/70 focus:ring-0 sm:text-sm text-center focus:text-left transition-all hover:bg-opacity-90 cursor-pointer hover:bg-white/20 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="w-[100px] flex items-center justify-end gap-3 text-white/80">
            <QuestionMarkCircleIcon className="h-5 w-5 hover:text-white cursor-pointer hidden md:block" />
            <div className="h-6 w-6 relative">
                 <UserProfileDropdown />
            </div>
          </div>
        </div>

        {/* Content Outlet */}
        <div className="flex-1 overflow-auto bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

