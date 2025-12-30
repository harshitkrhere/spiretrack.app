-- Fix @mention notifications to work with both username AND full_name
-- The original trigger only matched by username, but users often type full names

-- Drop and recreate the mention handler function
CREATE OR REPLACE FUNCTION public.handle_message_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mentioned_text text;
  mentioned_user_id uuid;
  sender_name text;
  team_name text;
  channel_name text;
BEGIN
  -- Skip for system messages
  IF NEW.is_system_message = true THEN
    RETURN NEW;
  END IF;

  -- Get sender info
  SELECT COALESCE(full_name, username, email) INTO sender_name
  FROM public.users WHERE id = NEW.user_id;
  
  -- Get team name
  SELECT name INTO team_name
  FROM public.teams WHERE id = NEW.team_id;
  
  -- Get channel name
  SELECT name INTO channel_name
  FROM public.team_channels WHERE id = NEW.channel_id;

  -- Find all @mentions in content (handles multi-word names with underscores or single words)
  FOR mentioned_text IN
    SELECT DISTINCT (regexp_matches(NEW.content, '@(\w+)', 'g'))[1]
  LOOP
    -- Skip special mentions like @team, @everyone, @channel, @here
    IF mentioned_text IN ('team', 'everyone', 'channel', 'here') THEN
      CONTINUE;
    END IF;
    
    -- Try to find user by:
    -- 1. Exact username match (case-insensitive)
    -- 2. Full name first word match (case-insensitive)
    -- 3. Full name contains match (case-insensitive)
    SELECT id INTO mentioned_user_id
    FROM public.users
    WHERE 
      -- Match on username
      LOWER(username) = LOWER(mentioned_text)
      -- OR match on first word of full_name
      OR LOWER(SPLIT_PART(full_name, ' ', 1)) = LOWER(mentioned_text)
    LIMIT 1;
    
    -- Only notify if:
    -- 1. User exists
    -- 2. User is a team member
    -- 3. User is not the sender
    IF mentioned_user_id IS NOT NULL 
       AND mentioned_user_id != NEW.user_id
       AND EXISTS (
         SELECT 1 FROM public.team_members 
         WHERE team_id = NEW.team_id AND user_id = mentioned_user_id
       )
    THEN
      -- Create notification
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body,
        link,
        metadata
      ) VALUES (
        mentioned_user_id,
        'mention',
        sender_name || ' mentioned you in ' || COALESCE(channel_name, 'chat'),
        LEFT(NEW.content, 100),  -- Preview of message
        '/app/team/' || NEW.team_id || '/chat',
        jsonb_build_object(
          'team_id', NEW.team_id,
          'channel_id', NEW.channel_id,
          'message_id', NEW.id,
          'sender_id', NEW.user_id
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists (re-create if needed)
DROP TRIGGER IF EXISTS trg_message_mentions ON public.team_messages;
CREATE TRIGGER trg_message_mentions
  AFTER INSERT ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_mentions();
