
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Palette, Bell, Globe, Smartphone, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { CustomColorsForm } from "./preferences/CustomColorsForm";
import { GoogleCalendarTab } from "./preferences/GoogleCalendarTab";
import {
  CompanyTab,
  AppearanceTab,
  NotificationsTab,
  MobileTab,
  ColorsTab,
} from "./preferences";
import { useSearchParams } from 'react-router-dom';

export const Preferences: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'company';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Préférences</h1>
        <p className="text-muted-foreground mt-2">
          Personnalisez votre expérience
        </p>
      </div>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Agenda
          </TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
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
        <TabsContent value="calendar" className="space-y-4">
          <GoogleCalendarTab />
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
