-- Add CO2 emission factor per km to vehicle rates
ALTER TABLE public.vehicle_rates ADD COLUMN IF NOT EXISTS co2_per_km NUMERIC DEFAULT 0.21;

COMMENT ON COLUMN public.vehicle_rates.co2_per_km IS 'CO2 emission in kg per km for this vehicle type';