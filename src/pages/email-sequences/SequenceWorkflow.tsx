import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Send, Sparkles, Mail, AlertCircle, CheckCircle2, Loader2, Trash2, CalendarClock, X } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Step {
  id: string;
  sequence_id: string;
  position: number;
  name: string;
  delay_label: string | null;
  campaign_id: string | null;
  source_list_ids: string[];
  excluded_list_ids: string[];
  status: string;
  sent_at: string | null;
  segmented_at: string | null;
  recipient_count: number;
  scheduled_at: string | null;
}

interface Segment {
  id: string;
  step_id: string;
  segment_type: 'bounced' | 'opened' | 'clicked' | 'not_opened';
  list_id: string;
  contact_count: number;
}

interface Sequence { id: string; name: string; description: string | null; }
interface ContactList { id: string; name: string; }
interface Campaign { id: string; name: string; subject: string | null; status: string; }

const SEG_LABELS: Record<string, { label: string; color: string }> = {
  bounced: { label: '✗ Bounced', color: 'bg-red-100 text-red-800 border-red-300' },
  clicked: { label: '🟢 Clicked', color: 'bg-green-100 text-green-800 border-green-300' },
  opened: { label: '🟡 Opened', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  not_opened: { label: '⚪ Not opened', color: 'bg-gray-100 text-gray-700 border-gray-300' },
};

interface Props { sequenceId: string; onBack: () => void; }

export const SequenceWorkflow: React.FC<Props> = ({ sequenceId, onBack }) => {
  const confirm = useConfirm();
  const [sequence, setSequence] = useState<Sequence | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStep, setShowAddStep] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [computingFor, setComputingFor] = useState<string | null>(null);
  const [schedulingFor, setSchedulingFor] = useState<Step | null>(null);
  const [scheduleValue, setScheduleValue] = useState<string>('');

  const load = async () => {
    setLoading(true);
    const [seqRes, stepsRes, listsRes, campRes] = await Promise.all([
      supabase.from('email_sequences').select('*').eq('id', sequenceId).single(),
      supabase.from('email_sequence_steps').select('*').eq('sequence_id', sequenceId).order('position'),
      supabase.from('contact_lists').select('id, name').order('name'),
      supabase.from('email_campaigns').select('id, name, subject, status').order('created_at', { ascending: false }),
    ]);
    if (seqRes.data) setSequence(seqRes.data as any);
    const stepData = (stepsRes.data as any) || [];
    setSteps(stepData);
    setContactLists((listsRes.data as any) || []);
    setCampaigns((campRes.data as any) || []);
    if (stepData.length) {
      const stepIds = stepData.map((s: Step) => s.id);
      const { data: segData } = await supabase.from('email_sequence_segments').select('*').in('step_id', stepIds);
      setSegments((segData as any) || []);
    } else setSegments([]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [sequenceId]);

  const segmentsByStep = useMemo(() => {
    const map: Record<string, Segment[]> = {};
    for (const s of segments) { (map[s.step_id] ||= []).push(s); }
    return map;
  }, [segments]);

  const allBouncedListIds = useMemo(
    () => segments.filter(s => s.segment_type === 'bounced').map(s => s.list_id),
    [segments]
  );

  const computeSegments = async (step: Step) => {
    setComputingFor(step.id);
    try {
      const { data, error } = await supabase.functions.invoke('compute-sequence-segments', { body: { stepId: step.id } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({ title: 'Segmentation terminée', description: 'Les sous-listes ont été créées.' });
      await load();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setComputingFor(null);
    }
  };

  const launchStep = async (step: Step) => {
    if (!step.campaign_id) { toast({ title: 'Aucune campagne liée', variant: 'destructive' }); return; }
    const ok = await confirm({
      title: `Lancer l'envoi de "${step.name}" ?`,
      description: `La campagne sera mise en file d'envoi (200/jour max). Une fois terminée, lance la segmentation pour générer les sous-listes.`,
      confirmText: 'Lancer', variant: 'default',
    });
    if (!ok) return;

    // Synchroniser les listes de l'étape vers la campagne avant l'envoi
    await supabase.from('campaign_contact_lists').delete().eq('campaign_id', step.campaign_id);
    const rows = [
      ...(step.source_list_ids || []).map((id) => ({ campaign_id: step.campaign_id!, contact_list_id: id, kind: 'include' })),
      ...(step.excluded_list_ids || []).map((id) => ({ campaign_id: step.campaign_id!, contact_list_id: id, kind: 'exclude' })),
    ];
    if (rows.length > 0) {
      const { error: linkErr } = await supabase.from('campaign_contact_lists').insert(rows);
      if (linkErr) {
        toast({ title: 'Erreur synchro listes', description: linkErr.message, variant: 'destructive' });
        return;
      }
    }

    await supabase.from('email_sequence_steps').update({ status: 'sending', sent_at: new Date().toISOString() }).eq('id', step.id);
    const { error } = await supabase.functions.invoke('send-campaign-emails', { body: { campaignId: step.campaign_id } });
    if (error) {
      toast({ title: 'Erreur envoi', description: error.message, variant: 'destructive' });
      await supabase.from('email_sequence_steps').update({ status: 'ready' }).eq('id', step.id);
    } else {
      toast({ title: 'Envoi en cours', description: 'La campagne est en file (200/jour max).' });
      await supabase.from('email_sequence_steps').update({ status: 'sent' }).eq('id', step.id);
    }
    load();
  };

  const scheduleStep = async () => {
    if (!schedulingFor || !scheduleValue) return;
    if (!schedulingFor.campaign_id) {
      toast({ title: 'Aucune campagne liée', variant: 'destructive' });
      return;
    }
    const iso = new Date(scheduleValue).toISOString();
    const { error } = await supabase
      .from('email_sequence_steps')
      .update({ scheduled_at: iso, status: 'ready' })
      .eq('id', schedulingFor.id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Envoi programmé', description: `Envoi prévu le ${new Date(iso).toLocaleString('fr-FR')}.` });
    setSchedulingFor(null);
    setScheduleValue('');
    load();
  };

  const cancelSchedule = async (step: Step) => {
    await supabase.from('email_sequence_steps').update({ scheduled_at: null }).eq('id', step.id);
    toast({ title: 'Programmation annulée' });
    load();
  };

  const deleteStep = async (step: Step) => {
    const ok = await confirm({ title: 'Supprimer cette étape ?', confirmText: 'Supprimer', variant: 'destructive' });
    if (!ok) return;
    await supabase.from('email_sequence_steps').delete().eq('id', step.id);
    load();
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!sequence) return <div className="p-6">Séquence introuvable</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2"><ArrowLeft className="w-4 h-4 mr-1" /> Séquences</Button>
          <h1 className="text-3xl font-bold">{sequence.name}</h1>
          {sequence.description && <p className="text-muted-foreground text-sm mt-1">{sequence.description}</p>}
        </div>
        <Button onClick={() => { setEditingStep(null); setShowAddStep(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter une étape
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Aucune étape. Commence par ajouter le premier email de ta séquence.</p>
          <Button onClick={() => setShowAddStep(true)}><Plus className="w-4 h-4 mr-1" /> Première étape</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const segs = segmentsByStep[step.id] || [];
            const campaign = campaigns.find(c => c.id === step.campaign_id);
            return (
              <div key={step.id}>
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {step.position}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{step.name}</CardTitle>
                          <div className="flex gap-2 items-center mt-1 flex-wrap">
                            <StatusBadge status={step.status} />
                            {step.delay_label && <Badge variant="outline" className="text-xs">⏱ {step.delay_label}</Badge>}
                            {campaign && <Badge variant="secondary" className="text-xs">📧 {campaign.name}</Badge>}
                            {step.scheduled_at && (step.status === 'draft' || step.status === 'ready') && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                <CalendarClock className="w-3 h-3 mr-1" />
                                Programmé : {new Date(step.scheduled_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditingStep(step); setShowAddStep(true); }}>Modifier</Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteStep(step)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-3">
                      Listes sources : {step.source_list_ids.length} · Listes exclues : {step.excluded_list_ids.length}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {(step.status === 'draft' || step.status === 'ready') && step.campaign_id && (
                        <Button size="sm" onClick={() => launchStep(step)}>
                          <Send className="w-4 h-4 mr-1" /> Lancer l'envoi
                        </Button>
                      )}
                      {!step.campaign_id && (
                        <div className="flex items-center text-sm text-amber-700 gap-1">
                          <AlertCircle className="w-4 h-4" /> Lier une campagne pour pouvoir lancer
                        </div>
                      )}
                      {(step.status === 'sent' || step.status === 'segmented') && (
                        <Button size="sm" variant="outline" onClick={() => computeSegments(step)} disabled={computingFor === step.id}>
                          {computingFor === step.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />}
                          {step.status === 'segmented' ? 'Recalculer la segmentation' : 'Calculer les segments'}
                        </Button>
                      )}
                    </div>

                    {segs.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                        {(['clicked', 'opened', 'not_opened', 'bounced'] as const).map(type => {
                          const seg = segs.find(s => s.segment_type === type);
                          if (!seg) return null;
                          return (
                            <div key={type} className={`p-3 rounded-lg border ${SEG_LABELS[type].color}`}>
                              <div className="text-xs font-medium">{SEG_LABELS[type].label}</div>
                              <div className="text-2xl font-bold">{seg.contact_count}</div>
                              <div className="text-[10px] opacity-70 truncate">Liste créée</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {idx < steps.length - 1 && (
                  <div className="flex justify-center my-2 text-muted-foreground">↓</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <StepEditor
        open={showAddStep}
        onClose={() => { setShowAddStep(false); setEditingStep(null); }}
        sequenceId={sequenceId}
        existingStep={editingStep}
        nextPosition={steps.length + 1}
        contactLists={contactLists}
        campaigns={campaigns}
        prevSegments={segments}
        autoExcludeBounced={allBouncedListIds}
        onSaved={() => { setShowAddStep(false); setEditingStep(null); load(); }}
      />
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; variant: any }> = {
    draft: { label: 'Brouillon', variant: 'outline' },
    ready: { label: 'Prêt', variant: 'default' },
    sending: { label: 'Envoi…', variant: 'secondary' },
    sent: { label: 'Envoyé', variant: 'secondary' },
    segmented: { label: 'Segmenté ✓', variant: 'default' },
  };
  const cfg = map[status] || { label: status, variant: 'outline' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

interface EditorProps {
  open: boolean; onClose: () => void; sequenceId: string;
  existingStep: Step | null; nextPosition: number;
  contactLists: ContactList[]; campaigns: Campaign[];
  prevSegments: Segment[]; autoExcludeBounced: string[];
  onSaved: () => void;
}

const StepEditor: React.FC<EditorProps> = ({ open, onClose, sequenceId, existingStep, nextPosition, contactLists, campaigns, prevSegments, autoExcludeBounced, onSaved }) => {
  const [name, setName] = useState('');
  const [delayLabel, setDelayLabel] = useState('');
  const [campaignId, setCampaignId] = useState<string>('');
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);

  useEffect(() => {
    if (existingStep) {
      setName(existingStep.name);
      setDelayLabel(existingStep.delay_label || '');
      setCampaignId(existingStep.campaign_id || '');
      setSourceIds(existingStep.source_list_ids || []);
      setExcludedIds(existingStep.excluded_list_ids || []);
    } else {
      setName(`Email ${nextPosition}`);
      setDelayLabel(nextPosition === 1 ? '' : 'J+7');
      setCampaignId('');
      setSourceIds([]);
      setExcludedIds(autoExcludeBounced);
    }
  }, [existingStep, open]);

  const toggle = (id: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const save = async () => {
    if (!name.trim()) return;
    const payload = {
      sequence_id: sequenceId,
      name: name.trim(),
      delay_label: delayLabel.trim() || null,
      campaign_id: campaignId || null,
      source_list_ids: sourceIds,
      excluded_list_ids: excludedIds,
      status: campaignId && sourceIds.length ? 'ready' : 'draft',
    };
    if (existingStep) {
      const { error } = await supabase.from('email_sequence_steps').update(payload).eq('id', existingStep.id);
      if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    } else {
      const { error } = await supabase.from('email_sequence_steps').insert({ ...payload, position: nextPosition });
      if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    }
    toast({ title: existingStep ? 'Étape mise à jour' : 'Étape ajoutée' });
    onSaved();
  };

  // Build list of "smart" source suggestions from previous segments
  const segmentLists = prevSegments
    .filter(s => s.segment_type !== 'bounced')
    .map(s => ({ id: s.list_id, type: s.segment_type, count: s.contact_count }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{existingStep ? 'Modifier l\'étape' : `Étape ${nextPosition}`}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nom de l'étape *</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Délai indicatif (informatif)</label>
            <Input value={delayLabel} onChange={e => setDelayLabel(e.target.value)} placeholder="Ex: J+7, Dans 2 semaines" />
          </div>
          <div>
            <label className="text-sm font-medium">Campagne email à envoyer</label>
            <Select value={campaignId || 'none'} onValueChange={v => setCampaignId(v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Choisir une campagne…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Aucune (lier plus tard) —</SelectItem>
                {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.subject ? `— ${c.subject}` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Crée d'abord ta campagne dans Campagnes email, puis liens-la ici.</p>
          </div>

          {segmentLists.length > 0 && (
            <div>
              <label className="text-sm font-medium">💡 Sous-listes des étapes précédentes</label>
              <div className="mt-1 space-y-1 border rounded p-2 bg-muted/30">
                {segmentLists.map(s => {
                  const lst = contactLists.find(l => l.id === s.id);
                  if (!lst) return null;
                  return (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={sourceIds.includes(s.id)} onCheckedChange={() => toggle(s.id, sourceIds, setSourceIds)} />
                      <Badge variant="outline" className="text-xs">{s.type}</Badge>
                      <span className="flex-1 truncate">{lst.name}</span>
                      <span className="text-xs text-muted-foreground">{s.count} contacts</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Listes sources ({sourceIds.length} sélectionnées)</label>
            <div className="mt-1 space-y-1 border rounded p-2 max-h-48 overflow-y-auto">
              {contactLists.map(l => (
                <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={sourceIds.includes(l.id)} onCheckedChange={() => toggle(l.id, sourceIds, setSourceIds)} />
                  <span className="flex-1 truncate">{l.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Listes à exclure ({excludedIds.length})</label>
            {autoExcludeBounced.length > 0 && (
              <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Les bounced des étapes précédentes sont auto-exclus.
              </p>
            )}
            <div className="mt-1 space-y-1 border rounded p-2 max-h-32 overflow-y-auto">
              {contactLists.map(l => (
                <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={excludedIds.includes(l.id)} onCheckedChange={() => toggle(l.id, excludedIds, setExcludedIds)} />
                  <span className="flex-1 truncate">{l.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={save} disabled={!name.trim()}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
