import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { Task, mapRowToTask, addTaskAction, updateTaskAction, deleteTaskAction } from './useTaskOperations';

export type { Task };

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user?.id) return;

    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (data && !error) setTasks(data.map(t => mapRowToTask(t as any)));
      setLoading(false);
    };

    fetchTasks();

    const channelName = `tasks-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, handleTaskRealtime)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `assigned_to=eq.${user.id}` }, handleTaskRealtime)
      .subscribe();

    function handleTaskRealtime(payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) {
      if (payload.eventType === 'INSERT') {
        const newTask = payload.new;
        setTasks(prev => prev.find(t => t.id === newTask.id) ? prev : [...prev, mapRowToTask(newTask)]);
      } else if (payload.eventType === 'UPDATE') {
        setTasks(prev => prev.map(t => t.id === payload.new.id ? mapRowToTask(payload.new) : t));
      } else if (payload.eventType === 'DELETE') {
        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      }
    }

    return () => {
      setTimeout(() => { try { supabase.removeChannel(channel); } catch (err) { logger.warn('Warning during tasks cleanup:', err); } }, 100);
    };
  }, [user?.id]);

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask = await addTaskAction(taskData, user?.id || taskData.user_id, user?.email || undefined);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const currentTask = tasks.find(t => t.id === id);
    const updatedTask = await updateTaskAction(id, updates, currentTask, user?.id || '', user?.email || undefined);
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    await deleteTaskAction(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getNotifications = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) { logger.error('Erreur notifications:', error); return []; }
  };

  const createTestNotification = async () => {
    if (!user) return;
    try {
      await supabase.from('notifications').insert({ user_id: user.id, type: 'test', title: 'Test notification', message: 'Ceci est une notification de test', read: false, data: { test: true } });
    } catch (error) { logger.error('Erreur notification test:', error); }
  };

  return { tasks, loading, addTask, updateTask, deleteTask, getNotifications, createTestNotification };
};
