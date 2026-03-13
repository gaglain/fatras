-- Remove the permissive INSERT policy that allows any authenticated user to create events
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;

-- Create a restrictive INSERT policy: only admin, manager, collaborator can create
CREATE POLICY "Non-artist users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role, 'collaborator'::app_role])
  );

-- Update the UPDATE policy to also exclude artistes
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
CREATE POLICY "Non-artist users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role, 'collaborator'::app_role])
  )
  WITH CHECK (
    auth.uid() = user_id
    AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role, 'collaborator'::app_role])
  );

-- Update DELETE policy similarly
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
CREATE POLICY "Non-artist users can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND has_any_role(auth.uid(), ARRAY['super_admin'::app_role, 'admin'::app_role, 'manager'::app_role, 'collaborator'::app_role])
  );
