-- =====================================================
-- Phase 2: @Mention Notification Trigger
-- Automatically creates notifications when users are mentioned in chat
-- =====================================================

-- Function to extract @mentions from message content and create notifications
CREATE OR REPLACE FUNCTION public.handle_message_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  mentioned_username text;
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

  -- Find all @username mentions in content
  FOR mentioned_username IN
    SELECT DISTINCT (regexp_matches(NEW.content, '@(\w+)', 'g'))[1]
  LOOP
    -- Skip special mentions like @team, @everyone, @channel, @here
    IF mentioned_username IN ('team', 'everyone', 'channel', 'here') THEN
      CONTINUE;
    END IF;
    
    -- Find user by username
    SELECT id INTO mentioned_user_id
    FROM public.users
    WHERE LOWER(username) = LOWER(mentioned_username);
    
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

-- Create trigger on team_messages INSERT
DROP TRIGGER IF EXISTS trg_message_mentions ON public.team_messages;
CREATE TRIGGER trg_message_mentions
  AFTER INSERT ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_mentions();

-- Also handle @team mentions (notify all team members)
CREATE OR REPLACE FUNCTION public.handle_team_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_name text;
  team_name text;
  channel_name text;
  member_record record;
BEGIN
  -- Skip for system messages
  IF NEW.is_system_message = true THEN
    RETURN NEW;
  END IF;
  
  -- Check if @team, @everyone, @channel, or @here is mentioned
  IF NEW.content !~* '@(team|everyone|channel|here)\b' THEN
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

  -- Notify all team members except sender
  FOR member_record IN
    SELECT user_id FROM public.team_members
    WHERE team_id = NEW.team_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      link,
      metadata
    ) VALUES (
      member_record.user_id,
      'mention',
      sender_name || ' mentioned @team in ' || COALESCE(channel_name, 'chat'),
      LEFT(NEW.content, 100),
      '/app/team/' || NEW.team_id || '/chat',
      jsonb_build_object(
        'team_id', NEW.team_id,
        'channel_id', NEW.channel_id,
        'message_id', NEW.id,
        'sender_id', NEW.user_id,
        'is_team_mention', true
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger for @team mentions
DROP TRIGGER IF EXISTS trg_team_mentions ON public.team_messages;
CREATE TRIGGER trg_team_mentions
  AFTER INSERT ON public.team_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_mentions();
