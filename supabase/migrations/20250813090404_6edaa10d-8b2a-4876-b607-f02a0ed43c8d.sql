-- Activer le temps réel pour toutes les tables principales
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;  
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.email_campaigns REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events; 
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;