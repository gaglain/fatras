-- Create function to update campaign statistics
CREATE OR REPLACE FUNCTION public.update_campaign_stats(
  campaign_id UUID,
  event_type TEXT
)
RETURNS VOID AS $$
BEGIN
  CASE event_type
    WHEN 'sent' THEN
      UPDATE public.campaigns 
      SET sent_count = COALESCE(sent_count, 0) + 1
      WHERE id = campaign_id;
    WHEN 'delivered' THEN
      UPDATE public.campaigns 
      SET delivered_count = COALESCE(delivered_count, 0) + 1
      WHERE id = campaign_id;
    WHEN 'opened' THEN
      UPDATE public.campaigns 
      SET opened_count = COALESCE(opened_count, 0) + 1,
          open_rate = CASE 
            WHEN COALESCE(sent_count, 0) > 0 
            THEN ((COALESCE(opened_count, 0) + 1)::NUMERIC / sent_count::NUMERIC) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id;
    WHEN 'clicked' THEN
      UPDATE public.campaigns 
      SET clicked_count = COALESCE(clicked_count, 0) + 1,
          click_rate = CASE 
            WHEN COALESCE(opened_count, 0) > 0 
            THEN ((COALESCE(clicked_count, 0) + 1)::NUMERIC / opened_count::NUMERIC) * 100 
            ELSE 0 
          END
      WHERE id = campaign_id;
    WHEN 'bounced' THEN
      UPDATE public.campaigns 
      SET bounced_count = COALESCE(bounced_count, 0) + 1
      WHERE id = campaign_id;
    WHEN 'unsubscribed' THEN
      UPDATE public.campaigns 
      SET unsubscribed_count = COALESCE(unsubscribed_count, 0) + 1
      WHERE id = campaign_id;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;