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
        .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`);

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

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: taskData.user_id,
          assigned_to: taskData.assigned_to,
          contact_id: taskData.contact_id,
          event_id: taskData.event_id,
          artist_id: taskData.artist_id,
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          due_date: taskData.due_date,
          completed_at: taskData.completed_at,
          tags: taskData.tags
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
        due_date: data.due_date || undefined,
        completed_at: data.completed_at || undefined,
        tags: data.tags || [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setTasks(prev => [...prev, newTask]);
      
      // Créer une notification si la tâche a une échéance
      if (newTask.due_date) {
        createTaskNotification(newTask);
      }
      
      return newTask;
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        assigned_to: updates.assigned_to,
        contact_id: updates.contact_id,
        event_id: updates.event_id,
        artist_id: updates.artist_id,
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        status: updates.status,
        due_date: updates.due_date,
        completed_at: updates.completed_at,
        tags: updates.tags
      })
      .eq('id', id)
      .select()
      .single();

    if (data && !error) {
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!error) {
      setTasks(prev => prev.filter(task => task.id !== id));
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
          data: { task_id: task.id, due_date: task.due_date }
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

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getNotifications
  };
};