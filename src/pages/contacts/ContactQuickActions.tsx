import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Calendar, Target, FileText, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type ActionType = 'task' | 'event' | 'opportunity' | 'quote';

interface Props {
  contactId: string;
  contactName?: string;
  onCreated?: () => void;
}

export const ContactQuickActions: React.FC<Props> = ({ contactId, contactName, onCreated }) => {
  const { user } = useAuth();
  const [openType, setOpenType] = useState<ActionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [extra, setExtra] = useState<string>('');
  const [priority, setPriority] = useState('medium');

  const reset = () => {
    setTitle(''); setDescription(''); setDate(''); setExtra(''); setPriority('medium');
  };

  const close = () => { setOpenType(null); reset(); };

  const handleCreate = async () => {
    if (!user) { toast.error('Non authentifié'); return; }
    if (!title.trim()) { toast.error('Le titre est requis'); return; }
    setLoading(true);
    try {
      if (openType === 'task') {
        const { error } = await supabase.from('tasks').insert({
          user_id: user.id, title, description: description || null,
          due_date: date || null, priority, status: 'todo', contact_id: contactId,
        });
        if (error) throw error;
        toast.success('Tâche créée');
      } else if (openType === 'event') {
        const { error } = await supabase.from('events').insert({
          user_id: user.id, title, description: description || null,
          start_date: date || null, venue: extra || null, status: 'pending', contact_id: contactId,
        });
        if (error) throw error;
        toast.success('Événement créé');
      } else if (openType === 'opportunity') {
        const { error } = await supabase.from('opportunities').insert({
          user_id: user.id, title, description: description || null,
          date: date || null, budget: extra ? Number(extra) : 0,
          status: 'open', contact_id: contactId,
        });
        if (error) throw error;
        toast.success('Opportunité créée');
      } else if (openType === 'quote') {
        const quoteNumber = `Q-${Date.now()}`;
        const { error } = await supabase.from('quotes').insert({
          user_id: user.id, title, description: description || null,
          quote_number: quoteNumber, valid_until: date || null,
          total_amount: extra ? Number(extra) : 0, vat_rate: 20,
          status: 'draft', contact_id: contactId,
        });
        if (error) throw error;
        toast.success('Devis créé');
      }
      onCreated?.();
      close();
    } catch (e: any) {
      toast.error(`Erreur: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const actions: { type: ActionType; label: string; icon: any }[] = [
    { type: 'task', label: 'Tâche', icon: CheckSquare },
    { type: 'event', label: 'Événement', icon: Calendar },
    { type: 'opportunity', label: 'Opportunité', icon: Target },
    { type: 'quote', label: 'Devis', icon: FileText },
  ];

  const titles: Record<ActionType, string> = {
    task: 'Nouvelle tâche',
    event: 'Nouvel événement',
    opportunity: 'Nouvelle opportunité',
    quote: 'Nouveau devis',
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Créer pour ce contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {actions.map(({ type, label, icon: Icon }) => (
              <Button key={type} variant="outline" size="sm" onClick={() => setOpenType(type)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                <Icon className="h-3.5 w-3.5 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openType !== null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{openType ? titles[openType] : ''}{contactName ? ` — ${contactName}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Titre *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div>
              <Label>
                {openType === 'task' ? 'Échéance' :
                 openType === 'event' ? 'Date de début' :
                 openType === 'opportunity' ? 'Date' :
                 openType === 'quote' ? 'Valide jusqu\'au' : 'Date'}
              </Label>
              <Input type={openType === 'event' ? 'datetime-local' : 'date'} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            {openType === 'task' && (
              <div>
                <Label>Priorité</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {openType === 'event' && (
              <div>
                <Label>Lieu</Label>
                <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Salle / lieu" />
              </div>
            )}
            {openType === 'opportunity' && (
              <div>
                <Label>Budget (€)</Label>
                <Input type="number" value={extra} onChange={(e) => setExtra(e.target.value)} />
              </div>
            )}
            {openType === 'quote' && (
              <div>
                <Label>Montant total (€)</Label>
                <Input type="number" value={extra} onChange={(e) => setExtra(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close} disabled={loading}>Annuler</Button>
            <Button onClick={handleCreate} disabled={loading}>{loading ? 'Création…' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
