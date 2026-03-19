-- When an event is linked to a roadshow_stop via roadshow_stop_events,
-- automatically set events.route_sheet_id to the roadshow_stop_id
CREATE OR REPLACE FUNCTION public.auto_link_route_sheet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE events
  SET route_sheet_id = NEW.roadshow_stop_id
  WHERE id = NEW.event_id
    AND (route_sheet_id IS NULL OR route_sheet_id != NEW.roadshow_stop_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_link_route_sheet
  AFTER INSERT ON public.roadshow_stop_events
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_route_sheet();

-- Also handle when a roadshow_stop_event is deleted: clear route_sheet_id
CREATE OR REPLACE FUNCTION public.auto_unlink_route_sheet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE events
  SET route_sheet_id = NULL
  WHERE id = OLD.event_id
    AND route_sheet_id = OLD.roadshow_stop_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_auto_unlink_route_sheet
  AFTER DELETE ON public.roadshow_stop_events
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_unlink_route_sheet();