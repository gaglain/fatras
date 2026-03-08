import React, { useState, useEffect } from 'react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Plus, FileText, Edit, Trash2, Save, Calculator, Search, File, FileDown, Eye } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { generateQuotePDF } from '@/utils/quotePdfGenerator';

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
  vat_rate: number;
}

interface QuoteItemForm {
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export const Contracts: React.FC = () => {
  const confirm = useConfirm();
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
  const [viewingQuote, setViewingQuote] = useState<any>(null);
  const [viewingQuoteItems, setViewingQuoteItems] = useState<any[]>([]);
  const [quoteTemplates, setQuoteTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
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
    fetchTemplates();
  }, []);

  const handleApplyTemplateToForm = (templateId: string) => {
    const template = quoteTemplates.find(t => t.id === templateId);
    if (!template) return;

    const updates: Partial<QuoteFormData> = {};
    if (template.description) updates.description = template.description;
    if (template.default_terms) {
      updates.description = (formData.description ? formData.description + '\n\n' : '') + 'Conditions : ' + template.default_terms;
    }

    const items = Array.isArray(template.default_items)
      ? template.default_items
      : typeof template.default_items === 'string'
      ? JSON.parse(template.default_items)
      : [];

    if (items.length > 0) {
      updates.items = items.map((item: any) => ({
        name: item.name || '',
        description: item.description || '',
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
      }));
    }

    setFormData(prev => ({ ...prev, ...updates }));
    setSelectedTemplateId('');
    toast.success(`Modèle "${template.name}" appliqué avec ${items.length} ligne(s)`);
  };
  const [formData, setFormData] = useState<QuoteFormData>(() => {
    try {
      const saved = localStorage.getItem('contractsQuoteDraft');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.warn('Erreur parse brouillon devis (contracts):', e);
      localStorage.removeItem('contractsQuoteDraft');
    }
    return {
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

  // Autosave du brouillon (création uniquement)
  React.useEffect(() => {
    try {
      if (!editingQuote && (formData.title || formData.description || formData.items?.some(i => i.name || i.unit_price))) {
        localStorage.setItem('contractsQuoteDraft', JSON.stringify(formData));
      }
    } catch (e) {
      logger.warn('Erreur sauvegarde brouillon devis (contracts):', e);
    }
  }, [formData, editingQuote]);

  // Restauration du brouillon à l'ouverture du formulaire si pas en édition
  React.useEffect(() => {
    if (showForm && !editingQuote) {
      try {
        const saved = localStorage.getItem('contractsQuoteDraft');
        if (saved) {
          setFormData(JSON.parse(saved));
        }
      } catch (e) {
        logger.warn('Erreur restauration brouillon devis (contracts):', e);
      }
    }
  }, [showForm, editingQuote]);

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * (formData.vat_rate / 100);
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

  const createRoadshowFromQuote = async (quoteId: string, quoteData: QuoteFormData) => {
    if (!currentUser) return;

    try {
      const event = events.find(e => e.id === quoteData.event_id);
      const contact = contacts.find(c => c.id === quoteData.contact_id);
      const artist = artists.find(a => a.id === quoteData.artist_id);

      if (!event) {
        toast.error('Un événement doit être associé au devis pour créer une feuille de route');
        return;
      }

      // Chercher l'opportunité associée via l'événement
      let opportunityId: string | null = null;
      if (event.id) {
        const { data: oppEvent } = await supabase
          .from('opportunity_events')
          .select('opportunity_id')
          .eq('event_id', event.id)
          .maybeSingle();
        
        if (oppEvent?.opportunity_id) {
          opportunityId = oppEvent.opportunity_id;
        } else {
          // Fallback: chercher par event_id direct dans opportunities
          const { data: opp } = await supabase
            .from('opportunities')
            .select('id')
            .eq('event_id', event.id)
            .maybeSingle();
          opportunityId = opp?.id || null;
        }
      }

      const { data: roadshow, error: roadshowError } = await supabase
        .from('roadshow_stops')
        .insert({
          user_id: currentUser.id,
          quote_id: quoteId,
          opportunity_id: opportunityId,
          city: event.city || 'Ville à définir',
          venue: event.venue || 'Lieu à définir',
          address: event.address || '',
          event_date: event.start_date || null,
          status: 'confirmed',
          capacity: event.attendees_count || 0,
          tickets_available: event.attendees_count || 0,
          crew: [],
          equipment: [],
          artists: artist ? [artist.id] : [],
          artist_lineup: [],
          notes: `Créé automatiquement à partir du devis ${quoteData.title}`
        })
        .select()
        .single();

      if (roadshowError) {
        throw roadshowError;
      }

      if (roadshow) {
        
        // Créer les membres du canal (utilisateur actuel + contact si présent)
        const memberIds: string[] = [];
        if (contact?.user_id) {
          memberIds.push(contact.user_id);
        }
        
        const { data: channel, error: channelError } = await supabase
          .rpc('create_messaging_channel', {
            channel_name: `🎭 ${quoteData.title}`,
            channel_description: `Organisation du spectacle - ${event.venue || 'Lieu à définir'}`,
            channel_type: 'private',
            member_user_ids: memberIds,
            roadshow_ref_id: roadshow.id
          });

        if (channelError) {
          toast.error('Feuille de route créée mais erreur lors de la création du canal de messagerie: ' + channelError.message);
        } else {
          toast.success('Feuille de route et canal de messagerie créés avec succès !');
        }
      }
    } catch (error: unknown) {
      logger.error('❌ Erreur lors de la création de la feuille de route:', error);
      toast.error('Erreur lors de la création de la feuille de route');
    }
  };

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

    let subtotal: number;
    let tax: number;
    let total: number;

    if (editingQuote) {
      // En édition, récupérer les items depuis la DB pour calculer les vrais totaux
      const { data: dbItems } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', editingQuote.id);
      
      subtotal = dbItems?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
      tax = subtotal * (formData.vat_rate / 100);
      total = subtotal + tax;
    } else {
      subtotal = calculateTotal();
      tax = calculateTax(subtotal);
      total = subtotal + tax;
    }

    try {
      if (editingQuote) {
        const previousStatus = editingQuote.status;
        
        await updateQuote(editingQuote.id, {
          title: formData.title,
          description: formData.description,
          contact_id: formData.contact_id || undefined,
          event_id: formData.event_id || undefined,
          artist_id: formData.artist_id || undefined,
          status: formData.status,
          total_amount: total,
          tax_amount: tax,
          vat_rate: formData.vat_rate,
          valid_until: formData.valid_until || undefined,
          terms: formData.terms,
          notes: formData.notes
        });

        if (formData.status === 'accepted' && previousStatus !== 'accepted') {
          await createRoadshowFromQuote(editingQuote.id, formData);
        }

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
          vat_rate: formData.vat_rate,
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
        
        if (createdQuote && formData.status === 'accepted') {
          await createRoadshowFromQuote(createdQuote.id, formData);
        }
        
        toast.success('Devis créé avec succès');
      }
      resetForm();
    } catch (error: unknown) {
      logger.error('Erreur lors de la sauvegarde du devis:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
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
      items: template.default_items.length > 0 ? template.default_items : [{ name: '', description: '', quantity: 1, unit_price: 0 }],
      vat_rate: 20
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
      items: [{ name: '', description: '', quantity: 1, unit_price: 0 }],
      vat_rate: 20
    });
    setShowForm(false);
    setEditingQuote(null);
    localStorage.removeItem('contractsQuoteDraft');
  };

  const handleEdit = (quote: typeof quotes[number]) => {
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
      items: [],  // On laisse vide, les items seront gérés par QuoteItemManager
      vat_rate: quote.vat_rate ?? 20
    });
    setShowForm(true);
  };

