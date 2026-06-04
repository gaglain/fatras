import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSyncTasks } from '@/hooks/useSyncTasks';
import { useEmailSync } from '@/hooks/useEmailSync';
import { Mail, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const SyncManager: React.FC = () => {
  const { 
    tasks, 
    notifications, 
    loading, 
    createOrUpdateTask, 
    markNotificationAsRead,
    getUnreadNotificationsCount 
  } = useSyncTasks();
  
  const { syncEmails, testImapConnection, isLoading: emailSyncLoading } = useEmailSync();
  const [emailInterval, setEmailInterval] = React.useState(15);
  const [calendarInterval, setCalendarInterval] = React.useState(30);

  const emailTask = tasks.find(task => task.sync_type === 'email');
  const calendarTask = tasks.find(task => task.sync_type === 'calendar');
  const unreadCount = getUnreadNotificationsCount();

  const handleManualEmailSync = async () => {
    try {
      await syncEmails();
      toast.success('Synchronisation manuelle des emails lancée');
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatNextSync = (nextSyncAt: string | null) => {
    if (!nextSyncAt) return 'Non programmée';
    const date = new Date(nextSyncAt);
    return formatDistanceToNow(date, { locale: fr, addSuffix: true });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Synchronisation des emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Synchronisation des emails
          </CardTitle>
          <CardDescription>
            Configuration de la synchronisation automatique des emails IMAP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-sync">Synchronisation automatique</Label>
              <p className="text-sm text-muted-foreground">
                Synchronise automatiquement vos emails toutes les {emailInterval} minutes
              </p>
            </div>
            <Switch
              id="email-sync"
              checked={emailTask?.is_enabled || false}
              onCheckedChange={(checked) => 
                createOrUpdateTask('email', checked, emailInterval)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email-interval">Intervalle (minutes)</Label>
              <Input
                id="email-interval"
                type="number"
                min="5"
                max="1440"
                value={emailInterval}
                onChange={(e) => setEmailInterval(parseInt(e.target.value) || 15)}
                onBlur={() => {
                  if (emailTask?.is_enabled) {
                    createOrUpdateTask('email', true, emailInterval);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Prochaine synchronisation</Label>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {formatNextSync(emailTask?.next_sync_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleManualEmailSync}
              disabled={emailSyncLoading}
              className="w-full sm:w-auto"
            >
              {emailSyncLoading ? 'Synchronisation...' : 'Synchroniser maintenant'}
            </Button>
            <Button 
              variant="outline" 
              onClick={testImapConnection}
              disabled={emailSyncLoading}
              className="w-full sm:w-auto"
            >
              Tester la connexion IMAP
            </Button>
          </div>


          {emailTask?.last_sync_at && (
            <div className="text-sm text-muted-foreground">
              Dernière synchronisation: {formatDistanceToNow(new Date(emailTask.last_sync_at), { locale: fr, addSuffix: true })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Synchronisation du calendrier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Synchronisation du calendrier
          </CardTitle>
          <CardDescription>
            Configuration de la synchronisation automatique du calendrier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="calendar-sync">Synchronisation automatique</Label>
              <p className="text-sm text-muted-foreground">
                Synchronise automatiquement votre calendrier toutes les {calendarInterval} minutes
              </p>
            </div>
            <Switch
              id="calendar-sync"
              checked={calendarTask?.is_enabled || false}
              onCheckedChange={(checked) => 
                createOrUpdateTask('calendar', checked, calendarInterval)
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-interval">Intervalle (minutes)</Label>
              <Input
                id="calendar-interval"
                type="number"
                min="5"
                max="1440"
                value={calendarInterval}
                onChange={(e) => setCalendarInterval(parseInt(e.target.value) || 30)}
                onBlur={() => {
                  if (calendarTask?.is_enabled) {
                    createOrUpdateTask('calendar', true, calendarInterval);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Prochaine synchronisation</Label>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {formatNextSync(calendarTask?.next_sync_at)}
              </p>
            </div>
          </div>

          {calendarTask?.last_sync_at && (
            <div className="text-sm text-muted-foreground">
              Dernière synchronisation: {formatDistanceToNow(new Date(calendarTask.last_sync_at), { locale: fr, addSuffix: true })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications de synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications de synchronisation
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Historique des synchronisations et notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucune notification de synchronisation
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    notification.is_read ? 'bg-muted/50' : 'bg-background'
                  }`}
                  onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                >
                  {getNotificationIcon(notification.notification_type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { locale: fr, addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.sync_type}
                      </Badge>
                      {!notification.is_read && (
                        <Badge variant="secondary" className="text-xs">
                          Non lu
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};