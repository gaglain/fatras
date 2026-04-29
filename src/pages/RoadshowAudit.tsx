import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, ExternalLink, Search, MapPin, Calendar, Link2, Trash2, Loader2, Sparkles, Wand2 } from 'lucide-react';
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

interface OptionItem { id: string; kind: EntityKind; label: string; sub?: string; raw: any; score?: number; }

const COLUMN_BY_KIND: Record<EntityKind, 'event_id' | 'opportunity_id' | 'quote_id'> = {
  event: 'event_id', opportunity: 'opportunity_id', quote: 'quote_id',
};

const norm = (s?: string | null) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const scoreMatch = (stop: RoadshowRow, candidate: { city?: string; venue?: string; title?: string; date?: string | null; location?: string }) => {
  let score = 0;
  const sCity = norm(stop.city), sVenue = norm(stop.venue), sDate = stop.event_date?.slice(0, 10);
  const cCity = norm(candidate.city || candidate.location), cVenue = norm(candidate.venue), cTitle = norm(candidate.title);
  const cDate = candidate.date?.slice(0, 10);
  if (sVenue && cVenue && (sVenue === cVenue || cVenue.includes(sVenue) || sVenue.includes(cVenue))) score += 5;
  if (sCity && (cCity === sCity || cTitle.includes(sCity))) score += 3;
  if (sVenue && cTitle.includes(sVenue)) score += 3;
  if (sDate && cDate && sDate === cDate) score += 4;
  return score;
};

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
  const [autoLinkingAll, setAutoLinkingAll] = useState(false);

  // Universal cache of all entities for auto-link + universal search
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allOpps, setAllOpps] = useState<any[]>([]);
  const [allQuotes, setAllQuotes] = useState<any[]>([]);

  // Linking dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStop, setDialogStop] = useState<RoadshowRow | null>(null);
  const [dialogKind, setDialogKind] = useState<EntityKind>('event');
  const [dialogSelected, setDialogSelected] = useState<string>('');
  const [dialogSearch, setDialogSearch] = useState('');
  const [universalMode, setUniversalMode] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [stopsRes, evRes, opRes, qtRes] = await Promise.all([
      supabase.from('roadshow_stops').select('id, city, venue, event_date, status, event_id, opportunity_id, quote_id, created_at').eq('is_archived', false).order('event_date', { ascending: false, nullsFirst: false }),
      supabase.from('events').select('id, title, city, venue, start_date').order('start_date', { ascending: false }).limit(500),
      supabase.from('opportunities').select('id, title, location, venue, date, status').order('date', { ascending: false }).limit(500),
      supabase.from('quotes').select('id, quote_number, title, total_amount, status, event_id').order('created_at', { ascending: false }).limit(500),
    ]);
    if (stopsRes.data) setRows(stopsRes.data as RoadshowRow[]);
    if (evRes.data) setAllEvents(evRes.data);
    if (opRes.data) setAllOpps(opRes.data);
    if (qtRes.data) setAllQuotes(qtRes.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Build universal options pool
  const universalPool: OptionItem[] = useMemo(() => {
    const items: OptionItem[] = [];
    allEvents.forEach((e: any) => items.push({
      id: e.id, kind: 'event',
      label: e.title || `${e.city || ''} ${e.venue || ''}`.trim() || 'Événement',
      sub: ['📅 Événement', e.city, e.venue, e.start_date ? new Date(e.start_date).toLocaleDateString('fr-FR') : null].filter(Boolean).join(' · '),
      raw: e,
    }));
    allOpps.forEach((o: any) => items.push({
      id: o.id, kind: 'opportunity',
      label: o.title || 'Opportunité',
      sub: ['💼 Opportunité', o.location, o.venue, o.date ? new Date(o.date).toLocaleDateString('fr-FR') : null, o.status].filter(Boolean).join(' · '),
      raw: o,
    }));
    allQuotes.forEach((q: any) => items.push({
      id: q.id, kind: 'quote',
      label: q.title || `Devis ${q.quote_number}`,
      sub: ['📄 Devis', q.quote_number, q.total_amount ? `${q.total_amount} €` : null, q.status].filter(Boolean).join(' · '),
      raw: q,
    }));
    return items;
  }, [allEvents, allOpps, allQuotes]);

  // Suggest a best match for a given stop + kind, returning an entity id or null
  const suggestMatch = (stop: RoadshowRow, kind: EntityKind): string | null => {
    const pool = kind === 'event' ? allEvents : kind === 'opportunity' ? allOpps : allQuotes;
    if (!pool.length) return null;
    let best: { id: string; score: number } | null = null;
    for (const item of pool) {
      const candidate = kind === 'event'
        ? { city: item.city, venue: item.venue, title: item.title, date: item.start_date }
        : kind === 'opportunity'
          ? { location: item.location, venue: item.venue, title: item.title, date: item.date }
          : { title: item.title, date: null, city: '', venue: '' };
      const s = scoreMatch(stop, candidate as any);
      // Quote chaining: if quote has event_id matching stop.event_id => super strong
      if (kind === 'quote' && stop.event_id && item.event_id === stop.event_id) {
        return item.id;
      }
      if (s > 0 && (!best || s > best.score)) best = { id: item.id, score: s };
    }
    return best && best.score >= 4 ? best.id : null;
  };

  const autoLinkRow = async (stop: RoadshowRow): Promise<{ linked: number; tried: number }> => {
    const updates: Partial<Record<'event_id' | 'opportunity_id' | 'quote_id', string>> = {};
    let linked = 0, tried = 0;
    (['event', 'opportunity', 'quote'] as EntityKind[]).forEach(k => {
      const col = COLUMN_BY_KIND[k];
      if (!stop[col]) {
        tried++;
        const match = suggestMatch(stop, k);
        if (match) { updates[col] = match; linked++; }
      }
    });
    if (linked === 0) return { linked, tried };
    const { error } = await supabase.from('roadshow_stops').update(updates).eq('id', stop.id);
    if (error) throw error;
    setRows(prev => prev.map(r => r.id === stop.id ? { ...r, ...updates } as RoadshowRow : r));
    return { linked, tried };
  };

  const handleAutoLinkRow = async (stop: RoadshowRow) => {
    setBusyId(stop.id);
    try {
      const { linked, tried } = await autoLinkRow(stop);
      if (linked === 0) toast.warning(`Aucune correspondance trouvée (${tried} lien(s) manquant(s))`);
      else toast.success(`${linked} lien(s) rétabli(s) automatiquement`);
    } catch (e: any) { toast.error(e.message); }
    setBusyId(null);
  };

  const handleAutoLinkAll = async () => {
    setAutoLinkingAll(true);
    let total = 0;
    const incomplete = rows.filter(r => !(r.event_id && r.opportunity_id && r.quote_id));
    for (const stop of incomplete) {
      try {
        const { linked } = await autoLinkRow(stop);
        total += linked;
      } catch { /* ignore individual errors */ }
    }
    setAutoLinkingAll(false);
    toast.success(`Auto-link terminé : ${total} lien(s) rétabli(s) sur ${incomplete.length} feuille(s)`);
  };

  const openLinkDialog = (stop: RoadshowRow, kind: EntityKind) => {
    setDialogStop(stop);
    setDialogKind(kind);
    setUniversalMode(false);
    setDialogSelected('');
    setDialogSearch('');
    setDialogOpen(true);
  };

  const confirmLink = async () => {
    if (!dialogStop || !dialogSelected) return;
    // If universal mode, the selected option may belong to a different kind than dialogKind
    const selectedOption = universalPool.find(o => o.id === dialogSelected);
    const targetKind: EntityKind = selectedOption?.kind || dialogKind;
    const column = COLUMN_BY_KIND[targetKind];
    setBusyId(dialogStop.id);
    const { error } = await supabase.from('roadshow_stops').update({ [column]: dialogSelected }).eq('id', dialogStop.id);
    setBusyId(null);
    if (error) { toast.error(`Erreur: ${error.message}`); return; }
    toast.success(`${targetKind === 'event' ? 'Événement' : targetKind === 'opportunity' ? 'Opportunité' : 'Devis'} lié`);
    setDialogOpen(false);
    setRows(prev => prev.map(r => r.id === dialogStop.id ? { ...r, [column]: dialogSelected } as RoadshowRow : r));
  };

  const handleUnlink = async (stop: RoadshowRow, kind: EntityKind) => {
    if (!confirm(`Délier ${kind === 'event' ? "l'événement" : kind === 'opportunity' ? "l'opportunité" : 'le devis'} ?`)) return;
    const column = COLUMN_BY_KIND[kind];
    setBusyId(stop.id);
    const { error } = await supabase.from('roadshow_stops').update({ [column]: null }).eq('id', stop.id);
    setBusyId(null);
    if (error) { toast.error(`Erreur: ${error.message}`); return; }
    toast.success('Lien retiré');
    setRows(prev => prev.map(r => r.id === stop.id ? { ...r, [column]: null } as RoadshowRow : r));
  };

  const handleDeleteStop = async (stop: RoadshowRow) => {
    if (!confirm(`Supprimer "${stop.city} - ${stop.venue}" et son canal de discussion lié ?`)) return;
    setBusyId(stop.id);
    const { error } = await supabase.from('roadshow_stops').delete().eq('id', stop.id);
    setBusyId(null);
    if (error) { toast.error(`Erreur: ${error.message}`); return; }
    toast.success('Feuille supprimée');
    setRows(prev => prev.filter(r => r.id !== stop.id));
  };

  // Filtered list of stops
  const filtered = rows.filter(r => {
    const linkCount = [r.event_id, r.opportunity_id, r.quote_id].filter(Boolean).length;
    if (filter === 'incomplete' && linkCount === 3) return false;
    if (filter === 'complete' && linkCount < 3) return false;
    if (search) {
      const q = norm(search);
      if (!norm(`${r.city} ${r.venue}`).includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total: rows.length,
    complete: rows.filter(r => r.event_id && r.opportunity_id && r.quote_id).length,
    incomplete: rows.filter(r => !(r.event_id && r.opportunity_id && r.quote_id)).length,
  };

  // Dialog options: universal search across all kinds, or filtered to kind
  const dialogOptions: OptionItem[] = useMemo(() => {
    let pool = universalMode ? universalPool : universalPool.filter(o => o.kind === dialogKind);
    if (dialogSearch) {
      const q = norm(dialogSearch);
      pool = pool.filter(o => norm(`${o.label} ${o.sub || ''}`).includes(q));
    }
    // If we have a stop, sort by relevance score
    if (dialogStop) {
      const scored = pool.map(o => {
        const candidate = o.kind === 'event'
          ? { city: o.raw.city, venue: o.raw.venue, title: o.raw.title, date: o.raw.start_date }
          : o.kind === 'opportunity'
            ? { location: o.raw.location, venue: o.raw.venue, title: o.raw.title, date: o.raw.date }
            : { title: o.raw.title, date: null, city: '', venue: '' };
        return { ...o, score: scoreMatch(dialogStop, candidate as any) };
      });
      scored.sort((a, b) => (b.score || 0) - (a.score || 0));
      return scored.slice(0, 100);
    }
    return pool.slice(0, 100);
  }, [universalPool, universalMode, dialogKind, dialogSearch, dialogStop]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Audit des feuilles de route</h1>
          <p className="text-muted-foreground mt-1">Liens (événement, opportunité, devis), auto-link et recherche universelle.</p>
        </div>
        <Button onClick={handleAutoLinkAll} disabled={autoLinkingAll || stats.incomplete === 0} className="border-2 border-foreground gap-2">
          {autoLinkingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Auto-link toutes les incomplètes ({stats.incomplete})
        </Button>
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
                    <div className="flex gap-2">
                      {missing.length > 0 && (
                        <Button size="sm" variant="outline" onClick={() => handleAutoLinkRow(r)} disabled={isBusy} className="border-2 border-foreground gap-1">
                          {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          Auto-link
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteStop(r)} disabled={isBusy} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <LinkBadge present={!!r.event_id} label="Événement" to={r.event_id ? `/events/${r.event_id}` : undefined}
                      onLink={() => openLinkDialog(r, 'event')}
                      onUnlink={r.event_id ? () => handleUnlink(r, 'event') : undefined} busy={isBusy} />
                    <LinkBadge present={!!r.opportunity_id} label="Opportunité" to={r.opportunity_id ? `/opportunities/${r.opportunity_id}` : undefined}
                      onLink={() => openLinkDialog(r, 'opportunity')}
                      onUnlink={r.opportunity_id ? () => handleUnlink(r, 'opportunity') : undefined} busy={isBusy} />
                    <LinkBadge present={!!r.quote_id} label="Devis" to={r.quote_id ? `/quotes` : undefined}
                      onLink={() => openLinkDialog(r, 'quote')}
                      onUnlink={r.quote_id ? () => handleUnlink(r, 'quote') : undefined} busy={isBusy} />
                  </div>

                  {missing.length > 0 && (
                    <div className="text-sm bg-destructive/10 border-l-4 border-destructive p-2 rounded">
                      <strong>Manquant :</strong> {missing.join(', ')}. Cliquez sur un badge rouge ou sur « Auto-link ».
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl flex flex-col max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="pr-8 text-base sm:text-lg leading-snug">
              Lier {dialogKind === 'event' ? 'un événement' : dialogKind === 'opportunity' ? 'une opportunité' : 'un devis'}
              {dialogStop && ` à ${dialogStop.city} - ${dialogStop.venue}`}
            </DialogTitle>
            <div className="pt-2">
              <Button size="sm" variant={universalMode ? 'default' : 'outline'} onClick={() => setUniversalMode(!universalMode)} className="gap-1">
                <Sparkles className="h-3 w-3" />
                {universalMode ? 'Recherche universelle ON' : 'Recherche universelle'}
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-3 px-6 flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder={universalMode ? 'Cherchez parmi événements, opportunités ET devis...' : 'Filtrer la liste...'}
                value={dialogSearch}
                onChange={e => setDialogSearch(e.target.value)}
                className="pl-9 border-2 border-foreground"
              />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto border-2 border-foreground rounded">
              {dialogOptions.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Aucun résultat</p>
              ) : (
                <ul className="divide-y divide-border">
                  {dialogOptions.map(o => {
                    const selected = dialogSelected === o.id;
                    return (
                      <li key={`${o.kind}-${o.id}`}>
                        <button
                          type="button"
                          onClick={() => setDialogSelected(o.id)}
                          className={`w-full text-left p-3 hover:bg-muted transition ${selected ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{o.label}</div>
                              {o.sub && <div className="text-xs text-muted-foreground truncate">{o.sub}</div>}
                            </div>
                            {(o.score || 0) >= 4 && (
                              <Badge variant="outline" className="border-green-600 text-green-700 text-xs gap-1">
                                <Sparkles className="h-3 w-3" /> Match
                              </Badge>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <DialogFooter className="p-4 border-t-2 border-foreground shrink-0 bg-background flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={confirmLink} disabled={!dialogSelected || !!busyId} className="bg-primary text-primary-foreground">
              {busyId && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Lier la sélection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoadshowAudit;
export { RoadshowAudit };
