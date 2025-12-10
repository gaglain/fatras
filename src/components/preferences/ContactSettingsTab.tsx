import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ContactSettings {
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_city: string;
  contact_hours_weekdays: string;
  contact_hours_saturday: string;
  contact_hours_sunday: string;
}

export const ContactSettingsTab: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ContactSettings>({
    contact_email: 'Booking@fatras.net',
    contact_phone: '',
    contact_address: '',
    contact_city: '',
    contact_hours_weekdays: '9:00 - 18:00',
    contact_hours_saturday: '10:00 - 16:00',
    contact_hours_sunday: 'Fermé'
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .in('setting_key', Object.keys(settings));

      if (error) throw error;

      if (data && data.length > 0) {
        const configMap = data.reduce((acc: Record<string, string>, s) => {
          acc[s.setting_key] = s.setting_value;
          return acc;
        }, {});

        setSettings(prev => ({
          ...prev,
          ...configMap
        }));
      }
    } catch (error) {
      console.error('Erreur chargement settings contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Upsert chaque setting
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            user_id: user.id,
            setting_key: key,
            setting_value: value || '',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,setting_key'
          });

        if (error) throw error;
      }

      toast.success('Paramètres de contact enregistrés');
    } catch (error: any) {
      console.error('Erreur sauvegarde settings:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof ContactSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées de contact</CardTitle>
          <CardDescription>
            Ces informations seront affichées sur la page contact de votre site web
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de contact (destinataire du formulaire)</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="Booking@fatras.net"
              />
              <p className="text-xs text-muted-foreground">
                Les messages du formulaire seront envoyés à cette adresse
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_address">Adresse</Label>
            <Input
              id="contact_address"
              value={settings.contact_address}
              onChange={(e) => handleChange('contact_address', e.target.value)}
              placeholder="123 Rue de la Musique"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_city">Ville / Code postal</Label>
            <Input
              id="contact_city"
              value={settings.contact_city}
              onChange={(e) => handleChange('contact_city', e.target.value)}
              placeholder="75001 Paris, France"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horaires d'ouverture</CardTitle>
          <CardDescription>
            Indiquez vos horaires de disponibilité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_hours_weekdays">Lundi - Vendredi</Label>
              <Input
                id="contact_hours_weekdays"
                value={settings.contact_hours_weekdays}
                onChange={(e) => handleChange('contact_hours_weekdays', e.target.value)}
                placeholder="9:00 - 18:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_hours_saturday">Samedi</Label>
              <Input
                id="contact_hours_saturday"
                value={settings.contact_hours_saturday}
                onChange={(e) => handleChange('contact_hours_saturday', e.target.value)}
                placeholder="10:00 - 16:00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_hours_sunday">Dimanche</Label>
              <Input
                id="contact_hours_sunday"
                value={settings.contact_hours_sunday}
                onChange={(e) => handleChange('contact_hours_sunday', e.target.value)}
                placeholder="Fermé"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
