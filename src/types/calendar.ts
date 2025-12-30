export interface CalendarCategory {
    id: string;
    user_id: string;
    name: string;
    color: string;
    icon?: string;
    is_default: boolean;
    position: number;
    created_at: string;
}

export interface CalendarEvent {
    id: string;
    user_id: string;
    category_id: string;
    title: string;
    description?: string;
    start_datetime: string;
    end_datetime: string;
    is_all_day: boolean;
    location?: string;
    reminder_minutes?: number;
    repeat_pattern?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
    attendees?: string[];
    created_at: string;
    updated_at: string;
    
    // Joined fields
    category?: CalendarCategory;
}

export type ViewMode = 'month' | 'week' | 'day';

export interface CreateEventDTO {
    title: string;
    category_id: string;
    start_datetime: string;
    end_datetime: string;
    description?: string;
    is_all_day?: boolean;
    location?: string;
    reminder_minutes?: number;
    repeat_pattern?: string | null;
    attendees?: string[];
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
    id: string;
}
