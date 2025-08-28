-- Create opportunities table with relationships
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  location TEXT,
  date DATE,
  budget NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'applied', 'won', 'lost')),
  deadline DATE,
  requirements TEXT,
  contact TEXT,
  -- Relations
  artist_id UUID,
  contact_id UUID,
  event_id UUID,
  task_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS only if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'opportunities' AND schemaname = 'public'
  ) THEN
    ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Users can manage own opportunities"
    ON public.opportunities
    FOR ALL
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Update trigger for opportunities
CREATE OR REPLACE FUNCTION public.update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_opportunities_updated_at ON public.opportunities;
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_opportunities_updated_at();