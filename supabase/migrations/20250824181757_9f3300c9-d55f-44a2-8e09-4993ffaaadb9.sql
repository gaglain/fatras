-- Fix all infinite recursion issues in messaging policies

-- Drop ALL problematic policies on both tables
DROP POLICY IF EXISTS "Users can view channels they are members of" ON public.messaging_channels;
DROP POLICY IF EXISTS "Channel owners can delete their channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Channel owners can update their channels" ON public.messaging_channels;
DROP POLICY IF EXISTS "Users can create their own channels" ON public.messaging_channels;

DROP POLICY IF EXISTS "Users can view members of their own channels" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Channel owners can manage members" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Users can join/leave channels" ON public.messaging_channel_members;

-- Create a simple function to check if user is channel owner
CREATE OR REPLACE FUNCTION public.is_channel_owner(channel_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messaging_channels 
    WHERE id = channel_id_param AND user_id = auth.uid()
  );
$$;

-- Create a simple function to check if user is channel member
CREATE OR REPLACE FUNCTION public.is_channel_member(channel_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messaging_channel_members 
    WHERE channel_id = channel_id_param AND user_id = auth.uid()
  );
$$;

-- Recreate all policies without recursion
-- Policies for messaging_channels
CREATE POLICY "Users can create their own channels" 
ON public.messaging_channels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Channel owners can update their channels" 
ON public.messaging_channels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Channel owners can delete their channels" 
ON public.messaging_channels 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view channels they own or are members of" 
ON public.messaging_channels 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.is_channel_member(id)
);

-- Policies for messaging_channel_members
CREATE POLICY "Users can view channel members" 
ON public.messaging_channel_members 
FOR SELECT 
USING (public.is_channel_owner(channel_id));

CREATE POLICY "Channel owners can manage members" 
ON public.messaging_channel_members 
FOR ALL 
USING (public.is_channel_owner(channel_id));

CREATE POLICY "Users can join channels" 
ON public.messaging_channel_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);