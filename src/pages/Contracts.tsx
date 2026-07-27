import React, { useState, useEffect } from 'react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Plus, FileText, Calculator, Search, File, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useQuotes } from '@/hooks/useQuotes';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useUser } from '@/contexts/UserContext';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContractCalculator, type CalculationValues } from '@/components/contracts/ContractCalculator';
import { QuoteTemplateManager } from '@/components/quotes/QuoteTemplateManager';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { ContractFormDialog, QuoteFormData, defaultFormData } from '@/pages/contracts/ContractFormDialog';
import { ContractViewDialog } from '@/pages/contracts/ContractViewDialog';
import { ContractQuoteCard } from '@/pages/contracts/ContractQuoteCard';

export const Contracts: React.FC = () => {
  const confirm = useConfirm();
  const { currentUser } = useUser();
  const { quotes, loading, addQuote, updateQuote, deleteQuote, generateQuoteNumber, addQuoteItem } = useQuotes();
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

  const [formData, setFormData] = useState<QuoteFormData>(() => {
    try {
      const saved = localStorage.getItem('contractsQuoteDraft');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      logger.warn('Erreur parse brouillon devis (contracts):', e);
      localStorage.removeItem('contractsQuoteDraft');
    }
    return { ...defaultFormData };
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const { data, error } = await supabase.from('quote_templates').select('*').order('name');
        if (error) throw error;
        setQuoteTemplates(data || []);
      } catch { /* silent */ }
    };
    fetchTemplates();
  }, []);

  // Autosave draft
  React.useEffect(() => {
    try {
      if (!editingQuote && (formData.title || formData.description || formData.items?.some(i => i.name || i.unit_price))) {
        localStorage.setItem('contractsQuoteDraft', JSON.stringify(formData));
      }
    } catch (e) { logger.warn('Erreur sauvegarde brouillon:', e); }
  }, [formData, editingQuote]);

  React.useEffect(() => {
    if (showForm && !editingQuote) {
      try {
        const saved = localStorage.getItem('contractsQuoteDraft');
        if (saved) setFormData(JSON.parse(saved));
      } catch (e) { logger.warn('Erreur restauration brouillon:', e); }
    }
  }, [showForm, editingQuote]);

  const handleApplyTemplateToForm = (templateId: string) => {
    const template = quoteTemplates.find(t => t.id === templateId);
    if (!template) return;
    const updates: Partial<QuoteFormData> = {};
    if (template.description) updates.description = template.description;
    if (template.default_terms) {
      updates.description = (formData.description ? formData.description + '\n\n' : '') + 'Conditions : ' + template.default_terms;
    }
    const items = Array.isArray(template.default_items) ? template.default_items : typeof template.default_items === 'string' ? JSON.parse(template.default_items) : [];
    if (items.length > 0) {
      updates.items = items.map((item: any) => ({ name: item.name || '', description: item.description || '', quantity: item.quantity || 1, unit_price: item.unit_price || 0 }));
    }
    setFormData(prev => ({ ...prev, ...updates }));
    setSelectedTemplateId('');
    toast.success(`Modèle "${template.name}" appliqué avec ${items.length} ligne(s)`);
  };

  const handleCalculatorChange = (values: CalculationValues) => {
    setFormData(prev => ({ ...prev, items: [{ name: 'Service complet', description: 'Cachet, transport, hébergement et frais annexes', quantity: 1, unit_price: values.totalHT }] }));
  };

  const createRoadshowFromQuote = async (quoteId: string, quoteData: QuoteFormData) => {
    if (!currentUser) return;
    try {
      const event = events.find(e => e.id === quoteData.event_id);
      const artist = artists.find(a => a.id === quoteData.artist_id);
      const contact = contacts.find(c => c.id === quoteData.contact_id);
      if (!event) { toast.error('Un événement doit être associé au devis pour créer une feuille de route'); return; }

      let opportunityId: string | null = null;
      if (event.id) {
        const { data: oppEvent } = await supabase.from('opportunity_events').select('opportunity_id').eq('event_id', event.id).maybeSingle();
        if (oppEvent?.opportunity_id) { opportunityId = oppEvent.opportunity_id; }
        else { const { data: opp } = await supabase.from('opportunities').select('id').eq('event_id', event.id).maybeSingle(); opportunityId = opp?.id || null; }
      }

      const { data: roadshow, error: roadshowError } = await supabase.from('roadshow_stops').insert({
        user_id: currentUser.id, quote_id: quoteId, opportunity_id: opportunityId,
        city: event.city || 'Ville à définir', venue: event.venue || 'Lieu à définir', address: event.address || '',
        event_date: event.start_date || null, status: 'confirmed', capacity: event.attendees_count || 0,
        tickets_available: event.attendees_count || 0, crew: [], equipment: [],
        artists: artist ? [artist.id] : [], artist_lineup: [],
        notes: `Créé automatiquement à partir du devis ${quoteData.title}`
      }).select().single();
      if (roadshowError) throw roadshowError;

      if (roadshow) {
        const memberIds: string[] = [];
        if (contact?.user_id) memberIds.push(contact.user_id);
        const { error: channelError } = await supabase.rpc('create_messaging_channel', {
          channel_name: `🎭 ${quoteData.title}`, channel_description: `Organisation du spectacle - ${event.venue || 'Lieu à définir'}`,
          channel_type: 'private', member_user_ids: memberIds, roadshow_ref_id: roadshow.id
        });
        if (channelError) toast.error('Feuille de route créée mais erreur canal: ' + channelError.message);
        else toast.success('Feuille de route et canal de messagerie créés !');
      }
    } catch (error: unknown) { logger.error('❌ Erreur feuille de route:', error); toast.error('Erreur lors de la création de la feuille de route'); }
  };

  const handleSaveQuote = async () => {
    if (!currentUser) return;
    if (!formData.title.trim()) { toast.error('Le titre est obligatoire'); return; }
    if (!editingQuote && (formData.items.length === 0 || !formData.items[0].name.trim())) { toast.error('Au moins un élément est requis'); return; }

    let subtotal: number, tax: number, total: number;
    if (editingQuote) {
      const { data: dbItems } = await supabase.from('quote_items').select('*').eq('quote_id', editingQuote.id);
      subtotal = dbItems?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
      tax = subtotal * (formData.vat_rate / 100); total = subtotal + tax;
    } else {
      subtotal = formData.items.reduce((t, i) => t + i.quantity * i.unit_price, 0);
      tax = subtotal * (formData.vat_rate / 100); total = subtotal + tax;
    }

    try {
      if (editingQuote) {
        const previousStatus = editingQuote.status;
        await updateQuote(editingQuote.id, {
          title: formData.title, description: formData.description, contact_id: formData.contact_id || undefined,
          event_id: formData.event_id || undefined, artist_id: formData.artist_id || undefined,
          status: formData.status, total_amount: total, tax_amount: tax, vat_rate: formData.vat_rate,
          valid_until: formData.valid_until || undefined, terms: formData.terms, notes: formData.notes
        });
        if (formData.status === 'accepted' && previousStatus !== 'accepted') await createRoadshowFromQuote(editingQuote.id, formData);
        toast.success('Devis modifié avec succès');
      } else {
        const createdQuote = await addQuote({
          user_id: currentUser.id, quote_number: generateQuoteNumber(), title: formData.title,
          description: formData.description, contact_id: formData.contact_id || undefined,
          event_id: formData.event_id || undefined, artist_id: formData.artist_id || undefined,
          status: formData.status, total_amount: total, tax_amount: tax, vat_rate: formData.vat_rate,
          valid_until: formData.valid_until || undefined, terms: formData.terms, notes: formData.notes
        });
        if (createdQuote && formData.items.length > 0) {
          for (const item of formData.items) {
            if (item.name.trim()) await addQuoteItem(createdQuote.id, { name: item.name, description: item.description, quantity: item.quantity, unit_price: item.unit_price, total_price: item.quantity * item.unit_price });
          }
        }
        if (createdQuote && formData.status === 'accepted') await createRoadshowFromQuote(createdQuote.id, formData);
        toast.success('Devis créé avec succès');
      }
      resetForm();
    } catch (error: unknown) {
      logger.error('Erreur sauvegarde devis:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    }
  };

  const handleApplyTemplate = (template: any) => {
    setFormData({
      title: template.name, description: template.description || '', contact_id: '', event_id: '', artist_id: '',
      status: 'draft', valid_until: '', terms: template.default_terms || defaultFormData.terms,
      notes: '', items: template.default_items.length > 0 ? template.default_items : [{ name: '', description: '', quantity: 1, unit_price: 0 }], vat_rate: 20
    });
    setShowTemplates(false); setShowForm(true); toast.success('Modèle appliqué avec succès');
  };

  const resetForm = () => {
    setFormData({ ...defaultFormData });
    setShowForm(false); setEditingQuote(null);
    localStorage.removeItem('contractsQuoteDraft');
  };

  const handleEdit = (quote: any) => {
    setEditingQuote(quote);
    setFormData({ title: quote.title, description: quote.description || '', contact_id: quote.contact_id || '', event_id: quote.event_id || '', artist_id: quote.artist_id || '', status: quote.status, valid_until: quote.valid_until || '', terms: quote.terms || defaultFormData.terms, notes: quote.notes || '', items: [], vat_rate: quote.vat_rate ?? 20 });
    setShowForm(true);
  };

  const handleDelete = async (quoteId: string) => {
    const ok = await confirm({ title: 'Supprimer le devis', description: 'Cette action est irréversible. Voulez-vous vraiment supprimer ce devis ?', confirmText: 'Supprimer', variant: 'destructive' });
    if (ok) { await deleteQuote(quoteId); toast.success('Devis supprimé'); }
  };

  const handleView = async (quote: any) => {
    try {
      const { data: items } = await supabase.from('quote_items').select('*').eq('quote_id', quote.id).order('created_at', { ascending: true });
      setViewingQuote(quote); setViewingQuoteItems(items || []);
    } catch (error) { logger.error('Erreur chargement items:', error); toast.error('Erreur lors du chargement du devis'); }
  };

  const getStatusColor = (status: string) => {
    switch (status) { case 'draft': return 'bg-gray-100 text-gray-800'; case 'sent': return 'bg-blue-100 text-blue-800'; case 'accepted': return 'bg-green-100 text-green-800'; case 'rejected': return 'bg-red-100 text-red-800'; case 'expired': return 'bg-orange-100 text-orange-800'; default: return 'bg-gray-100 text-gray-800'; }
  };
  const getStatusLabel = (status: string) => {
    switch (status) { case 'draft': return 'Brouillon'; case 'sent': return 'Envoyé'; case 'accepted': return 'Accepté'; case 'rejected': return 'Refusé'; case 'expired': return 'Expiré'; default: return status; }
  };

  if (loading) return <div>Chargement...</div>;

  const filteredQuotes = quotes.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()) || q.quote_number.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center"><FileText className="h-6 w-6 lg:h-8 lg:w-8 mr-2 lg:mr-3 text-blue-600" />Devis & Contrats</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Gérez vos devis et contrats clients</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowTemplates(true)} variant="outline" className="button-responsive"><File className="h-4 w-4 mr-2" />Modèles</Button>
          <Button onClick={() => setShowCalculator(true)} variant="outline" className="button-responsive"><Calculator className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Calculateur</span><span className="sm:hidden">Calc</span></Button>
          <Button onClick={() => setShowForm(true)} className="button-responsive"><Plus className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Nouveau Devis</span><span className="sm:hidden">Nouveau</span></Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Rechercher des devis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      <ContractFormDialog
        open={showForm} onOpenChange={setShowForm} formData={formData} setFormData={setFormData}
        editingQuote={editingQuote} quoteTemplates={quoteTemplates} selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId} onApplyTemplate={handleApplyTemplateToForm}
        onSave={handleSaveQuote} onReset={resetForm} updateQuote={updateQuote}
      />

      <div className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredQuotes.map(quote => (
          <ContractQuoteCard key={quote.id} quote={quote} contacts={contacts} events={events} artists={artists}
            onView={handleView} onEdit={handleEdit} onDelete={handleDelete} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
        ))}
      </div>

      {quotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Aucun devis créé</h3>
          <p className="text-gray-600 mb-4">Commencez par créer votre premier devis</p>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" />Créer un devis</Button>
        </div>
      )}

      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Calculateur de Devis</DialogTitle></DialogHeader>
          <ContractCalculator onCalculationChange={handleCalculatorChange} />
        </DialogContent>
      </Dialog>

      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modèles de Devis</DialogTitle></DialogHeader>
          <QuoteTemplateManager onApplyTemplate={handleApplyTemplate} />
        </DialogContent>
      </Dialog>

      <ContractViewDialog viewingQuote={viewingQuote} viewingQuoteItems={viewingQuoteItems}
        onClose={() => { setViewingQuote(null); setViewingQuoteItems([]); }} onEdit={handleEdit}
        contacts={contacts} events={events} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} />
    </div>
  );
};
