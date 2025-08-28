-- Créer la table notifications si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour la table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour les notifications
CREATE POLICY "Users can manage own notifications" 
ON public.notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- Ajouter la table aux publications en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;