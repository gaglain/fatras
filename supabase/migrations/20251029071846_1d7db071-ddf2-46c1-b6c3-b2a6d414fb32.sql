-- Create contact_types table
CREATE TABLE IF NOT EXISTS public.contact_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own contact types"
ON public.contact_types
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add contact_type_id to contacts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' 
    AND column_name = 'contact_type_id'
  ) THEN
    ALTER TABLE public.contacts ADD COLUMN contact_type_id UUID REFERENCES public.contact_types(id);
  END IF;
END $$;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_contact_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_types_updated_at
BEFORE UPDATE ON public.contact_types
FOR EACH ROW
EXECUTE FUNCTION update_contact_types_updated_at();