import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';

type Followup = {
  id: string; status: string; to_email: string; subject: string;
  send_at: string; sent_at: string | null; error: string | null;
};

const LABELS: Record<string, string> = {
  pending: 'Programmée', processing: 'En cours', sent: 'Envoyée', failed: 'Échouée', cancelled: 'Annulée',
};
const FILTERS: Record<string, string[]> = {
  scheduled: ['pending', 'processing'], sent: ['sent'], failed: ['failed'], all: [],
};

export const FollowupStatusView: React.FC = () => {
  const [rows, setRows] = useState<Followup[]>([]);
  const [filter, setFilter] = useState('scheduled');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from('email_followups')
      .select('id,status,to_email,subject,send_at,sent_at,error')
      .order('send_at', { ascending: false }).limit(300);
    if (error) toast.error(error.message); else setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (id: string, patch: Record<string, unknown>, msg: string) => {
    const { error } = await (supabase as any).from('email_followups')
      .update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return toast.error(error.message);
    toast.success(msg);
    load();
  };

  const retry = async (id: string) => {
    await update(id, { status: 'pending', error: null, send_at: new Date().toISOString() }, 'Relance remise en file');
    supabase.functions.invoke('process-email-followups').then(() => load()).catch(() => {});
  };

  const count = (k: string) => rows.filter((r) => FILTERS[k].length === 0 || FILTERS[k].includes(r.status)).length;
  const shown = rows.filter((r) => FILTERS[filter].length === 0 || FILTERS[filter].includes(r.status));
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="scheduled">Programmées ({count('scheduled')})</TabsTrigger>
            <TabsTrigger value="sent">Envoyées ({count('sent')})</TabsTrigger>
            <TabsTrigger value="failed">Échouées ({count('failed')})</TabsTrigger>
            <TabsTrigger value="all">Toutes ({count('all')})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Actualiser
        </Button>
      </div>

      {shown.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Aucune relance dans cette catégorie</p>
      ) : (
        <div className="space-y-2">
          {shown.map((r) => (
            <div key={r.id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={r.status === 'failed' ? 'destructive' : r.status === 'sent' ? 'default' : 'outline'}>
                    {LABELS[r.status] || r.status}
                  </Badge>
                  <span className="font-medium truncate">{r.to_email}</span>
                </div>
                <p className="text-sm truncate">{r.subject}</p>
                <p className="text-xs text-muted-foreground">
                  Prévue : {fmt(r.send_at)}{r.sent_at && ` · Envoyée : ${fmt(r.sent_at)}`}
                </p>
                {r.error && <p className="text-xs text-destructive break-words mt-1">{r.error}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {r.status === 'failed' && (
                  <Button size="sm" onClick={() => retry(r.id)}><RotateCcw className="h-4 w-4 mr-1" />Réessayer</Button>
                )}
                {r.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => update(r.id, { status: 'cancelled', error: 'Annulée manuellement' }, 'Relance annulée')}>
                    <X className="h-4 w-4 mr-1" />Annuler
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
