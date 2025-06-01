
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { MenuManager } from '@/components/MenuManager';
import { User, Settings, Layout, Bell, Globe, Shield } from 'lucide-react';

export const Preferences: React.FC = () => {
  const [userSettings, setUserSettings] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+33 1 23 45 67 89',
    company: 'ShowManager Pro',
    timezone: 'Europe/Paris',
    language: 'fr',
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    darkMode: false,
    compactView: false,
    autoSave: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(userSettings));
    alert('Préférences sauvegardées !');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Préférences</h1>
        <p className="text-gray-600 mt-2">Configurez votre application selon vos besoins.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Menu</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Interface</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Site Web</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Sécurité</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={userSettings.firstName}
                    onChange={(e) => handleSettingChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={userSettings.lastName}
                    onChange={(e) => handleSettingChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userSettings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={userSettings.phone}
                  onChange={(e) => handleSettingChange('phone', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={userSettings.company}
                  onChange={(e) => handleSettingChange('company', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <MenuManager />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-gray-600">Recevoir les notifications par email</p>
                </div>
                <Switch
                  checked={userSettings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications SMS</Label>
                  <p className="text-sm text-gray-600">Recevoir les notifications par SMS</p>
                </div>
                <Switch
                  checked={userSettings.smsNotifications}
                  onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications desktop</Label>
                  <p className="text-sm text-gray-600">Afficher les notifications sur le bureau</p>
                </div>
                <Switch
                  checked={userSettings.desktopNotifications}
                  onCheckedChange={(value) => handleSettingChange('desktopNotifications', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences d'Interface</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mode sombre</Label>
                  <p className="text-sm text-gray-600">Utiliser le thème sombre</p>
                </div>
                <Switch
                  checked={userSettings.darkMode}
                  onCheckedChange={(value) => handleSettingChange('darkMode', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Vue compacte</Label>
                  <p className="text-sm text-gray-600">Affichage plus dense des informations</p>
                </div>
                <Switch
                  checked={userSettings.compactView}
                  onCheckedChange={(value) => handleSettingChange('compactView', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-gray-600">Sauvegarder automatiquement les modifications</p>
                </div>
                <Switch
                  checked={userSettings.autoSave}
                  onCheckedChange={(value) => handleSettingChange('autoSave', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Site Web</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL du site</Label>
                <Input placeholder="https://monsite.com" />
              </div>
              <div>
                <Label>Titre du site</Label>
                <Input placeholder="ShowManager Spectacles" />
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="Votre partenaire pour des spectacles inoubliables" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                Changer le mot de passe
              </Button>
              <Button variant="outline" className="w-full">
                Configurer l'authentification à deux facteurs
              </Button>
              <Button variant="outline" className="w-full">
                Gérer les sessions actives
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={savePreferences} size="lg">
          Sauvegarder toutes les préférences
        </Button>
      </div>
    </div>
  );
};
