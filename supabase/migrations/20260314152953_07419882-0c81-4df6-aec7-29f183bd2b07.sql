-- Add is_archived column to roadshow_stops
ALTER TABLE public.roadshow_stops 
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Replace the cleanup trigger: archive channel instead of deleting
CREATE OR REPLACE FUNCTION public.archive_roadshow_channel()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  -- When a roadshow_stop is archived, also archive the linked messaging channel
  IF NEW.is_archived = true AND (OLD.is_archived = false OR OLD.is_archived IS NULL) THEN
    UPDATE messaging_channels SET is_active = false WHERE roadshow_id = NEW.id;
  END IF;
  -- When a roadshow_stop is un-archived, re-activate the channel
  IF NEW.is_archived = false AND OLD.is_archived = true THEN
    UPDATE messaging_channels SET is_active = true WHERE roadshow_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_archive_roadshow_channel ON public.roadshow_stops;
CREATE TRIGGER trigger_archive_roadshow_channel
  AFTER UPDATE OF is_archived ON public.roadshow_stops
  FOR EACH ROW
  EXECUTE FUNCTION public.archive_roadshow_channel();