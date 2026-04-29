
-- 1. Ajouter colonne event_id pour traçabilité directe
ALTER TABLE public.roadshow_stops
  ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_roadshow_stops_event_id ON public.roadshow_stops(event_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stops_opportunity_id ON public.roadshow_stops(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_roadshow_stops_quote_id ON public.roadshow_stops(quote_id);

-- 2. Fonction centralisée idempotente
CREATE OR REPLACE FUNCTION public.ensure_roadshow_for_entity(
  p_user_id uuid,
  p_event_id uuid DEFAULT NULL,
  p_opportunity_id uuid DEFAULT NULL,
  p_quote_id uuid DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_venue text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_event_date date DEFAULT NULL,
  p_capacity integer DEFAULT 0,
  p_artist_id uuid DEFAULT NULL,
  p_title text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
  new_id uuid;
  channel_label text;
BEGIN
  -- Anti-doublon : chercher feuille de route existante liée à n'importe lequel des 3 entités
  SELECT id INTO existing_id
  FROM public.roadshow_stops
  WHERE (p_event_id IS NOT NULL AND event_id = p_event_id)
     OR (p_opportunity_id IS NOT NULL AND opportunity_id = p_opportunity_id)
     OR (p_quote_id IS NOT NULL AND quote_id = p_quote_id)
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Compléter les liens manquants pour rattacher les 3 entités à la même feuille
    UPDATE public.roadshow_stops
    SET event_id = COALESCE(event_id, p_event_id),
        opportunity_id = COALESCE(opportunity_id, p_opportunity_id),
        quote_id = COALESCE(quote_id, p_quote_id),
        updated_at = now()
    WHERE id = existing_id;
    RETURN existing_id;
  END IF;

  -- Créer la nouvelle feuille de route
  INSERT INTO public.roadshow_stops (
    user_id, event_id, opportunity_id, quote_id,
    city, venue, address, event_date,
    status, capacity, tickets_available,
    crew, equipment, artists, artist_lineup, notes
  ) VALUES (
    p_user_id, p_event_id, p_opportunity_id, p_quote_id,
    COALESCE(p_city, 'Ville à définir'),
    COALESCE(p_venue, 'Lieu à définir'),
    COALESCE(p_address, ''),
    p_event_date,
    'confirmed',
    COALESCE(p_capacity, 0),
    COALESCE(p_capacity, 0),
    '{}', '{}',
    CASE WHEN p_artist_id IS NOT NULL THEN ARRAY[p_artist_id::text] ELSE '{}'::text[] END,
    '[]'::jsonb,
    'Créé automatiquement'
  )
  RETURNING id INTO new_id;

  -- Créer le canal de discussion associé (un seul, lié au roadshow)
  channel_label := COALESCE(p_title, p_venue, p_city, 'Événement');
  INSERT INTO public.messaging_channels (user_id, name, description, type, roadshow_id)
  VALUES (
    p_user_id,
    '🎭 ' || channel_label,
    'Organisation - ' || COALESCE(p_venue, p_city, ''),
    'private',
    new_id
  );

  RETURN new_id;
END;
$$;

-- 3. Trigger sur events : status -> confirmed
CREATE OR REPLACE FUNCTION public.auto_create_roadshow_on_event_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rs_id uuid;
BEGIN
  IF NEW.status IN ('confirmed', 'confirmé')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    rs_id := public.ensure_roadshow_for_entity(
      p_user_id => NEW.user_id,
      p_event_id => NEW.id,
      p_city => NEW.city,
      p_venue => NEW.venue,
      p_address => NEW.address,
      p_event_date => CASE WHEN NEW.start_date IS NOT NULL THEN NEW.start_date::date ELSE NULL END,
      p_capacity => NEW.attendees_count,
      p_artist_id => NEW.artist_id,
      p_title => NEW.title
    );
    -- Lier la feuille de route à l'événement
    IF rs_id IS NOT NULL AND (NEW.route_sheet_id IS NULL OR NEW.route_sheet_id != rs_id) THEN
      NEW.route_sheet_id := rs_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_roadshow_on_event_confirmed ON public.events;
CREATE TRIGGER trg_auto_roadshow_on_event_confirmed
BEFORE INSERT OR UPDATE OF status ON public.events
FOR EACH ROW EXECUTE FUNCTION public.auto_create_roadshow_on_event_confirmed();

-- 4. Trigger sur opportunities : status -> won
CREATE OR REPLACE FUNCTION public.auto_create_roadshow_on_opportunity_won()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'won'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.ensure_roadshow_for_entity(
      p_user_id => NEW.user_id,
      p_event_id => NEW.event_id,
      p_opportunity_id => NEW.id,
      p_city => NEW.location,
      p_venue => NEW.venue,
      p_event_date => CASE WHEN NEW.date IS NOT NULL THEN NEW.date::date ELSE NULL END,
      p_artist_id => NEW.artist_id,
      p_title => NEW.title
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_roadshow_on_opportunity_won ON public.opportunities;
CREATE TRIGGER trg_auto_roadshow_on_opportunity_won
AFTER INSERT OR UPDATE OF status ON public.opportunities
FOR EACH ROW EXECUTE FUNCTION public.auto_create_roadshow_on_opportunity_won();

-- 5. Trigger sur quotes : status -> accepted
CREATE OR REPLACE FUNCTION public.auto_create_roadshow_on_quote_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev_record RECORD;
BEGIN
  IF NEW.status = 'accepted'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Récupérer infos depuis l'événement lié si présent
    SELECT city, venue, address, start_date, attendees_count, artist_id, title
    INTO ev_record
    FROM public.events WHERE id = NEW.event_id;

    PERFORM public.ensure_roadshow_for_entity(
      p_user_id => NEW.user_id,
      p_event_id => NEW.event_id,
      p_opportunity_id => NEW.opportunity_id,
      p_quote_id => NEW.id,
      p_city => ev_record.city,
      p_venue => ev_record.venue,
      p_address => ev_record.address,
      p_event_date => CASE WHEN ev_record.start_date IS NOT NULL THEN ev_record.start_date::date ELSE NULL END,
      p_capacity => ev_record.attendees_count,
      p_artist_id => COALESCE(ev_record.artist_id, NEW.artist_id),
      p_title => COALESCE(ev_record.title, NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_roadshow_on_quote_accepted ON public.quotes;
CREATE TRIGGER trg_auto_roadshow_on_quote_accepted
AFTER INSERT OR UPDATE OF status ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.auto_create_roadshow_on_quote_accepted();
