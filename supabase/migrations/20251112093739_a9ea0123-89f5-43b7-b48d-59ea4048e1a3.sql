-- Collaborative visibility policies update
-- 1) Inbound emails: allow admins/managers to view shared org mailbox messages
DROP POLICY IF EXISTS "inbound_select_own" ON public.inbound_emails;
CREATE POLICY "Users view own inbound or admins/managers view shared mailboxes"
ON public.inbound_emails
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.email_accounts ea
    WHERE ea.is_organization_shared = true
      AND has_any_role(auth.uid(), ARRAY['super_admin','admin','manager']::app_role[])
      AND (
        lower(ea.email) = lower(public.inbound_emails.to_email)
        OR lower(ea.email) = lower(public.inbound_emails.from_email)
      )
  )
);

-- Keep existing INSERT/UPDATE/DELETE policies as-is (managed earlier)

-- 2) Emails (sent/received unified table): similar shared visibility
DROP POLICY IF EXISTS "emails_select_own" ON public.emails;
CREATE POLICY "Users view own emails or admins/managers view shared mailboxes"
ON public.emails
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.email_accounts ea
    WHERE ea.is_organization_shared = true
      AND has_any_role(auth.uid(), ARRAY['super_admin','admin','manager']::app_role[])
      AND (
        lower(ea.email) = lower(public.emails.to_email)
        OR lower(ea.email) = lower(public.emails.from_email)
      )
  )
);

-- 3) Show bible: managers/admins can view all docs
DROP POLICY IF EXISTS "show_bible_select_admins" ON public.show_bible_documents;
CREATE POLICY "Admins/managers can view show bible"
ON public.show_bible_documents
FOR SELECT
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['super_admin','admin','manager']::app_role[])
  OR user_id = auth.uid()
);

-- 4) Roadshow stops: members of lineup can view + admins/managers all
DROP POLICY IF EXISTS "roadshow_stops_select_members" ON public.roadshow_stops;
CREATE POLICY "View roadshow if owner, lineup member, or admin/manager"
ON public.roadshow_stops
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR has_any_role(auth.uid(), ARRAY['super_admin','admin','manager']::app_role[])
  OR EXISTS (
    SELECT 1
    FROM jsonb_array_elements(public.roadshow_stops.artist_lineup) AS lineup(value)
    WHERE (lineup.value ->> 'userId')::uuid = auth.uid()
  )
);

-- 5) Opportunities and quotes: admins/managers can view all (owners keep access)
DROP POLICY IF EXISTS "opportunities_select_admins" ON public.opportunities;
CREATE POLICY "Admins/managers can view opportunities"
ON public.opportunities
FOR SELECT
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['super_admin','admin','manager']::app_role[])
  OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "quotes_select_admins" ON public.quotes;
CREATE POLICY "Admins/managers can view quotes"
ON public.quotes
FOR SELECT
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['super_admin','admin','manager']::app_role[])
  OR user_id = auth.uid()
);
