-- Sécuriser form_submissions : limiter à 10 soumissions par IP par heure
CREATE OR REPLACE FUNCTION public.check_form_submission_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  submission_count INTEGER;
BEGIN
  -- Compter les soumissions récentes de cette IP
  SELECT COUNT(*) INTO submission_count
  FROM public.form_submissions
  WHERE ip_address = NEW.ip_address
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Limiter à 10 soumissions par heure par IP
  IF submission_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many form submissions from this IP';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger sur form_submissions
DROP TRIGGER IF EXISTS form_submission_rate_limit ON public.form_submissions;
CREATE TRIGGER form_submission_rate_limit
  BEFORE INSERT ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_form_submission_rate_limit();

-- Sécuriser public_chat_messages : limiter à 30 messages par visiteur par heure
CREATE OR REPLACE FUNCTION public.check_chat_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  message_count INTEGER;
BEGIN
  -- Compter les messages récents de ce visiteur
  SELECT COUNT(*) INTO message_count
  FROM public.public_chat_messages
  WHERE visitor_id = NEW.visitor_id
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Limiter à 30 messages par heure par visiteur
  IF message_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded: too many chat messages';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger sur public_chat_messages
DROP TRIGGER IF EXISTS chat_message_rate_limit ON public.public_chat_messages;
CREATE TRIGGER chat_message_rate_limit
  BEFORE INSERT ON public.public_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_chat_message_rate_limit();