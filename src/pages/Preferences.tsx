import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Palette, Bell, Globe, Smartphone, Download } from 'lucide-react';
import { toast } from 'sonner';

export const Preferences: React.FC = () => {
  const [companySettings, setCompanySettings] = useState({
    name: 'Fatras Booking',
    logo: '',
    favicon: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    tasks: true,
    contracts: true,
    events: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    compactMode: false,
    sidebarCollapsed: false
  });

  // Charger les paramètres sauvegardés
  useEffect(() => {
    const savedCompany = localStorage.getItem('companySettings');
    const savedNotifications = localStorage.getItem('notificationSettings');
    const savedAppearance = localStorage.getItem('appearanceSettings');

    if (savedCompany) {
      try {
        const settings = JSON.parse(savedCompany);
        setCompanySettings(settings);
        console.log('Paramètres entreprise chargés:', settings);
      } catch (error) {
        console.error('Erreur chargement paramètres entreprise:', error);
      }
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Erreur chargement paramètres notifications:', error);
      }
    }

    if (savedAppearance) {
      try {
        setAppearance(JSON.parse(savedAppearance));
      } catch (error) {
        console.error('Erreur chargement paramètres apparence:', error);
      }
    }
  }, []);

  const saveCompanySettings = () => {
    console.log('Sauvegarde des paramètres:', companySettings);
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    
    // Mettre à jour le favicon si fourni
    if (companySettings.favicon) {
      console.log('Mise à jour du favicon:', companySettings.favicon);
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
        console.log('Nouvel élément link créé pour le favicon');
      }
      
      link.type = 'image/x-icon';
      link.href = companySettings.favicon;
      console.log('Favicon mis à jour:', link.href);
    }

    // Mettre à jour le titre
    if (companySettings.name) {
      document.title = companySettings.name;
      console.log('Titre mis à jour:', companySettings.name);
    }

    // Déclencher un événement pour notifier les autres composants
    const event = new CustomEvent('companySettingsChanged', { 
      detail: companySettings 
    });
    window.dispatchEvent(event);
    console.log('Événement companySettingsChanged déclenché');
    
    toast.success('Paramètres de l\'entreprise sauvegardés');
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    toast.success('Paramètres de notification sauvegardés');
  };

  const saveAppearanceSettings = () => {
    localStorage.setItem('appearanceSettings', JSON.stringify(appearance));
    toast.success('Paramètres d\'apparence sauvegardés');
  };

  const handleFileUpload = (type: 'logo' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`Upload ${type}:`, file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log(`${type} converti en base64, taille:`, result.length);
        setCompanySettings(prev => ({
          ...prev,
          [type]: result
        }));
        toast.success(`${type === 'logo' ? 'Logo' : 'Icône'} chargé avec succès`);
      };
      reader.onerror = (error) => {
        console.error(`Erreur lecture ${type}:`, error);
        toast.error(`Erreur lors du chargement du ${type === 'logo' ? 'logo' : 'favicon'}`);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Préférences</h1>
        <p className="text-muted-foreground mt-2">Personnalisez votre expérience</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Informations de l'entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Nom de l'entreprise</Label>
                <Input
                  id="company-name"
                  value={companySettings.name}
                  onChange={(e) => setCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom de votre entreprise"
                />
              </div>

              <div>
                <Label htmlFor="company-logo">Logo de l'entreprise</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      id="company-logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('logo', e)}
                    />
                  </div>
                  {companySettings.logo && (
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={companySettings.logo}
                        alt="Logo"
                        className="h-12 w-12 object-contain border rounded"
                        onError={(e) => {
                          console.error('Erreur affichage logo:', companySettings.logo);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Badge variant="secondary" className="text-xs">Logo chargé</Badge>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Ce logo apparaîtra dans l'en-tête et sur les documents PDF
                </p>
              </div>

              <div>
                <Label htmlFor="company-favicon">Icône de l'application (Favicon)</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      id="company-favicon"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('favicon', e)}
                    />
                  </div>
                  {companySettings.favicon && (
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={companySettings.favicon}
                        alt="Favicon"
                        className="h-8 w-8 object-contain border rounded"
                        onError={(e) => {
                          console.error('Erreur affichage favicon:', companySettings.favicon);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <Badge variant="secondary" className="text-xs">Icône chargée</Badge>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Cette icône apparaîtra dans l'onglet du navigateur
                </p>
              </div>

              <Button onClick={saveCompanySettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les paramètres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Apparence de l'application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mode compact</Label>
                  <p className="text-sm text-muted-foreground">
                    Réduire l'espacement entre les éléments pour afficher plus d'informations à l'écran. 
                    Utile pour les écrans plus petits ou pour maximiser l'espace de travail.
                  </p>
                </div>
                <Switch
                  checked={appearance.compactMode}
                  onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, compactMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Sidebar réduite par défaut</Label>
                  <p className="text-sm text-muted-foreground">
                    La barre latérale sera repliée au démarrage
                  </p>
                </div>
                <Switch
                  checked={appearance.sidebarCollapsed}
                  onCheckedChange={(checked) => setAppearance(prev => ({ ...prev, sidebarCollapsed: checked }))}
                />
              </div>

              <Button onClick={saveAppearanceSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder l'apparence
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
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
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Notifications push</Label>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Notifications desktop</Label>
                <Switch
                  checked={notifications.desktop}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktop: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Notifications pour les tâches</Label>
                <Switch
                  checked={notifications.tasks}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, tasks: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Notifications pour les contrats</Label>
                <Switch
                  checked={notifications.contracts}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, contracts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Notifications pour les événements</Label>
                <Switch
                  checked={notifications.events}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, events: checked }))}
                />
              </div>

              <Button onClick={saveNotificationSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Applications mobiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Les applications mobiles iOS et Android sont en cours de développement.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" disabled className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    App iOS (Bientôt)
                  </Button>
                  <Button variant="outline" disabled className="flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    App Android (Bientôt)
                  </Button>
                </div>

                <Badge variant="secondary" className="text-xs">
                  En attendant, vous pouvez ajouter cette page à votre écran d'accueil
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
