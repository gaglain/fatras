-- Add artist_id and event_id to publications table
ALTER TABLE public.publications
ADD COLUMN artist_id uuid REFERENCES public.centralized_artists(id) ON DELETE SET NULL,
ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;

-- Add artist_id and event_id to email_campaigns table
ALTER TABLE public.email_campaigns
ADD COLUMN artist_id uuid REFERENCES public.centralized_artists(id) ON DELETE SET NULL,
ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_publications_artist_id ON public.publications(artist_id);
CREATE INDEX idx_publications_event_id ON public.publications(event_id);
CREATE INDEX idx_email_campaigns_artist_id ON public.email_campaigns(artist_id);
CREATE INDEX idx_email_campaigns_event_id ON public.email_campaigns(event_id);

-- Add comments for documentation
COMMENT ON COLUMN public.publications.artist_id IS 'Optional link to an artist';
COMMENT ON COLUMN public.publications.event_id IS 'Optional link to an event/spectacle';
COMMENT ON COLUMN public.email_campaigns.artist_id IS 'Optional link to an artist';
COMMENT ON COLUMN public.email_campaigns.event_id IS 'Optional link to an event/spectacle';