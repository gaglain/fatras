import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Eye, Edit, Trash2, Download, Calculator } from 'lucide-react';
import { useQuotes, Quote } from '@/hooks/useQuotes';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { QuoteCalculator, QuoteCalculation } from '@/components/quotes/QuoteCalculator';
import { QuoteItemManager } from '@/components/quotes/QuoteItemManager';
import { SimpleQuoteCalculator, QuoteFormData } from '@/components/quotes/SimpleQuoteCalculator';
import { toast } from 'sonner';

export const Quotes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [calculation, setCalculation] = useState<QuoteCalculation | null>(null);
  const [showSimpleCalculator, setShowSimpleCalculator] = useState(false);
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteFormData[]>([]);
  
  const { quotes, loading, addQuote, updateQuote, deleteQuote, generateQuoteNumber } = useQuotes();
  const { contacts } = useContacts();
  const { events } = useEvents();
  const { artists } = useCentralizedData();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact_id: 'none',
    event_id: 'none',
    artist_id: 'none',
    status: 'draft' as Quote['status'],
    valid_until: '',
    terms: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (!user) {
      toast.error('Utilisateur non connecté');
      return;
    }

    try {
      const quoteData = {
        user_id: user.id,
        quote_number: generateQuoteNumber(),
        title: formData.title,
        description: formData.description,
        contact_id: formData.contact_id !== 'none' ? formData.contact_id : undefined,
        event_id: formData.event_id !== 'none' ? formData.event_id : undefined,
        artist_id: formData.artist_id !== 'none' ? formData.artist_id : undefined,
        status: formData.status,
        total_amount: calculation?.finalPrice || 0,
        tax_amount: calculation?.vatAmount || 0,
        valid_until: formData.valid_until || undefined,
        terms: formData.terms,
        notes: formData.notes
      };

      const newQuote = await addQuote(quoteData);
      toast.success('Devis créé avec succès');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        contact_id: 'none',
        event_id: 'none',
        artist_id: 'none',
        status: 'draft',
        valid_until: '',
        terms: '',
        notes: ''
      });
      setCalculation(null);
      setDialogOpen(false);
      
      // Auto-select the new quote for editing items
      if (newQuote) {
        setSelectedQuote(newQuote);
      }
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      toast.error('Erreur lors de la création du devis');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      try {
        await deleteQuote(id);
        toast.success('Devis supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression du devis');
      }
    }
  };

  const handleSaveTemplate = (templateData: QuoteFormData) => {
    const templates = JSON.parse(localStorage.getItem('quoteTemplates') || '[]');
    const newTemplate = {
      ...templateData,
      id: Date.now().toString(),
      name: templateData.artistName || 'Modèle sans nom',
      createdAt: new Date().toISOString()
    };
    templates.push(newTemplate);
    localStorage.setItem('quoteTemplates', JSON.stringify(templates));
    setQuoteTemplates(templates);
    toast.success('Modèle de devis sauvegardé');
  };

  useEffect(() => {
    const templates = JSON.parse(localStorage.getItem('quoteTemplates') || '[]');
    setQuoteTemplates(templates);
  }, []);

  const getStatusBadge = (status: Quote['status']) => {
    const variants = {
      draft: 'secondary',
      sent: 'default',
      accepted: 'default',
      rejected: 'destructive',
      expired: 'outline'
    } as const;

    const labels = {
      draft: 'Brouillon',
      sent: 'Envoyé',
      accepted: 'Accepté',
      rejected: 'Refusé',
      expired: 'Expiré'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || quote.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Gestion des Devis</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez vos devis avec calculs automatiques</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowSimpleCalculator(true)} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculateur Simple
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Devis
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau devis</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="info" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="calculator">Calculateur</TabsTrigger>
                  <TabsTrigger value="items">Lignes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          placeholder="Nom du devis"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Statut</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value) => setFormData({ ...formData, status: value as Quote['status'] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="sent">Envoyé</SelectItem>
                            <SelectItem value="accepted">Accepté</SelectItem>
                            <SelectItem value="rejected">Refusé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact">Contact</Label>
                        <Select 
                          value={formData.contact_id} 
                          onValueChange={(value) => setFormData({ ...formData, contact_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un contact" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun contact</SelectItem>
                            {contacts.slice(0, 50).map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.first_name} {contact.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event">Événement</Label>
                        <Select 
                          value={formData.event_id} 
                          onValueChange={(value) => setFormData({ ...formData, event_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un événement" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun événement</SelectItem>
                            {events.slice(0, 50).map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="artist">Spectacle</Label>
                        <Select 
                          value={formData.artist_id} 
                          onValueChange={(value) => setFormData({ ...formData, artist_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un spectacle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucun spectacle</SelectItem>
                            {artists.slice(0, 50).map((artist) => (
                              <SelectItem key={artist.id} value={artist.id}>
                                {artist.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valid_until">Valide jusqu'au</Label>
                        <Input
                          id="valid_until"
                          type="date"
                          value={formData.valid_until}
                          onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="Description du devis"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="terms">Conditions</Label>
                        <Textarea
                          id="terms"
                          value={formData.terms}
                          onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                          rows={3}
                          placeholder="Conditions du devis"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                          placeholder="Notes internes"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">
                        Créer le devis
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="calculator">
                  <QuoteCalculator 
                    onCalculationChange={setCalculation}
                    initialValues={calculation || undefined}
                  />
                </TabsContent>
                
                <TabsContent value="items">
                  {selectedQuote && (
                    <QuoteItemManager 
                      quoteId={selectedQuote.id}
                      quote={selectedQuote}
                      onItemsChange={(items) => {
                        console.log('Items mis à jour:', items);
                        // Recalculer et mettre à jour le total du devis
                        const total = items.reduce((sum, item) => sum + item.total_price, 0);
                        const taxRate = 0.20; // 20% de TVA
                        const taxAmount = total * taxRate;
                        const totalWithTax = total + taxAmount;
                        
                        updateQuote(selectedQuote.id, {
                          ...selectedQuote,
                          total_amount: totalWithTax,
                          tax_amount: taxAmount
                        });
                      }}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des devis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Devis ({filteredQuotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Spectacle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-mono text-sm">
                        {quote.quote_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {quote.title}
                      </TableCell>
                      <TableCell>
                        {quote.contact_id ? (
                          contacts.find(c => c.id === quote.contact_id)?.first_name + ' ' +
                          contacts.find(c => c.id === quote.contact_id)?.last_name
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {quote.artist_id ? (
                          artists.find(a => a.id === quote.artist_id)?.name || '-'
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(quote.status)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(quote.total_amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(quote.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(quote.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun devis trouvé
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Calculateur Simple */}
      {showSimpleCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Calculateur de Devis</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowSimpleCalculator(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <SimpleQuoteCalculator onSave={handleSaveTemplate} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};