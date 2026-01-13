import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OpportunityEditorProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: any;
  onSave: () => void;
}

export const OpportunityEditor: React.FC<OpportunityEditorProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSave
}) => {
  const { users: activeUsers } = useActiveUsers();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    date: '',
    budget: '',
    probability_percentage: '50',
    deadline: '',
    requirements: '',
    status: 'open',
    contact_id: '',
    artist_id: '',
    event_id: '',
    owner_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        venue: opportunity.venue || '',
        location: opportunity.location || '',
        date: opportunity.date ? new Date(opportunity.date).toISOString().slice(0, 10) : '',
        budget: opportunity.budget ? String(opportunity.budget) : '',
        probability_percentage: opportunity.probability_percentage ? String(opportunity.probability_percentage) : '50',
        deadline: opportunity.deadline ? new Date(opportunity.deadline).toISOString().slice(0, 10) : '',
        requirements: opportunity.requirements || '',
        status: opportunity.status || 'open',
        contact_id: opportunity.contact_id || '',
        artist_id: opportunity.artist_id || '',
        event_id: opportunity.event_id || '',
        owner_id: opportunity.owner_id || ''
      });
    }
  }, [opportunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({
          title: formData.title,
          description: formData.description,
          venue: formData.venue,
          location: formData.location,
          date: formData.date || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          probability_percentage: formData.probability_percentage ? parseInt(formData.probability_percentage) : null,
          deadline: formData.deadline || null,
          requirements: formData.requirements,
          status: formData.status,
          contact_id: formData.contact_id || null,
          artist_id: formData.artist_id || null,
          event_id: formData.event_id || null,
          owner_id: formData.owner_id && formData.owner_id !== 'none' ? formData.owner_id : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunity.id);

      if (error) throw error;

      toast.success('Opportunité mise à jour');
      onSave();
      onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'opportunité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="venue">Lieu</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="date">Date de l'événement</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="budget">Budget (€)</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Ouverte</SelectItem>
                <SelectItem value="applied">Envoyée</SelectItem>
                <SelectItem value="won">Gagnée</SelectItem>
                <SelectItem value="lost">Perdue</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
              </SelectContent>
          </Select>
          </div>

          <div>
            <Label htmlFor="owner_id">Propriétaire</Label>
            <Select 
              value={formData.owner_id || 'none'} 
              onValueChange={(value) => setFormData({ ...formData, owner_id: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un propriétaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Aucun propriétaire
                  </div>
                </SelectItem>
                {activeUsers.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {u.first_name || u.last_name 
                        ? `${u.first_name || ''} ${u.last_name || ''}`.trim() 
                        : u.username || u.email}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
