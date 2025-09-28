-- Execute the previously prepared migration for sync tasks and notifications
CREATE TABLE public.sync_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('email', 'calendar')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  sync_interval_minutes INTEGER NOT NULL DEFAULT 15,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.sync_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('email', 'calendar')),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('success', 'error', 'warning')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their sync tasks" 
ON public.sync_tasks 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their notifications" 
ON public.sync_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" 
ON public.sync_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_sync_tasks_user_type ON public.sync_tasks(user_id, sync_type);
CREATE INDEX idx_sync_tasks_next_sync ON public.sync_tasks(next_sync_at) WHERE is_enabled = true;
CREATE INDEX idx_sync_notifications_user_unread ON public.sync_notifications(user_id, is_read);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_sync_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_sync_tasks_updated_at
BEFORE UPDATE ON public.sync_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_sync_tasks_updated_at();