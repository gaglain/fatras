-- Fix security issues: Enable RLS on opportunities table and set search_path for functions
DO $$
BEGIN
  -- Enable RLS on opportunities if not already enabled
  BEGIN
    ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'opportunities' 
      AND policyname = 'Users can manage own opportunities'
    ) THEN
      CREATE POLICY "Users can manage own opportunities"
      ON public.opportunities
      FOR ALL
      USING (auth.uid() = user_id);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- RLS might already be enabled, continue
    NULL;
  END;
END $$;

-- Fix search_path for functions
CREATE OR REPLACE FUNCTION public.update_opportunities_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;