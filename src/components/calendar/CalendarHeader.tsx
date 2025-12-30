import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import type { ViewMode } from '../../types/calendar';

interface CalendarHeaderProps {
    currentDate: Date;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onNext: () => void;
    onPrev: () => void;
    onToday: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    viewMode,
    onViewModeChange,
    onNext,
    onPrev,
    onToday
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6 lg:mb-8">
            {/* Month/Year Title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
                {format(currentDate, 'MMMM yyyy')}
            </h2>
            
            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {/* View Switcher */}
                <div className="bg-gray-100 p-1 rounded-lg sm:rounded-xl flex items-center">
                    {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => onViewModeChange(mode)}
                            className={`
                                px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg transition-all capitalize
                                ${viewMode === mode 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                                }
                            `}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                <div className="hidden sm:block h-6 w-px bg-gray-200" />

                <button 
                    onClick={onToday}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 text-gray-600 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                    Today
                </button>
                
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-sm">
                    <button 
                        onClick={onPrev}
                        className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                        onClick={onNext}
                        className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-md sm:rounded-lg transition-colors text-gray-600"
                    >
                        <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
