import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Loader2, MailWarning, RefreshCw, Trash2, Eraser, Download, Check, X, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

type InvalidContact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  reason: string;
  suggestion: string | null;
};

const isAscii = (e: string) => /^[\x00-\x7F]+$/.test(e);
const isValidFormat = (e: string) =>
  /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(e);

function analyse(raw: string): { ok: boolean; reason: string; suggestion: string | null } {
  if (!raw) return { ok: true, reason: '', suggestion: null };
  const original = raw;
  let v = raw.trim().toLowerCase();
  let suggestion: string | null = null;

  // Suggestions automatiques
  let cleaned = v;
  if (/^mailto:/i.test(cleaned)) cleaned = cleaned.replace(/^mailto:/i, '');
  const m = cleaned.match(/<([^>]+)>/);
  if (m) cleaned = m[1].trim();
  cleaned = cleaned.replace(/\s+/g, '');
  if (cleaned !== v.replace(/\s+/g, '') || cleaned !== original.trim().toLowerCase()) {
    if (cleaned && isAscii(cleaned) && isValidFormat(cleaned)) suggestion = cleaned;
  }

  if (/\s/.test(original)) return { ok: false, reason: 'Espace dans l\'adresse', suggestion };
  if (/^mailto:/i.test(original)) return { ok: false, reason: 'Préfixe mailto:', suggestion };
  if (!v.includes('@')) return { ok: false, reason: 'Pas de @', suggestion };
  if (!isAscii(v)) return { ok: false, reason: 'Caractères non-ASCII (accents)', suggestion };
  if (!isValidFormat(v)) return { ok: false, reason: 'Format invalide (user@domain.tld attendu)', suggestion };
  return { ok: true, reason: '', suggestion: null };
}

export const ContactEmailValidator: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [totalChecked, setTotalChecked] = useState(0);
  const [invalid, setInvalid] = useState<InvalidContact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const confirm = useConfirm();

  const scan = async () => {
    setScanning(true);
    setSelected(new Set());
    try {
      const PAGE = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email')
          .not('email', 'is', null)
          .neq('email', '')
          .order('created_at', { ascending: false })
          .range(from, from + PAGE - 1);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < PAGE) break;
        from += PAGE;
      }
      setTotalChecked(all.length);
      const bad: InvalidContact[] = [];
      for (const c of all) {
        const res = analyse(c.email || '');
        if (!res.ok) {
          bad.push({
            id: c.id,
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            reason: res.reason,
            suggestion: res.suggestion,
          });
        }
      }
      setInvalid(bad);
      setScanned(true);
      toast.success(`${all.length} contacts vérifiés, ${bad.length} email(s) invalide(s)`);
    } catch (e: any) {
      toast.error(`Erreur lors du scan : ${e.message}`);
    } finally {
      setScanning(false);
    }
  };

  const toggleAll = (v: boolean) => {
    setSelected(v ? new Set(invalid.map((i) => i.id)) : new Set());
  };
  const toggleOne = (id: string, v: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (v) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const applySuggestions = async () => {
    const items = invalid.filter((i) => selected.has(i.id) && i.suggestion);
    if (items.length === 0) {
      toast.error('Aucun contact sélectionné avec une correction automatique disponible');
      return;
    }
    const ok = await confirm({
      title: 'Appliquer les corrections',
      description: `Corriger automatiquement ${items.length} email(s) ?`,
      confirmText: 'Corriger',
    });
    if (!ok) return;
    setWorking(true);
    let done = 0;
    for (const it of items) {
      const { error } = await supabase.from('contacts').update({ email: it.suggestion }).eq('id', it.id);
      if (!error) done++;
    }
    setWorking(false);
    toast.success(`${done} email(s) corrigé(s)`);
    scan();
  };

  const clearEmails = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const ok = await confirm({
      title: 'Vider les emails',
      description: `Vider l'email de ${ids.length} contact(s) ? Les contacts seront conservés mais ne recevront plus de campagne.`,
      confirmText: 'Vider',
      variant: 'destructive',
    });
    if (!ok) return;
    setWorking(true);
    const { error } = await supabase.from('contacts').update({ email: null }).in('id', ids);
    setWorking(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} email(s) vidé(s)`);
    scan();
  };

  const deleteContacts = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const ok = await confirm({
      title: 'Supprimer les contacts',
      description: `Supprimer définitivement ${ids.length} contact(s) ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      variant: 'destructive',
    });
    if (!ok) return;
    setWorking(true);
    const { error } = await supabase.from('contacts').delete().in('id', ids);
    setWorking(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${ids.length} contact(s) supprimé(s)`);
    scan();
  };

  const exportCsv = () => {
    const header = 'id,first_name,last_name,email,reason,suggestion';
    const rows = invalid.map((i) =>
      [i.id, i.first_name || '', i.last_name || '', i.email, i.reason, i.suggestion || '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emails_invalides_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const selectedAuto = invalid.filter((i) => selected.has(i.id) && i.suggestion).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MailWarning className="h-5 w-5 text-amber-600" />
          Vérification des emails
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Analyse tous les contacts existants et détecte les adresses email invalides (espaces, accents, format incorrect, préfixe <code>mailto:</code>…) qui font échouer l'envoi des campagnes.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button onClick={scan} disabled={scanning}>
            {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {scanned ? 'Relancer le scan' : 'Lancer le scan'}
          </Button>
          {invalid.length > 0 && (
            <Button variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" /> Exporter en CSV
            </Button>
          )}
        </div>

        {scanned && (
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{totalChecked} contacts vérifiés</Badge>
            <Badge variant={invalid.length > 0 ? 'destructive' : 'default'}>
              {invalid.length} email(s) invalide(s)
            </Badge>
          </div>
        )}

        {invalid.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selected.size === invalid.length}
                  onCheckedChange={(v) => toggleAll(!!v)}
                />
                <span className="text-sm">Tout sélectionner ({selected.size}/{invalid.length})</span>
              </div>
              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                onClick={applySuggestions}
                disabled={working || selectedAuto === 0}
              >
                Corriger auto ({selectedAuto})
              </Button>
              <Button size="sm" variant="outline" onClick={clearEmails} disabled={working || selected.size === 0}>
                <Eraser className="h-4 w-4 mr-2" /> Vider email
              </Button>
              <Button size="sm" variant="destructive" onClick={deleteContacts} disabled={working || selected.size === 0}>
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            </div>

            <div className="border rounded-lg max-h-[500px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 w-8"></th>
                    <th className="p-2 text-left">Contact</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Problème</th>
                    <th className="p-2 text-left">Correction proposée</th>
                  </tr>
                </thead>
                <tbody>
                  {invalid.map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="p-2">
                        <Checkbox
                          checked={selected.has(i.id)}
                          onCheckedChange={(v) => toggleOne(i.id, !!v)}
                        />
                      </td>
                      <td className="p-2">{[i.first_name, i.last_name].filter(Boolean).join(' ') || '—'}</td>
                      <td className="p-2 font-mono text-xs break-all">{i.email}</td>
                      <td className="p-2"><Badge variant="outline">{i.reason}</Badge></td>
                      <td className="p-2 font-mono text-xs text-green-700">{i.suggestion || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
