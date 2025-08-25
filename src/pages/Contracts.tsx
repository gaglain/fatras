import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Edit, Trash2, Save, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useQuotes } from '@/hooks/useQuotes';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useUser } from '@/contexts/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContractCalculator, type CalculationValues } from '@/components/contracts/ContractCalculator';

interface QuoteFormData {
  title: string;
  description: string;
  contact_id: string;
  event_id: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  valid_until: string;
  terms: string;
  notes: string;
  items: QuoteItemForm[];
}

interface QuoteItemForm {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export const Contracts: React.FC = () => {
  const { currentUser } = useUser();
  const { quotes, loading, addQuote, updateQuote, deleteQuote, generateQuoteNumber } = useQuotes();
  const { contacts } = useContacts();
  const { events } = useEvents();
  
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [formData, setFormData] = useState<QuoteFormData>({
    title: '',
    description: '',
    contact_id: '',
    event_id: '',
    status: 'draft',
    valid_until: '',
    terms: 'Paiement à 30 jours. Acompte de 30% à la signature.',
    notes: '',
    items: [{ name: '', description: '', quantity: 1, unit_price: 0 }]
  });

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

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.20; // 20% TVA
  };

  const handleCalculatorChange = (values: CalculationValues) => {
    // Mise à jour automatique du formulaire avec les valeurs du calculateur
    setFormData(prev => ({
      ...prev,
      items: [{ 
        name: 'Service complet', 
        description: 'Cachet, transport, hébergement et frais annexes', 
        quantity: 1, 
        unit_price: values.totalHT 
      }]
    }));
  };

  const handleSaveQuote = async () => {
    if (!currentUser) return;

    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].name.trim()) {
      toast.error('Au moins un élément est requis');
      return;
    }

    const subtotal = calculateTotal();
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    try {
      if (editingQuote) {
        await updateQuote(editingQuote.id, {
          title: formData.title,
          description: formData.description,
          contact_id: formData.contact_id || undefined,
          event_id: formData.event_id || undefined,
          status: formData.status,
          total_amount: total,
          tax_amount: tax,
          valid_until: formData.valid_until || undefined,
          terms: formData.terms,
          notes: formData.notes
        });
        toast.success('Devis modifié avec succès');
      } else {
        await addQuote({
          user_id: currentUser.id,
          quote_number: generateQuoteNumber(),
          title: formData.title,
          description: formData.description,
          contact_id: formData.contact_id || undefined,
          event_id: formData.event_id || undefined,
          status: formData.status,
          total_amount: total,
          tax_amount: tax,
          valid_until: formData.valid_until || undefined,
          terms: formData.terms,
          notes: formData.notes
        });
        toast.success('Devis créé avec succès');
      }
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contact_id: '',
      event_id: '',
      status: 'draft',
      valid_until: '',
      terms: 'Paiement à 30 jours. Acompte de 30% à la signature.',
      notes: '',
      items: [{ name: '', description: '', quantity: 1, unit_price: 0 }]
    });
    setShowForm(false);
    setEditingQuote(null);
  };

  const handleEdit = (quote: any) => {
    setEditingQuote(quote);
    setFormData({
      title: quote.title,
      description: quote.description || '',
      contact_id: quote.contact_id || '',
      event_id: quote.event_id || '',
      status: quote.status,
      valid_until: quote.valid_until || '',
      terms: quote.terms || 'Paiement à 30 jours. Acompte de 30% à la signature.',
      notes: quote.notes || '',
      items: [{ name: 'Service', description: '', quantity: 1, unit_price: (quote.total_amount - quote.tax_amount) || 0 }]
    });
    setShowForm(true);
  };

  const handleDelete = async (quoteId: string) => {
    if (confirm('Supprimer ce devis ?')) {
      await deleteQuote(quoteId);
      toast.success('Devis supprimé');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'sent': return 'Envoyé';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center">
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 mr-2 lg:mr-3 text-blue-600" />
            Devis & Contrats
          </h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            Gérez vos devis et contrats clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCalculator(true)} 
            variant="outline"
            className="button-responsive"
          >
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Calculateur</span>
            <span className="sm:hidden">Calc</span>
          </Button>
          <Button onClick={() => setShowForm(true)} className="button-responsive">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouveau Devis</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Formulaire de devis */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingQuote ? 'Modifier le devis' : 'Créer un nouveau devis'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Titre du devis *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nom du devis"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Label htmlFor="contact">Client</Label>
                <Select value={formData.contact_id} onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="event">Événement associé</Label>
                <Select value={formData.event_id} onValueChange={(value) => setFormData(prev => ({ ...prev, event_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un événement" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valid_until">Valide jusqu'au</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée du devis"
                rows={3}
              />
            </div>

            {/* Items du devis */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Éléments du devis</Label>
                <Button onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un élément
                </Button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Nom de l'élément</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Service ou produit"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Détails"
                        />
                      </div>
                      <div>
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div className="flex-1">
                          <Label>Prix unitaire (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            min="0"
                          />
                        </div>
                        {formData.items.length > 1 && (
                          <Button
                            onClick={() => removeItem(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-right text-sm font-medium">
                      Total ligne: {(item.quantity * item.unit_price).toFixed(2)} €
                    </div>
                  </Card>
                ))}
              </div>

              {/* Totaux */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{calculateTotal().toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%):</span>
                    <span>{calculateTax(calculateTotal()).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total TTC:</span>
                    <span>{(calculateTotal() + calculateTax(calculateTotal())).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="terms">Conditions générales</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Conditions de paiement, délais, etc."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes internes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes privées non visibles par le client"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button onClick={handleSaveQuote} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {editingQuote ? 'Modifier' : 'Créer'} le devis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des devis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {quotes.map(quote => (
          <Card key={quote.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{quote.title}</h3>
                  <p className="text-sm text-gray-600">N° {quote.quote_number}</p>
                </div>
                <Badge className={getStatusColor(quote.status)}>
                  {getStatusLabel(quote.status)}
                </Badge>
              </div>

              {quote.description && (
                <p className="text-gray-600 text-sm mb-4">{quote.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="text-2xl font-bold text-blue-600">
                  {quote.total_amount.toFixed(2)} € TTC
                </div>
                
                {quote.valid_until && (
                  <div className="text-sm text-gray-600">
                    Valide jusqu'au {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(quote)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(quote.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Aucun devis créé</h3>
          <p className="text-gray-600 mb-4">Commencez par créer votre premier devis</p>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Créer un devis
          </Button>
        </div>
      )}

      {/* Dialog Calculateur */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Calculateur de Devis</DialogTitle>
          </DialogHeader>
          <ContractCalculator onCalculationChange={handleCalculatorChange} />
        </DialogContent>
      </Dialog>
    </div>
  );
};