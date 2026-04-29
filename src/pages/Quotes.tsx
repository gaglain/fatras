import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { FileText, Plus, Search, Calculator } from 'lucide-react';
import { useQuotes, Quote, QuoteItem } from '@/hooks/useQuotes';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { QuoteCalculator, QuoteCalculation } from '@/components/quotes/QuoteCalculator';
import { QuoteItemManager } from '@/components/quotes/QuoteItemManager';
import { SimpleQuoteCalculator, QuoteFormData } from '@/components/quotes/SimpleQuoteCalculator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { QuoteFormDialog } from './quotes/QuoteFormDialog';
import { QuoteTable } from './quotes/QuoteTable';

export const Quotes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [calculation, setCalculation] = useState<QuoteCalculation | null>(null);
  const [showSimpleCalculator, setShowSimpleCalculator] = useState(false);
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteFormData[]>([]);
  const [currentItems, setCurrentItems] = useState<QuoteItem[]>([]);
  const { quotes, loading, addQuote, updateQuote, deleteQuote, generateQuoteNumber } = useQuotes();
  const { contacts } = useContacts();
  const { events } = useEvents();
  const { artists } = useCentralizedData();
  const { user } = useAuth();

  const loadDraft = () => {
    try { const saved = localStorage.getItem('quoteDraft'); return saved ? JSON.parse(saved) : null; } catch { return null; }
  };

  const [formData, setFormData] = useState(loadDraft() || {
    title: '', description: '', contact_id: 'none', event_id: 'none', artist_id: 'none',
    status: 'draft' as Quote['status'], valid_until: '', terms: '', notes: '', vat_rate: 20
  });

  useEffect(() => {
    if (!selectedQuote && (formData.title || formData.description)) {
      try { localStorage.setItem('quoteDraft', JSON.stringify(formData)); } catch {}
    }
  }, [formData, selectedQuote]);

  useEffect(() => {
    if (dialogOpen && !selectedQuote) { const saved = loadDraft(); if (saved) setFormData(saved); }
  }, [dialogOpen, selectedQuote]);

  useEffect(() => {
    try { const raw = localStorage.getItem('quoteTemplates'); setQuoteTemplates(Array.isArray(JSON.parse(raw || '[]')) ? JSON.parse(raw || '[]') : []); } catch { setQuoteTemplates([]); }
  }, []);

  const resetForm = () => {
    setFormData({ title: '', description: '', contact_id: 'none', event_id: 'none', artist_id: 'none', status: 'draft', valid_until: '', terms: '', notes: '', vat_rate: 20 });
    localStorage.removeItem('quoteDraft');
  };

  const fillFormFromQuote = (q: Quote) => {
    setFormData({ title: q.title, description: q.description || '', contact_id: q.contact_id ?? 'none', event_id: q.event_id ?? 'none', artist_id: q.artist_id ?? 'none', status: q.status, valid_until: q.valid_until || '', terms: q.terms || '', notes: q.notes || '', vat_rate: (q as any).vat_rate ?? 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error('Le titre est requis'); return; }
    if (!user) { toast.error('Utilisateur non connecté'); return; }
    try {
      if (selectedQuote) {
        const updated = await updateQuote(selectedQuote.id, { title: formData.title, description: formData.description, contact_id: formData.contact_id !== 'none' ? formData.contact_id : null, event_id: formData.event_id !== 'none' ? formData.event_id : null, artist_id: formData.artist_id !== 'none' ? formData.artist_id : null, status: formData.status, valid_until: formData.valid_until || null, terms: formData.terms, notes: formData.notes, vat_rate: formData.vat_rate ?? 0 });
        // Feuille de route + canal créés automatiquement par trigger DB (anti-doublon centralisé)
        if (formData.status === 'accepted' && selectedQuote.status !== 'accepted') toast.success('Feuille de route et canal générés automatiquement');
        toast.success('Devis mis à jour');
        setSelectedQuote(updated || selectedQuote);
        setDialogOpen(false);
        return;
      }
      const newQuote = await addQuote({ user_id: user.id, quote_number: generateQuoteNumber(), title: formData.title, description: formData.description, contact_id: formData.contact_id !== 'none' ? formData.contact_id : undefined, event_id: formData.event_id !== 'none' ? formData.event_id : undefined, artist_id: formData.artist_id !== 'none' ? formData.artist_id : undefined, status: formData.status, total_amount: calculation?.finalPrice || 0, tax_amount: calculation?.vatAmount || 0, vat_rate: formData.vat_rate ?? 0, valid_until: formData.valid_until || undefined, terms: formData.terms, notes: formData.notes });
      toast.success('Devis créé');
      resetForm();
      setCalculation(null);
      setDialogOpen(false);
      if (newQuote) setSelectedQuote(newQuote);
    } catch { toast.error('Erreur lors de la sauvegarde'); }
  };

  const confirmAction = useConfirm();
  const handleDelete = async (id: string) => {
    const ok = await confirmAction({ title: 'Supprimer le devis', description: 'Êtes-vous sûr ?', variant: 'destructive' });
    if (ok) { try { await deleteQuote(id); toast.success('Devis supprimé'); } catch { toast.error('Erreur'); } }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) || q.quote_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (selectedStatus === 'all' || q.status === selectedStatus);
  });

  if (loading) return <div className="flex justify-center items-center h-64">Chargement...</div>;

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Gestion des Devis</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez vos devis avec calculs automatiques</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSimpleCalculator(true)} variant="outline"><Calculator className="h-4 w-4 mr-2" />Calculateur Simple</Button>
          <Button onClick={() => { setSelectedQuote(null); setCalculation(null); const saved = loadDraft(); if (saved) setFormData(saved); else resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Nouveau Devis
          </Button>
        </div>
      </div>

      <QuoteFormDialog
        dialogOpen={dialogOpen}
        onDialogOpenChange={(open) => { setDialogOpen(open); if (!open) setSelectedQuote(null); }}
        selectedQuote={selectedQuote}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        contacts={contacts}
        events={events}
        artists={artists}
        calculation={calculation}
        setCalculation={setCalculation}
        currentItems={currentItems}
        setCurrentItems={setCurrentItems}
        updateQuote={updateQuote}
        setSelectedQuote={setSelectedQuote}
        QuoteCalculator={QuoteCalculator}
        QuoteItemManager={QuoteItemManager}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Rechercher des devis..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="sent">Envoyé</SelectItem>
            <SelectItem value="accepted">Accepté</SelectItem>
            <SelectItem value="rejected">Refusé</SelectItem>
            <SelectItem value="expired">Expiré</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Devis ({filteredQuotes.length})</CardTitle></CardHeader>
        <CardContent>
          <QuoteTable
            quotes={filteredQuotes}
            contacts={contacts}
            events={events}
            artists={artists}
            onEdit={(q) => { setSelectedQuote(q); fillFormFromQuote(q); setCalculation(null); setDialogOpen(true); }}
            onDelete={handleDelete}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>

      {showSimpleCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Calculateur de Devis</h2>
                <Button variant="ghost" onClick={() => setShowSimpleCalculator(false)}>✕</Button>
              </div>
            </div>
            <div className="p-6">
              <SimpleQuoteCalculator onSave={(templateData) => {
                let templates: any[] = [];
                try { templates = JSON.parse(localStorage.getItem('quoteTemplates') || '[]'); if (!Array.isArray(templates)) templates = []; } catch { templates = []; }
                templates.push({ ...templateData, id: Date.now().toString(), name: (templateData as any).artistName || 'Modèle sans nom', createdAt: new Date().toISOString() });
                localStorage.setItem('quoteTemplates', JSON.stringify(templates));
                setQuoteTemplates(templates);
                toast.success('Modèle de devis sauvegardé');
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
