-- Create calendar_categories table
CREATE TABLE IF NOT EXISTS public.calendar_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT,
    is_default BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.calendar_categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    is_all_day BOOLEAN DEFAULT false,
    location TEXT,
    reminder_minutes INTEGER,
    repeat_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'custom'
    attendees UUID[], -- Array of user IDs
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.calendar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policies for calendar_categories
DROP POLICY IF EXISTS "Users can view their own categories" ON public.calendar_categories;
CREATE POLICY "Users can view their own categories"
    ON public.calendar_categories FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own categories" ON public.calendar_categories;
CREATE POLICY "Users can insert their own categories"
    ON public.calendar_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON public.calendar_categories;
CREATE POLICY "Users can update their own categories"
    ON public.calendar_categories FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON public.calendar_categories;
CREATE POLICY "Users can delete their own categories"
    ON public.calendar_categories FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for calendar_events
DROP POLICY IF EXISTS "Users can view their own events" ON public.calendar_events;
CREATE POLICY "Users can view their own events"
    ON public.calendar_events FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own events" ON public.calendar_events;
CREATE POLICY "Users can insert their own events"
    ON public.calendar_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own events" ON public.calendar_events;
CREATE POLICY "Users can update their own events"
    ON public.calendar_events FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own events" ON public.calendar_events;
CREATE POLICY "Users can delete their own events"
    ON public.calendar_events FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_datetime ON public.calendar_events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_calendar_events_end_datetime ON public.calendar_events(end_datetime);
CREATE INDEX IF NOT EXISTS idx_calendar_categories_user_id ON public.calendar_categories(user_id);

-- Insert default categories trigger
CREATE OR REPLACE FUNCTION public.handle_new_user_calendar_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.calendar_categories (user_id, name, color, is_default, position)
    VALUES
    (NEW.id, 'Meetings', 'bg-orange-500', true, 0),
    (NEW.id, 'Tasks', 'bg-blue-500', true, 1),
    (NEW.id, 'Reminders', 'bg-gray-500', true, 2),
    (NEW.id, 'Personal', 'bg-green-500', true, 3);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add default categories for new users
-- Note: This assumes you want this behavior. If not, we can handle it in the frontend.
-- For now, I'll comment it out to be safe and handle defaults in the frontend or a separate script.
-- CREATE TRIGGER on_auth_user_created_calendar
--     AFTER INSERT ON auth.users
--     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_calendar_categories();
