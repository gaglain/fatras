DO $$
DECLARE
  f record;
  keep_auth text[] := ARRAY[
    'has_role','has_any_role','has_permission','is_admin_user',
    'is_member_of_channel','is_owner_of_channel','is_public_active_channel',
    'check_channel_access','is_channel_owner',
    'confirm_roadshow_attendance','create_messaging_channel','create_direct_message_channel',
    'get_active_users_basic','get_event_contacts','get_my_shop_stats',
    'get_guest_order_by_email','create_guest_order',
    'delete_user_completely','create_user_with_profile','update_email_contact_links'
  ];
  keep_anon text[] := ARRAY['has_role','has_any_role','create_guest_order','get_guest_order_by_email'];
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig, p.proname
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', f.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', f.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f.sig);

    IF f.proname = ANY (keep_auth) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f.sig);
    END IF;
    IF f.proname = ANY (keep_anon) THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', f.sig);
    END IF;
  END LOOP;
END $$;