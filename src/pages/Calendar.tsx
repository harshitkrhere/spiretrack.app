import React, { useState } from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { useCalendarReminders } from '../hooks/useCalendarReminders';
import { CalendarSidebar } from '../components/calendar/CalendarSidebar';
import { CalendarHeader } from '../components/calendar/CalendarHeader';
import { MonthGrid } from '../components/calendar/MonthGrid';
import { WeekGrid } from '../components/calendar/WeekGrid';
import { DayGrid } from '../components/calendar/DayGrid';
import { EventModal } from '../components/calendar/EventModal';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import type { CalendarEvent, CreateEventDTO } from '../types/calendar';

export const Calendar: React.FC = () => {
    useCalendarReminders();

    const {
        currentDate,
        viewMode,
        setViewMode,
        categories,
        events,
        activeCategoryIds,
        toggleCategory,
        nextMonth,
        prevMonth,
        goToToday,
        daysInMonth,
        selectedDate,
        setSelectedDate,
        createEvent,
        updateEvent,
        deleteEvent,
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
    } = useCalendar();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleSaveEvent = async (eventData: CreateEventDTO) => {
        if (selectedEvent) {
            await updateEvent(selectedEvent, eventData as any);
        } else {
            await createEvent(eventData);
        }
    };

    const handleMoveEvent = (event: CalendarEvent, newDate: Date) => {
        const oldStart = new Date(event.start_datetime);
        const oldEnd = new Date(event.end_datetime);
        const duration = oldEnd.getTime() - oldStart.getTime();

        const newStart = new Date(newDate);
        newStart.setHours(oldStart.getHours(), oldStart.getMinutes());
        const newEnd = new Date(newStart.getTime() + duration);

        updateEvent(event, {
            start_datetime: newStart.toISOString(),
            end_datetime: newEnd.toISOString()
        });
    };

    return (
        <div className="relative min-h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <Bars3Icon className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Calendar</h1>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black/40 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex h-[calc(100vh-57px)] lg:h-screen">
                {/* Sidebar - hidden on mobile, slide in */}
                <div className={`
                    fixed lg:relative inset-y-0 left-0 z-50 
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="relative h-full">
                        {/* Mobile close button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg z-10"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <CalendarSidebar 
                            categories={categories}
                            activeCategoryIds={activeCategoryIds}
                            onToggleCategory={toggleCategory}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            hidePastEvents={hidePastEvents}
                            setHidePastEvents={setHidePastEvents}
                            showAllDayOnly={showAllDayOnly}
                            setShowAllDayOnly={setShowAllDayOnly}
                            showWithLocationOnly={showWithLocationOnly}
                            setShowWithLocationOnly={setShowWithLocationOnly}
                            showWeekdaysOnly={showWeekdaysOnly}
                            setShowWeekdaysOnly={setShowWeekdaysOnly}
                        />
                    </div>
                </div>

                {/* Calendar Grid Area */}
                <div className="flex-1 bg-white p-4 sm:p-6 lg:p-8 flex flex-col overflow-auto">
                    <CalendarHeader 
                        currentDate={currentDate}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onNext={nextMonth}
                        onPrev={prevMonth}
                        onToday={goToToday}
                    />

                    <div className="flex-1 overflow-auto">
                        {viewMode === 'month' && (
                            <MonthGrid 
                                currentDate={currentDate}
                                days={daysInMonth}
                                events={events}
                                onSelectDate={handleSelectDate}
                                selectedDate={selectedDate}
                                onMoveEvent={handleMoveEvent}
                                onEventClick={handleEventClick}
                            />
                        )}

                        {viewMode === 'week' && (
                            <WeekGrid 
                                currentDate={currentDate}
                                events={events}
                                onEventClick={handleEventClick}
                            />
                        )}

                        {viewMode === 'day' && (
                            <DayGrid 
                                currentDate={currentDate}
                                events={events}
                                onEventClick={handleEventClick}
                            />
                        )}
                    </div>
                </div>
            </div>

            <EventModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={deleteEvent}
                initialDate={selectedDate || new Date()}
                categories={categories}
                event={selectedEvent}
            />
        </div>
    );
};
