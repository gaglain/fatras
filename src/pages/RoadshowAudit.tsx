import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, ExternalLink, Search, MapPin, Calendar } from 'lucide-react';

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

const LinkBadge = ({ present, label, to }: { present: boolean; label: string; to?: string }) => {
  if (present && to) {
    return (
      <Link to={to}>
        <Badge variant="outline" className="gap-1 border-2 border-foreground hover:bg-primary hover:text-primary-foreground transition">
          <CheckCircle2 className="h-3 w-3" /> {label} <ExternalLink className="h-3 w-3" />
        </Badge>
      </Link>
    );
  }
  if (present) {
    return (
      <Badge variant="outline" className="gap-1 border-2 border-foreground">
        <CheckCircle2 className="h-3 w-3" /> {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 border-2 border-destructive text-destructive">
      <XCircle className="h-3 w-3" /> {label} manquant
    </Badge>
  );
};

const RoadshowAudit: React.FC = () => {
  const [rows, setRows] = useState<RoadshowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'complete'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('roadshow_stops')
        .select('id, city, venue, event_date, status, event_id, opportunity_id, quote_id, created_at')
        .eq('is_archived', false)
        .order('event_date', { ascending: false, nullsFirst: false });
      if (!error && data) setRows(data as RoadshowRow[]);
      setLoading(false);
    })();
  }, []);

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

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Audit des feuilles de route</h1>
        <p className="text-muted-foreground mt-1">
          Visualisez les liens (événement, opportunité, devis) de chaque feuille de route et identifiez les manquants.
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
        <div className="flex gap-2">
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
            return (
              <Card key={r.id} className="border-2 border-foreground hover:shadow-lg transition">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <Link to={`/roadshow?stop=${r.id}`} className="font-bold text-lg hover:underline flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {r.city || 'Ville ?'} — {r.venue || 'Lieu ?'}
                      </Link>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {r.event_date ? new Date(r.event_date).toLocaleDateString('fr-FR') : 'Date non définie'}
                        <Badge variant="secondary" className="ml-2">{r.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <LinkBadge present={!!r.event_id} label="Événement" to={r.event_id ? `/events/${r.event_id}` : undefined} />
                    <LinkBadge present={!!r.opportunity_id} label="Opportunité" to={r.opportunity_id ? `/opportunities/${r.opportunity_id}` : undefined} />
                    <LinkBadge present={!!r.quote_id} label="Devis" to={r.quote_id ? `/quotes` : undefined} />
                  </div>

                  {missing.length > 0 && (
                    <div className="text-sm bg-destructive/10 border-l-4 border-destructive p-2 rounded">
                      <strong>Lien(s) manquant(s) :</strong> {missing.join(', ')}.
                      {' '}Cette feuille a probablement été créée par un autre déclencheur (ex : opportunité gagnée mais pas d'événement confirmé associé).
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoadshowAudit;
export { RoadshowAudit };
