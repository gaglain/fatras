import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Users, UserCheck, UserX, Upload, Download, Mail, List, Grid, LayoutList } from 'lucide-react';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { CSVImporter } from '@/components/CSVImporter';
import { CSVExporter } from '@/components/CSVExporter';
import { ContactLists } from '@/pages/ContactLists';
import { ContactFilters } from '@/components/contacts/ContactFilters';
import { BulkContactActions } from '@/components/contacts/BulkContactActions';
import { BulkContactListAssignment } from '@/components/contacts/BulkContactListAssignment';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useContactLists } from '@/hooks/useContactLists';
import { toast } from 'sonner';
import { Contact } from '@/types/contact.types';
import { useNavigate } from 'react-router-dom';

export const Contacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { contactLists } = useContactLists();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [csvExportOpen, setCsvExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkListAssignmentOpen, setBulkListAssignmentOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [contactEvents, setContactEvents] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user) {
      fetchContacts();
      fetchEvents();
      fetchContactEvents();
    }
  }, [user]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter, roleFilter, tagFilters, sourceFilter, cityFilter, departmentFilter, eventFilter, contactEvents]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  const fetchContactEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_events')
        .select('contact_id, event_id');

      if (error) throw error;
      
      // Organize contact events as a map: contactId -> [eventId1, eventId2, ...]
      const eventMap: Record<string, string[]> = {};
      data?.forEach(ce => {
        if (!eventMap[ce.contact_id]) {
          eventMap[ce.contact_id] = [];
        }
        eventMap[ce.contact_id].push(ce.event_id);
      });
      
      setContactEvents(eventMap);
    } catch (error: any) {
      console.error('Erreur lors du chargement des liens contact-événement:', error);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact => 
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(contact => contact.role === roleFilter);
    }

    if (tagFilters.length > 0) {
      filtered = filtered.filter(contact => 
        contact.tags && contact.tags.some(tag => tagFilters.includes(tag))
      );
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(contact => contact.source === sourceFilter);
    }

    if (cityFilter !== 'all') {
      filtered = filtered.filter(contact => contact.city === cityFilter);
    }

    if (departmentFilter) {
      filtered = filtered.filter(contact => 
        contact.postal_code && contact.postal_code.startsWith(departmentFilter)
      );
    }

    if (eventFilter !== 'all') {
      filtered = filtered.filter(contact => {
        if (!contact.id) return false;
        const events = contactEvents[contact.id] || [];
        return events.includes(eventFilter);
      });
    }

    setFilteredContacts(filtered);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Contact supprimé avec succès');
      fetchContacts();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du contact');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingContact(null);
  };

  const handleImportComplete = (importedContacts: any[]) => {
    console.log('Import completed:', importedContacts.length, 'contacts');
    fetchContacts(); // Refresh the contacts list
    setCsvImportOpen(false);
  };

  // Bulk selection functions
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedContactIds(filteredContacts.map(c => c.id!).filter(Boolean));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleContactSelect = (contactId: string, selected: boolean) => {
    if (selected) {
      setSelectedContactIds(prev => [...prev, contactId]);
    } else {
      setSelectedContactIds(prev => prev.filter(id => id !== contactId));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContactIds.length === 0) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .in('id', selectedContactIds);

      if (error) throw error;
      
      toast.success(`${selectedContactIds.length} contact(s) supprimé(s) avec succès`);
      setSelectedContactIds([]);
      fetchContacts();
    } catch (error: any) {
      console.error('Erreur lors de la suppression en masse:', error);
      toast.error('Erreur lors de la suppression des contacts');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkListAssignment = () => {
    setBulkListAssignmentOpen(true);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setTagFilters([]);
    setSourceFilter('all');
    setCityFilter('all');
    setDepartmentFilter('');
    setEventFilter('all');
  };

  // Get unique values for filters
  const getUniqueValues = (key: keyof Contact) => {
    return Array.from(new Set(contacts.map(contact => contact[key]).filter(Boolean)));
  };

  const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));
  const availableSources = getUniqueValues('source') as string[];
  const availableCities = getUniqueValues('city') as string[];

  const getContactStats = () => {
    const total = contacts.length;
    const clients = contacts.filter(c => c.status === 'client').length;
    const prospects = contacts.filter(c => c.status === 'prospect').length;
    const inactifs = contacts.filter(c => c.status === 'inactif').length;
    
    return { total, clients, prospects, inactifs };
  };

  const stats = getContactStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Contacts & Listes</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">
            Gérez vos contacts et organisez-les en listes pour vos campagnes
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button onClick={() => navigate('/email-campaigns')} variant="outline" size="sm" className="w-full sm:w-auto">
            <Mail className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Campagnes Email</span>
            <span className="sm:hidden">Email</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouveau contact</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacts ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Listes de contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          {/* Actions pour les contacts */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-2">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grille
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4 mr-2" />
                Liste
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setCsvImportOpen(true)} variant="outline" size="sm" className="text-sm">
                <Upload className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Importer CSV</span>
                <span className="sm:hidden">Import</span>
              </Button>
              <Button onClick={() => setCsvExportOpen(true)} variant="outline" size="sm" className="text-sm">
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Exporter CSV</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-card p-3 md:p-4 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-3 md:p-4 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Clients</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">{stats.clients}</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-3 md:p-4 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Prospects</p>
                  <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.prospects}</p>
                </div>
              </div>
            </div>
            <div className="bg-card p-3 md:p-4 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-2">
                <UserX className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Inactifs</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-600">{stats.inactifs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
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
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            eventFilter={eventFilter}
            onEventFilterChange={setEventFilter}
            availableTags={availableTags}
            availableSources={availableSources}
            availableCities={availableCities}
            availableEvents={events}
            totalContacts={contacts.length}
            filteredCount={filteredContacts.length}
            onClearFilters={clearAllFilters}
          />

          {/* Bulk Actions */}
          {filteredContacts.length > 0 && (
            <BulkContactActions
              selectedContacts={selectedContactIds}
              totalContacts={filteredContacts.length}
              onSelectAll={handleSelectAll}
              onClearSelection={() => setSelectedContactIds([])}
              onBulkDelete={handleBulkDelete}
              isDeleting={isDeleting}
            />
          )}

          {/* Bulk Action Buttons */}
          {selectedContactIds.length > 0 && (
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
              <Button onClick={handleBulkListAssignment} variant="outline" size="sm" className="text-sm">
                <List className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ajouter à une liste</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </div>
          )}

          {/* Contacts Grid */}
          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {contacts.length === 0 ? 'Aucun contact' : 'Aucun résultat'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {contacts.length === 0 
                  ? 'Commencez par ajouter votre premier contact'
                  : 'Essayez de modifier vos filtres de recherche'
                }
              </p>
              {contacts.length === 0 && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un contact
                </Button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              : "space-y-2"
            }>
              {filteredContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isSelected={selectedContactIds.includes(contact.id!)}
                  onSelect={(selected) => handleContactSelect(contact.id!, selected)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lists" className="space-y-6">
          <ContactLists />
        </TabsContent>
      </Tabs>

      <ContactDialog
        isOpen={dialogOpen}
        onClose={handleDialogClose}
        contact={editingContact}
        onSave={() => {
          fetchContacts();
          handleDialogClose();
        }}
      />

      <CSVImporter
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImport={handleImportComplete}
      />

      <CSVExporter
        isOpen={csvExportOpen}
        onClose={() => setCsvExportOpen(false)}
        contacts={filteredContacts}
      />

      <BulkContactListAssignment
        isOpen={bulkListAssignmentOpen}
        onClose={() => setBulkListAssignmentOpen(false)}
        selectedContactIds={selectedContactIds}
        contactLists={contactLists}
        onListCreated={() => {
          setSelectedContactIds([]);
          setBulkListAssignmentOpen(false);
        }}
      />
    </div>
  );
};
