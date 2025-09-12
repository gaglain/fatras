-- CRITICAL SECURITY FIX: Remove overly permissive RLS policies (Fixed version)
-- This fixes policies that allow any authenticated user to access all data

-- ============= Fix user_profiles table (high priority) =============
-- This table contains highly sensitive personal data
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert user profiles" ON public.user_profiles;

-- Create limited admin access only for super admins
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
-- Drop existing policies if they exist and recreate properly
DROP POLICY IF EXISTS "All authenticated users can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

-- Create secure notification policies
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============= Fix messaging_channel_members table =============
-- Remove overly permissive policies
DROP POLICY IF EXISTS "All authenticated users can manage all channel members" ON public.messaging_channel_members;

-- ============= Fix contact_list_members table =============
-- This table should only allow users to see their own contact list memberships
DROP POLICY IF EXISTS "All authenticated users can manage contact list members" ON public.contact_list_members;

-- Create user-specific policies for contact_list_members
CREATE POLICY "Users manage own contact list members"
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

-- ============= Remove any policies with 'true' conditions =============
-- These are the most dangerous as they allow any authenticated user to see all data

-- Check and fix specific tables that were mentioned in the security report
DO $$
BEGIN
    -- Fix any remaining overly permissive policies on critical tables
    -- Drop policies that use 'true' condition (allow all authenticated users)
    
    -- These are the most critical to fix immediately
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all tasks" ON public.tasks';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all events" ON public.events';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all campaigns" ON public.campaigns';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all opportunities" ON public.opportunities';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all publications" ON public.publications';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all forms" ON public.forms';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all roadshow_stops" ON public.roadshow_stops';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all event_types" ON public.event_types';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all centralized_artists" ON public.centralized_artists';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all centralized_events" ON public.centralized_events';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated users can manage all email_campaigns" ON public.email_campaigns';
    
EXCEPTION WHEN OTHERS THEN
    -- Continue if some policies don't exist
    NULL;
END $$;

-- ============= Ensure all critical tables have RLS enabled =============
DO $$
DECLARE
    table_record RECORD;
BEGIN
    -- Ensure RLS is enabled on all tables with user_id
    FOR table_record IN 
        SELECT DISTINCT t.table_name 
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
        WHERE t.table_schema = 'public' 
        AND c.column_name = 'user_id'
        AND t.table_type = 'BASE TABLE'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.table_name);
        EXCEPTION WHEN OTHERS THEN
            -- RLS may already be enabled
            NULL;
        END;
    END LOOP;
END $$;