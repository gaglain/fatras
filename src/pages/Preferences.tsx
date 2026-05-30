import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Palette, Bell, Smartphone, Calendar, Mail, Settings, MapPin, User, Route } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';

const tabOptions = [
  { value: 'account', label: 'Compte', icon: User },
  { value: 'company', label: 'Entreprise', icon: Globe },
  { value: 'contact', label: 'Contact', icon: MapPin },
  { value: 'appearance', label: 'Apparence', icon: Palette },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'smtp', label: 'SMTP', icon: Mail },
  { value: 'calendar', label: 'Agenda', icon: Calendar },
  { value: 'gmail', label: 'Gmail', icon: Mail },
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'colors', label: 'Couleurs', icon: Palette },
];

export const Preferences: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'account';
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Preferences</h1>
        <p className="text-muted-foreground mt-2 text-sm lg:text-base">
          Personnalisez votre experience
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {isMobile ? (
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="mb-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map(tab => (
                <SelectItem key={tab.value} value={tab.value}>
                  <span className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/50 w-full mb-4">
            {tabOptions.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 data-[state=active]:bg-background whitespace-nowrap">
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        )}

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
