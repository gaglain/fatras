import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppSettings } from '@/hooks/useAppSettings';
import { Loader2, Mail, BellRing, Pencil, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type InvitationCfg = { enabled: boolean; subject: string; intro: string };
type RemindersCfg = { enabled: boolean; days: number[]; subjectTemplate: string; intro: string };
type UpdateCfg = { enabled: boolean; throttleMinutes: number; subject: string; intro: string };

const DEFAULT_INVITATION: InvitationCfg = {
  enabled: true,
  subject: '🎤 Invitation : {city} — {venue}',
  intro: "Vous avez été invité(e) à participer à la feuille de route ci-dessous. Veuillez prendre connaissance des détails et confirmer votre disponibilité dans l'application.",
};
const DEFAULT_REMINDERS: RemindersCfg = {
  enabled: true,
  days: [15, 7, 1],
  subjectTemplate: '🎤 Rappel : {city} – {venue} {daysLabel}',
  intro: 'Voici le récapitulatif de votre prochaine date {daysLabel} :',
};
const DEFAULT_UPDATE: UpdateCfg = {
  enabled: false,
  throttleMinutes: 30,
  subject: '✏️ Mise à jour : {city} — {venue}',
  intro: 'La feuille de route a été mise à jour. Voici les principaux changements :',
};

const AVAILABLE_DAYS = [30, 15, 7, 3, 1, 0];

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return { ...fallback, ...JSON.parse(raw) }; } catch { return fallback; }
}

