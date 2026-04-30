-- Renforce ensure_roadshow_for_entity pour éviter la double création de feuille de route
-- en détectant les doublons de manière transitive entre devis, opportunités et événements.
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
  resolved_event_id uuid := p_event_id;
  resolved_opportunity_id uuid := p_opportunity_id;
  resolved_quote_id uuid := p_quote_id;
  related_event_ids uuid[] := ARRAY[]::uuid[];
  related_opportunity_ids uuid[] := ARRAY[]::uuid[];
  related_quote_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  -- 1) Résolution transitive des entités liées
  -- Depuis un devis : récupérer les opportunités liées (table de liaison)
  IF resolved_quote_id IS NOT NULL THEN
    related_quote_ids := array_append(related_quote_ids, resolved_quote_id);
    SELECT COALESCE(array_agg(DISTINCT qo.opportunity_id), '{}')
      INTO related_opportunity_ids
    FROM public.quote_opportunities qo
    WHERE qo.quote_id = resolved_quote_id;
    IF resolved_opportunity_id IS NOT NULL THEN
      related_opportunity_ids := array_append(related_opportunity_ids, resolved_opportunity_id);
    END IF;
  ELSIF resolved_opportunity_id IS NOT NULL THEN
    related_opportunity_ids := array_append(related_opportunity_ids, resolved_opportunity_id);
  END IF;

  -- Depuis une opportunité : récupérer les événements liés (event_id direct + table de liaison)
  IF array_length(related_opportunity_ids, 1) > 0 THEN
    SELECT COALESCE(array_agg(DISTINCT eid), '{}') INTO related_event_ids
    FROM (
      SELECT o.event_id AS eid FROM public.opportunities o
        WHERE o.id = ANY(related_opportunity_ids) AND o.event_id IS NOT NULL
      UNION
      SELECT oe.event_id FROM public.opportunity_events oe
        WHERE oe.opportunity_id = ANY(related_opportunity_ids)
    ) sub;
  END IF;
  IF resolved_event_id IS NOT NULL THEN
    related_event_ids := array_append(related_event_ids, resolved_event_id);
  END IF;

  -- Depuis un événement : remonter aux opportunités et devis liés
  IF array_length(related_event_ids, 1) > 0 THEN
    -- Opportunités liées à ces événements
    SELECT COALESCE(array_agg(DISTINCT oid), related_opportunity_ids) INTO related_opportunity_ids
    FROM (
      SELECT o.id AS oid FROM public.opportunities o
        WHERE o.event_id = ANY(related_event_ids)
      UNION
      SELECT oe.opportunity_id FROM public.opportunity_events oe
        WHERE oe.event_id = ANY(related_event_ids)
      UNION
      SELECT unnest(related_opportunity_ids)
    ) sub;

    -- Devis liés à ces opportunités
    IF array_length(related_opportunity_ids, 1) > 0 THEN
      SELECT COALESCE(array_agg(DISTINCT qid), related_quote_ids) INTO related_quote_ids
      FROM (
        SELECT qo.quote_id AS qid FROM public.quote_opportunities qo
          WHERE qo.opportunity_id = ANY(related_opportunity_ids)
        UNION
        SELECT unnest(related_quote_ids)
      ) sub;
    END IF;
  END IF;

  -- 2) Recherche d'une feuille de route existante via N'IMPORTE quel ID lié
  SELECT id INTO existing_id
  FROM public.roadshow_stops
  WHERE (array_length(related_event_ids, 1) > 0 AND event_id = ANY(related_event_ids))
     OR (array_length(related_opportunity_ids, 1) > 0 AND opportunity_id = ANY(related_opportunity_ids))
     OR (array_length(related_quote_ids, 1) > 0 AND quote_id = ANY(related_quote_ids))
  ORDER BY created_at ASC
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Compléter les liens manquants
    UPDATE public.roadshow_stops
    SET event_id = COALESCE(event_id, resolved_event_id, (SELECT unnest(related_event_ids) LIMIT 1)),
        opportunity_id = COALESCE(opportunity_id, resolved_opportunity_id, (SELECT unnest(related_opportunity_ids) LIMIT 1)),
        quote_id = COALESCE(quote_id, resolved_quote_id, (SELECT unnest(related_quote_ids) LIMIT 1)),
        updated_at = now()
    WHERE id = existing_id;
    RETURN existing_id;
  END IF;

  -- 3) Création d'une nouvelle feuille de route
  INSERT INTO public.roadshow_stops (
    user_id, event_id, opportunity_id, quote_id,
    city, venue, address, event_date,
    status, capacity, tickets_available,
    crew, equipment, artists, artist_lineup, notes
  ) VALUES (
    p_user_id, resolved_event_id, resolved_opportunity_id, resolved_quote_id,
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

  -- 4) Création du canal de discussion associé (anti-doublon par roadshow_id)
  channel_label := COALESCE(p_title, p_venue, p_city, 'Événement');
  IF NOT EXISTS (SELECT 1 FROM public.messaging_channels WHERE roadshow_id = new_id) THEN
    INSERT INTO public.messaging_channels (user_id, name, description, type, roadshow_id)
    VALUES (
      p_user_id,
      '🎭 ' || channel_label,
      'Organisation - ' || COALESCE(p_venue, p_city, ''),
      'private',
      new_id
    );
  END IF;

  RETURN new_id;
END;
$function$;