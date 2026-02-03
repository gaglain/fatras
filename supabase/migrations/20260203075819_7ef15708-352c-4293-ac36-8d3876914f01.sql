-- Ajouter les coordonnées GPS à la table roadshow_stops
ALTER TABLE public.roadshow_stops
ADD COLUMN IF NOT EXISTS latitude double precision,
ADD COLUMN IF NOT EXISTS longitude double precision;

-- Créer un index spatial pour les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_roadshow_stops_coordinates 
ON public.roadshow_stops (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Ajouter les colonnes pour le calcul des frais de route
ALTER TABLE public.roadshow_stops
ADD COLUMN IF NOT EXISTS vehicle_type text,
ADD COLUMN IF NOT EXISTS distance_km numeric(10,2);

COMMENT ON COLUMN public.roadshow_stops.latitude IS 'Latitude GPS de l''étape';
COMMENT ON COLUMN public.roadshow_stops.longitude IS 'Longitude GPS de l''étape';
COMMENT ON COLUMN public.roadshow_stops.vehicle_type IS 'Type de véhicule pour le calcul des frais de route';
COMMENT ON COLUMN public.roadshow_stops.distance_km IS 'Distance en km depuis l''étape précédente';

-- Créer une table pour les tarifs par véhicule
CREATE TABLE IF NOT EXISTS public.vehicle_rates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  vehicle_name text NOT NULL,
  rate_per_km numeric(10,4) NOT NULL DEFAULT 0.50,
  fixed_cost numeric(10,2) DEFAULT 0,
  description text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_rates ENABLE ROW LEVEL SECURITY;

-- Policies for vehicle_rates
CREATE POLICY "Users can view their own vehicle rates" 
ON public.vehicle_rates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vehicle rates" 
ON public.vehicle_rates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicle rates" 
ON public.vehicle_rates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicle rates" 
ON public.vehicle_rates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_vehicle_rates_updated_at
BEFORE UPDATE ON public.vehicle_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();