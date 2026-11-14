import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { RefreshCw, RotateCcw, Eye, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type Event = { id: string; type: string; created_at: string; status: string; next_attempt_at?: string; payload?: { data?: { subject?: string; to?: string[] } } };
type Attempt = { id: string; sent_at: string; http_status_code: number | null; response: string };
type EventPage = { data: Event[]; has_more: boolean; webhook: { status: string; endpoint: string } };
const labels: Record<string, string> = { failed: 'Échec', success: 'Reçu', attempting: 'Nouvelle tentative', pending: 'En attente' };
const types: Record<string, string> = { 'email.sent': 'Envoi', 'email.delivered': 'Livraison email', 'email.opened': 'Ouverture', 'email.clicked': 'Clic', 'email.bounced': 'Rebond', 'email.delivery_delayed': 'Livraison retardée', 'email.complained': 'Plainte' };
const date = (value: string) => new Date(value).toLocaleString('fr-FR');
async function call<T>(body: Record<string, string>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('resend-webhook-monitor', { body });
  if (error) {
    const text = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
    let message = text;
    try { const details = JSON.parse(text); message = [details.error, details.details].filter(Boolean).join(' : '); } catch { /* non-JSON provider error */ }
    throw new Error(message);
  }
  return data as T;
}

export function ResendWebhooksTab() {
  const [cursors, setCursors] = useState<string[]>([]);
  const [filter, setFilter] = useState('failed');
  const [selected, setSelected] = useState<Event | null>(null);
  const confirm = useConfirm();
  const after = cursors.at(-1);
  const query = useQuery({ queryKey: ['resend-webhooks', after], queryFn: () => call<EventPage>({ action: 'list', ...(after ? { after } : {}) }), refetchInterval: 30000 });
  const details = useQuery({ queryKey: ['resend-webhook-details', selected?.id], enabled: Boolean(selected), queryFn: () => call<{ event: Event; attempts: { data: Attempt[]; has_more: boolean } }>({ action: 'details', eventId: selected?.id ?? '' }) });
  const replay = useMutation({ mutationFn: (id: string) => call<{ queued: boolean }>({ action: 'replay', eventId: id }), onSuccess: () => { toast.success('Nouvelle livraison demandée à Resend'); void query.refetch(); void details.refetch(); }, onError: (error: Error) => toast.error(error.message) });
  const doReplay = async (id: string) => {
    if (await confirm({ title: 'Relancer cet événement ?', description: 'Resend renverra cet événement à Fatras. Aucun email ne sera renvoyé au destinataire.', confirmText: 'Relancer' })) replay.mutate(id);
  };
  const events = query.data?.data ?? [];
  const visible = events.filter(e => filter === 'all' || (filter === 'pending' ? ['pending', 'attempting'].includes(e.status) : e.status === filter));
  const active = query.data?.webhook.status === 'enabled';
  return <section className="min-w-0 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-xl font-semibold">Webhooks Resend</h2><div className="mt-2 flex flex-wrap items-center gap-2"><Badge variant={active ? 'secondary' : 'outline'}>{query.data ? (active ? 'Actif' : 'Désactivé') : 'Connexion…'}</Badge><span className="text-sm text-muted-foreground">{events.filter(e => e.status === 'failed').length} échecs sur cette page</span></div></div>
      <div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Actualiser les événements" onClick={() => void query.refetch()} disabled={query.isFetching}><RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} /></Button><Button variant="outline" asChild><a href="https://resend.com/webhooks" target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Resend</a></Button></div>
    </div>
    <Tabs value={filter} onValueChange={setFilter}><TabsList className="flex h-auto flex-wrap justify-start"><TabsTrigger value="failed">Échecs</TabsTrigger><TabsTrigger value="pending">En attente</TabsTrigger><TabsTrigger value="success">Reçus</TabsTrigger><TabsTrigger value="all">Tous</TabsTrigger></TabsList></Tabs>
    {query.error && <p role="alert" className="break-words text-sm text-destructive">{query.error.message}</p>}
    {query.isLoading && <p className="text-sm text-muted-foreground">Chargement des événements…</p>}
    {!query.isLoading && !query.error && visible.length === 0 && <p className="py-6 text-sm text-muted-foreground">Aucun événement correspondant sur cette page.</p>}
    <div className="divide-y divide-border border-y border-border">{visible.map(event => <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{types[event.type] ?? event.type}</span><Badge variant={event.status === 'failed' ? 'destructive' : 'secondary'}>{labels[event.status] ?? event.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{date(event.created_at)}</p><p className="mt-1 break-all text-xs text-muted-foreground">{event.id}</p></div>
      <div className="flex shrink-0 gap-2"><Button variant="outline" size="icon" aria-label={`Voir les tentatives ${event.id}`} onClick={() => setSelected(event)}><Eye className="h-4 w-4" /></Button>{event.status === 'failed' && <Button variant="outline" onClick={() => void doReplay(event.id)} disabled={replay.isPending || !active}><RotateCcw className="mr-2 h-4 w-4" />Relancer</Button>}</div>
    </div>)}</div>
    <div className="flex items-center justify-between gap-2"><Button variant="outline" disabled={!cursors.length || query.isFetching} onClick={() => setCursors(c => c.slice(0, -1))}><ChevronLeft className="mr-1 h-4 w-4" />Précédent</Button><span className="text-sm text-muted-foreground">Page {cursors.length + 1}</span><Button variant="outline" disabled={!query.data?.has_more || query.isFetching} onClick={() => { const last = events.at(-1); if (last) setCursors(c => [...c, last.id]); }} >Suivant<ChevronRight className="ml-1 h-4 w-4" /></Button></div>
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Tentatives de livraison</DialogTitle></DialogHeader>
      {details.isLoading && <p>Chargement…</p>}{details.error && <p role="alert" className="break-words text-destructive">{details.error.message}</p>}
      {details.data && <><div className="space-y-1 text-sm"><p className="break-words font-medium">{details.data.event.payload?.data?.subject ?? types[details.data.event.type] ?? details.data.event.type}</p><p className="break-all text-muted-foreground">{details.data.event.payload?.data?.to?.join(', ')}</p><Badge variant="outline">{labels[details.data.event.status]}</Badge>{details.data.event.next_attempt_at && <p>Prochaine tentative : {date(details.data.event.next_attempt_at)}</p>}</div><div className="divide-y divide-border">{details.data.attempts.data.map(attempt => <div key={attempt.id} className="space-y-2 py-3"><p className="text-sm">{date(attempt.sent_at)} · HTTP {attempt.http_status_code ?? 'aucune réponse'}</p><pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs">{attempt.response || 'Aucune réponse enregistrée'}</pre></div>)}</div>{details.data.attempts.has_more && <p className="text-sm text-muted-foreground">100 dernières tentatives affichées.</p>}{details.data.event.status === 'failed' && <Button disabled={replay.isPending || !active} onClick={() => { if (selected) void doReplay(selected.id); }}><RotateCcw className="mr-2 h-4 w-4" />Relancer l’événement</Button>}</>}
    </DialogContent></Dialog>
  </section>;
}