-- Créer la table des tâches
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assigned_to UUID REFERENCES public.user_profiles(user_id),
  contact_id UUID REFERENCES public.contacts(id),
  event_id UUID REFERENCES public.events(id),
  artist_id UUID REFERENCES public.user_profiles(user_id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour tasks - utilisateurs peuvent gérer leurs propres tâches et celles qui leur sont assignées
CREATE POLICY "Users can manage own tasks and assigned tasks" 
ON public.tasks 
FOR ALL 
USING (
  auth.uid() = user_id OR 
  auth.uid() = assigned_to
);

-- Trigger pour updated_at
CREATE TRIGGER handle_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();