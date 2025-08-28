import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save } from 'lucide-react';
import { useQuotes, QuoteItem } from '@/hooks/useQuotes';
import { toast } from 'sonner';

interface QuoteItemManagerProps {
  quoteId: string;
  onItemsChange?: (items: QuoteItem[]) => void;
}

export const QuoteItemManager: React.FC<QuoteItemManagerProps> = ({
  quoteId,
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
  const { addQuoteItem, getQuoteItems } = useQuotes();

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

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.total_price, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Lignes du Devis
        </CardTitle>
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
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.description || '-'}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total_price)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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