-- Create a function that allows a user to confirm their own presence in a roadshow stop's artist_lineup
CREATE OR REPLACE FUNCTION public.confirm_roadshow_attendance(stop_id uuid, is_confirmed boolean DEFAULT true)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_lineup jsonb;
  updated_lineup jsonb := '[]'::jsonb;
  item jsonb;
  found boolean := false;
BEGIN
  -- Get the current artist_lineup
  SELECT artist_lineup INTO current_lineup
  FROM roadshow_stops
  WHERE id = stop_id;
  
  IF current_lineup IS NULL THEN
    RETURN false;
  END IF;
  
  -- Iterate and update the user's confirmed status
  FOR item IN SELECT * FROM jsonb_array_elements(current_lineup)
  LOOP
    IF (item->>'userId')::uuid = auth.uid() THEN
      updated_lineup := updated_lineup || jsonb_build_object('userId', auth.uid()::text, 'confirmed', is_confirmed);
      found := true;
    ELSE
      updated_lineup := updated_lineup || item;
    END IF;
  END LOOP;
  
  IF NOT found THEN
    RETURN false;
  END IF;
  
  -- Update the roadshow stop
  UPDATE roadshow_stops
  SET artist_lineup = updated_lineup
  WHERE id = stop_id;
  
  RETURN true;
END;
$$;
