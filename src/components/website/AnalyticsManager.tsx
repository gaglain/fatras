
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Eye, 
  TrendingUp, 
  Globe,
  Save,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsSettings {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  hotjarId: string;
  enableHeatmaps: boolean;
  enableUserRecordings: boolean;
}

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: string;
  topPages: Array<{ path: string; views: number; percentage: number }>;
  trafficSources: Array<{ source: string; visits: number; percentage: number }>;
}

const defaultAnalyticsSettings: AnalyticsSettings = {
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  hotjarId: '',
  enableHeatmaps: true,
  enableUserRecordings: false
};

// Données d'exemple (en production, ces données viendraient de l'API Analytics)
const mockAnalyticsData: AnalyticsData = {
  pageViews: 2845,
  uniqueVisitors: 1923,
  bounceRate: 42.8,
  avgSessionDuration: '3m 24s',
  topPages: [
    { path: '/front', views: 1250, percentage: 43.9 },
    { path: '/front/artists', views: 680, percentage: 23.9 },
    { path: '/front/events', views: 420, percentage: 14.8 },
    { path: '/front/shop', views: 295, percentage: 10.4 },
    { path: '/front/contact', views: 200, percentage: 7.0 }
  ],
  trafficSources: [
    { source: 'Direct', visits: 1138, percentage: 40.0 },
    { source: 'Google', visits: 854, percentage: 30.0 },
    { source: 'Réseaux sociaux', visits: 569, percentage: 20.0 },
    { source: 'Référencement', visits: 284, percentage: 10.0 }
  ]
};

export const AnalyticsManager: React.FC = () => {
  const [settings, setSettings] = useState<AnalyticsSettings>(defaultAnalyticsSettings);
  const [analyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  useEffect(() => {
    const savedSettings = localStorage.getItem('analytics_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Erreur chargement analytics:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('analytics_settings', JSON.stringify(settings));
    
    // Intégrer Google Analytics si l'ID est fourni
    if (settings.googleAnalyticsId) {
      // Supprimer l'ancien script s'il existe
      const existingScript = document.getElementById('ga-script');
      if (existingScript) {
        existingScript.remove();
      }

      // Ajouter le nouveau script Google Analytics
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`;
      script.async = true;
      document.head.appendChild(script);

      // Configuration GA
      const configScript = document.createElement('script');
      configScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.googleAnalyticsId}');
      `;
      document.head.appendChild(configScript);
    }

    toast.success('Paramètres Analytics sauvegardés');
  };

  const StatCard = ({ title, value, icon: Icon, trend }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">{trend}</span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Vue d'ensemble
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('settings')}
        >
          <Save className="h-4 w-4 mr-2" />
          Configuration
        </Button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pages vues"
              value={analyticsData.pageViews.toLocaleString()}
              icon={Eye}
              trend="+12%"
            />
            <StatCard
              title="Visiteurs uniques"
              value={analyticsData.uniqueVisitors.toLocaleString()}
              icon={Users}
              trend="+8%"
            />
            <StatCard
              title="Taux de rebond"
              value={`${analyticsData.bounceRate}%`}
              icon={TrendingUp}
              trend="-5%"
            />
            <StatCard
              title="Durée moyenne"
              value={analyticsData.avgSessionDuration}
              icon={Globe}
              trend="+15%"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pages les plus visitées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPages.map((page, index) => (
                    <div key={page.path} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{page.path}</p>
                          <p className="text-sm text-gray-500">{page.views} vues</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{page.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sources de trafic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.trafficSources.map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`} />
                        <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-gray-500">{source.visits} visites</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{source.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liens rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://analytics.google.com', '_blank')}
                  className="justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Analytics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://search.google.com/search-console', '_blank')}
                  className="justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Search Console
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://www.facebook.com/business/tools/ads-manager', '_blank')}
                  className="justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Facebook Ads
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configurez vos outils d'analyse et de suivi
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                  <Input
                    value={settings.googleAnalyticsId}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                    placeholder="GA-XXXXXXXXX-X ou G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Trouvez votre ID dans Google Analytics
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Google Tag Manager ID</label>
                  <Input
                    value={settings.googleTagManagerId}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleTagManagerId: e.target.value }))}
                    placeholder="GTM-XXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour une gestion avancée des tags
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
                  <Input
                    value={settings.facebookPixelId}
                    onChange={(e) => setSettings(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour le suivi des conversions Facebook
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hotjar ID</label>
                  <Input
                    value={settings.hotjarId}
                    onChange={(e) => setSettings(prev => ({ ...prev, hotjarId: e.target.value }))}
                    placeholder="1234567"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour les heatmaps et enregistrements
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Options de tracking</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableHeatmaps"
                    checked={settings.enableHeatmaps}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableHeatmaps: e.target.checked }))}
                  />
                  <label htmlFor="enableHeatmaps" className="text-sm">
                    Activer les cartes de chaleur (Heatmaps)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableUserRecordings"
                    checked={settings.enableUserRecordings}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableUserRecordings: e.target.checked }))}
                  />
                  <label htmlFor="enableUserRecordings" className="text-sm">
                    Activer l'enregistrement des sessions utilisateur
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={saveSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder la configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Événements personnalisés</CardTitle>
              <p className="text-sm text-muted-foreground">
                Suivez des actions spécifiques sur votre site
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Formulaires</h4>
                    <p className="text-sm text-gray-500">Suivi des soumissions</p>
                    <Badge className="mt-2" variant="secondary">Activé</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Boutique</h4>
                    <p className="text-sm text-gray-500">Achats et conversions</p>
                    <Badge className="mt-2" variant="secondary">Activé</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Téléchargements</h4>
                    <p className="text-sm text-gray-500">Fichiers téléchargés</p>
                    <Badge className="mt-2" variant="secondary">Activé</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
