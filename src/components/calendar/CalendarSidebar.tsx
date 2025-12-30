import React from 'react';
import { Switch } from '@headlessui/react';
import type { CalendarCategory } from '../../types/calendar';
import { FunnelIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

interface CalendarSidebarProps {
    categories: CalendarCategory[];
    activeCategoryIds: Set<string>;
    onToggleCategory: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    hidePastEvents: boolean;
    setHidePastEvents: (hide: boolean) => void;
    showAllDayOnly: boolean;
    setShowAllDayOnly: (show: boolean) => void;
    showWithLocationOnly: boolean;
    setShowWithLocationOnly: (show: boolean) => void;
    showWeekdaysOnly: boolean;
    setShowWeekdaysOnly: (show: boolean) => void;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
    categories,
    activeCategoryIds,
    onToggleCategory,
    searchQuery,
    setSearchQuery,
    hidePastEvents,
    setHidePastEvents,
    showAllDayOnly,
    setShowAllDayOnly,
    showWithLocationOnly,
    setShowWithLocationOnly,
    showWeekdaysOnly,
    setShowWeekdaysOnly
}) => {
    return (
        <div className="w-72 sm:w-64 lg:w-72 bg-gray-50 p-5 sm:p-6 lg:p-8 flex flex-col border-r border-gray-100 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 lg:mb-10">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-xl flex items-center justify-center text-gray-600 shadow-sm border border-gray-100">
                    <CalendarDaysIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                    <h1 className="text-lg lg:text-xl font-semibold text-gray-900 tracking-tight leading-none">Events</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Manage your schedule</p>
                </div>
            </div>

            {/* My Calendars */}
            <div className="mb-6 lg:mb-8">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 lg:mb-4">My Calendars</h3>
                <div className="space-y-2.5 lg:space-y-3">
                    {categories.map(cal => (
                        <div key={cal.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2.5 lg:gap-3">
                                <div className={`w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full ${cal.color}`} />
                                <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                    {cal.name}
                                </span>
                            </div>
                            <Switch
                                checked={activeCategoryIds.has(cal.id)}
                                onChange={() => onToggleCategory(cal.id)}
                                className={`${
                                    activeCategoryIds.has(cal.id) ? 'bg-gray-700' : 'bg-gray-300'
                                } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none`}
                            >
                                <span
                                    className={`${
                                        activeCategoryIds.has(cal.id) ? 'translate-x-5' : 'translate-x-1'
                                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</h3>
                    <FunnelIcon className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white rounded-lg lg:rounded-xl border border-gray-200 text-sm focus:border-gray-400 focus:ring-0 focus:outline-none transition-colors placeholder:text-gray-400"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>

                    {/* Filter Toggles */}
                    {[
                        { label: 'Hide Past Events', checked: hidePastEvents, onChange: setHidePastEvents },
                        { label: 'All Day Only', checked: showAllDayOnly, onChange: setShowAllDayOnly },
                        { label: 'With Location', checked: showWithLocationOnly, onChange: setShowWithLocationOnly },
                        { label: 'Weekdays Only', checked: showWeekdaysOnly, onChange: setShowWeekdaysOnly },
                    ].map((filter) => (
                        <div key={filter.label} className="flex items-center justify-between group">
                            <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                {filter.label}
                            </span>
                            <Switch
                                checked={filter.checked}
                                onChange={filter.onChange}
                                className={`${
                                    filter.checked ? 'bg-gray-700' : 'bg-gray-300'
                                } relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none`}
                            >
                                <span
                                    className={`${
                                        filter.checked ? 'translate-x-5' : 'translate-x-1'
                                    } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                                />
                            </Switch>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
