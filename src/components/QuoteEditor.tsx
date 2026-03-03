import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QuoteItemManager } from '@/components/quotes/QuoteItemManager';
import { useQuotes } from '@/hooks/useQuotes';
import { FileText, List, FileDown } from 'lucide-react';

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
      // Update quote description/terms
      const updates: any = {};
      if (template.description) updates.description = template.description;
      if (template.default_terms) updates.description = (formData.description ? formData.description + '\n\n' : '') + 'Conditions : ' + template.default_terms;
      
      if (Object.keys(updates).length > 0) {
        setFormData(prev => ({ ...prev, ...updates }));
      }

      // Add default items from template
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

      toast.success(`Modèle "${template.name}" appliqué avec ${items.length} ligne(s)`);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le devis - {quote?.quote_number || quote?.title}</DialogTitle>
        </DialogHeader>

        {/* Sélecteur de modèle de devis */}
        {quoteTemplates.length > 0 && quote?.id && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <FileDown className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Appliquer un modèle de devis..." />
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
              disabled={!selectedTemplateId}
              onClick={() => handleApplyTemplate(selectedTemplateId)}
            >
              Appliquer
            </Button>
          </div>
        )}
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informations générales
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lignes détaillées
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
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
      </TabsContent>

      <TabsContent value="items" className="mt-4">
        {quote?.id && (
          <QuoteItemManager 
            quoteId={quote.id}
            quote={quote}
          />
        )}
        {!quote?.id && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Veuillez d'abord enregistrer le devis pour ajouter des lignes détaillées.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
      </DialogContent>
    </Dialog>
  );
};
