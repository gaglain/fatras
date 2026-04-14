import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SEOSettings {
  enableSitemap: boolean;
  enableRobots: boolean;
  robotsContent: string;
}

interface SEOToolsTabProps {
  settings: SEOSettings;
  onSettingsChange: (updates: Partial<SEOSettings>) => void;
}

export const SEOToolsTab: React.FC<SEOToolsTabProps> = ({ settings, onSettingsChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Robots.txt</CardTitle>
          <p className="text-sm text-muted-foreground">
            Contrôlez l'indexation de votre site
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.enableRobots}
              onCheckedChange={(checked) => onSettingsChange({ enableRobots: checked })}
            />
            <label className="text-sm font-medium">Activer robots.txt</label>
          </div>
          
          {settings.enableRobots && (
            <Textarea
              value={settings.robotsContent}
              onChange={(e) => onSettingsChange({ robotsContent: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sitemap XML</CardTitle>
          <p className="text-sm text-muted-foreground">
            Plan de site pour les moteurs de recherche
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.enableSitemap}
              onCheckedChange={(checked) => onSettingsChange({ enableSitemap: checked })}
            />
            <label className="text-sm font-medium">Générer automatiquement</label>
          </div>
          
          {settings.enableSitemap && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Le sitemap sera disponible à l'adresse :
              </p>
              <code className="block p-2 bg-muted rounded text-sm">
                {window.location.origin}/sitemap.xml
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/sitemap.xml', '_blank')}
              >
                Voir le sitemap
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
