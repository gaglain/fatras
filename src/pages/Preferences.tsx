import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Palette, Bell, Smartphone, Calendar, Mail, Settings, MapPin, User } from 'lucide-react';
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
import { AccountTab } from "./preferences/AccountTab";
import { ContactSettingsTab } from '@/components/preferences/ContactSettingsTab';
import { useSearchParams } from 'react-router-dom';

export const Preferences: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'account';

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Préférences</h1>
        <p className="text-muted-foreground mt-2 text-sm lg:text-base">
          Personnalisez votre expérience
        </p>
      </div>
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex h-auto gap-1 p-1 bg-muted/50 min-w-max sm:flex sm:flex-wrap sm:min-w-0 sm:w-full">
            <TabsTrigger value="account" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Compte</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Entreprise</span>
              <span className="xs:hidden">Cie</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Contact</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Apparence</span>
              <span className="sm:hidden">Style</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>IMAP</span>
            </TabsTrigger>
            <TabsTrigger value="smtp" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>SMTP</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="gmail" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Gmail</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Smartphone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
              <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span>Couleurs</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="account" className="space-y-4">
          <AccountTab />
        </TabsContent>
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
