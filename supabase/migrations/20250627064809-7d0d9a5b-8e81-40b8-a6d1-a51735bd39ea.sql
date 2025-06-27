
-- Ajouter une colonne pseudonyme/username à la table user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Mettre à jour les utilisateurs existants avec un pseudonyme par défaut basé sur leur prénom/nom
UPDATE public.user_profiles 
SET username = LOWER(COALESCE(first_name, 'user') || '_' || COALESCE(last_name, id::text))
WHERE username IS NULL;

-- Rendre le pseudonyme obligatoire après avoir mis à jour les données existantes
ALTER TABLE public.user_profiles 
ALTER COLUMN username SET NOT NULL;

-- Créer une table pour les notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur la table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour insérer des notifications
CREATE POLICY "Users can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Politique pour marquer les notifications comme lues
CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);
