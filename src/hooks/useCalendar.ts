import { useState, useEffect, useMemo } from 'react';
import { 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    addMonths, 
    subMonths,
    addDays,
    addWeeks,
    isBefore,
    isAfter,
    differenceInMilliseconds
} from 'date-fns';
import { supabase } from '../lib/supabase';
import type { CalendarEvent, CalendarCategory, ViewMode } from '../types/calendar';
import { useAuth } from '../context/AuthContext';

export const useCalendar = () => {
    const { user } = useAuth();
    
    // State
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [categories, setCategories] = useState<CalendarCategory[]>([]);
    const [activeCategoryIds, setActiveCategoryIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [hidePastEvents, setHidePastEvents] = useState(false);
    const [showAllDayOnly, setShowAllDayOnly] = useState(false);
    const [showWithLocationOnly, setShowWithLocationOnly] = useState(false);
    const [showWeekdaysOnly, setShowWeekdaysOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    // Computed date ranges for fetching
    const fetchRange = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return { start, end };
    }, [currentDate]);

    // Fetch Categories
    useEffect(() => {
        if (!user) return;

        const fetchCategories = async () => {
            const { data: existingCategories, error } = await supabase
                .from('calendar_categories')
                .select('*')
                .order('position');
            
            if (error) {
                console.error('Error fetching categories:', error);
                return;
            }

            // 1. Deduplicate existing categories (fix for double-insert issue)
            const uniqueCats: CalendarCategory[] = [];
            const seenNames = new Set<string>();
            const duplicatesToDelete: string[] = [];

            (existingCategories || []).forEach(cat => {
                if (seenNames.has(cat.name)) {
                    duplicatesToDelete.push(cat.id);
                } else {
                    seenNames.add(cat.name);
                    uniqueCats.push(cat);
                }
            });

            // Cleanup duplicates in background
            if (duplicatesToDelete.length > 0) {
                console.log('Cleaning up duplicate categories:', duplicatesToDelete);
                supabase.from('calendar_categories').delete().in('id', duplicatesToDelete).then(({ error }) => {
                    if (error) console.error('Error deleting duplicates:', error);
                });
            }

            // 2. Define all desired default categories
            const defaultDefinitions = [
                { name: 'Work', color: 'bg-blue-500', position: 0 },
                { name: 'Personal', color: 'bg-green-500', position: 1 },
                { name: 'Important', color: 'bg-red-500', position: 2 },
                { name: 'Meetings', color: 'bg-purple-500', position: 3 },
                { name: 'Travel', color: 'bg-orange-500', position: 4 },
                { name: 'Health', color: 'bg-teal-500', position: 5 },
                { name: 'Finance', color: 'bg-yellow-500', position: 6 },
                { name: 'Social', color: 'bg-pink-500', position: 7 },
            ];

            const currentCats = uniqueCats;
            const missingCats = defaultDefinitions.filter(def => 
                !currentCats.some(cat => cat.name === def.name)
            );

            if (missingCats.length > 0) {
                const newCategories = missingCats.map(def => ({
                    user_id: user.id,
                    name: def.name,
                    color: def.color,
                    is_default: true,
                    position: def.position
                }));

                const { data: createdCats, error: createError } = await supabase
                    .from('calendar_categories')
                    .insert(newCategories)
                    .select();

                if (createError) {
                    console.error('Error creating missing categories:', createError);
                    setCategories(currentCats);
                    setActiveCategoryIds(new Set(currentCats.map(c => c.id)));
                } else if (createdCats) {
                    const allCats = [...currentCats, ...createdCats].sort((a, b) => a.position - b.position);
                    setCategories(allCats);
                    setActiveCategoryIds(new Set(allCats.map(c => c.id)));
                }
            } else {
                setCategories(currentCats);
                setActiveCategoryIds(new Set(currentCats.map(c => c.id)));
            }
        };

        fetchCategories();
    }, [user]);

    // Fetch Events & Realtime Subscription
    useEffect(() => {
        if (!user) return;

        const fetchEvents = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('calendar_events')
                .select('*, category:calendar_categories(*)')
                .gte('start_datetime', fetchRange.start.toISOString())
                .lte('end_datetime', fetchRange.end.toISOString());

            if (error) {
                console.error('Error fetching events:', error);
            } else {
                setEvents(data as CalendarEvent[]);
            }
            setLoading(false);
        };

        fetchEvents();

        // Realtime Subscription
        const channel = supabase
            .channel('calendar_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'calendar_events',
                    filter: `user_id=eq.${user.id}`
                },
                async () => {
                    await fetchEvents();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchRange]);

    // Navigation Handlers
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Filter Handlers
    const toggleCategory = (categoryId: string) => {
        const newSet = new Set(activeCategoryIds);
        if (newSet.has(categoryId)) {
            newSet.delete(categoryId);
        } else {
            newSet.add(categoryId);
        }
        setActiveCategoryIds(newSet);
    };

    // Expand recurring events into multiple instances within the visible range
    const expandedEvents = useMemo(() => {
        const allEvents: CalendarEvent[] = [];
        
        events.forEach(event => {
            // Always add the original event
            allEvents.push(event);
            
            // If it has a repeat pattern, generate instances
            if (event.repeat_pattern && event.repeat_pattern !== 'custom') {
                const originalStart = new Date(event.start_datetime);
                const originalEnd = new Date(event.end_datetime);
                const duration = differenceInMilliseconds(originalEnd, originalStart);
                
                let nextStart = originalStart;
                let instanceCount = 0;
                const maxInstances = 52; // Limit to ~1 year of occurrences
                
                while (instanceCount < maxInstances) {
                    // Calculate next occurrence based on pattern
                    switch (event.repeat_pattern) {
                        case 'daily':
                            nextStart = addDays(nextStart, 1);
                            break;
                        case 'weekly':
                            nextStart = addWeeks(nextStart, 1);
                            break;
                        case 'monthly':
                            nextStart = addMonths(nextStart, 1);
                            break;
                        default:
                            instanceCount = maxInstances; // Exit loop
                            continue;
                    }
                    
                    // Stop if we're past the visible range
                    if (isAfter(nextStart, fetchRange.end)) {
                        break;
                    }
                    
                    // Only add if within visible range
                    if (!isBefore(nextStart, fetchRange.start)) {
                        const nextEnd = new Date(nextStart.getTime() + duration);
                        allEvents.push({
                            ...event,
                            id: `${event.id}-recurring-${instanceCount}`, // Unique ID for React keys
                            start_datetime: nextStart.toISOString(),
                            end_datetime: nextEnd.toISOString(),
                        });
                    }
                    
                    instanceCount++;
                }
            }
        });
        
        return allEvents;
    }, [events, fetchRange]);

    // Derived State - now uses expandedEvents instead of events
    const filteredEvents = useMemo(() => {
        const now = new Date();
        return expandedEvents.filter(event => {
            // 1. Category Filter
            if (!activeCategoryIds.has(event.category_id)) return false;

            // 2. Hide Past Events Filter
            if (hidePastEvents) {
                const eventEnd = new Date(event.end_datetime);
                if (eventEnd < now) return false;
            }

            // 3. All Day Only Filter
            if (showAllDayOnly && !event.is_all_day) return false;

            // 4. With Location Only Filter
            if (showWithLocationOnly && !event.location) return false;

            // 5. Weekdays Only Filter
            if (showWeekdaysOnly) {
                const day = new Date(event.start_datetime).getDay();
                if (day === 0 || day === 6) return false; // 0 = Sunday, 6 = Saturday
            }

            // 6. Search Filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = event.title.toLowerCase().includes(query);
                const matchesDesc = event.description?.toLowerCase().includes(query);
                const matchesLoc = event.location?.toLowerCase().includes(query);
                
                if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
            }

            return true;
        });
    }, [expandedEvents, activeCategoryIds, hidePastEvents, showAllDayOnly, showWithLocationOnly, showWeekdaysOnly, searchQuery]);

    const daysInMonth = useMemo(() => {
        const days = [];
        let day = fetchRange.start;
        while (day <= fetchRange.end) {
            days.push(day);
            day = new Date(day.getTime() + 24 * 60 * 60 * 1000); // Add 1 day safely
        }
        return days;
    }, [fetchRange]);

    // Actions
    const createEvent = async (eventData: any) => {
        console.log('Creating event:', eventData);
        if (!user) {
            console.error('No user found');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .insert([{ ...eventData, user_id: user.id }])
                .select('*, category:calendar_categories(*)')
                .single();

            if (error) {
                console.error('Error creating event (Supabase):', error);
                throw error;
            }

            console.log('Event created successfully:', data);
            if (data) {
                setEvents(prev => [...prev, data]);
            }
        } catch (err) {
            console.error('Exception in createEvent:', err);
            throw err;
        }
    };

    const updateEvent = async (event: CalendarEvent, updates: Partial<CalendarEvent>) => {
        if (!user) return;

        // Optimistic update
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, ...updates } : e));

        const { error } = await supabase
            .from('calendar_events')
            .update(updates)
            .eq('id', event.id);

        if (error) {
            console.error('Error updating event:', error);
            // Revert on error (could be improved)
            setEvents(prev => prev.map(e => e.id === event.id ? event : e));
        }
    };

    const deleteEvent = async (eventId: string) => {
        if (!user) return;

        // Optimistic update
        setEvents(prev => prev.filter(e => e.id !== eventId));

        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', eventId);

        if (error) {
            console.error('Error deleting event:', error);
            // Revert (fetch again or undo)
        }
    };

    return {
        // State
        viewMode,
        currentDate,
        selectedDate,
        events: filteredEvents,
        categories,
        activeCategoryIds,
        loading,
        searchQuery,
        hidePastEvents,
        showAllDayOnly,
        showWithLocationOnly,
        showWeekdaysOnly,

        // Actions
        setViewMode,
        setCurrentDate,
        setSelectedDate,
        toggleCategory,
        createEvent,
        updateEvent,
        deleteEvent,
        setSearchQuery,
        setHidePastEvents,
        setShowAllDayOnly,
        setShowWithLocationOnly,
        setShowWeekdaysOnly,
        
        // Helpers
        nextMonth,
        prevMonth,
        goToToday,
        daysInMonth
    };
};
