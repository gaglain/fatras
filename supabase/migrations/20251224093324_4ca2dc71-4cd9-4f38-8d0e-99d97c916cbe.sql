-- =====================================================
-- MIGRATION SÉCURITÉ: Correction des RLS permissives
-- =====================================================

-- 1. TABLE: emails - Supprimer la policy trop permissive
DROP POLICY IF EXISTS "Allow authenticated read emails" ON public.emails;

-- 2. TABLE: inbound_emails - Supprimer la policy trop permissive  
DROP POLICY IF EXISTS "Allow authenticated read inbound_emails" ON public.inbound_emails;

-- 3. TABLE: contacts - Remplacer les policies "authenticated" par des restrictions user_id
DROP POLICY IF EXISTS "Authenticated users can view all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can update all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can delete all contacts" ON public.contacts;
DROP POLICY IF EXISTS "Authenticated users can create contacts" ON public.contacts;

CREATE POLICY "Users can view own contacts" ON public.contacts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts" ON public.contacts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON public.contacts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON public.contacts
FOR DELETE USING (auth.uid() = user_id);

-- 4. TABLE: events - Restreindre update/delete au propriétaire
DROP POLICY IF EXISTS "Authenticated users can update all events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can delete all events" ON public.events;

CREATE POLICY "Users can update own events" ON public.events
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON public.events
FOR DELETE USING (auth.uid() = user_id);

-- 5. TABLE: centralized_events - Restreindre update/delete au propriétaire
DROP POLICY IF EXISTS "Authenticated users can update all centralized events" ON public.centralized_events;
DROP POLICY IF EXISTS "Authenticated users can delete all centralized events" ON public.centralized_events;

CREATE POLICY "Users can update own centralized events" ON public.centralized_events
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own centralized events" ON public.centralized_events
FOR DELETE USING (auth.uid() = user_id);

-- 6. TABLE: calendar_events - Restreindre update/delete au propriétaire
DROP POLICY IF EXISTS "Authenticated users can update all calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Authenticated users can delete all calendar events" ON public.calendar_events;

CREATE POLICY "Users can update own calendar events" ON public.calendar_events
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON public.calendar_events
FOR DELETE USING (auth.uid() = user_id);

-- 7. TABLE: public_chat_messages - Restreindre lecture par visitor_id
DROP POLICY IF EXISTS "Visitors read own messages" ON public.public_chat_messages;

CREATE POLICY "Visitors read own messages by visitor_id" ON public.public_chat_messages
FOR SELECT USING (
  visitor_id = current_setting('request.headers', true)::json->>'x-visitor-id'
  OR has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role])
);

-- 8. TABLE: opportunities - Restreindre au propriétaire
DROP POLICY IF EXISTS "Authenticated users can view all opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can update all opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated users can delete all opportunities" ON public.opportunities;

CREATE POLICY "Users can view own opportunities" ON public.opportunities
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own opportunities" ON public.opportunities
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own opportunities" ON public.opportunities
FOR DELETE USING (auth.uid() = user_id);