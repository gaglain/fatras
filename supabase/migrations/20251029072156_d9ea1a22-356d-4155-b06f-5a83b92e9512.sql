-- Fix search_path security issue for update_contact_types_updated_at function
CREATE OR REPLACE FUNCTION update_contact_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;