-- Fix update_campaign_stats function to add ownership validation
-- This prevents any authenticated user from manipulating campaign statistics they don't own

CREATE OR REPLACE FUNCTION public.update_campaign_stats(campaign_id uuid, event_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Verify the caller owns this campaign before allowing any updates
  IF NOT EXISTS (SELECT 1 FROM public.campaigns WHERE id = campaign_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this campaign';
  END IF;

  CASE event_type
    WHEN 'sent' THEN
      UPDATE public.campaigns 
      SET sent_count = COALESCE(sent_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'delivered' THEN
      UPDATE public.campaigns 
      SET delivered_count = COALESCE(delivered_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'opened' THEN
      UPDATE public.campaigns 
      SET opened_count = COALESCE(opened_count, 0) + 1,
          open_rate = CASE 
            WHEN COALESCE(sent_count, 0) > 0 
            THEN ((COALESCE(opened_count, 0) + 1)::numeric / sent_count) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'clicked' THEN
      UPDATE public.campaigns 
      SET clicked_count = COALESCE(clicked_count, 0) + 1,
          click_rate = CASE 
            WHEN COALESCE(sent_count, 0) > 0 
            THEN ((COALESCE(clicked_count, 0) + 1)::numeric / sent_count) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'bounced' THEN
      UPDATE public.campaigns 
      SET bounced_count = COALESCE(bounced_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
    WHEN 'unsubscribed' THEN
      UPDATE public.campaigns 
      SET unsubscribed_count = COALESCE(unsubscribed_count, 0) + 1
      WHERE id = campaign_id AND user_id = auth.uid();
    ELSE
      RAISE EXCEPTION 'Unknown event type: %', event_type;
  END CASE;
END;
$function$;