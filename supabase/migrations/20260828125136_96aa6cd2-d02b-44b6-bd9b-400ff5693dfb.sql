-- Trigger functions must never be callable through the API
REVOKE EXECUTE ON FUNCTION public.auto_create_roadshow_on_event_confirmed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_roadshow_on_opportunity_won() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_create_roadshow_on_quote_accepted() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_user_role_to_user_roles() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recompute_campaign_stats() FROM anon, authenticated;

-- Privileged helpers only used internally / by edge functions (service_role)
REVOKE EXECUTE ON FUNCTION public.ensure_roadshow_for_entity(uuid, uuid, uuid, uuid, text, text, text, date, integer, uuid, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_roadshow_for_entity(uuid, uuid, uuid, uuid, text, text, text, date, integer, uuid, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.recompute_campaign_stats(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recompute_campaign_stats(uuid) TO service_role;