-- Corriger la politique RLS pour les notifications
-- Supprimer l'ancienne politique trop permissive
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

-- Créer une nouvelle politique restrictive pour les notifications
CREATE POLICY "Users can create notifications for themselves only" 
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ajouter une politique pour que seuls les admins puissent créer des notifications système
CREATE POLICY "Admins can create system notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);