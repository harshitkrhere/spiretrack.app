-- Trigger to call send-mention-email Edge Function when a mention notification is created

-- Create or replace function to call the Edge Function
CREATE OR REPLACE FUNCTION public.notify_mention_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
BEGIN
  -- Only process mention notifications
  IF NEW.type != 'mention' THEN
    RETURN NEW;
  END IF;

  -- Get configuration (these need to be set as database secrets)
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- If config not set, skip (Edge Function will be called manually or via webhook)
  IF supabase_url IS NULL OR service_role_key IS NULL THEN
    RAISE NOTICE 'Supabase URL or service role key not configured for Edge Function calls';
    RETURN NEW;
  END IF;

  -- Call the Edge Function asynchronously using pg_net extension
  -- Note: This requires pg_net extension to be enabled
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/send-mention-email',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'type', NEW.type,
      'title', NEW.title,
      'body', NEW.body,
      'link', NEW.link,
      'metadata', NEW.metadata
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the insert if email fails
    RAISE NOTICE 'Failed to call send-mention-email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on notifications table (if not exists)
DROP TRIGGER IF EXISTS trg_notify_mention_email ON public.notifications;
CREATE TRIGGER trg_notify_mention_email
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_mention_email();

-- Add comment
COMMENT ON FUNCTION public.notify_mention_email() IS 'Calls send-mention-email Edge Function when a mention notification is created';
