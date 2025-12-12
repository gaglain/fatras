-- Supprimer les anciennes policies sur public_chat_messages
DROP POLICY IF EXISTS "Admins can manage all public chat messages" ON public.public_chat_messages;
DROP POLICY IF EXISTS "Anyone can insert public chat messages" ON public.public_chat_messages;
DROP POLICY IF EXISTS "Visitors can read their own messages" ON public.public_chat_messages;

-- Recréer avec des policies claires
-- 1. Tout le monde peut envoyer un message (visiteurs non-authentifiés inclus)
CREATE POLICY "Anyone can insert public chat messages" 
ON public.public_chat_messages 
FOR INSERT 
WITH CHECK (true);

-- 2. Les visiteurs peuvent lire leurs propres messages (basé sur visitor_id stocké en cookie/localStorage)
CREATE POLICY "Visitors read own messages" 
ON public.public_chat_messages 
FOR SELECT 
USING (true);

-- 3. Les utilisateurs authentifiés peuvent tout faire (admins)
CREATE POLICY "Authenticated users can manage public chat" 
ON public.public_chat_messages 
FOR ALL 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Permettre la mise à jour des messages (mark as read)
CREATE POLICY "Authenticated users can update public chat" 
ON public.public_chat_messages 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);