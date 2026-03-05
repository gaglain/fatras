import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuoteItemManager } from '@/components/quotes/QuoteItemManager';
import { useQuotes } from '@/hooks/useQuotes';
import { FileText, List, FileDown, ChevronDown } from 'lucide-react';

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
  const [quoteTemplates, setQuoteTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [activeSection, setActiveSection] = useState<'details' | 'items'>('details');
  const { addQuoteItem } = useQuotes();

  useEffect(() => {
    fetchQuoteTemplates();
  }, []);

  const fetchQuoteTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .order('name');
      if (error) throw error;
      setQuoteTemplates(data || []);
    } catch {
      // silent
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    const template = quoteTemplates.find(t => t.id === templateId);
    if (!template || !quote?.id) return;

    try {
      const updates: any = {};
      if (template.description) updates.description = template.description;
      if (template.default_terms) updates.description = (formData.description ? formData.description + '\n\n' : '') + 'Conditions : ' + template.default_terms;
      
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
      }

      const items = Array.isArray(template.default_items)
        ? template.default_items
        : typeof template.default_items === 'string'
        ? JSON.parse(template.default_items)
        : [];

      for (const item of items) {
        const totalPrice = (item.quantity || 1) * (item.unit_price || 0);
        await addQuoteItem(quote.id, {
          name: item.name,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: totalPrice,
        });
      }

      toast.success(`Modèle "${template.name}" appliqué`);
      setSelectedTemplateId('');
    } catch {
      toast.error("Erreur lors de l'application du modèle");
    }
  };

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
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyé',
    accepted: 'Accepté',
    rejected: 'Refusé'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:!max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            Modifier — {quote?.quote_number || quote?.title}
          </DialogTitle>
        </DialogHeader>

        {/* Section switcher */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSection('details')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'details'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            Détails
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('items')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === 'items'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="h-4 w-4" />
            Lignes
          </button>
        </div>

        {/* Template selector */}
        {quoteTemplates.length > 0 && quote?.id && activeSection === 'details' && (
          <div className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg border border-dashed">
            <FileDown className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="flex-1 h-9 text-sm">
                <SelectValue placeholder="Appliquer un modèle…" />
              </SelectTrigger>
              <SelectContent>
                {quoteTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} {t.category ? `(${t.category})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-9"
              disabled={!selectedTemplateId}
              onClick={() => handleApplyTemplate(selectedTemplateId)}
            >
              OK
            </Button>
          </div>
        )}

        {/* Details section */}
        {activeSection === 'details' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="total_amount" className="text-sm">Total (€)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tax_amount" className="text-sm">TVA (€)</Label>
                <Input
                  id="tax_amount"
                  type="number"
                  step="0.01"
                  value={formData.tax_amount}
                  onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-sm">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        )}

        {/* Items section */}
        {activeSection === 'items' && (
          <div>
            {quote?.id ? (
              <QuoteItemManager quoteId={quote.id} quote={quote} />
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Enregistrez d'abord le devis pour ajouter des lignes.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
