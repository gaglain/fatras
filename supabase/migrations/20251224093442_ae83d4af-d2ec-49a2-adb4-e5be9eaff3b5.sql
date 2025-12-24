-- =====================================================
-- MIGRATION: Suppression colonnes tokens et fix search_path
-- =====================================================

-- 1. Supprimer les colonnes access_token et refresh_token non-chiffrées
ALTER TABLE public.email_accounts DROP COLUMN IF EXISTS access_token;
ALTER TABLE public.email_accounts DROP COLUMN IF EXISTS refresh_token;

-- 2. Fix search_path pour les fonctions manquantes
-- update_messaging_updated_at
CREATE OR REPLACE FUNCTION public.update_messaging_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- update_inbound_emails_updated_at
CREATE OR REPLACE FUNCTION public.update_inbound_emails_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- update_quote_items_updated_at
CREATE OR REPLACE FUNCTION public.update_quote_items_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  UPDATE public.quotes 
  SET updated_at = now()
  WHERE id = NEW.quote_id;
  
  RETURN NEW;
END;
$function$;

-- update_show_bible_notes_updated_at
CREATE OR REPLACE FUNCTION public.update_show_bible_notes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- link_email_to_contact
CREATE OR REPLACE FUNCTION public.link_email_to_contact()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  contact_record UUID;
BEGIN
  IF NEW.direction = 'received' THEN
    SELECT id INTO contact_record 
    FROM contacts 
    WHERE user_id = NEW.user_id 
    AND email = NEW.from_email
    LIMIT 1;
  ELSE
    SELECT id INTO contact_record 
    FROM contacts 
    WHERE user_id = NEW.user_id 
    AND email = NEW.to_email
    LIMIT 1;
  END IF;
  
  IF contact_record IS NOT NULL THEN
    NEW.contact_id = contact_record;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- generate_contact_external_id
CREATE OR REPLACE FUNCTION public.generate_contact_external_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(external_id FROM '^C([0-9]+)$') AS INTEGER)), 0) + 1
    INTO next_id
    FROM contacts 
    WHERE user_id = NEW.user_id 
    AND external_id ~ '^C[0-9]+$';
    
    NEW.external_id := 'C' || next_id;
    RETURN NEW;
END;
$function$;

-- generate_event_external_id
CREATE OR REPLACE FUNCTION public.generate_event_external_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(external_id FROM '^E([0-9]+)$') AS INTEGER)), 0) + 1
    INTO next_id
    FROM events 
    WHERE user_id = NEW.user_id 
    AND external_id ~ '^E[0-9]+$';
    
    NEW.external_id := 'E' || next_id;
    RETURN NEW;
END;
$function$;

-- notify_channel_members_on_new_message
CREATE OR REPLACE FUNCTION public.notify_channel_members_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  member_record RECORD;
  channel_name TEXT;
  sender_name TEXT;
BEGIN
  SELECT name INTO channel_name
  FROM public.messaging_channels
  WHERE id = NEW.channel_id;

  SELECT COALESCE(first_name || ' ' || last_name, username, 'Utilisateur')
  INTO sender_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;

  FOR member_record IN
    SELECT user_id
    FROM public.messaging_channel_members
    WHERE channel_id = NEW.channel_id
    AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      priority,
      metadata
    ) VALUES (
      member_record.user_id,
      'message',
      'Nouveau message',
      sender_name || ' : ' || LEFT(NEW.content, 100),
      false,
      'normal',
      jsonb_build_object(
        'channel_id', NEW.channel_id,
        'message_id', NEW.id,
        'channel_name', channel_name
      )
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

-- update_user_profile_data
CREATE OR REPLACE FUNCTION public.update_user_profile_data(profile_user_id uuid, profile_data json)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  result_data JSON;
BEGIN
  IF auth.uid() != profile_user_id AND NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  UPDATE user_profiles
  SET 
    first_name = COALESCE(profile_data->>'first_name', first_name),
    last_name = COALESCE(profile_data->>'last_name', last_name),
    phone = COALESCE(profile_data->>'phone', phone),
    avatar_url = COALESCE(profile_data->>'avatar_url', avatar_url),
    updated_at = NOW()
  WHERE user_id = profile_user_id;

  SELECT to_json(up.*) INTO result_data
  FROM user_profiles up
  WHERE up.user_id = profile_user_id;

  RETURN result_data;
END;
$function$;

-- notify_mentioned_users
CREATE OR REPLACE FUNCTION public.notify_mentioned_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  mentioned_user_id UUID;
  author_name TEXT;
BEGIN
  SELECT COALESCE(first_name || ' ' || last_name, username, email)
  INTO author_name
  FROM public.user_profiles
  WHERE user_id = NEW.user_id;

  IF NEW.mentioned_users IS NOT NULL THEN
    FOREACH mentioned_user_id IN ARRAY NEW.mentioned_users
    LOOP
      IF mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (
          user_id,
          type,
          title,
          message,
          is_read,
          priority,
          metadata
        ) VALUES (
          mentioned_user_id,
          'mention',
          'Mention dans une note',
          author_name || ' vous a mentionné dans "' || NEW.title || '"',
          false,
          'normal',
          jsonb_build_object(
            'note_id', NEW.id,
            'author_id', NEW.user_id,
            'artist_id', NEW.artist_id
          )
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

-- update_email_contact_links
CREATE OR REPLACE FUNCTION public.update_email_contact_links()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE emails e
  SET contact_id = c.id
  FROM contacts c
  WHERE e.user_id = c.user_id
    AND e.direction = 'received'
    AND e.from_email = c.email
    AND e.contact_id IS NULL;

  UPDATE emails e
  SET contact_id = c.id
  FROM contacts c
  WHERE e.user_id = c.user_id
    AND e.direction = 'sent'
    AND e.to_email = c.email
    AND e.contact_id IS NULL;
END;
$function$;

-- notify_on_public_chat_message
CREATE OR REPLACE FUNCTION public.notify_on_public_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  admin_user RECORD;
BEGIN
  IF NEW.is_from_admin = false THEN
    FOR admin_user IN 
      SELECT user_id FROM public.user_profiles 
      WHERE role IN ('admin', 'super_admin') 
      AND is_active = true 
      AND user_id IS NOT NULL
    LOOP
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        read,
        data
      ) VALUES (
        admin_user.user_id,
        'public_chat',
        'Nouveau message du site',
        COALESCE(NEW.visitor_name, 'Un visiteur') || ': ' || LEFT(NEW.message, 50) || CASE WHEN LENGTH(NEW.message) > 50 THEN '...' ELSE '' END,
        false,
        jsonb_build_object('visitor_id', NEW.visitor_id, 'message_id', NEW.id)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;