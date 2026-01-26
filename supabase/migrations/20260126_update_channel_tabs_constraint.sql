-- Drop existing check constraint if it exists
ALTER TABLE "public"."channel_tabs" DROP CONSTRAINT IF EXISTS "channel_tabs_type_check";

-- Add updated check constraint with all required types
ALTER TABLE "public"."channel_tabs" 
ADD CONSTRAINT "channel_tabs_type_check" 
CHECK (type IN ('messages', 'overview', 'tasks', 'files', 'execution', 'decisions', 'announcements'));
