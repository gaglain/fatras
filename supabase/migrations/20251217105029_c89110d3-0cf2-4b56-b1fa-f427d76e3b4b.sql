-- Allow public read access to published website pages
CREATE POLICY "Anyone can view published website pages"
ON public.website_pages
FOR SELECT
USING (status = 'published');