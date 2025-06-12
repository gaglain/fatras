
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MenuManager } from '@/components/MenuManager';
import { useTheme } from '@/contexts/ThemeContext';
import { User, Settings, Layout, Bell, Globe, Shield, Palette, Download, Smartphone } from 'lucide-react';

export const Preferences: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
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
    darkMode: theme === 'dark',
    compactView: false,
    autoSave: true,
    primaryColor: '#8B5CF6',
    accentColor: '#06B6D4',
    colorScheme: 'purple'
  });

  const handleSettingChange = (key: string, value: any) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (key === 'darkMode' && value !== (theme === 'dark')) {
      toggleTheme();
    }
  };

  const applyColorScheme = (scheme: string) => {
    const root = document.documentElement;
    
    switch (scheme) {
      case 'blue':
        root.style.setProperty('--primary', '217 91% 60%');
        root.style.setProperty('--primary-foreground', '0 0% 98%');
        break;
      case 'green':
        root.style.setProperty('--primary', '142 76% 36%');
        root.style.setProperty('--primary-foreground', '355.7 100% 97.3%');
        break;
      case 'red':
        root.style.setProperty('--primary', '0 72% 51%');
        root.style.setProperty('--primary-foreground', '0 0% 98%');
        break;
      case 'orange':
        root.style.setProperty('--primary', '24 95% 53%');
        root.style.setProperty('--primary-foreground', '60 9.1% 97.8%');
        break;
      default: // purple
        root.style.setProperty('--primary', '262.1 83.3% 57.8%');
        root.style.setProperty('--primary-foreground', '210 40% 98%');
    }
    
    setUserSettings(prev => ({ ...prev, colorScheme: scheme }));
  };

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(userSettings));
    alert('Préférences sauvegardées !');
  };

  const downloadApp = (platform: 'ios' | 'android') => {
    alert(`Le téléchargement de l'application ${platform.toUpperCase()} n'est pas encore disponible. Cette fonctionnalité sera ajoutée prochainement.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Préférences</h1>
        <p className="text-muted-foreground mt-2">Configurez votre application selon vos besoins.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Apparence</span>
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

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thème et Couleurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">Utiliser le thème sombre</p>
                </div>
                <Switch
                  checked={userSettings.darkMode}
                  onCheckedChange={(value) => handleSettingChange('darkMode', value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Schéma de couleurs</Label>
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { name: 'purple', color: '#8B5CF6', label: 'Violet' },
                    { name: 'blue', color: '#3B82F6', label: 'Bleu' },
                    { name: 'green', color: '#10B981', label: 'Vert' },
                    { name: 'red', color: '#EF4444', label: 'Rouge' },
                    { name: 'orange', color: '#F97316', label: 'Orange' }
                  ].map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => applyColorScheme(scheme.name)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        userSettings.colorScheme === scheme.name 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: scheme.color }}
                      />
                      <p className="text-xs font-medium">{scheme.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Couleurs personnalisées</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Couleur principale</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={userSettings.primaryColor}
                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={userSettings.primaryColor}
                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                        placeholder="#8B5CF6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Couleur d'accent</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={userSettings.accentColor}
                        onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={userSettings.accentColor}
                        onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                        placeholder="#06B6D4"
                      />
                    </div>
                  </div>
                </div>
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
                  <p className="text-sm text-muted-foreground">Recevoir les notifications par email</p>
                </div>
                <Switch
                  checked={userSettings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications SMS</Label>
                  <p className="text-sm text-muted-foreground">Recevoir les notifications par SMS</p>
                </div>
                <Switch
                  checked={userSettings.smsNotifications}
                  onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications desktop</Label>
                  <p className="text-sm text-muted-foreground">Afficher les notifications sur le bureau</p>
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
                  <Label>Vue compacte</Label>
                  <p className="text-sm text-muted-foreground">
                    Affichage plus dense avec moins d'espacement, icônes plus petites et texte réduit pour voir plus d'informations sur l'écran
                  </p>
                </div>
                <Switch
                  checked={userSettings.compactView}
                  onCheckedChange={(value) => handleSettingChange('compactView', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-muted-foreground">Sauvegarder automatiquement les modifications</p>
                </div>
                <Switch
                  checked={userSettings.autoSave}
                  onCheckedChange={(value) => handleSettingChange('autoSave', value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applications mobiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Téléchargez l'application ShowManager sur votre appareil mobile pour un accès complet en déplacement.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => downloadApp('ios')}
                  className="h-16 flex items-center justify-center space-x-3"
                >
                  <Smartphone className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">App Store</div>
                    <div className="text-xs text-muted-foreground">Télécharger pour iOS</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => downloadApp('android')}
                  className="h-16 flex items-center justify-center space-x-3"
                >
                  <Download className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Google Play</div>
                    <div className="text-xs text-muted-foreground">Télécharger pour Android</div>
                  </div>
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note :</strong> Les applications mobiles iOS et Android sont en cours de développement et seront bientôt disponibles sur les stores officiels.
                </p>
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
