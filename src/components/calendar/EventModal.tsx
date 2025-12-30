import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, MapPinIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { CalendarCategory, CreateEventDTO, CalendarEvent } from '../../types/calendar';
import { format } from 'date-fns';
import { LocationPicker } from './LocationPicker';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: CreateEventDTO) => Promise<void>;
    onDelete?: (eventId: string) => Promise<void>;
    initialDate?: Date;
    categories: CalendarCategory[];
    event?: CalendarEvent | null;
}

export const EventModal: React.FC<EventModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    initialDate,
    categories,
    event
}) => {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);
    const [repeatPattern, setRepeatPattern] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const REMINDER_OPTIONS = [
        { value: null, label: 'No reminder' },
        { value: 5, label: '5 minutes before' },
        { value: 15, label: '15 minutes before' },
        { value: 30, label: '30 minutes before' },
        { value: 60, label: '1 hour before' },
        { value: 1440, label: '1 day before' },
    ];

    const REPEAT_OPTIONS = [
        { value: null, label: 'Does not repeat' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
    ];

    useEffect(() => {
        if (isOpen) {
            if (event) {
                // Edit Mode
                setTitle(event.title);
                setCategoryId(event.category_id);
                setDescription(event.description || '');
                setLocation(event.location || '');
                
                const start = new Date(event.start_datetime);
                const end = new Date(event.end_datetime);
                
                setStartDate(format(start, 'yyyy-MM-dd'));
                setStartTime(format(start, 'HH:mm'));
                setEndDate(format(end, 'yyyy-MM-dd'));
                setEndTime(format(end, 'HH:mm'));
                setReminderMinutes(event.reminder_minutes ?? null);
                setRepeatPattern(event.repeat_pattern ?? null);
            } else if (initialDate) {
                // Create Mode
                const dateStr = format(initialDate, 'yyyy-MM-dd');
                setStartDate(dateStr);
                setEndDate(dateStr);
                setTitle('');
                setDescription('');
                setLocation('');
                setReminderMinutes(null);
                setRepeatPattern(null);
                if (categories.length > 0) {
                    setCategoryId(categories[0].id);
                }
            }
        }
    }, [isOpen, event, initialDate, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !startDate || !endDate || !categoryId) {
            alert('Please fill in all required fields (Title, Date, Category).');
            return;
        }

        setIsSubmitting(true);
        try {
            const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
            const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

            await onSave({
                title,
                category_id: categoryId,
                start_datetime: startDateTime,
                end_datetime: endDateTime,
                description,
                location,
                reminder_minutes: reminderMinutes ?? undefined,
                repeat_pattern: repeatPattern
            });
            onClose();
        } catch (error) {
            console.error('Failed to save event', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!event || !onDelete) return;
        if (confirm('Are you sure you want to delete this event?')) {
            setIsSubmitting(true);
            try {
                await onDelete(event.id);
                onClose();
            } catch (error) {
                console.error('Failed to delete event', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <Dialog.Title className="text-lg font-bold text-slate-900">
                            {event ? 'Edit Event' : 'New Event'}
                        </Dialog.Title>
                        <div className="flex items-center gap-2">
                            {event && onDelete && (
                                <button 
                                    onClick={handleDelete}
                                    className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                                    title="Delete Event"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                                <XMarkIcon className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Title */}
                        <div>
                            <input
                                type="text"
                                placeholder="Add title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full text-xl font-semibold placeholder:text-slate-400 border-0 border-b-2 border-slate-100 focus:border-blue-500 focus:ring-0 px-0 py-2 transition-colors bg-transparent"
                                autoFocus
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Start</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-24 rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">End</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex-1 rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-24 rounded-lg border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`
                                            px-3 py-1.5 rounded-full text-sm font-medium transition-all border
                                            ${categoryId === cat.id 
                                                ? `${cat.color} text-white border-transparent shadow-md` 
                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10">
                                <button
                                    type="button"
                                    onClick={() => setIsMapOpen(true)}
                                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Pick from Map"
                                >
                                    <MapPinIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Add location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full pl-12 rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-shadow"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <textarea
                                placeholder="Add description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                            />
                        </div>

                        {/* Reminder */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reminder</label>
                            <select
                                value={reminderMinutes ?? ''}
                                onChange={(e) => setReminderMinutes(e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                {REMINDER_OPTIONS.map(opt => (
                                    <option key={opt.label} value={opt.value ?? ''}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Repeat Pattern */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Repeat</label>
                            <select
                                value={repeatPattern ?? ''}
                                onChange={(e) => setRepeatPattern(e.target.value || null)}
                                className="w-full rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
                            >
                                {REPEAT_OPTIONS.map(opt => (
                                    <option key={opt.label} value={opt.value ?? ''}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50"
                            >
                                {isSubmitting ? event ? 'Update Event' : 'Save Event' : event ? 'Updating...' : 'Saving...'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>

            <LocationPicker 
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelectLocation={(loc) => setLocation(loc)}
            />
        </Dialog>
    );
};
