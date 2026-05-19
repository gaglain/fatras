CREATE OR REPLACE FUNCTION public.confirm_roadshow_attendance(stop_id uuid, is_confirmed boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_lineup jsonb;
  updated_lineup jsonb := '[]'::jsonb;
  item jsonb;
  merged jsonb;
  found boolean := false;
BEGIN
  SELECT artist_lineup INTO current_lineup
  FROM roadshow_stops
  WHERE id = stop_id;

  IF current_lineup IS NULL THEN
    RETURN false;
  END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(current_lineup)
  LOOP
    IF (item->>'userId')::uuid = auth.uid() THEN
      merged := item || jsonb_build_object(
        'userId', auth.uid()::text,
        'confirmed', is_confirmed,
        'declined', NOT is_confirmed
      );
      updated_lineup := updated_lineup || merged;
      found := true;
    ELSE
      updated_lineup := updated_lineup || item;
    END IF;
  END LOOP;

  IF NOT found THEN
    RETURN false;
  END IF;

  UPDATE roadshow_stops
  SET artist_lineup = updated_lineup
  WHERE id = stop_id;

  RETURN true;
END;
$function$;