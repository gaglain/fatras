-- Créer des tables de liaison pour interconnecter toutes les entités comme HubSpot

-- Table de liaison entre opportunités et événements
CREATE TABLE IF NOT EXISTS public.opportunity_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, event_id)
);

-- Table de liaison entre devis/contrats et événements
CREATE TABLE IF NOT EXISTS public.quote_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quote_id, event_id)
);

-- Table de liaison entre devis/contrats et opportunités
CREATE TABLE IF NOT EXISTS public.quote_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quote_id, opportunity_id)
);

-- Table de liaison entre artistes et événements
CREATE TABLE IF NOT EXISTS public.artist_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.centralized_artists(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'performer', -- performer, headliner, support, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_id, event_id)
);

-- Table de liaison entre artistes et opportunités
CREATE TABLE IF NOT EXISTS public.artist_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES public.centralized_artists(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'performer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(artist_id, opportunity_id)
);

-- Table de liaison entre roadshow_stops et contacts
CREATE TABLE IF NOT EXISTS public.roadshow_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'local_contact', -- local_contact, venue_manager, promoter, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(roadshow_stop_id, contact_id)
);

-- Table de liaison entre roadshow_stops et opportunités
CREATE TABLE IF NOT EXISTS public.roadshow_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roadshow_stop_id UUID NOT NULL REFERENCES public.roadshow_stops(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(roadshow_stop_id, opportunity_id)
);

-- Table de liaison flexible pour les tâches (permet de lier une tâche à n'importe quelle entité)
CREATE TABLE IF NOT EXISTS public.task_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'contact', 'event', 'opportunity', 'quote', 'artist', 'roadshow_stop'
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, entity_type, entity_id)
);

-- Table de liaison entre contacts et opportunités (en plus de la colonne contact_id existante)
CREATE TABLE IF NOT EXISTS public.contact_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'primary', -- primary, secondary, decision_maker, influencer, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, opportunity_id, role)
);

-- Table de liaison entre contacts et devis/contrats (en plus de la colonne contact_id existante)
CREATE TABLE IF NOT EXISTS public.contact_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'primary', -- primary, billing, decision_maker, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, quote_id, role)
);

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE public.opportunity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadshow_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadshow_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_quotes ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour opportunity_events
CREATE POLICY "Users can manage own opportunity events" ON public.opportunity_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.opportunities o 
    WHERE o.id = opportunity_events.opportunity_id AND o.user_id = auth.uid()
  )
);

-- Politiques RLS pour quote_events
CREATE POLICY "Users can manage own quote events" ON public.quote_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.quotes q 
    WHERE q.id = quote_events.quote_id AND q.user_id = auth.uid()
  )
);

-- Politiques RLS pour quote_opportunities
CREATE POLICY "Users can manage own quote opportunities" ON public.quote_opportunities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.quotes q 
    WHERE q.id = quote_opportunities.quote_id AND q.user_id = auth.uid()
  )
);

-- Politiques RLS pour artist_events
CREATE POLICY "Users can manage own artist events" ON public.artist_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.centralized_artists a 
    WHERE a.id = artist_events.artist_id AND a.user_id = auth.uid()
  )
);

-- Politiques RLS pour artist_opportunities
CREATE POLICY "Users can manage own artist opportunities" ON public.artist_opportunities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.centralized_artists a 
    WHERE a.id = artist_opportunities.artist_id AND a.user_id = auth.uid()
  )
);

-- Politiques RLS pour roadshow_contacts
CREATE POLICY "Users can manage own roadshow contacts" ON public.roadshow_contacts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.roadshow_stops r 
    WHERE r.id = roadshow_contacts.roadshow_stop_id AND r.user_id = auth.uid()
  )
);

-- Politiques RLS pour roadshow_opportunities
CREATE POLICY "Users can manage own roadshow opportunities" ON public.roadshow_opportunities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.roadshow_stops r 
    WHERE r.id = roadshow_opportunities.roadshow_stop_id AND r.user_id = auth.uid()
  )
);

-- Politiques RLS pour task_entities
CREATE POLICY "Users can manage own task entities" ON public.task_entities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    WHERE t.id = task_entities.task_id AND t.user_id = auth.uid()
  )
);

-- Politiques RLS pour contact_opportunities
CREATE POLICY "Users can manage own contact opportunities" ON public.contact_opportunities
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.contacts c 
    WHERE c.id = contact_opportunities.contact_id AND c.user_id = auth.uid()
  )
);

-- Politiques RLS pour contact_quotes
CREATE POLICY "Users can manage own contact quotes" ON public.contact_quotes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.contacts c 
    WHERE c.id = contact_quotes.contact_id AND c.user_id = auth.uid()
  )
);

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_opportunity_events_opportunity ON public.opportunity_events(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_events_event ON public.opportunity_events(event_id);
CREATE INDEX IF NOT EXISTS idx_quote_events_quote ON public.quote_events(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_events_event ON public.quote_events(event_id);
CREATE INDEX IF NOT EXISTS idx_quote_opportunities_quote ON public.quote_opportunities(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_opportunities_opportunity ON public.quote_opportunities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_artist_events_artist ON public.artist_events(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_events_event ON public.artist_events(event_id);
CREATE INDEX IF NOT EXISTS idx_artist_opportunities_artist ON public.artist_opportunities(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_opportunities_opportunity ON public.artist_opportunities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_contacts_roadshow ON public.roadshow_contacts(roadshow_stop_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_contacts_contact ON public.roadshow_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_opportunities_roadshow ON public.roadshow_opportunities(roadshow_stop_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_opportunities_opportunity ON public.roadshow_opportunities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_task_entities_task ON public.task_entities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_entities_entity ON public.task_entities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_contact_opportunities_contact ON public.contact_opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_opportunities_opportunity ON public.contact_opportunities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_contact_quotes_contact ON public.contact_quotes(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_quotes_quote ON public.contact_quotes(quote_id);