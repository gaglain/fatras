import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface SiteSettingsData {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: { facebook: string; instagram: string; twitter: string; youtube: string; linkedin: string; };
  theme: { primaryColor: string; secondaryColor: string; backgroundColor: string; textColor: string; };
  features: { enableBlog: boolean; enableShop: boolean; enableBooking: boolean; enableChat: boolean; enableNewsletter: boolean; };
  maintenance: { enabled: boolean; message: string; };
}

interface SectionProps {
  settings: SiteSettingsData;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettingsData>>;
  handleFileUpload: (field: 'logo' | 'favicon', event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GeneralSection: React.FC<SectionProps> = ({ settings, setSettings, handleFileUpload }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom du site</label>
            <Input value={settings.siteName} onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email de contact</label>
            <Input type="email" value={settings.contactEmail} onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description du site</label>
          <Textarea value={settings.siteDescription} onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))} rows={3} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Téléphone</label>
            <Input value={settings.contactPhone} onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Adresse</label>
            <Input value={settings.address} onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))} />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Logo et Favicon</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Logo du site</label>
            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload('logo', e)} />
            {settings.logo && <img src={settings.logo} alt="Logo" className="h-16 w-auto border rounded mt-2" />}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Favicon</label>
            <Input type="file" accept="image/*" onChange={(e) => handleFileUpload('favicon', e)} />
            {settings.favicon && <img src={settings.favicon} alt="Favicon" className="h-8 w-8 border rounded mt-2" />}
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Réseaux sociaux</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(settings.socialLinks).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-medium mb-2 capitalize">{platform}</label>
              <Input value={url} onChange={(e) => setSettings(prev => ({
                ...prev, socialLinks: { ...prev.socialLinks, [platform]: e.target.value }
              }))} placeholder={`URL ${platform}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const ColorField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="flex space-x-2">
      <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-16 h-10" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
    </div>
  </div>
);

export const DesignSection: React.FC<Pick<SectionProps, 'settings' | 'setSettings'>> = ({ settings, setSettings }) => (
  <Card>
    <CardHeader><CardTitle>Personnalisation du thème</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColorField label="Couleur principale" value={settings.theme.primaryColor}
          onChange={(v) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: v } }))} />
        <ColorField label="Couleur secondaire" value={settings.theme.secondaryColor}
          onChange={(v) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, secondaryColor: v } }))} />
        <ColorField label="Couleur de fond" value={settings.theme.backgroundColor}
          onChange={(v) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, backgroundColor: v } }))} />
        <ColorField label="Couleur du texte" value={settings.theme.textColor}
          onChange={(v) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, textColor: v } }))} />
      </div>
    </CardContent>
  </Card>
);

const featureDescriptions: Record<string, string> = {
  enableBlog: 'Système de blog intégré',
  enableShop: 'Boutique en ligne',
  enableBooking: 'Système de réservation',
  enableChat: 'Widget de chat public',
  enableNewsletter: 'Inscription newsletter',
};

export const FeaturesSection: React.FC<Pick<SectionProps, 'settings' | 'setSettings'>> = ({ settings, setSettings }) => (
  <Card>
    <CardHeader><CardTitle>Fonctionnalités du site</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {Object.entries(settings.features).map(([feature, enabled]) => (
        <div key={feature} className="flex items-center justify-between">
          <div>
            <label className="font-medium capitalize">
              {feature.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <p className="text-sm text-gray-500">{featureDescriptions[feature]}</p>
          </div>
          <Switch checked={enabled} onCheckedChange={(checked) => setSettings(prev => ({
            ...prev, features: { ...prev.features, [feature]: checked }
          }))} />
        </div>
      ))}
    </CardContent>
  </Card>
);

export const MaintenanceSection: React.FC<Pick<SectionProps, 'settings' | 'setSettings'>> = ({ settings, setSettings }) => (
  <Card>
    <CardHeader><CardTitle>Mode maintenance</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch checked={settings.maintenance.enabled}
          onCheckedChange={(checked) => setSettings(prev => ({
            ...prev, maintenance: { ...prev.maintenance, enabled: checked }
          }))} />
        <label className="font-medium">Activer le mode maintenance</label>
      </div>
      {settings.maintenance.enabled && (
        <div>
          <label className="block text-sm font-medium mb-2">Message de maintenance</label>
          <Textarea value={settings.maintenance.message}
            onChange={(e) => setSettings(prev => ({
              ...prev, maintenance: { ...prev.maintenance, message: e.target.value }
            }))} rows={3} />
        </div>
      )}
    </CardContent>
  </Card>
);
