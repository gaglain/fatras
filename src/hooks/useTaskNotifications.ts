import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TaskNotification {
  id: string;
  task_id: string;
  task_title: string;
  due_date: string;
  priority: string;
  type: 'overdue' | 'due_soon' | 'reminder';
  message: string;
  created_at: string;
}
const TASK_TOAST_STORAGE_KEY = 'task_toast_shown';

const readToastStore = () => {
  try {
    const raw = localStorage.getItem(TASK_TOAST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {} as Record<string, string>;
  }
};

const writeToastStore = (map: Record<string, string>) => {
  try {
    localStorage.setItem(TASK_TOAST_STORAGE_KEY, JSON.stringify(map));
  } catch {}
};

const hasShownToast = (key: string) => {
  const map = readToastStore();
  return !!map[key];
};

const markToastShown = (key: string) => {
  const map = readToastStore();
  map[key] = new Date().toISOString();
  writeToastStore(map);
};

export const useTaskNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Vérifier les tâches en retard au chargement
    checkOverdueTasks();
    
    // Vérifier les tâches qui arrivent à échéance bientôt
    checkUpcomingTasks();

    // Configurer un intervalle pour vérifier toutes les 5 minutes
    const interval = setInterval(() => {
      checkOverdueTasks();
      checkUpcomingTasks();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  const checkOverdueTasks = async () => {
    if (!user) return;

    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .not('status', 'in', '(completed,cancelled)')
        .not('due_date', 'is', null)
        .lt('due_date', new Date().toISOString());

      if (error) throw error;

      for (const task of tasks || []) {
        const key = `overdue:${task.id}`;
        if (hasShownToast(key)) continue;

        const { data: existing, error: existingError } = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'task_overdue')
          .eq('data->>task_id', String(task.id))
          .maybeSingle();

        if (existingError) {
          console.warn('⚠️ Impossible de vérifier les notifications existantes (overdue):', existingError);
          // Évite le spam si la vérification échoue
          markToastShown(key);
          continue;
        }

        if (!existing) {
          await supabase
            .from('notifications')
            .insert({
              user_id: task.assigned_to || task.user_id,
              type: 'task_overdue',
              title: 'Tâche en retard',
              message: `La tâche "${task.title}" était due le ${new Date(task.due_date).toLocaleDateString('fr-FR')}`,
              data: {
                task_id: task.id,
                task_title: task.title,
                due_date: task.due_date,
                priority: task.priority
              },
              read: false
            });

          toast.error(`Tâche en retard: ${task.title}`, {
            description: `Due le ${new Date(task.due_date).toLocaleDateString('fr-FR')}`,
            duration: 8000,
          });
          markToastShown(key);
        } else {
          // Déjà notifiée auparavant -> ne pas réafficher
          markToastShown(key);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des tâches en retard:', error);
    }
  };

  const checkUpcomingTasks = async () => {
    if (!user) return;

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
        .not('status', 'in', '(completed,cancelled)')
        .not('due_date', 'is', null)
        .gte('due_date', new Date().toISOString())
        .lt('due_date', tomorrow.toISOString());

      if (error) throw error;

      for (const task of tasks || []) {
        const today = new Date().toISOString().split('T')[0];
        const key = `due_soon:${task.id}:${today}`;
        if (hasShownToast(key)) continue;

        const { data: existing, error: existingError } = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'task_due_soon')
          .eq('data->>task_id', String(task.id))
          .gte('created_at', `${today}T00:00:00Z`)
          .maybeSingle();

        if (existingError) {
          console.warn('⚠️ Impossible de vérifier les notifications existantes (due_soon):', existingError);
          markToastShown(key);
          continue;
        }

        const dueDate = new Date(task.due_date);
        const now = new Date();
        const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

        let message = '';
        if (hoursUntilDue <= 1) {
          message = `La tâche "${task.title}" est due dans moins d'une heure`;
        } else if (hoursUntilDue <= 24) {
          message = `La tâche "${task.title}" est due dans ${hoursUntilDue} heures`;
        }

        if (!existing) {
          await supabase
            .from('notifications')
            .insert({
              user_id: task.assigned_to || task.user_id,
              type: 'task_due_soon',
              title: 'Tâche bientôt due',
              message: message || `La tâche "${task.title}" est bientôt due`,
              data: {
                task_id: task.id,
                task_title: task.title,
                due_date: task.due_date,
                priority: task.priority,
                hours_until_due: hoursUntilDue
              },
              read: false
            });
        }

        if (hoursUntilDue <= 2 && message) {
          toast.warning(`Tâche urgente: ${task.title}`, {
            description: message,
            duration: 6000,
          });
        }

        markToastShown(key);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des tâches à venir:', error);
    }
  };

  return {
    notifications,
    checkOverdueTasks,
    checkUpcomingTasks
  };
};