export const RoadshowEmailsTab: React.FC = () => {
  const { settings, setSetting, loading } = useAppSettings();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<InvitationCfg>(DEFAULT_INVITATION);
  const [reminders, setReminders] = useState<RemindersCfg>(DEFAULT_REMINDERS);
  const [updateCfg, setUpdateCfg] = useState<UpdateCfg>(DEFAULT_UPDATE);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    setInvitation(parseJson(settings['roadshow_email_invitation'], DEFAULT_INVITATION));
    setReminders(parseJson(settings['roadshow_email_reminders'], DEFAULT_REMINDERS));
    setUpdateCfg(parseJson(settings['roadshow_email_update'], DEFAULT_UPDATE));
  }, [loading, settings]);

  const save = async (key: string, value: any) => {
    setSaving(key);
    const ok = await setSetting(key, JSON.stringify(value));
    setSaving(null);
    if (ok) toast.success('Préférences enregistrées');
  };

  const sendTest = async (kind: 'invitation' | 'update') => {
    if (!user?.email) { toast.error('Aucun email associé à votre compte'); return; }
    setTesting(kind);
    try {
      if (kind === 'invitation') {
        const { error } = await supabase.functions.invoke('send-roadshow-assignment-email', {
          body: { userIds: [user.id], stopId: null, city: 'Ville test', venue: 'Salle test', _test: true },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.functions.invoke('send-roadshow-update-email', {
          body: { userIds: [user.id], stopId: null, city: 'Ville test', venue: 'Salle test', changes: ['Date modifiée', 'Heure du show modifiée'], _test: true },
        });
        if (error) throw error;
      }
      toast.success(`Email de test envoyé à ${user.email}`);
    } catch (e: any) {
      toast.error(`Échec de l'envoi : ${e.message || e}`);
    } finally {
      setTesting(null);
    }
  };

  const toggleDay = (d: number) => {
    const next = reminders.days.includes(d)
      ? reminders.days.filter(x => x !== d)
      : [...reminders.days, d].sort((a, b) => b - a);
    setReminders({ ...reminders, days: next });
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/30 p-4 flex gap-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Ces réglages contrôlent les emails automatiques envoyés aux personnes du casting des feuilles de route.
          Variables disponibles dans les sujets : <code className="text-foreground">{'{city}'}</code>, <code className="text-foreground">{'{venue}'}</code>, <code className="text-foreground">{'{daysLabel}'}</code> (pour les rappels).
        </p>
      </div>

      {/* Invitation */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email d'invitation</CardTitle>
              <CardDescription>Envoyé quand un artiste ou équipier est ajouté au casting.</CardDescription>
            </div>
            <Switch
              checked={invitation.enabled}
              onCheckedChange={(v) => { const n = { ...invitation, enabled: v }; setInvitation(n); save('roadshow_email_invitation', n); }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Sujet</Label>
            <Input value={invitation.subject} onChange={(e) => setInvitation({ ...invitation, subject: e.target.value })} />
          </div>
          <div>
            <Label>Texte d'introduction</Label>
            <Textarea rows={4} value={invitation.intro} onChange={(e) => setInvitation({ ...invitation, intro: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save('roadshow_email_invitation', invitation)} disabled={saving === 'roadshow_email_invitation'}>
              {saving === 'roadshow_email_invitation' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Enregistrer
            </Button>
            <Button variant="outline" onClick={() => sendTest('invitation')} disabled={testing === 'invitation'}>
              {testing === 'invitation' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Envoyer un test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5" /> Rappels automatiques</CardTitle>
              <CardDescription>Envoyés en amont de la date à toute l'équipe du casting.</CardDescription>
            </div>
            <Switch
              checked={reminders.enabled}
              onCheckedChange={(v) => { const n = { ...reminders, enabled: v }; setReminders(n); save('roadshow_email_reminders', n); }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Jours d'envoi</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_DAYS.map(d => (
                <Badge
                  key={d}
                  variant={reminders.days.includes(d) ? 'default' : 'outline'}
                  className="cursor-pointer select-none px-3 py-1"
                  onClick={() => toggleDay(d)}
                >
                  {d === 0 ? 'Jour J' : `J-${d}`}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Sujet</Label>
            <Input value={reminders.subjectTemplate} onChange={(e) => setReminders({ ...reminders, subjectTemplate: e.target.value })} />
          </div>
          <div>
            <Label>Texte d'introduction</Label>
            <Textarea rows={3} value={reminders.intro} onChange={(e) => setReminders({ ...reminders, intro: e.target.value })} />
          </div>
          <Button onClick={() => save('roadshow_email_reminders', reminders)} disabled={saving === 'roadshow_email_reminders'}>
            {saving === 'roadshow_email_reminders' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Enregistrer
          </Button>
        </CardContent>
      </Card>

      {/* Update */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> Notification de modification</CardTitle>
              <CardDescription>Envoyée à l'équipe quand une feuille de route est modifiée (horaires, lieu, logistique…).</CardDescription>
            </div>
            <Switch
              checked={updateCfg.enabled}
              onCheckedChange={(v) => { const n = { ...updateCfg, enabled: v }; setUpdateCfg(n); save('roadshow_email_update', n); }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Délai anti-spam (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={updateCfg.throttleMinutes}
              onChange={(e) => setUpdateCfg({ ...updateCfg, throttleMinutes: Math.max(0, parseInt(e.target.value || '0', 10)) })}
            />
            <p className="text-xs text-muted-foreground mt-1">Une seule notification est envoyée par feuille toutes les X minutes, même si plusieurs modifications ont lieu.</p>
          </div>
          <div>
            <Label>Sujet</Label>
            <Input value={updateCfg.subject} onChange={(e) => setUpdateCfg({ ...updateCfg, subject: e.target.value })} />
          </div>
          <div>
            <Label>Texte d'introduction</Label>
            <Textarea rows={3} value={updateCfg.intro} onChange={(e) => setUpdateCfg({ ...updateCfg, intro: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => save('roadshow_email_update', updateCfg)} disabled={saving === 'roadshow_email_update'}>
              {saving === 'roadshow_email_update' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Enregistrer
            </Button>
            <Button variant="outline" onClick={() => sendTest('update')} disabled={testing === 'update'}>
              {testing === 'update' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Envoyer un test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
