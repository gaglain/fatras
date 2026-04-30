-- A) Nettoyage des doublons confirmés sans données
DELETE FROM public.messaging_channels WHERE roadshow_id IN (
  'f93904cd-f72b-46cf-9145-b09840536ad5',
  '2fe7595c-f510-445e-bed5-4ad95eb1a63e',
  'f724be8e-45f9-4392-904e-fe55e9427e59',
  'c646cf8b-630e-440b-b460-cd2a7634cb6c'
);
DELETE FROM public.roadshow_stops WHERE id IN (
  'f93904cd-f72b-46cf-9145-b09840536ad5',
  '2fe7595c-f510-445e-bed5-4ad95eb1a63e',
  'f724be8e-45f9-4392-904e-fe55e9427e59',
  'c646cf8b-630e-440b-b460-cd2a7634cb6c'
);

-- B) Index unique uniquement sur event_id (un événement = une feuille).
-- On NE met PAS de contrainte unique sur quote_id ni opportunity_id : un devis ou une opportunité
-- peut couvrir plusieurs dates (ex. Le Mans 6 + 7 août = 2 événements = 2 feuilles légitimes).
CREATE UNIQUE INDEX IF NOT EXISTS uq_roadshow_stops_event_id 
  ON public.roadshow_stops(event_id) WHERE event_id IS NOT NULL;

-- C) Fonction révisée :
--    - L'événement est désormais la CLÉ PRIMAIRE de déduplication.
--    - La résolution transitive ne fusionne par devis/opportunité que SI un seul événement est concerné.
--    - Verrou advisory anti-race basé sur l'event_id (ou fallback) pour la concurrence.
CREATE OR REPLACE FUNCTION public.ensure_roadshow_for_entity(
  p_user_id uuid,
  p_event_id uuid DEFAULT NULL::uuid,
  p_opportunity_id uuid DEFAULT NULL::uuid,
  p_quote_id uuid DEFAULT NULL::uuid,
  p_city text DEFAULT NULL::text,
  p_venue text DEFAULT NULL::text,
  p_address text DEFAULT NULL::text,
  p_event_date date DEFAULT NULL::date,
  p_capacity integer DEFAULT 0,
  p_artist_id uuid DEFAULT NULL::uuid,
  p_title text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_id uuid;
  new_id uuid;
  channel_label text;
  related_event_count int := 0;
  lock_key bigint;
BEGIN
  -- Verrou anti-race : prioritairement sur event_id (clé unique), sinon devis/opp
  lock_key := hashtextextended(
    COALESCE(p_event_id::text, p_quote_id::text, p_opportunity_id::text, p_user_id::text || '-fallback'),
    42
  );
  PERFORM pg_advisory_xact_lock(lock_key);

  -- 1) PRIORITÉ : recherche par event_id (clé canonique)
  IF p_event_id IS NOT NULL THEN
    SELECT id INTO existing_id FROM public.roadshow_stops WHERE event_id = p_event_id LIMIT 1;
    IF existing_id IS NOT NULL THEN
      UPDATE public.roadshow_stops
      SET opportunity_id = COALESCE(opportunity_id, p_opportunity_id),
          quote_id       = COALESCE(quote_id, p_quote_id),
          updated_at = now()
      WHERE id = existing_id;
      RETURN existing_id;
    END IF;
  END IF;

  -- 2) Si pas d'event_id fourni : déduplication par devis/opportunité UNIQUEMENT si
  --    elle ne couvre qu'un seul événement (sinon risque de fusion abusive multi-dates).
  IF p_event_id IS NULL AND (p_quote_id IS NOT NULL OR p_opportunity_id IS NOT NULL) THEN
    -- Compter le nb d'événements liés
    SELECT COUNT(DISTINCT eid) INTO related_event_count FROM (
      SELECT o.event_id AS eid FROM public.opportunities o
        WHERE p_opportunity_id IS NOT NULL AND o.id = p_opportunity_id AND o.event_id IS NOT NULL
      UNION
      SELECT oe.event_id FROM public.opportunity_events oe
        WHERE p_opportunity_id IS NOT NULL AND oe.opportunity_id = p_opportunity_id
      UNION
      SELECT oe.event_id FROM public.opportunity_events oe
        JOIN public.quote_opportunities qo ON qo.opportunity_id = oe.opportunity_id
        WHERE p_quote_id IS NOT NULL AND qo.quote_id = p_quote_id
      UNION
      SELECT o.event_id FROM public.opportunities o
        JOIN public.quote_opportunities qo ON qo.opportunity_id = o.id
        WHERE p_quote_id IS NOT NULL AND qo.quote_id = p_quote_id AND o.event_id IS NOT NULL
    ) sub;

    -- Si <=1 événement concerné : on peut fusionner avec une feuille existante du même devis/opp
    IF related_event_count <= 1 THEN
      SELECT id INTO existing_id FROM public.roadshow_stops
      WHERE (p_quote_id IS NOT NULL AND quote_id = p_quote_id)
         OR (p_opportunity_id IS NOT NULL AND opportunity_id = p_opportunity_id)
      ORDER BY created_at ASC
      LIMIT 1;

      IF existing_id IS NOT NULL THEN
        UPDATE public.roadshow_stops
        SET quote_id = COALESCE(quote_id, p_quote_id),
            opportunity_id = COALESCE(opportunity_id, p_opportunity_id),
            updated_at = now()
        WHERE id = existing_id;
        RETURN existing_id;
      END IF;
    END IF;
    -- Si plusieurs événements liés et pas d'event_id : on crée une feuille générique
    -- (elle sera reliée plus tard à un événement précis lors d'un autre appel).
  END IF;

  -- 3) Création (toute insertion sur event_id déjà existant lèvera l'index unique = sécurité finale)
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

  channel_label := COALESCE(p_title, p_venue, p_city, 'Événement');
  IF NOT EXISTS (SELECT 1 FROM public.messaging_channels WHERE roadshow_id = new_id) THEN
    INSERT INTO public.messaging_channels (user_id, name, description, type, roadshow_id)
    VALUES (p_user_id, '🎭 ' || channel_label, 'Organisation - ' || COALESCE(p_venue, p_city, ''), 'private', new_id);
  END IF;

  RETURN new_id;
END;
$function$;