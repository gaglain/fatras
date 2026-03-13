-- Drop the overly permissive SELECT policy that allows all authenticated users to see all stops
DROP POLICY IF EXISTS "Authenticated users can view all roadshow stops" ON public.roadshow_stops;
