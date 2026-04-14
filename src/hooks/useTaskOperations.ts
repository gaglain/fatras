import { supabase } from '@/integrations/supabase/client';
import { notifyTaskAssignment } from '@/utils/notificationHelpers';
import { logger } from '@/lib/logger';

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

export function mapRowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id,
    user_id: row.user_id,
    assigned_to: row.assigned_to || undefined,
    contact_id: row.contact_id || undefined,
    event_id: row.event_id || undefined,
    artist_id: row.artist_id || undefined,
    title: row.title,
    description: row.description || '',
    priority: row.priority,
    status: row.status,
    task_type: row.task_type,
    due_date: row.due_date || undefined,
    completed_at: row.completed_at || undefined,
    tags: row.tags || [],
    created_at: row.created_at,
    updated_at: row.updated_at
  } as Task;
}

export async function addTaskAction(
  taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>,
  userId: string,
  userEmail?: string
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      assigned_to: taskData.assigned_to,
      contact_id: taskData.contact_id,
      event_id: taskData.event_id,
      artist_id: taskData.artist_id || null,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      task_type: taskData.task_type,
      due_date: taskData.due_date,
      completed_at: taskData.completed_at,
      tags: taskData.tags
    })
    .select()
    .single();

  if (error) throw error;
  const newTask = mapRowToTask(data as any);

  if (newTask.assigned_to && newTask.assigned_to !== userId && userEmail) {
    await notifyTaskAssignment({ assignedToUserId: newTask.assigned_to, taskTitle: newTask.title, assignedByUserEmail: userEmail, taskId: newTask.id });
  }

  if (newTask.due_date) {
    await createTaskNotification(newTask, userId);
  }
  await createSimpleTaskNotification(newTask, userId);

  return newTask;
}

export async function updateTaskAction(
  id: string, updates: Partial<Task>, currentTask: Task | undefined,
  userId: string, userEmail?: string
): Promise<Task> {
  const updateData: Record<string, unknown> = {};
  const fields = ['assigned_to', 'contact_id', 'event_id', 'artist_id', 'title', 'description', 'priority', 'status', 'task_type', 'due_date', 'completed_at', 'tags'] as const;
  for (const f of fields) {
    if (updates[f] !== undefined) updateData[f] = updates[f];
  }
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from('tasks').update(updateData).eq('id', id).select().single();
  if (error) throw error;
  const updatedTask = mapRowToTask(data as any);

  if (updates.assigned_to && currentTask?.assigned_to !== updates.assigned_to && updates.assigned_to !== userId && userEmail) {
    await notifyTaskAssignment({ assignedToUserId: updates.assigned_to, taskTitle: updatedTask.title, assignedByUserEmail: userEmail, taskId: updatedTask.id });
  }

  return updatedTask;
}

export async function deleteTaskAction(id: string): Promise<void> {
  await supabase.from('notifications').delete()
    .or(`and(type.eq.task_reminder,data->>task_id.eq.${id}),and(type.eq.task_created,data->>task_id.eq.${id}),and(type.eq.task_overdue,data->>task_id.eq.${id})`);
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

async function createTaskNotification(task: Task, userId: string) {
  if (!task.due_date) return;
  try {
    await supabase.from('notifications').insert({
      user_id: task.assigned_to || task.user_id,
      type: 'task_reminder',
      title: 'Rappel de tâche',
      message: `La tâche "${task.title}" arrive à échéance le ${new Date(task.due_date).toLocaleString('fr-FR')}`,
      read: false,
      data: { task_id: task.id, due_date: task.due_date }
    });
  } catch (error) { logger.error('Erreur notification tâche:', error); }
}

async function createSimpleTaskNotification(task: Task, userId: string) {
  try {
    await supabase.from('notifications').insert({
      user_id: task.assigned_to || task.user_id,
      type: 'task_created',
      title: 'Nouvelle tâche assignée',
      message: `Une nouvelle tâche "${task.title}" vous a été assignée`,
      read: false,
      data: { task_id: task.id, task_title: task.title }
    });
  } catch (error) { logger.error('Erreur notification tâche:', error); }
}
