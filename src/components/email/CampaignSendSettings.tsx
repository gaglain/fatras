import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const DEFAULT_DAILY_LIMIT = 200;
const DEFAULT_SEND_HOUR_UTC = 8;

export const CampaignSendSettings: React.FC = () => {
  const { user } = useAuth();
  const [dailyLimit, setDailyLimit] = useState<string>(String(DEFAULT_DAILY_LIMIT));
  const [sendHour, setSendHour] = useState<string>(String(DEFAULT_SEND_HOUR_UTC));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .eq('user_id', user.id)
          .in('setting_key', ['email_campaign_daily_limit', 'email_campaign_send_hour_utc']);
        for (const r of data || []) {
          if (r.setting_key === 'email_campaign_daily_limit') setDailyLimit(r.setting_value);
          if (r.setting_key === 'email_campaign_send_hour_utc') setSendHour(r.setting_value);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const limit = parseInt(dailyLimit, 10);
    const hour = parseInt(sendHour, 10);
    if (isNaN(limit) || limit <= 0 || limit > 5000) {
      toast.error('Limite invalide (1 à 5000)');
      return;
    }
    if (isNaN(hour) || hour < 0 || hour > 23) {
      toast.error('Heure invalide (0 à 23)');
      return;
    }
    setSaving(true);
    try {
      await supabase.from('app_settings').upsert(
        [
          { user_id: user.id, setting_key: 'email_campaign_daily_limit', setting_value: String(limit) },
          { user_id: user.id, setting_key: 'email_campaign_send_hour_utc', setting_value: String(hour) },
        ],
        { onConflict: 'user_id,setting_key' }
      );
      toast.success('Paramètres d\'envoi sauvegardés');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Local hour preview (browser TZ)
  const hourNum = parseInt(sendHour, 10);
  let localPreview = '';
  if (!isNaN(hourNum)) {
    const d = new Date();
    d.setUTCHours(hourNum, 0, 0, 0);
    localPreview = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Envoi des campagnes (Resend)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Quand une campagne dépasse la limite quotidienne de votre compte Resend, l'envoi est
          automatiquement étalé sur plusieurs jours. Configurez ci-dessous le nombre maximum
          d'emails par jour et l'heure à laquelle reprendre l'envoi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="campaign-daily-limit">Limite d'envois par jour</Label>
            <Input
              id="campaign-daily-limit"
              type="number"
              min={1}
              max={5000}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Plan gratuit Resend : 100/jour. Plan payant : 50 000+/jour.
            </p>
          </div>
          <div>
            <Label htmlFor="campaign-send-hour">Heure d'envoi (UTC)</Label>
            <Select value={sendHour} onValueChange={setSendHour} disabled={loading}>
              <SelectTrigger id="campaign-send-hour">
                <SelectValue placeholder="Choisir une heure" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {Array.from({ length: 24 }).map((_, h) => (
                  <SelectItem key={h} value={String(h)}>
                    {String(h).padStart(2, '0')}:00 UTC
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {localPreview && (
              <p className="text-xs text-muted-foreground mt-1">
                Soit {localPreview} dans votre fuseau horaire.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
