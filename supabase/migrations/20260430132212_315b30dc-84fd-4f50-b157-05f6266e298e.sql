CREATE OR REPLACE FUNCTION public.auto_create_roadshow_on_quote_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev_record RECORD;
  linked_opportunity_id uuid;
BEGIN
  IF NEW.status = 'accepted'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Récupérer infos depuis l'événement lié si présent
    SELECT city, venue, address, start_date, attendees_count, artist_id, title
    INTO ev_record
    FROM public.events
    WHERE id = NEW.event_id;

    -- Les devis ne portent pas directement opportunity_id : utiliser la table de liaison.
    SELECT qo.opportunity_id
    INTO linked_opportunity_id
    FROM public.quote_opportunities qo
    WHERE qo.quote_id = NEW.id
    ORDER BY qo.created_at ASC
    LIMIT 1;

    PERFORM public.ensure_roadshow_for_entity(
      p_user_id => NEW.user_id,
      p_event_id => NEW.event_id,
      p_opportunity_id => linked_opportunity_id,
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