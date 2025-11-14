import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
  onSave: () => void;
}

export const QuoteEditor: React.FC<QuoteEditorProps> = ({
  isOpen,
  onClose,
  quote,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    total_amount: '',
    tax_amount: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quote) {
      setFormData({
        title: quote.title || '',
        description: quote.description || '',
        total_amount: quote.total_amount || '',
        tax_amount: quote.tax_amount || '',
        status: quote.status || 'draft'
      });
    }
  }, [quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          title: formData.title,
          description: formData.description,
          total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
          tax_amount: formData.tax_amount ? parseFloat(formData.tax_amount) : null,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (error) throw error;

      toast.success('Devis mis à jour');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error updating quote:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le devis</DialogTitle>
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
            <Label htmlFor="total_amount">Montant total (€)</Label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="tax_amount">Montant TVA (€)</Label>
            <Input
              id="tax_amount"
              type="number"
              step="0.01"
              value={formData.tax_amount}
              onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="accepted">Accepté</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
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
