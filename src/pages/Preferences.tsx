
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Palette, Bell, Globe, Smartphone, Download, Calendar, Mail, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { CustomColorsForm } from "./preferences/CustomColorsForm";
import { GoogleCalendarTab } from "./preferences/GoogleCalendarTab";
import { GmailTab } from "./preferences/GmailTab";
import { EmailTestComponent } from '@/components/EmailTestComponent';
import {
  CompanyTab,
  AppearanceTab,
  NotificationsTab,
  MobileTab,
  ColorsTab,
  EmailTab,
} from "./preferences";
import { useSearchParams } from 'react-router-dom';

export const Preferences: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'company';

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Préférences</h1>
        <p className="text-muted-foreground mt-2 text-sm lg:text-base">
          Personnalisez votre expérience
        </p>
      </div>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="company" className="text-xs lg:text-sm">
            <Globe className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Entreprise</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs lg:text-sm">
            <Palette className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Apparence</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs lg:text-sm">
            <Bell className="h-4 w-4 lg:mr-2" />
            <span className="hidden sm:inline lg:inline">Notifications</span>
            <span className="sm:hidden">Notifs</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs lg:text-sm">
            <Settings className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="text-xs lg:text-sm">
            <Calendar className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Agenda</span>
          </TabsTrigger>
          <TabsTrigger value="gmail" className="text-xs lg:text-sm">
            <Mail className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Gmail</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="text-xs lg:text-sm">
            <Smartphone className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-xs lg:text-sm">
            <Palette className="h-4 w-4 lg:mr-2" />
            <span className="hidden lg:inline">Couleurs</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="company" className="space-y-4">
          <CompanyTab />
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <AppearanceTab />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab />
        </TabsContent>
        <TabsContent value="email" className="space-y-6">
          <EmailTab />
          <EmailTestComponent />
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <GoogleCalendarTab />
        </TabsContent>
        <TabsContent value="gmail" className="space-y-4">
          <GmailTab />
        </TabsContent>
        <TabsContent value="mobile" className="space-y-4">
          <MobileTab />
        </TabsContent>
        <TabsContent value="colors" className="space-y-4">
          <ColorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
