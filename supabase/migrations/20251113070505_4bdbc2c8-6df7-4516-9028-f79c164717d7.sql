-- Collaborative view policies for manager/admin users
-- Allow all authenticated users to view shared data across the workspace

-- Contact Types: allow read for all authenticated users
CREATE POLICY "Authenticated users can view all contact types"
ON public.contact_types
FOR SELECT
TO authenticated
USING (true);

-- Contact Lists: allow read for all authenticated users
CREATE POLICY "Authenticated users can view all contact lists"
ON public.contact_lists
FOR SELECT
TO authenticated
USING (true);

-- Event Types: allow read for all authenticated users
CREATE POLICY "Authenticated users can view all event types"
ON public.event_types
FOR SELECT
TO authenticated
USING (true);

-- Centralized Artists (Spectacles): allow read for all authenticated users
CREATE POLICY "Authenticated users can view all centralized artists"
ON public.centralized_artists
FOR SELECT
TO authenticated
USING (true);

-- Campaigns: allow read for all authenticated users
CREATE POLICY "Authenticated users can view all campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (true);