
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    tasks: true,
    contracts: true,
    events: true
  });

  useEffect(() => {
    const savedNotifications = localStorage.getItem("notificationSettings");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch {}
    }
  }, []);

  const saveNotificationSettings = () => {
    localStorage.setItem("notificationSettings", JSON.stringify(notifications));
    toast.success("Paramètres de notification sauvegardés");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Paramètres de notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Notifications par email</Label>
          <Switch
            checked={notifications.email}
            onCheckedChange={checked => setNotifications(prev => ({ ...prev, email: checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Notifications push</Label>
          <Switch
            checked={notifications.push}
            onCheckedChange={checked => setNotifications(prev => ({ ...prev, push: checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Notifications desktop</Label>
          <Switch
            checked={notifications.desktop}
            onCheckedChange={checked => setNotifications(prev => ({ ...prev, desktop: checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Notifications pour les tâches</Label>
          <Switch
            checked={notifications.tasks}
            onCheckedChange={checked => setNotifications(prev => ({ ...prev, tasks: checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Notifications pour les contrats</Label>
          <Switch
            checked={notifications.contracts}
            onCheckedChange={checked => setNotifications(prev => ({ ...prev, contracts: checked }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Notifications pour les événements</Label>
          <Switch
            checked={notifications.events}
            onCheckedChange={checked => setNotifications(prev => ({ ...prev, events: checked }))}
          />
        </div>
        <Button onClick={saveNotificationSettings} className="w-full bg-[#ec5f65] hover:bg-[#ec5f65]/90 text-white">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les notifications
        </Button>
      </CardContent>
    </Card>
  );
};
