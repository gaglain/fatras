import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Users, UserCheck, UserX, Upload, Download, Mail, List, Grid, LayoutList, Loader2, Merge } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { CSVImporter } from '@/components/CSVImporter';
import { CSVExporter } from '@/components/CSVExporter';
import { ContactLists } from '@/pages/ContactLists';
import { ContactFilters } from '@/components/contacts/ContactFilters';
import { BulkContactActions } from '@/components/contacts/BulkContactActions';
import { BulkContactListAssignment } from '@/components/contacts/BulkContactListAssignment';
import { ContactDuplicateScanner } from '@/components/contacts/ContactDuplicateScanner';
import { EmailComposer } from '@/components/email/EmailComposer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useContactLists } from '@/hooks/useContactLists';
import { toast } from 'sonner';
import { Contact } from '@/types/contact.types';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 200;

export const Contacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { contactLists, createContactList } = useContactLists();

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
  const [emailComposer, setEmailComposer] = useState<{
    isOpen: boolean;
    to: string;
    toName: string;
  }>({ isOpen: false, to: '', toName: '' });

  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [contactEvents, setContactEvents] = useState<Record<string, string[]>>({});
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [contactArtists, setContactArtists] = useState<Record<string, string[]>>({});
  const [artistFilter, setArtistFilter] = useState('all');

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalContactsCount, setTotalContactsCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchContacts({ reset: true });
      fetchEvents();
      fetchArtists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter, roleFilter, tagFilters, sourceFilter, cityFilter, departmentFilter, eventFilter, artistFilter, contactEvents, contactArtists]);

  const fetchRelationsForContacts = async (contactIds: string[]) => {
    if (contactIds.length === 0) return;

    try {
      const [eventsRes, artistsRes] = await Promise.all([
        supabase
          .from('contact_events')
          .select('contact_id, event_id')
          .in('contact_id', contactIds),
        supabase
          .from('contact_artists')
          .select('contact_id, artist_id')
          .in('contact_id', contactIds),
      ]);

      if (!eventsRes.error && eventsRes.data) {
        setContactEvents(prev => {
          const next = { ...prev };
          for (const ce of eventsRes.data) {
            const arr = next[ce.contact_id] ?? [];
            if (!arr.includes(ce.event_id)) next[ce.contact_id] = [...arr, ce.event_id];
          }
          return next;
        });
      }

      if (!artistsRes.error && artistsRes.data) {
        setContactArtists(prev => {
          const next = { ...prev };
          for (const ca of artistsRes.data) {
            const arr = next[ca.contact_id] ?? [];
            if (!arr.includes(ca.artist_id)) next[ca.contact_id] = [...arr, ca.artist_id];
          }
          return next;
        });
      }
    } catch {
      // Silent fail for relations loading
    }
  };

  const fetchContacts = async ({ reset }: { reset: boolean }) => {
    const targetPage = reset ? 0 : page;
    const from = targetPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    if (reset) {
      setLoading(true);
      setContacts([]);
      setFilteredContacts([]);
      setSelectedContactIds([]);
      setContactEvents({});
      setContactArtists({});
      setPage(0);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const { data, error, count } = await supabase
        .from('contacts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (typeof count === 'number') {
        setTotalContactsCount(count);
      }

      const newContacts = (data || []) as Contact[];

      let mergedCount = 0;
      setContacts(prev => {
        const merged = reset ? newContacts : [...prev, ...newContacts];
        mergedCount = merged.length;
        return merged;
      });

      setPage(reset ? 1 : targetPage + 1);

      const total = typeof count === 'number' ? count : totalContactsCount;
      setHasMore(total ? mergedCount < total : newContacts.length === PAGE_SIZE);

      // Charger les liens (événements/artistes) uniquement pour les contacts présents sur cette page
      await fetchRelationsForContacts(newContacts.map(c => c.id).filter(Boolean));
    } catch {
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
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
    } catch {
      // Silent fail for events loading
    }
  };

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setArtists(data || []);
    } catch {
      // Silent fail for artists loading
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

    if (artistFilter !== 'all') {
      filtered = filtered.filter(contact => {
        if (!contact.id) return false;
        const artists = contactArtists[contact.id] || [];
        return artists.includes(artistFilter);
      });
    }

    setFilteredContacts(filtered);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const confirmAction = useConfirm();
  const handleDelete = async (id: string) => {
    const ok = await confirmAction({ title: 'Supprimer le contact', description: 'Êtes-vous sûr de vouloir supprimer ce contact ?', variant: 'destructive' });
    if (!ok) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Contact supprimé avec succès');
      fetchContacts({ reset: true });
    } catch {
      toast.error('Erreur lors de la suppression du contact');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingContact(null);
  };

  const handleImportComplete = () => {
    fetchContacts({ reset: true });
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
      fetchContacts({ reset: true });
    } catch {
      toast.error('Erreur lors de la suppression des contacts');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkListAssignment = () => {
    setBulkListAssignmentOpen(true);
  };

  const handleContact = (contact: Contact, method: 'email' | 'phone') => {
    if (method === 'email' && contact.email) {
      setEmailComposer({
        isOpen: true,
        to: contact.email,
        toName: `${contact.first_name} ${contact.last_name}`,
      });
    } else if (method === 'phone' && contact.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
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
    setArtistFilter('all');
  };

  // Get unique values for filters
  const getUniqueValues = (key: keyof Contact) => {
    return Array.from(new Set(contacts.map(contact => contact[key]).filter(Boolean)));
  };

  const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));
  const availableSources = getUniqueValues('source') as string[];
  const availableCities = getUniqueValues('city') as string[];

  // Stats from database - use totalContactsCount for accurate total
  const [contactStats, setContactStats] = useState({ total: 0, clients: 0, prospects: 0, inactifs: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Fetch counts by status from database
        const [totalRes, clientsRes, prospectsRes, inactifsRes] = await Promise.all([
          supabase.from('contacts').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'client'),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'prospect'),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'inactif'),
        ]);

        setContactStats({
          total: totalRes.count || 0,
          clients: clientsRes.count || 0,
          prospects: prospectsRes.count || 0,
          inactifs: inactifsRes.count || 0,
        });
      } catch {
        // Fallback to loaded contacts if query fails
        setContactStats({
          total: contacts.length,
          clients: contacts.filter(c => c.status === 'client').length,
          prospects: contacts.filter(c => c.status === 'prospect').length,
          inactifs: contacts.filter(c => c.status === 'inactif').length,
        });
      }
    };

    fetchStats();
  }, [user, contacts.length]);

  const stats = contactStats;

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
            artistFilter={artistFilter}
            onArtistFilterChange={setArtistFilter}
            availableTags={availableTags}
            availableSources={availableSources}
            availableCities={availableCities}
            availableEvents={events}
            availableArtists={artists}
            totalContacts={totalContactsCount || contacts.length}
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
                  onContact={handleContact}
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
          fetchContacts({ reset: true });
          // Ne pas fermer le dialog ici - ContactDialog gère sa propre fermeture
          // pour permettre l'affichage de la suite de création
        }}
      />

      <CSVImporter
        isOpen={csvImportOpen}
        onClose={() => setCsvImportOpen(false)}
        onImport={handleImportComplete}
        contactLists={contactLists}
        onCreateList={async (listName, contactIds) => {
          await createContactList({ name: listName, contactIds });
        }}
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

      <EmailComposer
        isOpen={emailComposer.isOpen}
        onClose={() => setEmailComposer({ isOpen: false, to: '', toName: '' })}
        toEmail={emailComposer.to}
        subject=""
        preText=""
      />
    </div>
  );
};
