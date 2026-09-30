CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT _user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) $$;
REVOKE ALL ON FUNCTION public.is_team_member(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid) TO authenticated;

DROP POLICY IF EXISTS "Allow authenticated read app_settings" ON public.app_settings;
CREATE POLICY "Team read app_settings" ON public.app_settings FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all organization calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Allow authenticated read calendar_events" ON public.calendar_events;
CREATE POLICY "Team read calendar_events" ON public.calendar_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all campaigns" ON public.campaigns;
CREATE POLICY "Team read campaigns" ON public.campaigns FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all centralized artists" ON public.centralized_artists;
CREATE POLICY "Team read centralized_artists" ON public.centralized_artists FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all centralized events" ON public.centralized_events;
DROP POLICY IF EXISTS "Allow authenticated read centralized_events" ON public.centralized_events;
CREATE POLICY "Team read centralized_events" ON public.centralized_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all contact list members" ON public.contact_list_members;
CREATE POLICY "Team read contact_list_members" ON public.contact_list_members FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all contact lists" ON public.contact_lists;
CREATE POLICY "Team read contact_lists" ON public.contact_lists FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all contact types" ON public.contact_types;
CREATE POLICY "Team read contact_types" ON public.contact_types FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all email templates" ON public.email_templates;
CREATE POLICY "Team read email_templates" ON public.email_templates FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all event types" ON public.event_types;
CREATE POLICY "Team read event_types" ON public.event_types FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Allow authenticated read events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON public.events;
CREATE POLICY "Team read events" ON public.events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all publications" ON public.publications;
CREATE POLICY "Team read publications" ON public.publications FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all quote templates" ON public.quote_templates;
CREATE POLICY "Team read quote_templates" ON public.quote_templates FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all quotes" ON public.quotes;
CREATE POLICY "Team read quotes" ON public.quotes FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all roadshow expenses" ON public.roadshow_expenses;
CREATE POLICY "Team read roadshow_expenses" ON public.roadshow_expenses FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage stop vehicles" ON public.roadshow_stop_vehicles;
CREATE POLICY "Team manage stop vehicles" ON public.roadshow_stop_vehicles FOR ALL TO authenticated USING (public.is_team_member(auth.uid())) WITH CHECK (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;
CREATE POLICY "Team read role_permissions" ON public.role_permissions FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view all tasks" ON public.tasks;
CREATE POLICY "Team read tasks" ON public.tasks FOR SELECT TO authenticated USING (public.is_team_member(auth.uid()));