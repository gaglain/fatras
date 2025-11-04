-- Create junction tables for roadshow stops relationships

-- Table for linking roadshow stops to contacts
CREATE TABLE IF NOT EXISTS public.roadshow_stop_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  role TEXT, -- e.g., 'organizer', 'technical', 'local_contact'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(roadshow_stop_id, contact_id)
);

-- Table for linking roadshow stops to events
CREATE TABLE IF NOT EXISTS public.roadshow_stop_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(roadshow_stop_id, event_id)
);

-- Table for linking roadshow stops to quotes
CREATE TABLE IF NOT EXISTS public.roadshow_stop_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(roadshow_stop_id, quote_id)
);

-- Table for linking roadshow stops to contracts (if contracts table exists)
CREATE TABLE IF NOT EXISTS public.roadshow_stop_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  contract_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(roadshow_stop_id, contract_id)
);

-- Enable RLS on all junction tables
ALTER TABLE public.roadshow_stop_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadshow_stop_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadshow_stop_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadshow_stop_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roadshow_stop_contacts
CREATE POLICY "Users can manage their roadshow stop contacts"
  ON public.roadshow_stop_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadshow_stops rs
      WHERE rs.id = roadshow_stop_contacts.roadshow_stop_id
      AND rs.user_id = auth.uid()
    )
  );

-- RLS Policies for roadshow_stop_events
CREATE POLICY "Users can manage their roadshow stop events"
  ON public.roadshow_stop_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadshow_stops rs
      WHERE rs.id = roadshow_stop_events.roadshow_stop_id
      AND rs.user_id = auth.uid()
    )
  );

-- RLS Policies for roadshow_stop_quotes
CREATE POLICY "Users can manage their roadshow stop quotes"
  ON public.roadshow_stop_quotes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadshow_stops rs
      WHERE rs.id = roadshow_stop_quotes.roadshow_stop_id
      AND rs.user_id = auth.uid()
    )
  );

-- RLS Policies for roadshow_stop_contracts
CREATE POLICY "Users can manage their roadshow stop contracts"
  ON public.roadshow_stop_contracts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.roadshow_stops rs
      WHERE rs.id = roadshow_stop_contracts.roadshow_stop_id
      AND rs.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_contacts_roadshow ON public.roadshow_stop_contacts(roadshow_stop_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_contacts_contact ON public.roadshow_stop_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_events_roadshow ON public.roadshow_stop_events(roadshow_stop_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_events_event ON public.roadshow_stop_events(event_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_quotes_roadshow ON public.roadshow_stop_quotes(roadshow_stop_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_quotes_quote ON public.roadshow_stop_quotes(quote_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_contracts_roadshow ON public.roadshow_stop_contracts(roadshow_stop_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stop_contracts_contract ON public.roadshow_stop_contracts(contract_id);