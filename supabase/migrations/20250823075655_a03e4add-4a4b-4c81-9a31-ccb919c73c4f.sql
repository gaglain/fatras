-- Fix infinite recursion in messaging channel members policies

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Channel owners and admins can manage members" ON public.messaging_channel_members;

-- Create a security definer function to check channel ownership/admin status
CREATE OR REPLACE FUNCTION public.check_channel_access(channel_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messaging_channels 
    WHERE id = channel_id_param AND user_id = user_id_param
  ) OR EXISTS (
    SELECT 1 FROM public.messaging_channel_members 
    WHERE channel_id = channel_id_param AND user_id = user_id_param AND role = 'admin'
  );
$$;

-- Create new policy using the security definer function
CREATE POLICY "Channel owners and admins can manage members" 
ON public.messaging_channel_members 
FOR ALL 
USING (
  public.check_channel_access(channel_id, auth.uid()) OR 
  user_id = auth.uid() -- Users can manage their own membership
);