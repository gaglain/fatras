-- CRITICAL SECURITY FIX: Remove all overly permissive RLS policies
-- This fixes policies that allow any authenticated user to access all data

-- ============= Fix user_profiles table =============
-- This table contains highly sensitive personal data
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert user profiles" ON public.user_profiles;

-- Create limited admin access only for specific admin functions
CREATE POLICY "Super admins can view all user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles admin_check
    WHERE admin_check.user_id = auth.uid() 
    AND admin_check.role = 'super_admin'
  )
);

-- ============= Fix notifications table =============
-- Ensure users only see their own notifications
DROP POLICY IF EXISTS "All authenticated users can manage all notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============= Fix messaging_channel_members table =============
-- Remove overly permissive policies
DROP POLICY IF EXISTS "All authenticated users can manage all channel members" ON public.messaging_channel_members;

-- Keep only the specific policies that are already secure
-- The existing policies "Channel owners can manage members", "Users can join channels", "Users can view channel members" are fine

-- ============= Ensure all other tables have proper user isolation =============

-- Double-check that all critical tables have proper RLS
-- These should already be fixed from previous migrations, but ensuring consistency

-- Fix any remaining overly permissive policies on critical tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Find and drop any policies with 'true' conditions on sensitive tables
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('tasks', 'events', 'campaigns', 'opportunities', 'publications', 'forms', 'roadshow_stops', 'event_types', 'centralized_artists', 'centralized_events', 'email_campaigns')
        AND quals = 'true'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
        
        -- Create replacement user-specific policy
        EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', 
                      'Users can manage their own ' || policy_record.tablename, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- ============= Create notifications table if it doesn't exist =============
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    data jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    read_at timestamptz
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============= Fix contact_list_members table =============
-- This table should only allow users to see their own contact list memberships
DROP POLICY IF EXISTS "All authenticated users can manage contact list members" ON public.contact_list_members;

-- Create user-specific policies for contact_list_members
CREATE POLICY "Users can manage their own contact list members"
ON public.contact_list_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contact_lists cl
    WHERE cl.id = contact_list_members.contact_list_id
    AND cl.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contact_lists cl
    WHERE cl.id = contact_list_members.contact_list_id
    AND cl.user_id = auth.uid()
  )
);

-- ============= Audit and fix any remaining security holes =============

-- Ensure all tables with user_id columns have proper RLS
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public' 
        AND c.column_name = 'user_id'
        AND t.table_type = 'BASE TABLE'
    LOOP
        -- Check if RLS is enabled
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON c.relnamespace = n.oid 
            WHERE n.nspname = 'public' 
            AND c.relname = table_name 
            AND c.relrowsecurity = true
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        END IF;
    END LOOP;
END $$;