
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Palette, Bell, Smartphone, Calendar, Mail, Settings, MapPin } from 'lucide-react';
import { CustomColorsForm } from "./preferences/CustomColorsForm";
import { GoogleCalendarTab } from "./preferences/GoogleCalendarTab";
import { GmailTab } from "./preferences/GmailTab";
import { EmailTestComponent } from '@/components/EmailTestComponent';
import { EmailInbox } from '@/components/EmailInbox';
import {
  CompanyTab,
  AppearanceTab,
  NotificationsTab,
  MobileTab,
  ColorsTab,
  EmailTab,
  SmtpTab,
} from "./preferences";
import { ContactSettingsTab } from '@/components/preferences/ContactSettingsTab';
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
        <TabsList className="w-full flex flex-wrap h-auto gap-2 p-2 bg-muted/50">
          <TabsTrigger value="company" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Globe className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Entreprise</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <MapPin className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Contact</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Palette className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Apparence</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Bell className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
            <span>IMAP</span>
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Mail className="h-4 w-4 mr-1 sm:mr-2" />
            <span>SMTP</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Agenda</span>
          </TabsTrigger>
          <TabsTrigger value="gmail" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Mail className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Gmail</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Smartphone className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex-1 min-w-[100px] text-xs sm:text-sm data-[state=active]:bg-background">
            <Palette className="h-4 w-4 mr-1 sm:mr-2" />
            <span>Couleurs</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="company" className="space-y-4">
          <CompanyTab />
        </TabsContent>
        <TabsContent value="contact" className="space-y-4">
          <ContactSettingsTab />
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
          <EmailInbox />
        </TabsContent>
        <TabsContent value="smtp" className="space-y-6">
          <SmtpTab />
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
