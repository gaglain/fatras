-- Drop the existing policy for public viewing
DROP POLICY IF EXISTS "Public can view confirmed events" ON public.events;

-- Create new policy that allows viewing both confirmed and option events
CREATE POLICY "Public can view confirmed and option events" 
ON public.events 
FOR SELECT 
USING (status IN ('confirmed', 'option'));