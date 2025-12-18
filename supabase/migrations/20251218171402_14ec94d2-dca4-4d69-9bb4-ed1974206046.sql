-- Public front: allow visitors to read only public website settings keys
CREATE POLICY "Public can view public website settings"
ON public.app_settings
FOR SELECT
TO anon
USING (
  setting_key IN (
    'websiteConfig',
    'contact_email',
    'contact_phone',
    'address',
    'google_analytics_id'
  )
);

-- Public front: allow visitors to read visible menu items
CREATE POLICY "Public can view visible website menu"
ON public.website_menu
FOR SELECT
TO anon
USING (is_visible = true);