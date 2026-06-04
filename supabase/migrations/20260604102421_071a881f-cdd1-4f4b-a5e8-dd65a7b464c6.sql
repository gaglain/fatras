-- Repair: for any event that has its own roadshow_stop linked via roadshow_stops.event_id,
-- realign events.route_sheet_id to that stop. Otherwise events with a stale shared
-- route_sheet_id were pulling another event's route sheet into Google Calendar.
UPDATE public.events e
SET route_sheet_id = rs.id
FROM public.roadshow_stops rs
WHERE rs.event_id = e.id
  AND (e.route_sheet_id IS NULL OR e.route_sheet_id <> rs.id);

-- Clear any route_sheet_id that points to a stop bound to a DIFFERENT event.
UPDATE public.events e
SET route_sheet_id = NULL
FROM public.roadshow_stops rs
WHERE e.route_sheet_id = rs.id
  AND rs.event_id IS NOT NULL
  AND rs.event_id <> e.id;