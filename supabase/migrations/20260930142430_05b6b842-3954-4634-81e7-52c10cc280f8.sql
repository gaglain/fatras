DROP POLICY IF EXISTS "Visitors read own messages by visitor_id" ON public.public_chat_messages;

CREATE POLICY "Admins read public chat messages" ON public.public_chat_messages
FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['admin'::app_role, 'super_admin'::app_role]));

CREATE OR REPLACE FUNCTION public.get_visitor_chat_messages(p_visitor_id text)
RETURNS SETOF public.public_chat_messages
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.public_chat_messages
  WHERE p_visitor_id IS NOT NULL AND length(p_visitor_id) >= 20
    AND visitor_id = p_visitor_id
  ORDER BY created_at ASC
  LIMIT 500
$$;

REVOKE ALL ON FUNCTION public.get_visitor_chat_messages(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_visitor_chat_messages(text) TO anon, authenticated;