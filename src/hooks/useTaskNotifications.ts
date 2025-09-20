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
        // Vérifier si on a déjà notifié pour cette tâche
        const existingNotification = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'task_overdue')
          .eq('data->>task_id', task.id)
          .single();

        if (!existingNotification.data) {
          // Créer une notification de tâche en retard
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

          // Afficher une notification toast
          toast.error(`Tâche en retard: ${task.title}`, {
            description: `Due le ${new Date(task.due_date).toLocaleDateString('fr-FR')}`,
            duration: 8000,
          });
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
        // Vérifier si on a déjà notifié pour cette tâche aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const existingNotification = await supabase
          .from('notifications')
          .select('id')
          .eq('type', 'task_due_soon')
          .eq('data->>task_id', task.id)
          .gte('created_at', `${today}T00:00:00Z`)
          .single();

        if (!existingNotification.data) {
          const dueDate = new Date(task.due_date);
          const now = new Date();
          const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

          let message = '';
          if (hoursUntilDue <= 1) {
            message = `La tâche "${task.title}" est due dans moins d'une heure`;
          } else if (hoursUntilDue <= 24) {
            message = `La tâche "${task.title}" est due dans ${hoursUntilDue} heures`;
          }

          if (message && hoursUntilDue <= 24) {
            // Créer une notification de tâche bientôt due
            await supabase
              .from('notifications')
              .insert({
                user_id: task.assigned_to || task.user_id,
                type: 'task_due_soon',
                title: 'Tâche bientôt due',
                message,
                data: {
                  task_id: task.id,
                  task_title: task.title,
                  due_date: task.due_date,
                  priority: task.priority,
                  hours_until_due: hoursUntilDue
                },
                read: false
              });

            // Afficher une notification toast pour les tâches urgentes (moins de 2 heures)
            if (hoursUntilDue <= 2) {
              toast.warning(`Tâche urgente: ${task.title}`, {
                description: message,
                duration: 6000,
              });
            }
          }
        }
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