import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save, X, Download } from 'lucide-react';
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
  const { addQuoteItem, updateQuoteItem, deleteQuoteItem, getQuoteItems } = useQuotes();

  useEffect(() => {
    loadItems();
  }, [quoteId]);

  const loadItems = async () => {
    if (!quoteId) return;
    
    try {
      const fetchedItems = await getQuoteItems(quoteId);
      setItems(fetchedItems);
      if (onItemsChange) {
        onItemsChange(fetchedItems);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des items:', error);
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
      const itemData = {
        name: newItem.name,
        description: newItem.description,
        quantity: newItem.quantity,
        unit_price: newItem.unit_price,
        total_price: totalPrice
      };

      const addedItem = await addQuoteItem(quoteId, itemData);
      if (addedItem) {
        await loadItems(); // Recharger les items pour s'assurer de la cohérence
        setNewItem({
          name: '',
          description: '',
          quantity: 1,
          unit_price: 0
        });
        
        toast.success('Élément ajouté avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élément:', error);
      toast.error('Erreur lors de l\'ajout de l\'élément');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemId: string, updatedData: any) => {
    try {
      await updateQuoteItem(itemId, updatedData);
      await loadItems();
      setEditingItem(null);
      toast.success('Élément mis à jour');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteQuoteItem(itemId);
      await loadItems();
      toast.success('Élément supprimé');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.total_price, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleExportPDF = () => {
    if (!quote) {
      toast.error('Informations du devis manquantes');
      return;
    }

    try {
      const doc = generateQuotePDF(quote, items);
      doc.save(`devis-${quote.quote_number || quote.id}.pdf`);
      toast.success('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Lignes du Devis
        </CardTitle>
        {items.length > 0 && (
          <Button onClick={handleExportPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulaire d'ajout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="itemName">Nom *</Label>
            <Select 
              value={newItem.name || 'custom'} 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setNewItem({ ...newItem, name: '' });
                } else {
                  setNewItem({ ...newItem, name: value });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type ou saisir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Personnalisé</SelectItem>
                <SelectItem value="Prestation artistique">Prestation artistique</SelectItem>
                <SelectItem value="Location matériel">Location matériel</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Hébergement">Hébergement</SelectItem>
                <SelectItem value="Restauration">Restauration</SelectItem>
                <SelectItem value="Technique">Technique</SelectItem>
                <SelectItem value="Frais de dossier">Frais de dossier</SelectItem>
              </SelectContent>
            </Select>
            {(newItem.name === '' || !['Prestation artistique', 'Location matériel', 'Transport', 'Hébergement', 'Restauration', 'Technique', 'Frais de dossier'].includes(newItem.name)) && (
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Nom personnalisé de l'item"
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemDescription">Description</Label>
            <Textarea
              id="itemDescription"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemQuantity">Quantité</Label>
            <Input
              id="itemQuantity"
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemPrice">Prix unitaire (€)</Label>
            <Input
              id="itemPrice"
              type="number"
              step="0.01"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={handleAddItem} 
              disabled={loading || !newItem.name.trim()}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Table des items */}
        {items.length > 0 && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isEditing = editingItem === item.id;
                  const [editData, setEditData] = useState(item);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <Input
                            value={editData.name}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                            className="w-full"
                          />
                        ) : (
                          item.name
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {isEditing ? (
                          <Input
                            value={editData.description || ''}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                            className="w-full"
                          />
                        ) : (
                          item.description || '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editData.quantity}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 1;
                              setEditData({
                                ...editData, 
                                quantity,
                                total_price: quantity * editData.unit_price
                              });
                            }}
                            className="w-20"
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editData.unit_price}
                            onChange={(e) => {
                              const unit_price = parseFloat(e.target.value) || 0;
                              setEditData({
                                ...editData, 
                                unit_price,
                                total_price: editData.quantity * unit_price
                              });
                            }}
                            className="w-24"
                          />
                        ) : (
                          formatCurrency(item.unit_price)
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {isEditing ? (
                          formatCurrency(editData.total_price)
                        ) : (
                          formatCurrency(item.total_price)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateItem(item.id, editData)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(null)}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(item.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold text-right">
                    Total:
                  </TableCell>
                  <TableCell className="font-bold text-right text-lg">
                    {formatCurrency(calculateTotal())}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune ligne ajoutée au devis
          </div>
        )}
      </CardContent>
    </Card>
  );
};