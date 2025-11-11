-- Modifier les policies RLS pour calendar_events pour une vue partagée de l'organisation

-- Supprimer les anciennes policies restrictives
DROP POLICY IF EXISTS "Users can view their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can create their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON calendar_events;

-- Créer de nouvelles policies pour une vue partagée de l'organisation
CREATE POLICY "Authenticated users can view all organization calendar events"
ON calendar_events
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create calendar events"
ON calendar_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update all calendar events"
ON calendar_events
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete all calendar events"
ON calendar_events
FOR DELETE
TO authenticated
USING (true);