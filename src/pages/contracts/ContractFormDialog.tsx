import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Save, Trash2, FileDown } from 'lucide-react';
import { UniversalSearch } from '@/components/UniversalSearch';
import { QuoteItemManager } from '@/components/quotes/QuoteItemManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface QuoteFormData {
  title: string;
  description: string;
  contact_id: string;
  event_id: string;
  artist_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  terms: string;
  notes: string;
  items: QuoteItemForm[];
  vat_rate: number;
}

export interface QuoteItemForm {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export const defaultFormData: QuoteFormData = {
  title: '',
  description: '',
  contact_id: '',
  event_id: '',
  artist_id: '',
  status: 'draft',
  valid_until: '',
  terms: 'Paiement à 30 jours. Acompte de 30% à la signature.',
  notes: '',
  items: [{ name: '', description: '', quantity: 1, unit_price: 0 }],
  vat_rate: 20
};

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: QuoteFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
  editingQuote: any;
  quoteTemplates: any[];
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onSave: () => void;
  onReset: () => void;
  updateQuote: any;
}

export const ContractFormDialog: React.FC<ContractFormDialogProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  editingQuote,
  quoteTemplates,
  selectedTemplateId,
  setSelectedTemplateId,
  onApplyTemplate,
  onSave,
  onReset,
  updateQuote,
}) => {
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof QuoteItemForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  const calculateTax = (subtotal: number) => subtotal * (formData.vat_rate / 100);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onReset(); else onOpenChange(o); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingQuote ? 'Modifier le devis' : 'Créer un nouveau devis'}</DialogTitle>
        </DialogHeader>

        {quoteTemplates.length > 0 && (
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
            <Button size="sm" disabled={!selectedTemplateId} onClick={() => onApplyTemplate(selectedTemplateId)}>
              Appliquer
            </Button>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre du devis *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Nom du devis" required />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Client</Label>
              <UniversalSearch placeholder="Rechercher un contact..." filterTypes={['contact']} selectedId={formData.contact_id} onSelect={(item) => setFormData(prev => ({ ...prev, contact_id: item.id }))} />
            </div>
            <div>
              <Label>Événement associé</Label>
              <UniversalSearch placeholder="Rechercher un événement..." filterTypes={['event']} selectedId={formData.event_id} onSelect={(item) => setFormData(prev => ({ ...prev, event_id: item.id }))} />
            </div>
            <div>
              <Label>Spectacle associé</Label>
              <UniversalSearch placeholder="Rechercher un spectacle..." filterTypes={['artist']} selectedId={formData.artist_id} onSelect={(item) => setFormData(prev => ({ ...prev, artist_id: item.id }))} />
            </div>
            <div>
              <Label>Valide jusqu'au</Label>
              <Input type="date" value={formData.valid_until} onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))} />
            </div>
            <div>
              <Label>TVA</Label>
              <Select value={String(formData.vat_rate)} onValueChange={(value) => setFormData(prev => ({ ...prev, vat_rate: parseFloat(value) }))}>
                <SelectTrigger><SelectValue placeholder="Choisir le taux de TVA" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5.5">5,5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <MentionableTextarea value={formData.description} onChange={(val) => setFormData(prev => ({ ...prev, description: val }))} placeholder="Description détaillée du devis... Tapez @ pour mentionner" rows={3} />
          </div>

          {/* Items du devis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Lignes du devis</Label>
              <Button onClick={addItem} variant="outline" size="sm"><Plus className="h-4 w-4 mr-1.5" />Ajouter</Button>
            </div>
            {formData.items.map((item, index) => (
              <Card key={index} className="p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nom *</Label>
                    <Input value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} placeholder="Service ou produit" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Description</Label>
                    <Input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Détails" className="h-9" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Qté</Label>
                    <Input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} min="1" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Prix unit. (€)</Label>
                    <Input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} min="0" className="h-9" />
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-semibold pb-2">{(item.quantity * item.unit_price).toFixed(2)} €</span>
                    {formData.items.length > 1 && (
                      <Button onClick={() => removeItem(index)} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {!editingQuote && (
              <Card className="p-4 bg-muted/50">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{calculateTotal().toFixed(2)} €</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">TVA ({formData.vat_rate}%)</span><span>{calculateTax(calculateTotal()).toFixed(2)} €</span></div>
                  <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2"><span>Total TTC</span><span>{(calculateTotal() + calculateTax(calculateTotal())).toFixed(2)} €</span></div>
                </div>
              </Card>
            )}
          </div>

          {editingQuote && (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-base font-semibold">Taux de TVA</Label>
                    <p className="text-sm text-muted-foreground">Choisissez le taux de TVA applicable à ce devis</p>
                  </div>
                  <div className="w-48">
                    <Select
                      value={String(formData.vat_rate)}
                      onValueChange={async (value) => {
                        const rate = parseFloat(value) || 0;
                        setFormData(prev => ({ ...prev, vat_rate: rate }));
                        if (editingQuote) {
                          try {
                            const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', editingQuote.id);
                            const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
                            const taxAmount = subtotal * (rate / 100);
                            const totalAmount = subtotal + taxAmount;
                            await updateQuote(editingQuote.id, { vat_rate: rate, tax_amount: taxAmount, total_amount: totalAmount } as any);
                            toast.success('TVA mise à jour');
                          } catch (e) {
                            logger.error('Erreur mise à jour TVA:', e);
                            toast.error('Erreur lors de la mise à jour de la TVA');
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="h-12 text-base font-semibold"><SelectValue placeholder="Choisir le taux de TVA" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0" className="text-base">0%</SelectItem>
                        <SelectItem value="5.5" className="text-base">5,5%</SelectItem>
                        <SelectItem value="10" className="text-base">10%</SelectItem>
                        <SelectItem value="20" className="text-base">20%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {editingQuote && <QuoteItemManager quoteId={editingQuote.id} quote={editingQuote} />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Conditions générales</Label>
              <MentionableTextarea value={formData.terms} onChange={(val) => setFormData(prev => ({ ...prev, terms: val }))} placeholder="Conditions de paiement, délais, etc." rows={4} />
            </div>
            <div>
              <Label>Notes internes</Label>
              <MentionableTextarea value={formData.notes} onChange={(val) => setFormData(prev => ({ ...prev, notes: val }))} placeholder="Notes privées... Tapez @ pour mentionner" rows={4} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onReset}>Annuler</Button>
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {editingQuote ? 'Modifier' : 'Créer'} le devis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
