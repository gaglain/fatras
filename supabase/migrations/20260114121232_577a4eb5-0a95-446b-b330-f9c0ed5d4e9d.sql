-- Delete orphaned messaging channels (channels linked to deleted roadshow_stops)
DELETE FROM messaging_channels 
WHERE roadshow_id IS NOT NULL 
AND NOT EXISTS (SELECT 1 FROM roadshow_stops WHERE roadshow_stops.id = messaging_channels.roadshow_id);

-- Create a trigger to automatically delete messaging channels when a roadshow_stop is deleted
CREATE OR REPLACE FUNCTION public.cleanup_roadshow_channel()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the associated messaging channel when a roadshow_stop is deleted
  DELETE FROM messaging_channels WHERE roadshow_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_roadshow_stop_delete_cleanup_channel ON roadshow_stops;

CREATE TRIGGER on_roadshow_stop_delete_cleanup_channel
  BEFORE DELETE ON roadshow_stops
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_roadshow_channel();