import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Upload, Download } from 'lucide-react';
import { ViewToggle } from '@/components/ui/view-toggle';
import { GlobalFileUpload } from '@/components/GlobalFileUpload';
import { CSVImporter } from '@/components/CSVImporter';
import { CSVExporter } from '@/components/CSVExporter';
import { ContactForm } from '@/components/ContactForm';
import { ContactFilters } from '@/components/contacts/ContactFilters';
import { BulkContactActions } from '@/components/contacts/BulkContactActions';
import { useContactsRealtime } from '@/hooks/useContactsRealtime';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ContactCard } from '@/components/contacts/ContactCard';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position?: string;
  address?: string;
  city?: string;
  status: 'prospect' | 'client' | 'inactive';
  source?: string;
  notes?: string;
  tags: string[];
  accepts_marketing_emails: boolean;
  created_at: string;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCSVImporter, setShowCSVImporter] = useState(false);
  const [showCSVExporter, setShowCSVExporter] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastLoadTime, setLastLoadTime] = useState(0);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  console.log('📋 Contacts - Page loaded with', contacts.length, 'contacts');

  // Fonction de chargement des contacts optimisée
  const loadContacts = useCallback(async (forceReload = false) => {
    const now = Date.now();
    
    // Éviter les rechargements trop fréquents (sauf si forcé)
    if (!forceReload && now - lastLoadTime < 2000) {
      console.log('⏸️ Skipping reload - too recent');
      return;
    }
    
    setLoading(true);
    setLastLoadTime(now);
    
    try {
      console.log('🔄 Loading contacts from database...');
      
      const { data: contactsData, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading contacts:', error);
        toast.error('Erreur lors du chargement des contacts');
        return;
      }

      const formattedContacts = contactsData?.map(contact => ({
        id: contact.id,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        position: contact.position || '',
        address: contact.address || '',
        city: contact.city || '',
        status: (contact.status as 'prospect' | 'client' | 'inactive') || 'prospect',
        source: contact.source || '',
        notes: contact.notes || '',
        tags: contact.tags || [],
        accepts_marketing_emails: contact.accepts_marketing_emails ?? true,
        created_at: contact.created_at || new Date().toISOString()
      })) || [];

      setContacts(formattedContacts);
      console.log('✅ Contacts loaded successfully:', formattedContacts.length);
      
      if (formattedContacts.length > 0) {
        toast.success(`${formattedContacts.length} contacts chargés`);
      }
    } catch (error) {
      console.error('❌ Error in loadContacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  }, [lastLoadTime]);

  // Callbacks pour la synchronisation temps réel
  const handleContactAdded = useCallback((newContact: Contact) => {
    setContacts(prev => {
      // Vérifier si le contact existe déjà
      const exists = prev.some(c => c.id === newContact.id);
      if (exists) {
        console.log('📋 Contact already exists, skipping add');
        return prev;
      }
      
      console.log('➕ Adding new contact to list:', newContact.first_name, newContact.last_name);
      toast.success(`Nouveau contact ajouté: ${newContact.first_name} ${newContact.last_name}`);
      return [newContact, ...prev];
    });
  }, []);

  const handleContactUpdated = useCallback((updatedContact: Contact) => {
    setContacts(prev => {
      const updated = prev.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      );
      console.log('📝 Contact updated in list:', updatedContact.first_name, updatedContact.last_name);
      return updated;
    });
  }, []);

  const handleContactDeleted = useCallback((contactId: string) => {
    setContacts(prev => {
      const filtered = prev.filter(c => c.id !== contactId);
      console.log('🗑️ Contact removed from list:', contactId);
      return filtered;
    });
    // Retirer de la sélection si supprimé
    setSelectedContacts(prev => prev.filter(id => id !== contactId));
  }, []);

  useContactsRealtime({
    onContactAdded: handleContactAdded,
    onContactUpdated: handleContactUpdated,
    onContactDeleted: handleContactDeleted,
    enabled: true
  });

  useEffect(() => {
    loadContacts(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadContacts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadContacts]);

  // Données pour les filtres
  const filterData = useMemo(() => {
    const allTags = [...new Set(contacts.flatMap(c => c.tags))].filter(Boolean).sort();
    const allSources = [...new Set(contacts.map(c => c.source))].filter(Boolean).sort();
    const allCities = [...new Set(contacts.map(c => c.city))].filter(Boolean).sort();
    
    return { allTags, allSources, allCities };
  }, [contacts]);

  // Filtrage des contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      // Recherche textuelle
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          contact.first_name.toLowerCase().includes(searchLower) ||
          contact.last_name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.position?.toLowerCase().includes(searchLower) ||
          contact.city?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtre par statut
      if (statusFilter !== 'all' && contact.status !== statusFilter) {
        return false;
      }

      // Filtre par source
      if (sourceFilter !== 'all' && contact.source !== sourceFilter) {
        return false;
      }

      // Filtre par ville
      if (cityFilter !== 'all' && contact.city !== cityFilter) {
        return false;
      }

      // Filtre par tags
      if (tagFilters.length > 0) {
        const hasMatchingTag = tagFilters.some(tag => contact.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [contacts, searchTerm, statusFilter, sourceFilter, cityFilter, tagFilters]);

  // Gestion de la sélection en masse
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedContacts(filteredContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleContactSelection = (contactId: string, selected: boolean) => {
    if (selected) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleClearSelection = () => {
    setSelectedContacts([]);
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    setIsDeleting(true);
    try {
      console.log('🗑️ Bulk deleting contacts:', selectedContacts);
      
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', selectedContacts);

      if (error) {
        console.error('Error bulk deleting contacts:', error);
        toast.error('Erreur lors de la suppression en masse');
        return;
      }

      console.log('✅ Bulk deletion successful');
      toast.success(`${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} supprimé${selectedContacts.length > 1 ? 's' : ''}`);
      
      // Vider la sélection
      setSelectedContacts([]);
      
      // Forcer le rechargement des contacts
      setTimeout(() => loadContacts(true), 500);
    } catch (error) {
      console.error('Error in handleBulkDelete:', error);
      toast.error('Erreur lors de la suppression en masse');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateContact = () => {
    console.log('➕ Creating new contact');
    setEditingContact(null);
    setShowCreateForm(true);
  };

  const handleEditContact = (contact: Contact) => {
    console.log('✏️ Editing contact:', contact.id);
    setEditingContact(contact);
    setShowCreateForm(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      try {
        console.log('🗑️ Deleting contact:', contactId);
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', contactId);

        if (error) {
          console.error('Error deleting contact:', error);
          toast.error('Erreur lors de la suppression');
          return;
        }

        console.log('✅ Contact deletion successful');
      } catch (error) {
        console.error('Error in handleDeleteContact:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleFormSave = () => {
    setShowCreateForm(false);
    setEditingContact(null);
    console.log('✅ Form saved, reloading contacts');
    // Forcer le rechargement après sauvegarde
    setTimeout(() => loadContacts(true), 500);
  };

  const handleCSVImport = (importedContacts: any[]) => {
    console.log('📥 CSV Import completed:', importedContacts.length, 'contacts');
    toast.success(`${importedContacts.length} contacts importés avec succès !`);
    setShowCSVImporter(false);
    
    // Forcer le rechargement après import
    setTimeout(() => loadContacts(true), 1000);
  };

  const handleFileUploaded = (file: { url: string; name: string; type: string }) => {
    console.log('📎 File uploaded for contacts:', file);
    toast.success(`Fichier "${file.name}" ajouté aux contacts`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTagFilters([]);
    setSourceFilter('all');
    setCityFilter('all');
  };

  const handleNewTagAdded = (newTag: string) => {
    console.log('🏷️ New tag added to system:', newTag);
  };

  // Fonction pour rafraîchir manuellement
  const handleRefresh = () => {
    console.log('🔄 Manual refresh requested');
    loadContacts(true);
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Contacts
            <Badge variant="outline" className="ml-2">
              Temps réel activé
            </Badge>
          </h1>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-gray-600">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} enregistré{contacts.length !== 1 ? 's' : ''}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <Button 
            onClick={() => setShowCSVExporter(true)} 
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button 
            onClick={() => setShowCSVImporter(true)} 
            variant="outline"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <Button onClick={handleCreateContact} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Contact
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <ContactFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        tagFilters={tagFilters}
        onTagFiltersChange={setTagFilters}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        cityFilter={cityFilter}
        onCityFilterChange={setCityFilter}
        availableTags={filterData.allTags}
        availableSources={filterData.allSources}
        availableCities={filterData.allCities}
        totalContacts={contacts.length}
        filteredCount={filteredContacts.length}
        onClearFilters={handleClearFilters}
      />

      {/* Actions en masse */}
      {filteredContacts.length > 0 && (
        <BulkContactActions
          selectedContacts={selectedContacts}
          totalContacts={filteredContacts.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDelete}
          isDeleting={isDeleting}
        />
      )}

      {/* Upload de fichiers */}
      <Card>
        <CardHeader>
          <CardTitle>Import de Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalFileUpload
            onFileUploaded={handleFileUploaded}
            acceptedTypes=".csv,.xlsx,.vcf"
            label="Importer des contacts (CSV, Excel, vCard)"
            maxSize={5}
          />
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className={viewMode === 'list' ? 'grid gap-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
        {filteredContacts.map((contact) => (
          <ContactCard 
            key={contact.id} 
            contact={contact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            availableTags={filterData.allTags}
            onNewTagAdded={handleNewTagAdded}
            viewMode={viewMode}
            isSelected={selectedContacts.includes(contact.id)}
            onSelectionChange={handleContactSelection}
          />
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {contacts.length === 0 ? 'Aucun contact trouvé' : 'Aucun contact ne correspond aux filtres'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || tagFilters.length > 0 || sourceFilter !== 'all' || cityFilter !== 'all' ? 
                'Aucun contact ne correspond à vos critères de recherche.' : 
                'Commencez par ajouter votre premier contact ou importer un fichier CSV.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && tagFilters.length === 0 && sourceFilter === 'all' && cityFilter === 'all') && (
              <div className="space-x-2">
                <Button onClick={handleCreateContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un contact
                </Button>
                <Button variant="outline" onClick={() => setShowCSVImporter(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contact Form Dialog */}
      <ContactForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingContact(null);
        }}
        onSave={handleFormSave}
        contact={editingContact || undefined}
      />

      {/* CSV Importer Dialog */}
      <CSVImporter
        isOpen={showCSVImporter}
        onClose={() => setShowCSVImporter(false)}
        onImport={handleCSVImport}
      />

      {/* CSV Exporter Dialog */}
      <CSVExporter
        isOpen={showCSVExporter}
        onClose={() => setShowCSVExporter(false)}
        contacts={filteredContacts}
      />
    </div>
  );
};
