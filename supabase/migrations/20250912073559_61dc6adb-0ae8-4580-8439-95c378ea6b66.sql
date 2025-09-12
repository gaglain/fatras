-- Fix critical security issues with profiles and user_profiles tables
-- Update RLS policies to restrict access to user-owned data only

-- ============= Fix profiles table RLS policies =============
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "All authenticated users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can insert profiles" ON public.profiles;

-- Create secure user-specific policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============= Fix user_profiles table RLS policies =============
-- Drop existing overly permissive policies if they exist
DROP POLICY IF EXISTS "All authenticated users can manage all user profiles" ON public.user_profiles;

-- Create secure user-specific policies for user_profiles table
CREATE POLICY "Users can view their own user profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own user profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all profiles for administrative purposes
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles admin_check
    WHERE admin_check.user_id = auth.uid() 
    AND admin_check.role IN ('admin', 'super_admin')
  )
);

-- ============= Fix contacts table RLS policies =============
-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Enable all access for authenticated users on contacts" ON public.contacts;

-- Create user-specific contact policies
CREATE POLICY "Users can manage their own contacts"
ON public.contacts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= Fix email_accounts table RLS policies =============
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.email_accounts;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.email_accounts;
DROP POLICY IF EXISTS "Enable update for all users" ON public.email_accounts;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.email_accounts;

-- Create user-specific email account policies
CREATE POLICY "Users can manage their own email accounts"
ON public.email_accounts
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= Fix inbound_emails table RLS policies =============
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.inbound_emails;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.inbound_emails;
DROP POLICY IF EXISTS "Enable update for all users" ON public.inbound_emails;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.inbound_emails;

-- Create user-specific inbound email policies
CREATE POLICY "Users can manage their own inbound emails"
ON public.inbound_emails
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= Fix messaging tables RLS policies =============
-- Update messaging_channels policies to be more restrictive
DROP POLICY IF EXISTS "All authenticated users can manage all messaging channels" ON public.messaging_channels;

CREATE POLICY "Users can manage their own channels"
ON public.messaging_channels
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Channel members can view channels"
ON public.messaging_channels
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = messaging_channels.id 
    AND user_id = auth.uid()
  )
);

-- Update messaging_messages policies to be more restrictive
DROP POLICY IF EXISTS "All authenticated users can manage all messages" ON public.messaging_messages;

CREATE POLICY "Users can send messages to their channels"
ON public.messaging_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = messaging_messages.channel_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Channel members can view messages"
ON public.messaging_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.messaging_channel_members
    WHERE channel_id = messaging_messages.channel_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.messaging_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.messaging_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============= Fix website management tables =============
-- Update website_pages policies to be user-specific
DROP POLICY IF EXISTS "All authenticated users can manage all website pages" ON public.website_pages;

CREATE POLICY "Users can manage their own website pages"
ON public.website_pages
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update website_menu policies to be user-specific
DROP POLICY IF EXISTS "All authenticated users can manage all website menu" ON public.website_menu;

CREATE POLICY "Users can manage their own website menu"
ON public.website_menu
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============= Fix app_settings table =============
-- Update app_settings policies to be user-specific
DROP POLICY IF EXISTS "All authenticated users can manage all app settings" ON public.app_settings;

CREATE POLICY "Users can manage their own app settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);