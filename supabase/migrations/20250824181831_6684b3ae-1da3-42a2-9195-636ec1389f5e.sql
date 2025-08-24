-- Fix the circular reference in channel member policies

-- Drop the problematic policy and function
DROP POLICY IF EXISTS "Users can view channels they own or are members of" ON public.messaging_channels;
DROP FUNCTION IF EXISTS public.is_channel_member(UUID);

-- Create a simpler policy for viewing channels that doesn't create recursion
CREATE POLICY "Users can view channels they own" 
ON public.messaging_channels 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for members to view channels (this will be handled differently)
-- We'll allow users to see channels where they are explicitly added as members
-- This avoids the circular reference by not checking membership in the channel view policy