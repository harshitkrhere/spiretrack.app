import React, { useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay, differenceInMinutes, startOfDay } from 'date-fns';
import type { CalendarEvent } from '../../types/calendar';

interface WeekGridProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const WeekGrid: React.FC<WeekGridProps> = ({
    currentDate,
    events,
    onEventClick
}) => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

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
            <div className="flex border-b border-slate-200">
                <div className="w-16 flex-shrink-0" /> {/* Time label spacer */}
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="flex-1 text-center py-2 border-l border-slate-100">
                        <div className="text-xs font-bold text-slate-400 uppercase">{format(day, 'EEE')}</div>
                        <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : 'text-slate-700'}`}>
                            {format(day, 'd')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto relative">
                <div className="flex h-[1440px]"> {/* 60px per hour */}
                    {/* Time Labels */}
                    <div className="w-16 flex-shrink-0 flex flex-col text-xs text-slate-400 font-medium bg-slate-50 border-r border-slate-200">
                        {HOURS.map(hour => (
                            <div key={hour} className="flex-1 border-b border-slate-100 relative">
                                <span className="absolute -top-2 right-2">
                                    {format(new Date().setHours(hour, 0), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {weekDays.map(day => {
                        const dayEvents = events.filter(e => isSameDay(new Date(e.start_datetime), day));

                        return (
                            <div key={day.toISOString()} className="flex-1 border-r border-slate-100 relative">
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
                                        className={`absolute left-0.5 right-0.5 rounded-md p-1 text-xs text-white overflow-hidden cursor-pointer hover:brightness-95 transition-all shadow-sm z-10 ${event.category?.color || 'bg-slate-500'}`}
                                        style={getEventStyle(event)}
                                    >
                                        <div className="font-bold truncate">{event.title}</div>
                                        <div className="truncate opacity-80">
                                            {format(new Date(event.start_datetime), 'h:mm a')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
