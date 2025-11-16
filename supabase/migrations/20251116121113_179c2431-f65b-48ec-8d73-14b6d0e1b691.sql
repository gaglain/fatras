-- Add artist_id and event_id to contact_lists table
ALTER TABLE public.contact_lists
ADD COLUMN artist_id uuid REFERENCES public.centralized_artists(id) ON DELETE SET NULL,
ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_contact_lists_artist_id ON public.contact_lists(artist_id);
CREATE INDEX idx_contact_lists_event_id ON public.contact_lists(event_id);

-- Add comments for documentation
COMMENT ON COLUMN public.contact_lists.artist_id IS 'Optional link to an artist';
COMMENT ON COLUMN public.contact_lists.event_id IS 'Optional link to an event/spectacle';