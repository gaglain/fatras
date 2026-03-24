-- Create table for multiple vehicles per roadshow stop
CREATE TABLE public.roadshow_stop_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadshow_stop_id uuid NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  vehicle_name text NOT NULL,
  distance_km numeric DEFAULT 0,
  departure_address text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roadshow_stop_vehicles ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users can manage vehicles on stops they can see
CREATE POLICY "Authenticated users can manage stop vehicles"
  ON public.roadshow_stop_vehicles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER update_roadshow_stop_vehicles_updated_at
  BEFORE UPDATE ON public.roadshow_stop_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing single vehicle data to the new table
INSERT INTO public.roadshow_stop_vehicles (roadshow_stop_id, vehicle_name, distance_km, departure_address)
SELECT id, vehicle_type, distance_km, departure_address
FROM public.roadshow_stops
WHERE vehicle_type IS NOT NULL AND vehicle_type != '';