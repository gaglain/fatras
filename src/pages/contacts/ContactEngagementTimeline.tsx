import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2, Eye, MousePointerClick, Reply, AlertTriangle, RefreshCw } from 'lucide-react';

type Kind = 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced';

interface TimelineEvent {
  key: string;
  kind: Kind;
  at: string;
  subject: string;
  source: 'Email' | 'Campagne';
}

const META: Record<Kind, { label: string; icon: React.ElementType; cls: string }> = {
  sent: { label: 'Envoyé', icon: Send, cls: 'text-muted-foreground border-border' },
  delivered: { label: 'Délivré', icon: CheckCircle2, cls: 'text-primary border-primary/40' },
  opened: { label: 'Ouvert', icon: Eye, cls: 'text-primary border-primary' },
  clicked: { label: 'Cliqué', icon: MousePointerClick, cls: 'text-primary border-primary bg-primary/10' },
  replied: { label: 'A répondu', icon: Reply, cls: 'text-foreground border-foreground' },
  bounced: { label: 'Rebond', icon: AlertTriangle, cls: 'text-destructive border-destructive' },
};

const FILTERS: Array<{ value: Kind | 'all'; label: string }> = [
  { value: 'all', label: 'Tout' },
  { value: 'delivered', label: 'Délivrés' },
  { value: 'opened', label: 'Ouvertures' },
  { value: 'clicked', label: 'Clics' },
  { value: 'replied', label: 'Réponses' },
];

export const ContactEngagementTimeline: React.FC<{ contactId: string; contactEmail?: string | null }> = ({ contactId, contactEmail }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Kind | 'all'>('all');

  const load = async () => {
    setLoading(true);
    const email = (contactEmail || '').toLowerCase().trim();
    const orFilters = [`contact_id.eq.${contactId}`];
    if (email) orFilters.push(`to_email.ilike.%${email}%`, `from_email.ilike.%${email}%`);

    const [{ data: emails }, { data: analytics }] = await Promise.all([
      supabase
        .from('emails')
        .select('id, subject, direction, status, sent_at, delivered_at, opened_at, received_at, created_at, updated_at, campaign_id')
        .or(orFilters.join(','))
        .order('created_at', { ascending: false })
        .limit(500),
      supabase
        .from('email_analytics')
        .select('id, event_type, created_at, campaign_id, event_data')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false })
        .limit(500),
    ]);

    const out: TimelineEvent[] = [];
    for (const e of emails || []) {
      const subject = e.subject || '(sans objet)';
      if (e.direction === 'received') {
        out.push({ key: `${e.id}-r`, kind: 'replied', at: e.received_at || e.created_at, subject, source: 'Email' });
        continue;
      }
      const sentAt = e.sent_at || (['sent', 'delivered', 'opened', 'clicked'].includes(e.status || '') ? e.created_at : null);
      if (sentAt) out.push({ key: `${e.id}-s`, kind: 'sent', at: sentAt, subject, source: 'Email' });
      if (e.delivered_at) out.push({ key: `${e.id}-d`, kind: 'delivered', at: e.delivered_at, subject, source: 'Email' });
      if (e.opened_at) out.push({ key: `${e.id}-o`, kind: 'opened', at: e.opened_at, subject, source: 'Email' });
      if (e.status === 'clicked') out.push({ key: `${e.id}-c`, kind: 'clicked', at: e.updated_at, subject, source: 'Email' });
      if (e.status === 'bounced' || e.status === 'failed') out.push({ key: `${e.id}-b`, kind: 'bounced', at: e.updated_at, subject, source: 'Email' });
    }
    for (const a of analytics || []) {
      const kind = a.event_type as Kind;
      if (!META[kind] || kind === 'replied') continue;
      const d = (a.event_data || {}) as Record<string, any>;
      out.push({ key: `a-${a.id}`, kind, at: a.created_at, subject: d.subject || 'Campagne email', source: 'Campagne' });
    }
    out.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime());
    setEvents(out);
    setLoading(false);
  };

  useEffect(() => { load(); }, [contactId, contactEmail]);

  const shown = useMemo(() => (filter === 'all' ? events : events.filter(e => e.kind === filter)), [events, filter]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Chronologie d'engagement</CardTitle>
        <Button variant="ghost" size="icon" onClick={load} aria-label="Actualiser"><RefreshCw className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <Button key={f.value} size="sm" variant={filter === f.value ? 'default' : 'outline'} onClick={() => setFilter(f.value)}>
              {f.label}
            </Button>
          ))}
        </div>
        {loading ? (
          <p className="text-muted-foreground text-sm">Chargement...</p>
        ) : shown.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun événement pour ce contact.</p>
        ) : (
          <ol className="relative border-l border-border ml-3 space-y-4">
            {shown.map(ev => {
              const m = META[ev.kind];
              const Icon = m.icon;
              return (
                <li key={ev.key} className="ml-5">
                  <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border bg-background ${m.cls}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{m.label}</span>
                    <Badge variant="outline" className="text-xs">{ev.source}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ev.at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground break-words">{ev.subject}</p>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
