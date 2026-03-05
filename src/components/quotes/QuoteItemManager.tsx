import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X, Download, Pencil } from 'lucide-react';
import { useQuotes, QuoteItem } from '@/hooks/useQuotes';
import { generateQuotePDF } from '@/utils/quotePdfGenerator';
import { toast } from 'sonner';

interface QuoteItemManagerProps {
  quoteId: string;
  quote?: any;
  onItemsChange?: (items: QuoteItem[]) => void;
}

export const QuoteItemManager: React.FC<QuoteItemManagerProps> = ({ 
  quoteId, 
  quote,
  onItemsChange 
}) => {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0
  });
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editMap, setEditMap] = useState<Record<string, QuoteItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const { addQuoteItem, updateQuoteItem, deleteQuoteItem, getQuoteItems, updateQuote } = useQuotes();

  useEffect(() => {
    loadItems();
  }, [quoteId]);

  const loadItems = async () => {
    if (!quoteId) return;
    try {
      const fetchedItems = await getQuoteItems(quoteId);
      setItems(fetchedItems);
      if (onItemsChange) onItemsChange(fetchedItems);
    } catch {
      // Silent
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      toast.error('Le nom de l\'élément est requis');
      return;
    }
    if (!quoteId) {
      toast.error('Devis non spécifié');
      return;
    }

    setLoading(true);
    try {
      const totalPrice = newItem.quantity * newItem.unit_price;
      await addQuoteItem(quoteId, {
        name: newItem.name,
        description: newItem.description,
        quantity: newItem.quantity,
        unit_price: newItem.unit_price,
        total_price: totalPrice
      });
      await loadItems();
      await updateQuoteTotal();
      setNewItem({ name: '', description: '', quantity: 1, unit_price: 0 });
      setShowAddForm(false);
      toast.success('Élément ajouté');
    } catch {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteTotal = async () => {
    if (!quoteId || !quote) return;
    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const vatRate = (quote as any)?.vat_rate != null ? Number((quote as any).vat_rate) / 100 : 0.20;
    const taxAmount = subtotal * vatRate;
    const totalAmount = subtotal + taxAmount;
    try {
      await updateQuote(quoteId, { total_amount: totalAmount, tax_amount: taxAmount });
      if (onItemsChange) onItemsChange(items);
    } catch { /* silent */ }
  };

  const handleUpdateItem = async (itemId: string, updatedData: any) => {
    try {
      await updateQuoteItem(itemId, updatedData);
      await loadItems();
      await updateQuoteTotal();
      setEditingItem(null);
      toast.success('Élément mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteQuoteItem(itemId);
      await loadItems();
      toast.success('Élément supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const calculateTotal = () => items.reduce((total, item) => total + item.total_price, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const handleExportPDF = () => {
    if (!quote) { toast.error('Informations du devis manquantes'); return; }
    try {
      const doc = generateQuotePDF(quote, items);
      doc.save(`devis-${quote.quote_number || quote.id}.pdf`);
      toast.success('PDF exporté');
    } catch {
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const predefinedNames = ['Prestation artistique', 'Location matériel', 'Transport', 'Hébergement', 'Restauration', 'Technique', 'Frais de dossier'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Lignes du devis</h3>
        <div className="flex gap-2">
          {items.length > 0 && (
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          )}
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="border-dashed border-primary/40">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Type</Label>
                <Select 
                  value={predefinedNames.includes(newItem.name) ? newItem.name : 'custom'} 
                  onValueChange={(v) => setNewItem({ ...newItem, name: v === 'custom' ? '' : v })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                    {predefinedNames.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                {!predefinedNames.includes(newItem.name) && (
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Nom personnalisé"
                    className="h-9 mt-1.5"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Description…"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Prix unitaire (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-medium text-muted-foreground">
                Total : {formatCurrency(newItem.quantity * newItem.unit_price)}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  Annuler
                </Button>
                <Button size="sm" onClick={handleAddItem} disabled={loading || !newItem.name.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items list — card layout (mobile-friendly) */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => {
            const isEditing = editingItem === item.id;
            const editData = isEditing ? (editMap[item.id] ?? item) : item;

            if (isEditing) {
              return (
                <Card key={item.id} className="border-primary/40">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Nom</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditMap(prev => ({
                            ...prev, [item.id]: { ...editData, name: e.target.value }
                          }))}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Description</Label>
                        <Input
                          value={editData.description || ''}
                          onChange={(e) => setEditMap(prev => ({
                            ...prev, [item.id]: { ...editData, description: e.target.value }
                          }))}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Quantité</Label>
                        <Input
                          type="number"
                          value={editData.quantity}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value) || 1;
                            setEditMap(prev => ({
                              ...prev, [item.id]: { ...editData, quantity, total_price: quantity * (editData.unit_price || 0) }
                            }));
                          }}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Prix unitaire (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.unit_price}
                          onChange={(e) => {
                            const unit_price = parseFloat(e.target.value) || 0;
                            setEditMap(prev => ({
                              ...prev, [item.id]: { ...editData, unit_price, total_price: (editData.quantity || 1) * unit_price }
                            }));
                          }}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-semibold">
                        Total : {formatCurrency(editData.total_price)}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingItem(null);
                          setEditMap(prev => { const n = { ...prev }; delete n[item.id]; return n; });
                        }}>
                          <X className="h-4 w-4 mr-1" /> Annuler
                        </Button>
                        <Button size="sm" onClick={() => handleUpdateItem(item.id, editMap[item.id] || item)}>
                          <Save className="h-4 w-4 mr-1" /> Enregistrer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={item.id} className="group hover:shadow-sm transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground truncate">— {item.description}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                        <span className="font-semibold text-sm text-foreground">
                          {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingItem(item.id); setEditMap(prev => ({ ...prev, [item.id]: item })); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Total */}
          <div className="flex justify-end items-center gap-2 pt-2 pr-1">
            <span className="text-sm text-muted-foreground">Total HT :</span>
            <span className="text-lg font-bold">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      )}

      {items.length === 0 && !showAddForm && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Aucune ligne ajoutée au devis
        </div>
      )}
    </div>
  );
};
