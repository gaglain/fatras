
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Bell, Mail, CheckSquare, Calendar, MessageSquare, User, Users, AtSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  tasks: boolean;
  contracts: boolean;
  events: boolean;
  messages: boolean;
  contacts: boolean;
  artists: boolean;
  dashboard: boolean;
  calendar: boolean;
}

export const NotificationsTab: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    push: true,
    tasks: true,
    contracts: true,
    events: true,
    messages: true,
    contacts: true,
    artists: true,
    dashboard: true,
    calendar: true
  });

  const [mentionEmailEnabled, setMentionEmailEnabled] = useState(false);
  const [mentionEmailLoading, setMentionEmailLoading] = useState(true);

  useEffect(() => {
    const savedNotifications = localStorage.getItem("notificationSettings");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch {}
    }
  }, []);

  // Load mention email preference from Supabase
  useEffect(() => {
    if (!user?.id) return;
    const loadMentionPref = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('user_id', user.id)
        .eq('setting_key', 'notify_mentions_by_email')
        .maybeSingle();
      setMentionEmailEnabled(data?.setting_value === 'true');
      setMentionEmailLoading(false);
    };
    loadMentionPref();
  }, [user?.id]);

  const toggleMentionEmail = async (enabled: boolean) => {
    if (!user?.id) return;
    setMentionEmailEnabled(enabled);

    const { error } = await supabase
      .from('app_settings')
      .upsert({
        user_id: user.id,
        setting_key: 'notify_mentions_by_email',
        setting_value: enabled ? 'true' : 'false',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,setting_key' });

    if (error) {
      console.error('Error saving mention email pref:', error);
      toast.error("Erreur lors de la sauvegarde");
      setMentionEmailEnabled(!enabled);
    } else {
      toast.success(enabled ? "Notifications email pour les mentions activees" : "Notifications email pour les mentions desactivees");
    }
  };

  const saveNotificationSettings = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(notifications));
    toast.success("Parametres de notification sauvegardes");
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Email sur mentions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AtSign className="h-5 w-5 mr-2" />
            Mentions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Recevez un email quand quelqu'un vous mentionne (@) dans un message ou une note
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label>Email lors d'une mention</Label>
            </div>
            <Switch
              checked={mentionEmailEnabled}
              onCheckedChange={toggleMentionEmail}
              disabled={mentionEmailLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Types de notifications generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Types de notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label>Notifications par email</Label>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => updateSetting('email', checked)}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label>Notifications push</Label>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) => updateSetting('push', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications par module */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="h-5 w-5 mr-2" />
            Notifications par module
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choisissez quels modules peuvent vous envoyer des notifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <Label>Taches</Label>
            </div>
            <Switch
              checked={notifications.tasks}
              onCheckedChange={(checked) => updateSetting('tasks', checked)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label>Messages</Label>
            </div>
            <Switch
              checked={notifications.messages}
              onCheckedChange={(checked) => updateSetting('messages', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label>Evenements</Label>
            </div>
            <Switch
              checked={notifications.events}
              onCheckedChange={(checked) => updateSetting('events', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label>Contacts</Label>
            </div>
            <Switch
              checked={notifications.contacts}
              onCheckedChange={(checked) => updateSetting('contacts', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label>Artistes</Label>
            </div>
            <Switch
              checked={notifications.artists}
              onCheckedChange={(checked) => updateSetting('artists', checked)}
            />
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <Label>Contrats</Label>
            </div>
            <Switch
              checked={notifications.contracts}
              onCheckedChange={(checked) => updateSetting('contracts', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label>Calendrier</Label>
            </div>
            <Switch
              checked={notifications.calendar}
              onCheckedChange={(checked) => updateSetting('calendar', checked)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <Label>Tableau de bord</Label>
            </div>
            <Switch
              checked={notifications.dashboard}
              onCheckedChange={(checked) => updateSetting('dashboard', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={saveNotificationSettings} 
        className="w-full bg-[#ec5f65] hover:bg-[#ec5f65]/90 text-white"
      >
        <Save className="h-4 w-4 mr-2" />
        Sauvegarder les parametres
      </Button>
    </div>
  );
};
