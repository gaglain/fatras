-- Supprimer les doublons de notifications de tâches (garder seulement la première notification par tâche/type/jour)
DELETE FROM notifications 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY user_id, type, data->>'task_id', DATE(created_at)
      ORDER BY created_at ASC
    ) as rn
    FROM notifications 
    WHERE type IN ('task_due_soon', 'task_overdue', 'task_reminder')
  ) sub 
  WHERE rn > 1
);