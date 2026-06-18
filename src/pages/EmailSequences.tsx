import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, GitBranch, ArrowLeft, Archive, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SequenceWorkflow } from './email-sequences/SequenceWorkflow';
import { useAuthContext } from '@/contexts/UnifiedAuthContext';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  user_id: string;
}

export const EmailSequences: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    setSequences((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const createSequence = async () => {
    if (!newName.trim() || !user?.id) return;
    const { data, error } = await supabase
      .from('email_sequences')
      .insert({ name: newName.trim(), description: newDesc.trim() || null, user_id: user.id })
      .select()
      .single();
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    setShowCreate(false);
    setNewName(''); setNewDesc('');
    setSelectedId(data.id);
    await load();
  };

  const deleteSequence = async (id: string) => {
    const ok = await confirm({ title: 'Supprimer cette séquence ?', description: 'Toutes les étapes et sous-listes générées seront supprimées.', confirmText: 'Supprimer', variant: 'destructive' });
    if (!ok) return;
    const { error } = await supabase.from('email_sequences').delete().eq('id', id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Séquence supprimée' });
    load();
  };

  if (selectedId) {
    return <SequenceWorkflow sequenceId={selectedId} onBack={() => { setSelectedId(null); load(); }} />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/email-campaigns')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Campagnes
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2"><GitBranch className="w-7 h-7" /> Séquences emailing</h1>
          <p className="text-muted-foreground text-sm mt-1">Enchaînez plusieurs emails avec re-segmentation automatique par engagement</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Nouvelle séquence</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : sequences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GitBranch className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Aucune séquence pour l'instant.</p>
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" /> Créer ma première séquence</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sequences.map(s => (
            <Card key={s.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelectedId(s.id)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  <Badge variant={s.status === 'archived' ? 'secondary' : 'default'}>{s.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {s.description && <p className="text-sm text-muted-foreground mb-2">{s.description}</p>}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Créée le {new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteSequence(s.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle séquence</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Lancement album printemps 2026" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Objectif de la séquence…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={createSequence} disabled={!newName.trim()}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSequences;
