-- Fix remaining RLS policies that weren't properly updated
-- Ensure all tables have proper user-specific access control

-- ============= Fix remaining tables with overly permissive policies =============

-- Fix forms table
DROP POLICY IF EXISTS "All authenticated users can manage all forms" ON public.forms;
CREATE POLICY "Users can manage their own forms"
ON public.forms
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix campaigns table  
DROP POLICY IF EXISTS "Enable all access for authenticated users on campaigns" ON public.campaigns;
CREATE POLICY "Users can manage their own campaigns"
ON public.campaigns
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix centralized_events table
DROP POLICY IF EXISTS "Enable all access for authenticated users on centralized_events" ON public.centralized_events;
CREATE POLICY "Users can manage their own centralized events"
ON public.centralized_events
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix roadshow_stops table
DROP POLICY IF EXISTS "Enable all access for authenticated users on roadshow_stops" ON public.roadshow_stops;
CREATE POLICY "Users can manage their own roadshow stops"
ON public.roadshow_stops
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix events table
DROP POLICY IF EXISTS "Enable all access for authenticated users on events" ON public.events;
CREATE POLICY "Users can manage their own events"
ON public.events
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix opportunities table
DROP POLICY IF EXISTS "Enable all access for authenticated users on opportunities" ON public.opportunities;
CREATE POLICY "Users can manage their own opportunities"
ON public.opportunities
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix tasks table
DROP POLICY IF EXISTS "Enable all access for authenticated users on tasks" ON public.tasks;
CREATE POLICY "Users can manage their own tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix publications table
DROP POLICY IF EXISTS "Enable all access for authenticated users on publications" ON public.publications;
CREATE POLICY "Users can manage their own publications"
ON public.publications
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix event_types table
DROP POLICY IF EXISTS "Enable all access for authenticated users on event_types" ON public.event_types;
CREATE POLICY "Users can manage their own event types"
ON public.event_types
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix email_campaigns table
DROP POLICY IF EXISTS "Enable all access for authenticated users on email_campaigns" ON public.email_campaigns;
CREATE POLICY "Users can manage their own email campaigns"
ON public.email_campaigns
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix quotes table
DROP POLICY IF EXISTS "Enable all access for authenticated users on quotes" ON public.quotes;
CREATE POLICY "Users can manage their own quotes"
ON public.quotes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix centralized_artists table (assuming it exists)
-- We need to ensure artists table has proper RLS too
CREATE TABLE IF NOT EXISTS public.centralized_artists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    bio text,
    genre text,
    contact_info jsonb DEFAULT '{}',
    social_links jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on centralized_artists if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'centralized_artists' AND table_schema = 'public') THEN
        ALTER TABLE public.centralized_artists ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage their own artists" ON public.centralized_artists;
        CREATE POLICY "Users can manage their own artists"
        ON public.centralized_artists
        FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;