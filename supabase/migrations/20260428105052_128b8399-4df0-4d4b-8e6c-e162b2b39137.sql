-- Revoke EXECUTE from authenticated on all public SECURITY DEFINER functions,
-- except those needed as RPC endpoints or as RLS policy helpers.
DO $$
DECLARE
  r record;
  keep text[] := ARRAY[
    -- RPC endpoints called from frontend
    'confirm_roadshow_attendance',
    'create_direct_message_channel',
    'create_guest_order',
    'create_messaging_channel',
    'delete_user_completely',
    'get_guest_order_by_email',
    'get_my_shop_stats',
    -- RLS policy helpers (must stay executable by authenticated)
    'has_role',
    'has_any_role',
    'has_permission',
    'is_admin_user',
    'is_member_of_channel',
    'is_owner_of_channel',
    'is_public_active_channel',
    'is_channel_owner',
    'check_channel_access',
    -- Secure RPCs used by hooks/edge functions via PostgREST
    'get_email_accounts_safe',
    'get_email_accounts_secure',
    'get_email_accounts_without_tokens',
    'get_user_profiles',
    'get_active_users_basic',
    'get_event_contacts',
    'get_my_sensitive_data',
    'update_my_sensitive_data',
    'update_campaign_stats',
    'create_user_with_profile'
  ];
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND NOT (p.proname = ANY(keep))
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', r.sig);
  END LOOP;
END $$;