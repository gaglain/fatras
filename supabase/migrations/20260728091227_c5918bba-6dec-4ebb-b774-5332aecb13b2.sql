DROP TRIGGER IF EXISTS trigger_badge_sync_notifications ON public.notifications;
CREATE TRIGGER trigger_badge_sync_notifications
AFTER UPDATE OR DELETE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.dispatch_push_badge_sync_on_notification_change();

DROP TRIGGER IF EXISTS trigger_badge_sync_email_notifications ON public.email_notifications;
CREATE TRIGGER trigger_badge_sync_email_notifications
AFTER UPDATE OR DELETE ON public.email_notifications
FOR EACH ROW EXECUTE FUNCTION public.dispatch_push_badge_sync_on_notification_change();