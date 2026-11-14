import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ContactSearchCombobox } from '@/components/contacts/ContactSearchCombobox';
import { useContacts } from '@/hooks/useContacts';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { Sparkles, Square, Check, ChevronDown, Loader2 } from 'lucide-react';
import { sanitizeEmailHtml } from '@/lib/sanitize';

type Props = { contactId?: string; toEmail?: string; hasContent: boolean; onApply: (draft: { to: string; subject: string; html: string }) => void };
type Draft = { to: string; subject: string; html: string };

export function BookingEmailAssistant({ contactId, toEmail = '', hasContent, onApply }: Props) {
  const { currentUser } = useUnifiedAuth();
  const allowed = ['admin', 'super_admin', 'manager'].includes(currentUser?.role ?? '') || String(currentUser?.role) === 'collaborator';
  const [open, setOpen] = useState(false);
  const [pickedContactId, setPickedContactId] = useState(contactId ?? '');
  const [programmer, setProgrammer] = useState({ name: '', email: toEmail, organization: '', city: '', context: '' });
  const { contacts } = useContacts();
  const [showId, setShowId] = useState('');
  const [templateId, setTemplateId] = useState('none');
  const [period, setPeriod] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmReplace, setConfirmReplace] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const shows = useQuery({ queryKey: ['booking-assistant-shows', currentUser?.id], enabled: open && allowed, queryFn: async () => {
    const { data, error } = await supabase.from('centralized_artists').select('id,name,email_template_id').order('name');
    if (error) throw error; return data;
  } });
  const templates = useQuery({ queryKey: ['booking-assistant-templates', currentUser?.id], enabled: open && allowed, queryFn: async () => {
    const { data, error } = await supabase.from('email_templates').select('id,name').order('name');
    if (error) throw error; return data;
  } });
  useEffect(() => { setProgrammer(p => ({ ...p, email: toEmail })); }, [toEmail]);
  useEffect(() => { if (contactId) setPickedContactId(contactId); }, [contactId]);
  useEffect(() => {
    if (!open || !pickedContactId) return;
    const contact = (Array.isArray(contacts) ? contacts : []).find(c => c.id === pickedContactId);
    if (contact) setProgrammer(p => ({ ...p, name: `${contact.first_name} ${contact.last_name}`.trim(), email: contact.email ?? toEmail, organization: contact.company ?? '', city: contact.city ?? '' }));
  }, [pickedContactId, contacts, open]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const generate = async () => {
    setError(''); setBusy(true);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Connectez-vous pour rédiger cet email');
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/draft-booking-email`, {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ programmer, showId, period, templateId: templateId === 'none' ? null : templateId }),
      });
      if (!response.ok) {
        const text = await response.text();
        let message = text;
        try { const body = JSON.parse(text); message = body.error || body.message || text; } catch { /* plain error */ }
        throw new Error(message);
      }
      if (!response.body) throw new Error('Aucune réponse reçue');
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let received = false;
      const process = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === 'error') throw new Error(event.error);
        if (event.type === 'draft') { setDraft({ to: event.to, subject: event.subject, html: sanitizeEmailHtml(event.html) }); received = true; }
      };
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() ?? ''; lines.forEach(process);
      }
      buffer += decoder.decode(); process(buffer);
      if (!received) throw new Error('Aucun brouillon n’a été reçu');
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'La rédaction a échoué');
    } finally { if (abortRef.current === controller) { abortRef.current = null; setBusy(false); } }
  };
  const apply = (force = false) => {
    if (!draft) return;
    if (hasContent && !force) { setConfirmReplace(true); return; }
    const final = { ...draft, html: sanitizeEmailHtml(draft.html) };
    setConfirmReplace(false); setOpen(false);
    setTimeout(() => onApply(final), 0);
  };
  if (!allowed) return null;
  return <div className="min-w-0 border-y border-border py-3">
    <Button type="button" variant="ghost" className="w-full justify-between whitespace-normal text-left" onClick={() => setOpen(o => !o)} aria-expanded={open}><span className="flex items-center gap-2"><Sparkles className="h-4 w-4 shrink-0" />Email de réservation · Lovable AI</span><ChevronDown className="h-4 w-4 shrink-0" /></Button>
    {open && <div className="min-w-0 space-y-4 pt-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><Label htmlFor="ai-programmer">Programmateur *</Label><Input id="ai-programmer" maxLength={200} disabled={busy} value={programmer.name} onChange={e => setProgrammer(p => ({ ...p, name: e.target.value }))} /></div>
        <div><Label htmlFor="ai-email">Email *</Label><Input id="ai-email" type="email" disabled={busy} value={programmer.email} onChange={e => setProgrammer(p => ({ ...p, email: e.target.value }))} /></div>
        <div><Label htmlFor="ai-organization">Festival ou salle</Label><Input id="ai-organization" maxLength={300} disabled={busy} value={programmer.organization} onChange={e => setProgrammer(p => ({ ...p, organization: e.target.value }))} /></div>
        <div><Label htmlFor="ai-city">Ville</Label><Input id="ai-city" maxLength={150} disabled={busy} value={programmer.city} onChange={e => setProgrammer(p => ({ ...p, city: e.target.value }))} /></div>
      </div>
      <div><Label>Spectacle à proposer *</Label><Select value={showId} disabled={busy} onValueChange={id => { setShowId(id); setTemplateId(shows.data?.find(s => s.id === id)?.email_template_id ?? 'none'); }}><SelectTrigger><SelectValue placeholder="Choisir un spectacle" /></SelectTrigger><SelectContent>{shows.data?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Modèle de rédaction</Label><Select value={templateId} disabled={busy} onValueChange={setTemplateId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Proposition de réservation Fatras</SelectItem>{templates.data?.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
      <div><Label htmlFor="ai-period">Date ou période souhaitée</Label><Input id="ai-period" maxLength={300} disabled={busy} value={period} onChange={e => setPeriod(e.target.value)} /></div>
      <div><Label htmlFor="ai-context">Informations complémentaires sur la programmation</Label><Textarea id="ai-context" maxLength={3000} disabled={busy} rows={3} value={programmer.context} onChange={e => setProgrammer(p => ({ ...p, context: e.target.value }))} /></div>
      {(shows.error || templates.error || error) && <p role="alert" className="break-words text-sm text-destructive">{error || shows.error?.message || templates.error?.message}</p>}
      <div className="flex flex-wrap gap-2"><Button type="button" disabled={busy || !showId || !programmer.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(programmer.email)} onClick={() => void generate()}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{busy ? 'Rédaction…' : draft ? 'Rédiger une autre version' : 'Rédiger le brouillon'}</Button>{busy && <Button type="button" variant="outline" onClick={() => abortRef.current?.abort()}><Square className="mr-2 h-4 w-4" />Arrêter</Button>}</div>
      {draft && <div className="space-y-3 border-t border-border pt-4"><h3 className="font-medium">Brouillon à relire</h3><div><Label htmlFor="ai-draft-subject">Objet</Label><Input id="ai-draft-subject" value={draft.subject} onChange={e => setDraft(d => d ? { ...d, subject: e.target.value } : d)} /></div><RichTextEditor value={draft.html} onChange={html => setDraft(d => d ? { ...d, html } : d)} className="min-h-[180px]" /><Button type="button" disabled={busy || !draft.subject.trim() || !draft.html.trim()} onClick={() => apply()}><Check className="mr-2 h-4 w-4" />Utiliser ce brouillon</Button>{confirmReplace && <div className="space-y-2 rounded-md border border-border p-3 text-sm"><p>L’objet et le texte actuels seront remplacés par ce brouillon.</p><div className="flex flex-wrap gap-2"><Button type="button" size="sm" onClick={() => apply(true)}>Remplacer</Button><Button type="button" size="sm" variant="outline" onClick={() => setConfirmReplace(false)}>Annuler</Button></div></div>}</div>}
    </div>}
  </div>;
}