import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, Download, Mail, List, Grid, LayoutList, Loader2, Merge, Users, MailWarning } from 'lucide-react';
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
import { ContactEmailValidator } from '@/components/contacts/ContactEmailValidator';
import { EmailComposer } from '@/components/email/EmailComposer';
import { ContactsHeader } from './contacts/ContactsHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useContactLists } from '@/hooks/useContactLists';
import { toast } from 'sonner';
import { Contact } from '@/types/contact.types';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 500;

export const Contacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [emailComposer, setEmailComposer] = useState<{ isOpen: boolean; to: string; toName: string }>({ isOpen: false, to: '', toName: '' });
  const [events, setEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [contactEvents, setContactEvents] = useState<Record<string, string[]>>({});
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [contactArtists, setContactArtists] = useState<Record<string, string[]>>({});
  const [artistFilter, setArtistFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalContactsCount, setTotalContactsCount] = useState<number>(0);
  const [contactStats, setContactStats] = useState({ total: 0, clients: 0, prospects: 0, inactifs: 0 });

  useEffect(() => { if (user) { fetchContacts({ reset: true }); fetchEvents(); fetchArtists(); } }, [user]);
  useEffect(() => { filterContacts(); }, [contacts, searchTerm, statusFilter, roleFilter, tagFilters, sourceFilter, cityFilter, departmentFilter, eventFilter, artistFilter, contactEvents, contactArtists]);

  // Auto-load all remaining pages when any filter is active so search/filters cover the full DB
  const hasActiveFilter = (
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    roleFilter !== 'all' ||
    tagFilters.length > 0 ||
    sourceFilter !== 'all' ||
    cityFilter !== 'all' ||
    departmentFilter.trim() !== '' ||
    eventFilter !== 'all' ||
    artistFilter !== 'all'
  );
  useEffect(() => {
    if (hasActiveFilter && hasMore && !isLoadingMore && !loading) {
      fetchContacts({ reset: false });
    }
  }, [hasActiveFilter, hasMore, isLoadingMore, loading]);

  // Open the contact creation dialog with prefilled data when arriving with ?prefillEmail / ?prefillName / ?prefillPhone
  useEffect(() => {
    const prefillEmail = searchParams.get('prefillEmail');
    const prefillName = searchParams.get('prefillName') || '';
    const prefillPhone = searchParams.get('prefillPhone');
    if (!prefillEmail && !prefillPhone) return;

    const cleanName = prefillName.replace(/<[^>]+>/g, '').replace(/"/g, '').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ') || '';

    setActiveTab('contacts');
    setEditingContact({
      first_name,
      last_name,
      email: prefillEmail || '',
      phone: prefillPhone || '',
      position: '', company: '',
      address: '', city: '', postal_code: '', country: 'France',
      status: 'prospect', source: prefillPhone ? 'phone' : 'email', notes: '', tags: [], role: 'contact',
    } as Contact);
    setDialogOpen(true);

    // Clean URL so refreshing doesn't re-open the dialog
    const next = new URLSearchParams(searchParams);
    next.delete('prefillEmail');
    next.delete('prefillName');
    next.delete('prefillPhone');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const [totalRes, clientsRes, prospectsRes, inactifsRes] = await Promise.all([
          supabase.from('contacts').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'client'),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'prospect'),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'inactif'),
        ]);
        setContactStats({ total: totalRes.count || 0, clients: clientsRes.count || 0, prospects: prospectsRes.count || 0, inactifs: inactifsRes.count || 0 });
      } catch {
        setContactStats({ total: contacts.length, clients: contacts.filter(c => c.status === 'client').length, prospects: contacts.filter(c => c.status === 'prospect').length, inactifs: contacts.filter(c => c.status === 'inactif').length });
      }
    };
    fetchStats();
  }, [user, contacts.length]);

  const fetchRelationsForContacts = async (contactIds: string[]) => {
    if (contactIds.length === 0) return;
    try {
      const [eventsRes, artistsRes] = await Promise.all([
        supabase.from('contact_events').select('contact_id, event_id').in('contact_id', contactIds),
        supabase.from('contact_artists').select('contact_id, artist_id').in('contact_id', contactIds),
      ]);
      if (!eventsRes.error && eventsRes.data) {
        setContactEvents(prev => { const next = { ...prev }; for (const ce of eventsRes.data) { const arr = next[ce.contact_id] ?? []; if (!arr.includes(ce.event_id)) next[ce.contact_id] = [...arr, ce.event_id]; } return next; });
      }
      if (!artistsRes.error && artistsRes.data) {
        setContactArtists(prev => { const next = { ...prev }; for (const ca of artistsRes.data) { const arr = next[ca.contact_id] ?? []; if (!arr.includes(ca.artist_id)) next[ca.contact_id] = [...arr, ca.artist_id]; } return next; });
      }
    } catch {}
  };

  const fetchContacts = async ({ reset, silent = false }: { reset: boolean; silent?: boolean }) => {
    const targetPage = reset ? 0 : page;
    const from = targetPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    if (reset) { if (!silent) setLoading(true); setContacts([]); setFilteredContacts([]); setSelectedContactIds([]); setContactEvents({}); setContactArtists({}); setPage(0); } else { setIsLoadingMore(true); }
    try {
      const { data, error, count } = await supabase.from('contacts').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      if (typeof count === 'number') setTotalContactsCount(count);
      const newContacts = (data || []) as Contact[];
      let mergedCount = 0;
      setContacts(prev => { const merged = reset ? newContacts : [...prev, ...newContacts]; mergedCount = merged.length; return merged; });
      setPage(reset ? 1 : targetPage + 1);
      const total = typeof count === 'number' ? count : totalContactsCount;
      setHasMore(total ? mergedCount < total : newContacts.length === PAGE_SIZE);
      await fetchRelationsForContacts(newContacts.map(c => c.id).filter(Boolean));
    } catch { toast.error('Erreur lors du chargement des contacts'); } finally { if (!silent) setLoading(false); setIsLoadingMore(false); }
  };

  const fetchEvents = async () => { try { const { data } = await supabase.from('events').select('id, title').order('start_date', { ascending: false }); setEvents(data || []); } catch {} };
  const fetchArtists = async () => { try { const { data } = await supabase.from('centralized_artists').select('id, name').order('name'); setArtists(data || []); } catch {} };

  const filterContacts = () => {
    let filtered = contacts;
    if (searchTerm) filtered = filtered.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase()) || c.position?.toLowerCase().includes(searchTerm.toLowerCase()) || c.city?.toLowerCase().includes(searchTerm.toLowerCase()) || c.company?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter);
    if (roleFilter !== 'all') filtered = filtered.filter(c => c.role === roleFilter);
    if (tagFilters.length > 0) filtered = filtered.filter(c => c.tags && c.tags.some(tag => tagFilters.includes(tag)));
    if (sourceFilter !== 'all') filtered = filtered.filter(c => c.source === sourceFilter);
    if (cityFilter !== 'all') filtered = filtered.filter(c => c.city === cityFilter);
    if (departmentFilter) filtered = filtered.filter(c => c.postal_code && c.postal_code.startsWith(departmentFilter));
    if (eventFilter !== 'all') filtered = filtered.filter(c => c.id && (contactEvents[c.id] || []).includes(eventFilter));
    if (artistFilter !== 'all') filtered = filtered.filter(c => c.id && (contactArtists[c.id] || []).includes(artistFilter));
    setFilteredContacts(filtered);
  };

  const confirmAction = useConfirm();
  const handleDelete = async (id: string) => {
    const ok = await confirmAction({ title: 'Supprimer le contact', description: 'Êtes-vous sûr de vouloir supprimer ce contact ? Les événements, devis et tâches liés seront conservés mais désassociés.', variant: 'destructive' });
    if (!ok) return;
    try {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Contact supprimé avec succès');
      fetchContacts({ reset: true });
    } catch (e: any) {
      toast.error(`Erreur lors de la suppression : ${e?.message || 'inconnue'}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContactIds.length === 0) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('contacts').delete().in('id', selectedContactIds);
      if (error) throw error;
      toast.success(`${selectedContactIds.length} contact(s) supprimé(s) avec succès`);
      setSelectedContactIds([]);
      fetchContacts({ reset: true });
    } catch (e: any) {
      toast.error(`Erreur lors de la suppression : ${e?.message || 'inconnue'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleContact = (contact: Contact, method: 'email' | 'phone') => {
    if (method === 'email' && contact.email) setEmailComposer({ isOpen: true, to: contact.email, toName: `${contact.first_name} ${contact.last_name}` });
    else if (method === 'phone' && contact.phone) window.location.href = `tel:${contact.phone}`;
  };

  const clearAllFilters = () => { setSearchTerm(''); setStatusFilter('all'); setRoleFilter('all'); setTagFilters([]); setSourceFilter('all'); setCityFilter('all'); setDepartmentFilter(''); setEventFilter('all'); setArtistFilter('all'); };
  const availableTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));
  const availableSources = Array.from(new Set(contacts.map(c => c.source).filter(Boolean))) as string[];
  const availableCities = Array.from(new Set(contacts.map(c => c.city).filter(Boolean))) as string[];

  if (loading) return <div className="flex items-center justify-center min-h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <ContactsHeader stats={contactStats} onNewContact={() => setDialogOpen(true)} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contacts" className="flex items-center gap-2"><Users className="h-4 w-4" />Contacts ({contactStats.total})</TabsTrigger>
          <TabsTrigger value="lists" className="flex items-center gap-2"><List className="h-4 w-4" />Listes</TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-2"><Merge className="h-4 w-4" />Doublons</TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2"><MailWarning className="h-4 w-4" />Vérif. emails</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-2">
            <div className="flex space-x-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}><Grid className="h-4 w-4 mr-2" />Grille</Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}><LayoutList className="h-4 w-4 mr-2" />Liste</Button>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setCsvImportOpen(true)} variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Importer CSV</span><span className="sm:hidden">Import</span></Button>
              <Button onClick={() => setCsvExportOpen(true)} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Exporter CSV</span><span className="sm:hidden">Export</span></Button>
            </div>
          </div>

          <ContactFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} tagFilters={tagFilters} onTagFiltersChange={setTagFilters} sourceFilter={sourceFilter} onSourceFilterChange={setSourceFilter} cityFilter={cityFilter} onCityFilterChange={setCityFilter} departmentFilter={departmentFilter} onDepartmentFilterChange={setDepartmentFilter} eventFilter={eventFilter} onEventFilterChange={setEventFilter} artistFilter={artistFilter} onArtistFilterChange={setArtistFilter} availableTags={availableTags} availableSources={availableSources} availableCities={availableCities} availableEvents={events} availableArtists={artists} totalContacts={totalContactsCount || contacts.length} filteredCount={filteredContacts.length} onClearFilters={clearAllFilters} />

          {filteredContacts.length > 0 && <BulkContactActions selectedContacts={selectedContactIds} totalContacts={filteredContacts.length} onSelectAll={(s) => s ? setSelectedContactIds(filteredContacts.map(c => c.id!).filter(Boolean)) : setSelectedContactIds([])} onClearSelection={() => setSelectedContactIds([])} onBulkDelete={handleBulkDelete} isDeleting={isDeleting} />}

          {selectedContactIds.length > 0 && (
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:gap-2">
              <Button onClick={() => setBulkListAssignmentOpen(true)} variant="outline" size="sm"><List className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Ajouter à une liste</span><span className="sm:hidden">Ajouter</span></Button>
            </div>
          )}

          {filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{contacts.length === 0 ? 'Aucun contact' : 'Aucun résultat'}</h3>
              <p className="text-muted-foreground mb-4">{contacts.length === 0 ? 'Commencez par ajouter votre premier contact' : 'Essayez de modifier vos filtres de recherche'}</p>
              {contacts.length === 0 && <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Ajouter un contact</Button>}
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" : "space-y-2"}>
                {filteredContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} onEdit={(c) => { setEditingContact(c); setDialogOpen(true); }} onDelete={handleDelete} onContact={handleContact} isSelected={selectedContactIds.includes(contact.id!)} onSelect={(s) => s ? setSelectedContactIds(prev => [...prev, contact.id!]) : setSelectedContactIds(prev => prev.filter(id => id !== contact.id!))} viewMode={viewMode} />
                ))}
              </div>
              {hasMore && (
                <div className="flex flex-col items-center gap-2 py-6">
                  <p className="text-sm text-muted-foreground">
                    {contacts.length} sur {totalContactsCount} contacts chargés
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchContacts({ reset: false })} disabled={isLoadingMore}>
                      {isLoadingMore ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Charger {Math.min(PAGE_SIZE, totalContactsCount - contacts.length)} de plus
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={isLoadingMore}
                      onClick={async () => {
                        setIsLoadingMore(true);
                        try {
                          const { data, error } = await supabase
                            .from('contacts')
                            .select('*')
                            .order('created_at', { ascending: false })
                            .range(contacts.length, totalContactsCount - 1);
                          if (error) throw error;
                          const rest = (data || []) as Contact[];
                          setContacts(prev => [...prev, ...rest]);
                          await fetchRelationsForContacts(rest.map(c => c.id!).filter(Boolean));
                          setHasMore(false);
                          toast.success(`${rest.length} contacts supplémentaires chargés`);
                        } catch {
                          toast.error('Erreur lors du chargement complet');
                        } finally {
                          setIsLoadingMore(false);
                        }
                      }}
                    >
                      Tout charger ({totalContactsCount})
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="lists" className="space-y-6"><ContactLists /></TabsContent>
        <TabsContent value="duplicates" className="space-y-6"><ContactDuplicateScanner onMergeComplete={() => fetchContacts({ reset: true })} /></TabsContent>
        <TabsContent value="emails" className="space-y-6"><ContactEmailValidator /></TabsContent>
      </Tabs>

      <ContactDialog isOpen={dialogOpen} onClose={() => { setDialogOpen(false); setEditingContact(null); }} contact={editingContact} onSave={() => fetchContacts({ reset: true })} />
      <CSVImporter isOpen={csvImportOpen} onClose={() => setCsvImportOpen(false)} onImport={() => { fetchContacts({ reset: true, silent: true }); }} contactLists={contactLists} onCreateList={async (listName, contactIds) => { await createContactList({ name: listName, contactIds }); }} />
      <CSVExporter isOpen={csvExportOpen} onClose={() => setCsvExportOpen(false)} contacts={filteredContacts} />
      <BulkContactListAssignment isOpen={bulkListAssignmentOpen} onClose={() => setBulkListAssignmentOpen(false)} selectedContactIds={selectedContactIds} contactLists={contactLists} onListCreated={() => { setSelectedContactIds([]); setBulkListAssignmentOpen(false); }} />
      <EmailComposer isOpen={emailComposer.isOpen} onClose={() => setEmailComposer({ isOpen: false, to: '', toName: '' })} toEmail={emailComposer.to} subject="" preText="" />
    </div>
  );
};
