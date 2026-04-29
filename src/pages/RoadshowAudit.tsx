import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, ExternalLink, Search, MapPin, Calendar, Link2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type EntityKind = 'event' | 'opportunity' | 'quote';

interface RoadshowRow {
  id: string;
  city: string;
  venue: string;
  event_date: string | null;
  status: string;
  event_id: string | null;
  opportunity_id: string | null;
  quote_id: string | null;
  created_at: string;
}

interface OptionItem { id: string; label: string; sub?: string; }

const LinkBadge = ({ present, label, to, onLink, onUnlink, busy }: {
  present: boolean; label: string; to?: string;
  onLink?: () => void; onUnlink?: () => void; busy?: boolean;
}) => {
  if (present) {
    return (
      <div className="inline-flex items-center gap-1">
        {to ? (
          <Link to={to}>
            <Badge variant="outline" className="gap-1 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition">
              <CheckCircle2 className="h-3 w-3" /> {label} <ExternalLink className="h-3 w-3" />
            </Badge>
          </Link>
        ) : (
          <Badge variant="outline" className="gap-1 border-2 border-foreground">
            <CheckCircle2 className="h-3 w-3" /> {label}
          </Badge>
        )}
        {onUnlink && (
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onUnlink} disabled={busy} title={`Délier ${label.toLowerCase()}`}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </div>
    );
  }
  return (
    <Button size="sm" variant="outline" onClick={onLink} disabled={busy} className="gap-1 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground h-7">
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
      {label} manquant
      <Link2 className="h-3 w-3 ml-1" />
    </Button>
  );
};

const RoadshowAudit: React.FC = () => {
  const [rows, setRows] = useState<RoadshowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  // Linking dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStop, setDialogStop] = useState<RoadshowRow | null>(null);
  const [dialogKind, setDialogKind] = useState<EntityKind>('event');
  const [dialogOptions, setDialogOptions] = useState<OptionItem[]>([]);
  const [dialogLoadingOptions, setDialogLoadingOptions] = useState(false);
  const [dialogSelected, setDialogSelected] = useState<string>('');
  const [dialogSearch, setDialogSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('roadshow_stops')
      .select('id, city, venue, event_date, status, event_id, opportunity_id, quote_id, created_at')
      .eq('is_archived', false)
      .order('event_date', { ascending: false, nullsFirst: false });
    if (!error && data) setRows(data as RoadshowRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openLinkDialog = async (stop: RoadshowRow, kind: EntityKind) => {
    setDialogStop(stop);
    setDialogKind(kind);
    setDialogSelected('');
    setDialogSearch('');
    setDialogOpen(true);
    setDialogLoadingOptions(true);
    try {
      let options: OptionItem[] = [];
      if (kind === 'event') {
        const { data } = await supabase.from('events').select('id, title, city, venue, start_date').order('start_date', { ascending: false }).limit(200);
        options = (data || []).map((e: any) => ({
          id: e.id,
          label: e.title || `${e.city || ''} ${e.venue || ''}`.trim() || 'Événement',
          sub: [e.city, e.venue, e.start_date ? new Date(e.start_date).toLocaleDateString('fr-FR') : null].filter(Boolean).join(' · '),
        }));
      } else if (kind === 'opportunity') {
        const { data } = await supabase.from('opportunities').select('id, title, location, venue, date, status').order('date', { ascending: false }).limit(200);
        options = (data || []).map((o: any) => ({
          id: o.id,
          label: o.title || 'Opportunité',
          sub: [o.location, o.venue, o.date ? new Date(o.date).toLocaleDateString('fr-FR') : null, o.status].filter(Boolean).join(' · '),
        }));
      } else {
        const { data } = await supabase.from('quotes').select('id, quote_number, title, total_amount, status').order('created_at', { ascending: false }).limit(200);
        options = (data || []).map((q: any) => ({
          id: q.id,
          label: q.title || `Devis ${q.quote_number}`,
          sub: [q.quote_number, q.total_amount ? `${q.total_amount} €` : null, q.status].filter(Boolean).join(' · '),
        }));
      }
      setDialogOptions(options);
    } finally {
      setDialogLoadingOptions(false);
    }
  };

  const confirmLink = async () => {
    if (!dialogStop || !dialogSelected) return;
    setBusyId(dialogStop.id);
    const column = dialogKind === 'event' ? 'event_id' : dialogKind === 'opportunity' ? 'opportunity_id' : 'quote_id';
    const { error } = await supabase.from('roadshow_stops').update({ [column]: dialogSelected }).eq('id', dialogStop.id);
    setBusyId(null);
    if (error) {
      toast.error(`Erreur: ${error.message}`);
      return;
    }
    toast.success('Lien ajouté avec succès');
    setDialogOpen(false);
    setRows(prev => prev.map(r => r.id === dialogStop.id ? { ...r, [column]: dialogSelected } as RoadshowRow : r));
  };

  const handleUnlink = async (stop: RoadshowRow, kind: EntityKind) => {
    if (!confirm(`Délier ${kind === 'event' ? "l'événement" : kind === 'opportunity' ? "l'opportunité" : 'le devis'} de cette feuille de route ?`)) return;
    const column = kind === 'event' ? 'event_id' : kind === 'opportunity' ? 'opportunity_id' : 'quote_id';
    setBusyId(stop.id);
    const { error } = await supabase.from('roadshow_stops').update({ [column]: null }).eq('id', stop.id);
    setBusyId(null);
    if (error) { toast.error(`Erreur: ${error.message}`); return; }
    toast.success('Lien retiré');
    setRows(prev => prev.map(r => r.id === stop.id ? { ...r, [column]: null } as RoadshowRow : r));
  };

  const handleDeleteStop = async (stop: RoadshowRow) => {
    if (!confirm(`Supprimer définitivement la feuille de route "${stop.city} - ${stop.venue}" ? (le canal de discussion lié sera aussi supprimé)`)) return;
    setBusyId(stop.id);
    const { error } = await supabase.from('roadshow_stops').delete().eq('id', stop.id);
    setBusyId(null);
    if (error) { toast.error(`Erreur: ${error.message}`); return; }
    toast.success('Feuille de route supprimée');
    setRows(prev => prev.filter(r => r.id !== stop.id));
  };

  const filtered = rows.filter(r => {
    const linkCount = [r.event_id, r.opportunity_id, r.quote_id].filter(Boolean).length;
    if (filter === 'incomplete' && linkCount === 3) return false;
    if (filter === 'complete' && linkCount < 3) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${r.city} ${r.venue}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: rows.length,
    complete: rows.filter(r => r.event_id && r.opportunity_id && r.quote_id).length,
    incomplete: rows.filter(r => !(r.event_id && r.opportunity_id && r.quote_id)).length,
  };

  const filteredOptions = dialogOptions.filter(o =>
    !dialogSearch || `${o.label} ${o.sub || ''}`.toLowerCase().includes(dialogSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Audit des feuilles de route</h1>
        <p className="text-muted-foreground mt-1">
          Visualisez les liens (événement, opportunité, devis) et résolvez les manquants en un clic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-foreground"><CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.total}</p></CardContent></Card>
        <Card className="border-2 border-foreground"><CardHeader className="pb-2"><CardTitle className="text-sm text-green-700">Complètes (3 liens)</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.complete}</p></CardContent></Card>
        <Card className="border-2 border-foreground"><CardHeader className="pb-2"><CardTitle className="text-sm text-destructive">Incomplètes</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.incomplete}</p></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par ville ou lieu..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-2 border-foreground" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')} className="border-2 border-foreground">Toutes</Button>
          <Button variant={filter === 'incomplete' ? 'default' : 'outline'} onClick={() => setFilter('incomplete')} className="border-2 border-foreground">Incomplètes</Button>
          <Button variant={filter === 'complete' ? 'default' : 'outline'} onClick={() => setFilter('complete')} className="border-2 border-foreground">Complètes</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-foreground"><CardContent className="p-8 text-center text-muted-foreground">Aucune feuille de route trouvée.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const missing = [
              !r.event_id && 'événement',
              !r.opportunity_id && 'opportunité',
              !r.quote_id && 'devis',
            ].filter(Boolean) as string[];
            const isBusy = busyId === r.id;
            return (
              <Card key={r.id} className="border-2 border-foreground hover:shadow-lg transition">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <Link to={`/roadshow?stop=${r.id}`} className="font-bold text-lg hover:underline flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {r.city || 'Ville ?'} — {r.venue || 'Lieu ?'}
                      </Link>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                        <Calendar className="h-3 w-3" />
                        {r.event_date ? new Date(r.event_date).toLocaleDateString('fr-FR') : 'Date non définie'}
                        <Badge variant="secondary">{r.status}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteStop(r)} disabled={isBusy} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <LinkBadge
                      present={!!r.event_id} label="Événement"
                      to={r.event_id ? `/events/${r.event_id}` : undefined}
                      onLink={() => openLinkDialog(r, 'event')}
                      onUnlink={r.event_id ? () => handleUnlink(r, 'event') : undefined}
                      busy={isBusy}
                    />
                    <LinkBadge
                      present={!!r.opportunity_id} label="Opportunité"
                      to={r.opportunity_id ? `/opportunities/${r.opportunity_id}` : undefined}
                      onLink={() => openLinkDialog(r, 'opportunity')}
                      onUnlink={r.opportunity_id ? () => handleUnlink(r, 'opportunity') : undefined}
                      busy={isBusy}
                    />
                    <LinkBadge
                      present={!!r.quote_id} label="Devis"
                      to={r.quote_id ? `/quotes` : undefined}
                      onLink={() => openLinkDialog(r, 'quote')}
                      onUnlink={r.quote_id ? () => handleUnlink(r, 'quote') : undefined}
                      busy={isBusy}
                    />
                  </div>

                  {missing.length > 0 && (
                    <div className="text-sm bg-destructive/10 border-l-4 border-destructive p-2 rounded">
                      <strong>Lien(s) manquant(s) :</strong> {missing.join(', ')}.
                      {' '}Cliquez sur un badge rouge pour rattacher l'entité correspondante.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Lier {dialogKind === 'event' ? 'un événement' : dialogKind === 'opportunity' ? 'une opportunité' : 'un devis'}
              {dialogStop && ` à ${dialogStop.city} - ${dialogStop.venue}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Filtrer la liste..." value={dialogSearch} onChange={e => setDialogSearch(e.target.value)} className="border-2 border-foreground" />
            {dialogLoadingOptions ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : (
              <Select value={dialogSelected} onValueChange={setDialogSelected}>
                <SelectTrigger className="border-2 border-foreground"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {filteredOptions.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">Aucun résultat</div>
                  ) : filteredOptions.map(o => (
                    <SelectItem key={o.id} value={o.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{o.label}</span>
                        {o.sub && <span className="text-xs text-muted-foreground">{o.sub}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={confirmLink} disabled={!dialogSelected || !!busyId}>
              {busyId && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Lier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoadshowAudit;
export { RoadshowAudit };
