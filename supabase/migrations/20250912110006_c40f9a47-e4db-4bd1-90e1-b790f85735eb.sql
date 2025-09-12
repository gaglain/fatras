-- FINAL COMPREHENSIVE SECURITY FIX
-- Remove ALL overly permissive RLS policies that allow any authenticated user to access all data

-- ============= Fix user_profiles table (Critical) =============
-- Drop the overly permissive policies completely
DROP POLICY IF EXISTS "All authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can insert profiles" ON public.profiles;

-- ============= Fix centralized_artists table (Critical) =============
DROP POLICY IF EXISTS "Enable all access for authenticated users on centralized_artists" ON public.centralized_artists;

-- Ensure proper user-specific policy exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'centralized_artists' AND table_schema = 'public') THEN
        EXECUTE 'CREATE POLICY "Users can manage their own artists" ON public.centralized_artists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Policy already exists, that's fine
    NULL;
END $$;

-- ============= Fix messaging_channels table (Critical) =============
DROP POLICY IF EXISTS "All authenticated users can manage all messaging channels" ON public.messaging_channels;

-- Create proper messaging channel policies
CREATE POLICY "Users can create messaging channels"
ON public.messaging_channels
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Channel owners can manage their channels"
ON public.messaging_channels
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- ============= Fix messaging_messages table (Critical) =============
DROP POLICY IF EXISTS "All authenticated users can manage all messages" ON public.messaging_messages;

-- These policies should already exist from previous migrations, but ensuring they're there:
DO $$
BEGIN
    -- Only create if not exists
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messaging_messages' AND policyname = 'Users can send messages to their channels') THEN
        EXECUTE 'CREATE POLICY "Users can send messages to their channels" ON public.messaging_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.messaging_channel_members WHERE channel_id = messaging_messages.channel_id AND user_id = auth.uid()))';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messaging_messages' AND policyname = 'Channel members can view messages') THEN
        EXECUTE 'CREATE POLICY "Channel members can view messages" ON public.messaging_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.messaging_channel_members WHERE channel_id = messaging_messages.channel_id AND user_id = auth.uid()))';
    END IF;
END $$;

-- ============= Comprehensive cleanup of all overly permissive policies =============
DO $$
DECLARE
    policy_rec RECORD;
    table_name text;
    policy_name text;
BEGIN
    -- Find ALL policies with 'true' conditions across all tables
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname, cmd
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND quals = 'true'  -- This means "any authenticated user can access"
    LOOP
        -- Drop the dangerous policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
        
        -- Only create a replacement if the table has a user_id column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = policy_rec.schemaname 
            AND table_name = policy_rec.tablename 
            AND column_name = 'user_id'
        ) THEN
            -- Create a secure replacement policy
            EXECUTE format('CREATE POLICY "Users can manage their own %s" ON %I.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', 
                          policy_rec.tablename,
                          policy_rec.schemaname, 
                          policy_rec.tablename);
        END IF;
    END LOOP;
    
    -- Also remove any policies that might have "authenticated" as the only condition
    FOR policy_rec IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (
            quals LIKE '%true%' 
            OR policyname LIKE '%all authenticated users%'
            OR policyname LIKE '%Enable all access%'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_rec.policyname, 
                      policy_rec.schemaname, 
                      policy_rec.tablename);
    END LOOP;
END $$;

-- ============= Ensure ALL tables with user_id have proper RLS =============
DO $$
DECLARE
    table_rec RECORD;
BEGIN
    FOR table_rec IN 
        SELECT DISTINCT t.table_name 
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
        WHERE t.table_schema = 'public' 
        AND c.column_name = 'user_id'
        AND t.table_type = 'BASE TABLE'
        AND t.table_name NOT IN ('profiles') -- Skip profiles table as it has different structure
    LOOP
        -- Enable RLS if not already enabled
        BEGIN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_rec.table_name);
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Already enabled
        END;
        
        -- Ensure there's at least one user-specific policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = table_rec.table_name 
            AND quals LIKE '%auth.uid() = user_id%'
        ) THEN
            BEGIN
                EXECUTE format('CREATE POLICY "Users can manage their own %s" ON public.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', 
                              table_rec.table_name, table_rec.table_name);
            EXCEPTION WHEN duplicate_object THEN
                NULL; -- Policy already exists
            END;
        END IF;
    END LOOP;
END $$;