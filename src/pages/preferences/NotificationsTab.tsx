
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Bell, Mail, CheckSquare, Calendar, MessageSquare, User, Users, AtSign, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  mentions_email: boolean;
  task_reminders_email: boolean;
  tasks: boolean;
  contracts: boolean;
  events: boolean;
  messages: boolean;
  contacts: boolean;
  artists: boolean;
  dashboard: boolean;
  calendar: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  email: true,
  push: true,
  mentions_email: false,
  task_reminders_email: false,
  tasks: true,
  contracts: true,
  events: true,
  messages: true,
  contacts: true,
  artists: true,
  dashboard: true,
  calendar: true,
};

const SETTING_KEY = 'notification_settings';
const MENTION_KEY = 'notify_mentions_by_email';
const TASK_REMINDER_KEY = 'notify_task_reminders_by_email';

export const NotificationsTab: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from Supabase
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .eq('user_id', user.id)
          .in('setting_key', [SETTING_KEY, MENTION_KEY, TASK_REMINDER_KEY]);

        let loaded = { ...DEFAULT_SETTINGS };

        // Migrate from localStorage if exists and no DB data
        const localData = localStorage.getItem('notificationSettings');

        if (data && data.length > 0) {
          data.forEach(row => {
            if (row.setting_key === SETTING_KEY) {
              try {
                const parsed = JSON.parse(row.setting_value);
                loaded = { ...loaded, ...parsed };
              } catch {}
            }
            if (row.setting_key === MENTION_KEY) {
              loaded.mentions_email = row.setting_value === 'true';
            }
            if (row.setting_key === TASK_REMINDER_KEY) {
              loaded.task_reminders_email = row.setting_value === 'true';
            }
          });
        } else if (localData) {
          // Migrate from localStorage
          try {
            const parsed = JSON.parse(localData);
            loaded = { ...loaded, ...parsed };
          } catch {}
        }

        setSettings(loaded);
      } catch (err) {
        console.error('Error loading notification settings:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const updateSetting = useCallback((key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const saveSettings = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      const { mentions_email, task_reminders_email, ...rest } = settings;
      const now = new Date().toISOString();

      // Save main settings
      await supabase
        .from('app_settings')
        .upsert({
          user_id: user.id,
          setting_key: SETTING_KEY,
          setting_value: JSON.stringify(rest),
          updated_at: now,
        }, { onConflict: 'user_id,setting_key' });

      // Save mention email separately (used by DB trigger)
      await supabase
        .from('app_settings')
        .upsert({
          user_id: user.id,
          setting_key: MENTION_KEY,
          setting_value: mentions_email ? 'true' : 'false',
          updated_at: now,
        }, { onConflict: 'user_id,setting_key' });

      // Save task reminders email preference separately (used by edge function)
      await supabase
        .from('app_settings')
        .upsert({
          user_id: user.id,
          setting_key: TASK_REMINDER_KEY,
          setting_value: task_reminders_email ? 'true' : 'false',
          updated_at: now,
        }, { onConflict: 'user_id,setting_key' });

      // Clean up localStorage
      localStorage.removeItem('notificationSettings');

      toast.success("Preferences de notifications sauvegardees");
    } catch (err) {
      console.error('Error saving notification settings:', err);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mentions */}
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
              checked={settings.mentions_email}
              onCheckedChange={(checked) => updateSetting('mentions_email', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rappels tâches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckSquare className="h-5 w-5 mr-2" />
            Rappels de tâches
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Recevez un récapitulatif quotidien par email des tâches en retard et à venir
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label>Email récapitulatif quotidien</Label>
            </div>
            <Switch
              checked={settings.task_reminders_email}
              onCheckedChange={(checked) => updateSetting('task_reminders_email', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Types generaux */}
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
              checked={settings.email}
              onCheckedChange={(checked) => updateSetting('email', checked)}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label>Notifications push</Label>
            </div>
            <Switch
              checked={settings.push}
              onCheckedChange={(checked) => updateSetting('push', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Par module */}
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
          {[
            { key: 'tasks' as const, icon: CheckSquare, label: 'Taches' },
            { key: 'messages' as const, icon: MessageSquare, label: 'Messages' },
            { key: 'events' as const, icon: Calendar, label: 'Evenements' },
            { key: 'contacts' as const, icon: User, label: 'Contacts' },
            { key: 'artists' as const, icon: Users, label: 'Artistes' },
          ].map(({ key, icon: Icon, label }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <Label>{label}</Label>
              </div>
              <Switch
                checked={settings[key]}
                onCheckedChange={(checked) => updateSetting(key, checked)}
              />
            </div>
          ))}

          <Separator />

          {[
            { key: 'contracts' as const, icon: CheckSquare, label: 'Contrats' },
            { key: 'calendar' as const, icon: Calendar, label: 'Calendrier' },
            { key: 'dashboard' as const, icon: CheckSquare, label: 'Tableau de bord' },
          ].map(({ key, icon: Icon, label }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <Label>{label}</Label>
              </div>
              <Switch
                checked={settings[key]}
                onCheckedChange={(checked) => updateSetting(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        onClick={saveSettings}
        disabled={saving}
        className="w-full"
      >
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Sauvegarder les parametres
      </Button>
    </div>
  );
};
