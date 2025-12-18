-- Dédupliquer les notifications de tâches (garde la plus récente)
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, type, (data->>'task_id'), (data->>'due_date')
      ORDER BY created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.notifications
  WHERE type IN ('task_due_soon', 'task_overdue')
    AND data ? 'task_id'
    AND data ? 'due_date'
)
DELETE FROM public.notifications n
USING ranked r
WHERE n.id = r.id
  AND r.rn > 1;

-- Empêcher les futurs doublons (unicité par user/type/task_id/due_date)
CREATE UNIQUE INDEX IF NOT EXISTS notifications_task_dedup_idx
ON public.notifications (user_id, type, (data->>'task_id'), (data->>'due_date'))
WHERE type IN ('task_due_soon', 'task_overdue')
  AND data ? 'task_id'
  AND data ? 'due_date';
