import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Plus, FileText, Edit, Trash2, Save, Calculator, Search, File } from 'lucide-react';
import { toast } from 'sonner';
import { useQuotes } from '@/hooks/useQuotes';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useUser } from '@/contexts/UserContext';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContractCalculator, type CalculationValues } from '@/components/contracts/ContractCalculator';
import { QuoteItemManager } from '@/components/quotes/QuoteItemManager';
import { QuoteTemplateManager } from '@/components/quotes/QuoteTemplateManager';
import { UniversalSearch } from '@/components/UniversalSearch';

interface QuoteFormData {
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
  const { artists } = useCentralizedData();
  
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState<QuoteFormData>({
    title: '',
    description: '',
    contact_id: '',
    event_id: '',
    artist_id: '',
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

  const { addQuoteItem } = useQuotes();

  const handleSaveQuote = async () => {
    if (!currentUser) return;

    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    // Valider les items seulement en mode création (pas en édition où ils sont gérés par QuoteItemManager)
    if (!editingQuote && (formData.items.length === 0 || !formData.items[0].name.trim())) {
      toast.error('Au moins un élément est requis');
      return;
    }

    // Calcul des montants (utilisés uniquement à la création; en édition, les lignes gèrent les totaux)
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
          artist_id: formData.artist_id || undefined,
          status: formData.status,
          valid_until: formData.valid_until || undefined,
          terms: formData.terms,
          notes: formData.notes
        });
        toast.success('Devis modifié avec succès');
      } else {
        const createdQuote = await addQuote({
          user_id: currentUser.id,
          quote_number: generateQuoteNumber(),
          title: formData.title,
          description: formData.description,
          contact_id: formData.contact_id || undefined,
          event_id: formData.event_id || undefined,
          artist_id: formData.artist_id || undefined,
          status: formData.status,
          total_amount: total,
          tax_amount: tax,
          valid_until: formData.valid_until || undefined,
          terms: formData.terms,
          notes: formData.notes
        });
        
        if (createdQuote && formData.items.length > 0) {
          // Ajouter les items du devis
          for (const item of formData.items) {
            if (item.name.trim()) {
              await addQuoteItem(createdQuote.id, {
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.quantity * item.unit_price
              });
            }
          }
        }
        
        toast.success('Devis créé avec succès');
      }
      resetForm();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du devis:', error);
      const message = error?.message || (typeof error === 'string' ? error : 'Erreur lors de la sauvegarde');
      toast.error(message);
    }
  };

  const handleApplyTemplate = (template: any) => {
    setFormData({
      title: template.name,
      description: template.description || '',
      contact_id: '',
      event_id: '',
      artist_id: '',
      status: 'draft',
      valid_until: '',
      terms: template.default_terms || 'Paiement à 30 jours. Acompte de 30% à la signature.',
      notes: '',
      items: template.default_items.length > 0 ? template.default_items : [{ name: '', description: '', quantity: 1, unit_price: 0 }]
    });
    setShowTemplates(false);
    setShowForm(true);
    toast.success('Modèle appliqué avec succès');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      contact_id: '',
      event_id: '',
      artist_id: '',
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
      artist_id: quote.artist_id || '',
      status: quote.status,
      valid_until: quote.valid_until || '',
      terms: quote.terms || 'Paiement à 30 jours. Acompte de 30% à la signature.',
      notes: quote.notes || '',
      items: []  // On laisse vide, les items seront gérés par QuoteItemManager
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

  const filteredQuotes = quotes.filter(quote =>
    quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onClick={() => setShowTemplates(true)} 
            variant="outline"
            className="button-responsive"
          >
            <File className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Modèles</span>
            <span className="sm:hidden">Modèles</span>
          </Button>
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
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
                <UniversalSearch
                  placeholder="Rechercher un contact..."
                  filterTypes={['contact']}
                  onSelect={(item) => setFormData(prev => ({ ...prev, contact_id: item.id }))}
                />
                {formData.contact_id && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Contact sélectionné: {contacts.find(c => c.id === formData.contact_id)?.first_name} {contacts.find(c => c.id === formData.contact_id)?.last_name}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="event">Événement associé</Label>
                <UniversalSearch
                  placeholder="Rechercher un événement..."
                  filterTypes={['event']}
                  onSelect={(item) => setFormData(prev => ({ ...prev, event_id: item.id }))}
                />
                {formData.event_id && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Événement sélectionné: {events.find(e => e.id === formData.event_id)?.title}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="artist">Spectacle associé</Label>
                <UniversalSearch
                  placeholder="Rechercher un spectacle..."
                  filterTypes={['artist']}
                  onSelect={(item) => setFormData(prev => ({ ...prev, artist_id: item.id }))}
                />
                {formData.artist_id && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Spectacle sélectionné: {artists.find(a => a.id === formData.artist_id)?.name}
                  </div>
                )}
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

              {/* Totaux - seulement lors de la création */}
              {!editingQuote && (
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
              )}
            </div>

            {/* QuoteItemManager - visible seulement lors de l'édition pour gérer les lignes */}
            {editingQuote && (
              <QuoteItemManager 
                quoteId={editingQuote.id} 
                quote={editingQuote}
              />
            )}

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
      <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredQuotes.map(quote => (
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

              <div className="space-y-1 text-sm text-muted-foreground mb-4">
                <div>
                  <span className="font-medium">Contact: </span>
                  {quote.contact_id ? (
                    (contacts.find(c => c.id === quote.contact_id)?.first_name || '') + ' ' + (contacts.find(c => c.id === quote.contact_id)?.last_name || '')
                  ) : '-'}
                </div>
                <div>
                  <span className="font-medium">Événement: </span>
                  {quote.event_id ? (
                    events.find(e => e.id === quote.event_id)?.title || '-'
                  ) : '-'}
                </div>
                <div>
                  <span className="font-medium">Spectacle: </span>
                  {quote.artist_id ? (
                    artists.find(a => a.id === quote.artist_id)?.name || '-'
                  ) : '-'}
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

      {/* Gestionnaire d'items pour le devis sélectionné */}
      {editingQuote && (
        <div className="mt-6">
          <QuoteItemManager 
            quoteId={editingQuote.id}
            quote={editingQuote}
            onItemsChange={(items) => {
              // Recalculer le total automatiquement
              const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
              const tax = subtotal * 0.20; // 20% TVA
              const total = subtotal + tax;
              
              updateQuote(editingQuote.id, {
                total_amount: total,
                tax_amount: tax
              });
            }}
          />
        </div>
      )}

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

      {/* Dialog Modèles */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modèles de Devis</DialogTitle>
          </DialogHeader>
          <QuoteTemplateManager onApplyTemplate={handleApplyTemplate} />
        </DialogContent>
      </Dialog>
    </div>
  );
};