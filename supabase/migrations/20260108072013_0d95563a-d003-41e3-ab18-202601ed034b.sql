-- Fix overly permissive RLS policies that use USING (true) for UPDATE/DELETE/ALL operations
-- These policies should restrict access to the owner (user_id = auth.uid())

-- 1. contact_list_members - fix ALL policy
DROP POLICY IF EXISTS "Authenticated users can manage all contact list members" ON public.contact_list_members;
CREATE POLICY "Users can manage their contact list members" ON public.contact_list_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl 
      WHERE cl.id = contact_list_members.contact_list_id 
      AND cl.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl 
      WHERE cl.id = contact_list_members.contact_list_id 
      AND cl.user_id = auth.uid()
    )
  );

-- 2. contact_lists - fix ALL policy  
DROP POLICY IF EXISTS "Authenticated users can manage all contact lists" ON public.contact_lists;
CREATE POLICY "Users can manage their contact lists" ON public.contact_lists
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. contact_types - fix ALL policy
DROP POLICY IF EXISTS "Authenticated users can manage all contact types" ON public.contact_types;
CREATE POLICY "Users can manage their contact types" ON public.contact_types
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. email_campaigns - fix ALL policy
DROP POLICY IF EXISTS "Authenticated users can manage all email campaigns" ON public.email_campaigns;
CREATE POLICY "Users can manage their email campaigns" ON public.email_campaigns
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. email_templates - fix UPDATE and DELETE policies
DROP POLICY IF EXISTS "Authenticated users can delete email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Authenticated users can update email templates" ON public.email_templates;
CREATE POLICY "Users can update their email templates" ON public.email_templates
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their email templates" ON public.email_templates
  FOR DELETE USING (user_id = auth.uid());

-- 6. publications - fix UPDATE and DELETE policies
DROP POLICY IF EXISTS "Authenticated users can delete all publications" ON public.publications;
DROP POLICY IF EXISTS "Authenticated users can update all publications" ON public.publications;
CREATE POLICY "Users can update their publications" ON public.publications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their publications" ON public.publications
  FOR DELETE USING (user_id = auth.uid());

-- 7. quote_templates - fix ALL policy
DROP POLICY IF EXISTS "Authenticated users can manage all quote templates" ON public.quote_templates;
CREATE POLICY "Users can manage their quote templates" ON public.quote_templates
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. quotes - fix UPDATE and DELETE policies
DROP POLICY IF EXISTS "Authenticated users can delete all quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated users can update all quotes" ON public.quotes;
CREATE POLICY "Users can update their quotes" ON public.quotes
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their quotes" ON public.quotes
  FOR DELETE USING (user_id = auth.uid());

-- 9. roadshow_expenses - fix UPDATE and DELETE policies
DROP POLICY IF EXISTS "Authenticated users can delete roadshow expenses" ON public.roadshow_expenses;
DROP POLICY IF EXISTS "Authenticated users can update roadshow expenses" ON public.roadshow_expenses;
CREATE POLICY "Users can update their roadshow expenses" ON public.roadshow_expenses
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their roadshow expenses" ON public.roadshow_expenses
  FOR DELETE USING (user_id = auth.uid());

-- 10. roadshow_stops - fix UPDATE and DELETE policies
DROP POLICY IF EXISTS "Authenticated users can delete all roadshow stops" ON public.roadshow_stops;
DROP POLICY IF EXISTS "Authenticated users can update all roadshow stops" ON public.roadshow_stops;
CREATE POLICY "Users can update their roadshow stops" ON public.roadshow_stops
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their roadshow stops" ON public.roadshow_stops
  FOR DELETE USING (user_id = auth.uid());

-- 11. tasks - fix UPDATE and DELETE policies
DROP POLICY IF EXISTS "Authenticated users can delete all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Authenticated users can update all tasks" ON public.tasks;
CREATE POLICY "Users can update their tasks" ON public.tasks
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their tasks" ON public.tasks
  FOR DELETE USING (user_id = auth.uid());

-- Note: form_submissions and public_chat_messages with INSERT (true) are intentionally public
-- form_submissions: allows anonymous form submissions
-- public_chat_messages: allows visitors to send messages