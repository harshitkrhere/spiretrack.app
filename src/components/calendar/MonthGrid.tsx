import React from 'react';
import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
import { DndContext, useDraggable, useDroppable, useSensors, useSensor, PointerSensor, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CalendarEvent } from '../../types/calendar';

interface MonthGridProps {
    currentDate: Date;
    days: Date[];
    events: CalendarEvent[];
    onSelectDate: (date: Date) => void;
    selectedDate: Date | null;
    onMoveEvent: (event: CalendarEvent, newDate: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Draggable Event Component
const DraggableEvent = ({ event, onClick }: { event: CalendarEvent; onClick: (e: CalendarEvent) => void }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: event.id,
        data: event,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.8 : 1,
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDragging) {
            onClick(event);
        }
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...listeners} 
            {...attributes}
            className={`
                px-2 py-1 rounded-md text-[10px] font-bold text-white truncate shadow-sm transition-transform hover:scale-[1.02] cursor-pointer z-20
                ${event.category?.color || 'bg-slate-500'}
                ${isDragging ? 'ring-2 ring-white shadow-lg' : ''}
            `}
            title={`${event.title} (Click to edit)`}
            onClick={handleClick}
        >
            {event.title}
        </div>
    );
};

// Droppable Day Component
const DroppableDay = ({ 
    day, 
    currentDate, 
    selectedDate, 
    onSelectDate, 
    children 
}: { 
    day: Date; 
    currentDate: Date; 
    selectedDate: Date | null; 
    events: CalendarEvent[]; 
    onSelectDate: (date: Date) => void;
    children: React.ReactNode;
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: day.toISOString(),
        data: { date: day },
    });

    const isCurrentMonth = isSameMonth(day, currentDate);
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const isDayToday = isToday(day);

    return (
        <div 
            ref={setNodeRef}
            onClick={() => onSelectDate(day)}
            className={`
                relative bg-white p-2 min-h-[120px] group transition-all duration-200 hover:bg-slate-50 cursor-pointer
                ${!isCurrentMonth ? 'bg-slate-50/50' : ''}
                ${isSelected ? 'bg-blue-50/50 ring-inset ring-2 ring-blue-500/20 z-10' : ''}
                ${isOver ? 'bg-blue-100 ring-inset ring-2 ring-blue-400' : ''}
            `}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isDayToday 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                        : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
                    }
                `}>
                    {format(day, 'd')}
                </span>
            </div>
            <div className="space-y-1.5">
                {children}
            </div>
        </div>
    );
};

export const MonthGrid: React.FC<MonthGridProps> = ({
    currentDate,
    days,
    events,
    onSelectDate,
    selectedDate,
    onMoveEvent,
    onEventClick
}) => {
    // Only start drag after moving 8px - this allows clicks to work properly
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const draggedEvent = active.data.current as CalendarEvent;
            const targetDate = over.data.current?.date as Date;

            if (draggedEvent && targetDate) {
                onMoveEvent(draggedEvent, targetDate);
            }
        }
    };

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex-1 flex flex-col h-full">
                {/* Days Header */}
                <div className="grid grid-cols-7 mb-4">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    {days.map((day) => {
                        // Filter events for this day
                        const dayEvents = events.filter(e => isSameDay(new Date(e.start_datetime), day));

                        return (
                            <DroppableDay
                                key={day.toISOString()}
                                day={day}
                                currentDate={currentDate}
                                selectedDate={selectedDate}
                                events={dayEvents}
                                onSelectDate={onSelectDate}
                            >
                                {dayEvents.map((event) => (
                                    <DraggableEvent 
                                        key={event.id} 
                                        event={event} 
                                        onClick={onEventClick}
                                    />
                                ))}
                            </DroppableDay>
                        );
                    })}
                </div>
            </div>
        </DndContext>
    );
};