  const handleDelete = async (quoteId: string) => {
    if (confirm('Supprimer ce devis ?')) {
      await deleteQuote(quoteId);
      toast.success('Devis supprimé');
    }
  };

  const handleView = async (quote: typeof quotes[number]) => {
    try {
      const { data: items } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quote.id)
        .order('created_at', { ascending: true });
      
      setViewingQuote(quote);
      setViewingQuoteItems(items || []);
    } catch (error) {
      logger.error('Erreur chargement items:', error);
      toast.error('Erreur lors du chargement du devis');
    }
  };

  const handleDownloadPDF = () => {
    if (!viewingQuote) return;
    const doc = generateQuotePDF(viewingQuote, viewingQuoteItems);
    doc.save(`devis-${viewingQuote.quote_number}.pdf`);
    toast.success('PDF téléchargé');
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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

      {/* Formulaire de devis en popup */}
      <Dialog open={showForm} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuote ? 'Modifier le devis' : 'Créer un nouveau devis'}</DialogTitle>
          </DialogHeader>

          {/* Sélecteur de modèle de devis */}
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
              <Button
                size="sm"
                disabled={!selectedTemplateId}
                onClick={() => handleApplyTemplateToForm(selectedTemplateId)}
              >
                Appliquer
              </Button>
            </div>
          )}

          <div className="space-y-6">
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
                  selectedId={formData.contact_id}
                  onSelect={(item) => setFormData(prev => ({ ...prev, contact_id: item.id }))}
                />
              </div>

              <div>
                <Label htmlFor="event">Événement associé</Label>
                <UniversalSearch
                  placeholder="Rechercher un événement..."
                  filterTypes={['event']}
                  selectedId={formData.event_id}
                  onSelect={(item) => setFormData(prev => ({ ...prev, event_id: item.id }))}
                />
              </div>

              <div>
                <Label htmlFor="artist">Spectacle associé</Label>
                <UniversalSearch
                  placeholder="Rechercher un spectacle..."
                  filterTypes={['artist']}
                  selectedId={formData.artist_id}
                  onSelect={(item) => setFormData(prev => ({ ...prev, artist_id: item.id }))}
                />
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

              <div>
                <Label htmlFor="vat_rate">TVA</Label>
                <Select 
                  value={String(formData.vat_rate)}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vat_rate: parseFloat(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le taux de TVA" />
                  </SelectTrigger>
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
              <Label htmlFor="description">Description</Label>
              <MentionableTextarea
                value={formData.description}
                onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                placeholder="Description détaillée du devis... Tapez @ pour mentionner"
                rows={3}
              />
            </div>

            {/* Items du devis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Lignes du devis</Label>
                <Button onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Ajouter
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <Card key={index} className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nom *</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Service ou produit"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Détails"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Qté</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Prix unit. (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        min="0"
                        className="h-9"
                      />
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-semibold pb-2">
                        {(item.quantity * item.unit_price).toFixed(2)} €
                      </span>
                      {formData.items.length > 1 && (
                        <Button
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Totaux - seulement lors de la création */}
              {!editingQuote && (
                <Card className="p-4 bg-muted/50">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{calculateTotal().toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TVA ({formData.vat_rate}%)</span>
                      <span>{calculateTax(calculateTotal()).toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                      <span>Total TTC</span>
                      <span>{(calculateTotal() + calculateTax(calculateTotal())).toFixed(2)} €</span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Sélecteur TVA pour l'édition */}
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
                              // Récupérer les items pour recalculer le total
                              const { data: items } = await supabase
                                .from('quote_items')
                                .select('*')
                                .eq('quote_id', editingQuote.id);
                              
                              const subtotal = items?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
                              const taxAmount = subtotal * (rate / 100);
                              const totalAmount = subtotal + taxAmount;
                              
                              await updateQuote(editingQuote.id, {
                                vat_rate: rate,
                                tax_amount: taxAmount,
                                total_amount: totalAmount
                              } as any);
                              
                              setEditingQuote((prev: any) => ({ 
                                ...prev, 
                                vat_rate: rate,
                                tax_amount: taxAmount,
                                total_amount: totalAmount
                              }));
                              
                              toast.success('TVA mise à jour');
                            } catch (e) {
                              logger.error('Erreur mise à jour TVA:', e);
                              toast.error('Erreur lors de la mise à jour de la TVA');
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="h-12 text-base font-semibold">
                          <SelectValue placeholder="Choisir le taux de TVA" />
                        </SelectTrigger>
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
                <MentionableTextarea
                  value={formData.terms}
                  onChange={(val) => setFormData(prev => ({ ...prev, terms: val }))}
                  placeholder="Conditions de paiement, délais, etc."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes internes</Label>
                <MentionableTextarea
                  value={formData.notes}
                  onChange={(val) => setFormData(prev => ({ ...prev, notes: val }))}
                  placeholder="Notes privées... Tapez @ pour mentionner"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button onClick={handleSaveQuote} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {editingQuote ? 'Modifier' : 'Créer'} le devis
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Liste des devis */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredQuotes.map(quote => (
          <Card key={quote.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">
                    {quote.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">N° {quote.quote_number}</p>
                </div>
                <Badge className={getStatusColor(quote.status)}>
                  {getStatusLabel(quote.status)}
                </Badge>
              </div>

              {quote.description && (
                <p className="text-gray-600 text-sm mb-4 break-words">{quote.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {Number(quote.total_amount ?? 0).toFixed(2)} € TTC
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

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleView(quote)} className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Voir
                </Button>
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

      {/* Dialog Modèles */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modèles de Devis</DialogTitle>
          </DialogHeader>
          <QuoteTemplateManager onApplyTemplate={handleApplyTemplate} />
        </DialogContent>
      </Dialog>

      {/* Dialog Visualisation du devis */}
      <Dialog open={!!viewingQuote} onOpenChange={(open) => { if (!open) { setViewingQuote(null); setViewingQuoteItems([]); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Devis N° {viewingQuote?.quote_number}</DialogTitle>
          </DialogHeader>
          {viewingQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Titre:</span>
                  <p className="font-medium">{viewingQuote.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Statut:</span>
                  <div className="mt-1">
                    <Badge className={getStatusColor(viewingQuote.status)}>
                      {getStatusLabel(viewingQuote.status)}
                    </Badge>
                  </div>
                </div>
                {viewingQuote.description && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p>{viewingQuote.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Créé le:</span>
                  <p>{new Date(viewingQuote.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                {viewingQuote.valid_until && (
                  <div>
                    <span className="text-muted-foreground">Valide jusqu'au:</span>
                    <p>{new Date(viewingQuote.valid_until).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Contact:</span>
                  <p>{viewingQuote.contact_id ? ((contacts.find(c => c.id === viewingQuote.contact_id)?.first_name || '') + ' ' + (contacts.find(c => c.id === viewingQuote.contact_id)?.last_name || '')).trim() || '-' : '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Événement:</span>
                  <p>{viewingQuote.event_id ? events.find(e => e.id === viewingQuote.event_id)?.title || '-' : '-'}</p>
                </div>
              </div>

              {/* Items */}
              {viewingQuoteItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Lignes du devis</h4>
                  <div className="space-y-2">
                    {viewingQuoteItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item.name}</p>
                          {item.description && <p className="text-muted-foreground text-xs">{item.description}</p>}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p>{item.quantity} × {Number(item.unit_price).toFixed(2)} €</p>
                          <p className="font-semibold">{Number(item.total_price).toFixed(2)} €</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totaux */}
              <Card className="p-4 bg-muted/50">
                <div className="space-y-1.5 text-sm">
                  {(() => {
                    const subtotal = viewingQuoteItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
                    const vatRate = viewingQuote.vat_rate ?? 0;
                    const tax = viewingQuote.tax_amount ?? (subtotal * vatRate / 100);
                    const total = viewingQuote.total_amount ?? (subtotal + tax);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sous-total HT</span>
                          <span>{subtotal.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">TVA ({vatRate}%)</span>
                          <span>{tax.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                          <span>Total TTC</span>
                          <span>{total.toFixed(2)} €</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </Card>

              {viewingQuote.terms && (
                <div>
                  <h4 className="font-semibold mb-1">Conditions</h4>
                  <p className="text-sm text-muted-foreground">{viewingQuote.terms}</p>
                </div>
              )}

              {viewingQuote.notes && (
                <div>
                  <h4 className="font-semibold mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{viewingQuote.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleDownloadPDF} className="flex-1">
                  <FileDown className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button variant="outline" onClick={() => { setViewingQuote(null); handleEdit(viewingQuote); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};