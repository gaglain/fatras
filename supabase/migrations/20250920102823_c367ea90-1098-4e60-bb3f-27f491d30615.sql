-- Corriger le problème de création d'utilisateur en s'assurant que user_profiles référence bien auth.users
-- Vérifier d'abord s'il y a des enregistrements orphelins dans user_profiles
DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Supprimer l'ancienne contrainte de clé étrangère si elle existe
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Ajouter la nouvelle contrainte de clé étrangère correcte
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Créer une fonction pour les notifications de tâches en retard
CREATE OR REPLACE FUNCTION public.check_overdue_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insérer des notifications pour les tâches en retard qui n'ont pas encore de notification
  INSERT INTO notifications (user_id, type, title, message, data, read)
  SELECT DISTINCT
    COALESCE(t.assigned_to, t.user_id) as user_id,
    'task_overdue' as type,
    'Tâche en retard' as title,
    'La tâche "' || t.title || '" était due le ' || to_char(t.due_date::timestamp, 'DD/MM/YYYY à HH24:MI') as message,
    jsonb_build_object(
      'task_id', t.id, 
      'task_title', t.title, 
      'due_date', t.due_date,
      'priority', t.priority
    ) as data,
    false as read
  FROM tasks t
  WHERE t.due_date < NOW()
    AND t.status NOT IN ('completed', 'cancelled')
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.type = 'task_overdue' 
      AND n.data->>'task_id' = t.id::text
    );
END;
$$;

-- Créer un trigger pour vérifier automatiquement les tâches en retard
-- Note: En production, ceci serait mieux géré par un job cron
CREATE OR REPLACE FUNCTION public.trigger_overdue_check()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier uniquement les tâches qui viennent d'être créées ou modifiées
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.due_date IS NOT NULL THEN
    -- Si la tâche est en retard et pas complétée
    IF NEW.due_date < NOW() AND NEW.status NOT IN ('completed', 'cancelled') THEN
      -- Vérifier s'il n'y a pas déjà une notification pour cette tâche
      IF NOT EXISTS (
        SELECT 1 FROM notifications 
        WHERE type = 'task_overdue' 
        AND data->>'task_id' = NEW.id::text
      ) THEN
        INSERT INTO notifications (user_id, type, title, message, data, read)
        VALUES (
          COALESCE(NEW.assigned_to, NEW.user_id),
          'task_overdue',
          'Tâche en retard',
          'La tâche "' || NEW.title || '" était due le ' || to_char(NEW.due_date::timestamp, 'DD/MM/YYYY à HH24:MI'),
          jsonb_build_object(
            'task_id', NEW.id, 
            'task_title', NEW.title, 
            'due_date', NEW.due_date,
            'priority', NEW.priority
          ),
          false
        );
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Appliquer le trigger sur la table tasks
DROP TRIGGER IF EXISTS check_overdue_tasks_trigger ON tasks;
CREATE TRIGGER check_overdue_tasks_trigger
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_overdue_check();