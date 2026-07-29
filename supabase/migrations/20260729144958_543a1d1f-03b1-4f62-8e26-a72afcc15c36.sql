CREATE OR REPLACE FUNCTION public.recompute_campaign_stats(p_campaign_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sent integer;
  v_delivered integer;
  v_opened integer;
  v_clicked integer;
  v_bounced integer;
  v_base integer;
BEGIN
  SELECT COALESCE(sent_count, 0) INTO v_sent FROM public.email_campaigns WHERE id = p_campaign_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT
    COUNT(DISTINCT contact_id) FILTER (WHERE event_type = 'sent'),
    COUNT(DISTINCT contact_id) FILTER (WHERE event_type = 'delivered'),
    COUNT(DISTINCT contact_id) FILTER (WHERE event_type IN ('opened','clicked')),
    COUNT(DISTINCT contact_id) FILTER (WHERE event_type = 'clicked'),
    COUNT(DISTINCT contact_id) FILTER (WHERE event_type = 'bounced')
  INTO v_base, v_delivered, v_opened, v_clicked, v_bounced
  FROM public.email_analytics
  WHERE campaign_id = p_campaign_id;

  v_sent := GREATEST(COALESCE(v_sent, 0), COALESCE(v_base, 0));
  v_delivered := COALESCE(v_delivered, 0);
  IF v_sent > 0 AND v_delivered > v_sent THEN
    v_delivered := v_sent;
  END IF;

  v_base := CASE WHEN v_delivered > 0 THEN v_delivered ELSE v_sent END;

  UPDATE public.email_campaigns
  SET
    delivered_count = v_delivered,
    opened_count = COALESCE(v_opened, 0),
    clicked_count = COALESCE(v_clicked, 0),
    bounced_count = COALESCE(v_bounced, 0),
    open_rate = CASE WHEN v_base > 0 THEN ROUND((COALESCE(v_opened,0)::numeric / v_base) * 100, 2) ELSE 0 END,
    click_rate = CASE WHEN v_base > 0 THEN ROUND((COALESCE(v_clicked,0)::numeric / v_base) * 100, 2) ELSE 0 END
  WHERE id = p_campaign_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recompute_campaign_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL THEN
    PERFORM public.recompute_campaign_stats(NEW.campaign_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS email_analytics_recompute_stats ON public.email_analytics;
CREATE TRIGGER email_analytics_recompute_stats
AFTER INSERT ON public.email_analytics
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_campaign_stats();

GRANT EXECUTE ON FUNCTION public.recompute_campaign_stats(uuid) TO authenticated, service_role;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM public.email_campaigns LOOP
    PERFORM public.recompute_campaign_stats(r.id);
  END LOOP;
END $$;