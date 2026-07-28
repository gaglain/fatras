import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Eye, Edit, Trash2, Download, Calculator } from 'lucide-react';
import { Quote } from '@/hooks/useQuotes';
import { UniversalSearch } from '@/components/UniversalSearch';

interface QuoteFormDialogProps {
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  selectedQuote: Quote | null;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  contacts: any[];
  events: any[];
  artists: any[];
  users?: any[];
  calculation: any;
  setCalculation: (calc: any) => void;
  currentItems: any[];
  setCurrentItems: (items: any[]) => void;
  updateQuote: (id: string, data: any) => Promise<any>;
  setSelectedQuote: (q: any) => void;
  QuoteCalculator: React.FC<any>;
  QuoteItemManager: React.FC<any>;
}

export const QuoteFormDialog: React.FC<QuoteFormDialogProps> = ({
  dialogOpen, onDialogOpenChange, selectedQuote, formData, setFormData, onSubmit,
  contacts, events, artists, users = [], calculation, setCalculation, currentItems, setCurrentItems,
  updateQuote, setSelectedQuote, QuoteCalculator, QuoteItemManager,
}) => {
  return (
    <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedQuote ? 'Modifier le devis' : 'Créer un nouveau devis'}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="calculator">Calculateur</TabsTrigger>
            <TabsTrigger value="items">Lignes</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Nom du devis" />
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="sent">Envoyé</SelectItem>
                      <SelectItem value="accepted">Accepté</SelectItem>
                      <SelectItem value="rejected">Refusé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TVA</Label>
                  <Select value={String(formData.vat_rate ?? 20)} onValueChange={(value) => setFormData({ ...formData, vat_rate: parseFloat(value) })}>
                    <SelectTrigger><SelectValue placeholder="Choisir le taux de TVA" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5.5">5,5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <UniversalSearch
                    filterTypes={['contact']}
                    triggerText={(() => { const c = contacts.find((ct: any) => ct.id === (formData.contact_id !== 'none' ? formData.contact_id : '')); return c ? `${c.first_name} ${c.last_name}` : 'Sélectionner un contact'; })()}
                    onSelect={(item: any) => setFormData({ ...formData, contact_id: item.id })}
                    placeholder="Rechercher un contact..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Événement</Label>
                  <UniversalSearch
                    filterTypes={['event']}
                    triggerText={(() => { const ev = events.find((e: any) => e.id === (formData.event_id !== 'none' ? formData.event_id : '')); return ev ? ev.title : 'Sélectionner un événement'; })()}
                    onSelect={(item: any) => setFormData({ ...formData, event_id: item.id })}
                    placeholder="Rechercher un événement..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Spectacle</Label>
                  <UniversalSearch
                    filterTypes={['artist']}
                    triggerText={(() => { const a = artists.find((ar: any) => ar.id === (formData.artist_id !== 'none' ? formData.artist_id : '')); return a ? a.name : 'Sélectionner un spectacle'; })()}
                    onSelect={(item: any) => setFormData({ ...formData, artist_id: item.id })}
                    placeholder="Rechercher un spectacle..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Propriétaire</Label>
                  <Select value={formData.owner_id || 'none'} onValueChange={(value) => setFormData({ ...formData, owner_id: value === 'none' ? '' : value })}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un propriétaire" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun propriétaire</SelectItem>
                      {users.map((u: any) => (
                        <SelectItem key={u.user_id} value={u.user_id}>
                          {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : (u.username || u.email)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valide jusqu'au</Label>
                  <Input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Description du devis" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Conditions</Label>
                  <Textarea value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} rows={3} placeholder="Conditions du devis" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="Notes internes" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onDialogOpenChange(false)}>Annuler</Button>
                <Button type="submit">{selectedQuote ? 'Mettre à jour le devis' : 'Créer le devis'}</Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="calculator">
            <QuoteCalculator onCalculationChange={setCalculation} initialValues={calculation || undefined} />
          </TabsContent>

          <TabsContent value="items">
            {selectedQuote && (
              <>
                <Card className="mb-6 border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label className="text-base font-semibold">Taux de TVA</Label>
                        <p className="text-sm text-muted-foreground">Choisissez le taux de TVA applicable à ce devis</p>
                      </div>
                      <div className="w-48">
                        <Select
                          value={String(formData.vat_rate ?? (selectedQuote as any)?.vat_rate ?? 20)}
                          onValueChange={async (value) => {
                            const rate = parseFloat(value) || 0;
                            setFormData({ ...formData, vat_rate: rate });
                            if (selectedQuote) {
                              const subtotal = currentItems.reduce((sum: number, i: any) => sum + (i.total_price || 0), 0);
                              const taxAmount = subtotal * (rate / 100);
                              const totalWithTax = subtotal + taxAmount;
                              try {
                                const updated = await updateQuote(selectedQuote.id, { ...selectedQuote, vat_rate: rate, tax_amount: taxAmount, total_amount: totalWithTax });
                                setSelectedQuote(updated || { ...selectedQuote, vat_rate: rate, tax_amount: taxAmount, total_amount: totalWithTax });
                              } catch {}
                            }
                          }}
                        >
                          <SelectTrigger className="h-12 text-base font-semibold"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5.5">5,5%</SelectItem>
                            <SelectItem value="10">10%</SelectItem>
                            <SelectItem value="20">20%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <QuoteItemManager
                  quoteId={selectedQuote.id}
                  quote={selectedQuote}
                  onItemsChange={(items: any[]) => {
                    setCurrentItems(items);
                    const total = items.reduce((sum: number, item: any) => sum + item.total_price, 0);
                    const vatRatePercent = formData.vat_rate ?? (selectedQuote as any)?.vat_rate ?? 0;
                    const taxRate = Number(vatRatePercent) / 100;
                    const taxAmount = total * taxRate;
                    const totalWithTax = total + taxAmount;
                    updateQuote(selectedQuote.id, { ...selectedQuote, total_amount: totalWithTax, tax_amount: taxAmount, vat_rate: Number(vatRatePercent) });
                    setSelectedQuote((prev: any) => prev ? { ...prev, total_amount: totalWithTax, tax_amount: taxAmount, vat_rate: Number(vatRatePercent) } : prev);
                  }}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
