-- Fix the infinite recursion issue completely

-- Drop all problematic policies
DROP POLICY IF EXISTS "Channel owners and admins can manage members" ON public.messaging_channel_members;
DROP POLICY IF EXISTS "Users can view members of channels they belong to" ON public.messaging_channel_members;

-- Update the check_channel_access function to avoid recursion
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
  );
$$;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view members of their own channels" 
ON public.messaging_channel_members 
FOR SELECT 
USING (
  channel_id IN (
    SELECT id FROM public.messaging_channels 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Channel owners can manage members" 
ON public.messaging_channel_members 
FOR ALL 
USING (
  public.check_channel_access(channel_id, auth.uid()) OR 
  user_id = auth.uid()
);

CREATE POLICY "Users can join/leave channels" 
ON public.messaging_channel_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());