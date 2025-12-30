import React from 'react';
import { format, differenceInMinutes, startOfDay } from 'date-fns';
import type { CalendarEvent } from '../../types/calendar';

interface DayGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const DayGrid: React.FC<DayGridProps> = ({
    currentDate,
    events,
    onEventClick
}) => {
    const dayEvents = events.filter(e => {
        const eventDate = new Date(e.start_datetime);
        return eventDate.getDate() === currentDate.getDate() &&
               eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear();
    });

    const getEventStyle = (event: CalendarEvent) => {
        const start = new Date(event.start_datetime);
        const end = new Date(event.end_datetime);
        const dayStart = startOfDay(start);
        
        const startMinutes = differenceInMinutes(start, dayStart);
        const durationMinutes = differenceInMinutes(end, start);

        return {
            top: `${(startMinutes / 1440) * 100}%`,
            height: `${(durationMinutes / 1440) * 100}%`,
        };
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-slate-200 py-4 px-8">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold text-slate-800">{format(currentDate, 'EEEE')}</span>
                    <span className="text-slate-500">{format(currentDate, 'MMMM d, yyyy')}</span>
                </div>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto relative">
                <div className="flex h-[1440px]"> {/* 60px per hour */}
                    {/* Time Labels */}
                    <div className="w-20 flex-shrink-0 flex flex-col text-xs text-slate-400 font-medium bg-slate-50 border-r border-slate-200">
                        {HOURS.map(hour => (
                            <div key={hour} className="flex-1 border-b border-slate-100 relative">
                                <span className="absolute -top-2 right-4">
                                    {format(new Date().setHours(hour, 0), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day Column */}
                    <div className="flex-1 relative bg-white">
                        {/* Hour Grid Lines */}
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] border-b border-slate-50" />
                        ))}

                        {/* Events */}
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(event);
                                }}
                                className={`absolute left-4 right-4 rounded-lg p-3 text-white overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-md z-10 ${event.category?.color || 'bg-slate-500'}`}
                                style={getEventStyle(event)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-sm">{event.title}</span>
                                    <span className="text-xs opacity-90 bg-black/10 px-2 py-0.5 rounded-full">
                                        {format(new Date(event.start_datetime), 'h:mm a')} - {format(new Date(event.end_datetime), 'h:mm a')}
                                    </span>
                                </div>
                                {event.location && (
                                    <div className="text-xs opacity-90 mb-1 flex items-center gap-1">
                                        📍 {event.location}
                                    </div>
                                )}
                                <div className="text-xs opacity-80 line-clamp-2">
                                    {event.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
