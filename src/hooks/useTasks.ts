import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Task {
  id: string;
  user_id: string;
  assigned_to?: string;
  contact_id?: string;
  event_id?: string;
  artist_id?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  task_type: 'Email' | 'Telephone' | 'RDV' | 'Autre';
  due_date?: string;
  completed_at?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        const tasksData: Task[] = data.map(task => ({
          id: task.id,
          user_id: task.user_id,
          assigned_to: task.assigned_to || undefined,
          contact_id: task.contact_id || undefined,
          event_id: task.event_id || undefined,
          artist_id: task.artist_id || undefined,
          title: task.title,
          description: task.description || '',
          priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
          status: task.status as 'todo' | 'in_progress' | 'completed' | 'cancelled',
          task_type: task.task_type as 'Email' | 'Telephone' | 'RDV' | 'Autre',
          due_date: task.due_date || undefined,
          completed_at: task.completed_at || undefined,
          tags: task.tags || [],
          created_at: task.created_at,
          updated_at: task.updated_at
        }));
        setTasks(tasksData);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  // Configuration des mises à jour en temps réel désactivée temporairement
  // useEffect(() => {
  //   if (!user) return;

  //   // Créer un nom de canal unique pour éviter les conflits
  //   const channelName = `tasks-realtime-${user.id}-${Date.now()}`;
  //   console.log('Creating tasks channel:', channelName);
    
  //   const channel = supabase
  //     .channel(channelName)
  //     .on('postgres_changes', {
  //       event: 'INSERT',
  //       schema: 'public',
  //       table: 'tasks'
  //     }, (payload) => {
  //       console.log('Task INSERT:', payload);
  //       const newTask = payload.new;
  //       if (newTask.user_id === user.id || newTask.assigned_to === user.id) {
  //         const taskData: Task = {
  //           id: newTask.id,
  //           user_id: newTask.user_id,
  //           assigned_to: newTask.assigned_to || undefined,
  //           contact_id: newTask.contact_id || undefined,
  //           event_id: newTask.event_id || undefined,
  //           artist_id: newTask.artist_id || undefined,
  //           title: newTask.title,
  //           description: newTask.description || '',
  //           priority: newTask.priority as 'low' | 'medium' | 'high' | 'urgent',
  //           status: newTask.status as 'todo' | 'in_progress' | 'completed' | 'cancelled',
  //           due_date: newTask.due_date || undefined,
  //           completed_at: newTask.completed_at || undefined,
  //           tags: newTask.tags || [],
  //           created_at: newTask.created_at,
  //           updated_at: newTask.updated_at
  //         };
  //         setTasks(prev => [...prev, taskData]);
  //       }
  //     })
  //     .on('postgres_changes', {
  //       event: 'UPDATE',
  //       schema: 'public',
  //       table: 'tasks'
  //     }, (payload) => {
  //       console.log('Task UPDATE:', payload);
  //       const updatedTask = payload.new;
  //       if (updatedTask.user_id === user.id || updatedTask.assigned_to === user.id) {
  //         const taskData: Task = {
  //           id: updatedTask.id,
  //           user_id: updatedTask.user_id,
  //           assigned_to: updatedTask.assigned_to || undefined,
  //           contact_id: updatedTask.contact_id || undefined,
  //           event_id: updatedTask.event_id || undefined,
  //           artist_id: updatedTask.artist_id || undefined,
  //           title: updatedTask.title,
  //           description: updatedTask.description || '',
  //           priority: updatedTask.priority as 'low' | 'medium' | 'high' | 'urgent',
  //           status: updatedTask.status as 'todo' | 'in_progress' | 'completed' | 'cancelled',
  //           due_date: updatedTask.due_date || undefined,
  //           completed_at: updatedTask.completed_at || undefined,
  //           tags: updatedTask.tags || [],
  //           created_at: updatedTask.created_at,
  //           updated_at: updatedTask.updated_at
  //         };
  //         setTasks(prev => prev.map(task => task.id === updatedTask.id ? taskData : task));
  //       }
  //     })
  //     .on('postgres_changes', {
  //       event: 'DELETE',
  //       schema: 'public',
  //       table: 'tasks'
  //     }, (payload) => {
  //       console.log('Task DELETE:', payload);
  //       const deletedTask = payload.old;
  //       setTasks(prev => prev.filter(task => task.id !== deletedTask.id));
  //     });

  //   // S'abonner au canal
  //   const subscription = channel.subscribe((status) => {
  //     console.log('Tasks channel subscription status:', status);
  //   });

  //   return () => {
  //     console.log('Cleaning up tasks channel:', channelName);
  //     supabase.removeChannel(channel);
  //   };
  // }, [user?.id]); // Dépendance uniquement sur user.id pour éviter les re-créations inutiles

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // S'assurer que les liaisons avec les artistes sont préservées
      const taskWithRequiredData = {
        ...taskData,
        user_id: user?.id || taskData.user_id,
        artist_id: taskData.artist_id || null // Garder la liaison artiste
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: taskWithRequiredData.user_id,
          assigned_to: taskWithRequiredData.assigned_to,
          contact_id: taskWithRequiredData.contact_id,
          event_id: taskWithRequiredData.event_id,
          artist_id: taskWithRequiredData.artist_id,
          title: taskWithRequiredData.title,
          description: taskWithRequiredData.description,
          priority: taskWithRequiredData.priority,
          status: taskWithRequiredData.status,
          task_type: taskWithRequiredData.task_type,
          due_date: taskWithRequiredData.due_date,
          completed_at: taskWithRequiredData.completed_at,
          tags: taskWithRequiredData.tags
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        user_id: data.user_id,
        assigned_to: data.assigned_to || undefined,
        contact_id: data.contact_id || undefined,
        event_id: data.event_id || undefined,
        artist_id: data.artist_id || undefined,
        title: data.title,
        description: data.description || '',
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: data.status as 'todo' | 'in_progress' | 'completed' | 'cancelled',
        task_type: data.task_type as 'Email' | 'Telephone' | 'RDV' | 'Autre',
        due_date: data.due_date || undefined,
        completed_at: data.completed_at || undefined,
        tags: data.tags || [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setTasks(prev => [...prev, newTask]);
      
      // Créer une notification si la tâche a une échéance
      if (newTask.due_date) {
        await createTaskNotification(newTask);
      }
      
      // Créer aussi une notification simple pour informer de la création
      await createSimpleTaskNotification(newTask);
      
      return newTask;
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      console.log('🔄 Updating task:', id, updates);
      
      // Préparer les données pour la mise à jour en filtrant les valeurs undefined
      const updateData: any = {};
      
      if (updates.assigned_to !== undefined) updateData.assigned_to = updates.assigned_to;
      if (updates.contact_id !== undefined) updateData.contact_id = updates.contact_id;
      if (updates.event_id !== undefined) updateData.event_id = updates.event_id;
      if (updates.artist_id !== undefined) updateData.artist_id = updates.artist_id;
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.task_type !== undefined) updateData.task_type = updates.task_type;
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
      if (updates.completed_at !== undefined) updateData.completed_at = updates.completed_at;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      
      // Forcer la mise à jour du timestamp
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating task:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Task updated successfully:', data);
        // Construire l'objet task complet pour la mise à jour locale
        const updatedTask: Task = {
          id: data.id,
          user_id: data.user_id,
          assigned_to: data.assigned_to || undefined,
          contact_id: data.contact_id || undefined,
          event_id: data.event_id || undefined,
          artist_id: data.artist_id || undefined,
          title: data.title,
          description: data.description || '',
          priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
          status: data.status as 'todo' | 'in_progress' | 'completed' | 'cancelled',
          task_type: data.task_type as 'Email' | 'Telephone' | 'RDV' | 'Autre',
          due_date: data.due_date || undefined,
          completed_at: data.completed_at || undefined,
          tags: data.tags || [],
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        
        setTasks(prev => prev.map(task => 
          task.id === id ? updatedTask : task
        ));
        
        return updatedTask;
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Supprimer d'abord toutes les notifications liées à cette tâche
      await supabase
        .from('notifications')
        .delete()
        .or(`and(type.eq.task_reminder,data->>task_id.eq.${id}),and(type.eq.task_created,data->>task_id.eq.${id}),and(type.eq.task_overdue,data->>task_id.eq.${id})`);

      // Puis supprimer la tâche
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (!error) {
        setTasks(prev => prev.filter(task => task.id !== id));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      throw error;
    }
  };

  const createTaskNotification = async (task: Task) => {
    if (!task.due_date || !user) return;
    
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: task.assigned_to || task.user_id,
          type: 'task_reminder',
          title: 'Rappel de tâche',
          message: `La tâche "${task.title}" arrive à échéance le ${new Date(task.due_date).toLocaleString('fr-FR')}`,
          read: false, // Explicitement non lue
          data: { task_id: task.id, due_date: task.due_date }
        });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  };

  // Créer une notification simple pour toute nouvelle tâche
  const createSimpleTaskNotification = async (task: Task) => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: task.assigned_to || task.user_id,
          type: 'task_created',
          title: 'Nouvelle tâche assignée',
          message: `Une nouvelle tâche "${task.title}" vous a été assignée`,
          read: false, // Explicitement non lue
          data: { task_id: task.id, task_title: task.title }
        });
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
    }
  };

  // Fonction pour récupérer les notifications
  const getNotifications = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  };

  // Créer une notification test pour voir le point rouge
  const createTestNotification = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'test',
          title: 'Test notification',
          message: 'Ceci est une notification de test pour vérifier le système',
          read: false, // Explicitement non lue
          data: { test: true }
        });
    } catch (error) {
      console.error('Erreur lors de la création de la notification de test:', error);
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getNotifications,
    createTestNotification
  };
};