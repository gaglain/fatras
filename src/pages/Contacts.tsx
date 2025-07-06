
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit, Phone, Mail, MapPin, User, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CSVImporter } from '@/components/CSVImporter';
import { ContactForm } from '@/components/ContactForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  accepts_marketing_emails?: boolean;
  event_id?: string;
  event_type_id?: string;
  created_at: string;
  events?: { title: string };
  event_types?: { name: string; color?: string };
}

export const Contacts: React.FC = () => {
  console.log('👥 Contacts page loading');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImporter, setShowImporter] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);

  useEffect(() => {
    console.log('🔄 Loading contacts data');
    loadContacts();
    loadEventsAndEventTypes();
  }, []);

  useEffect(() => {
    // Filtrer les contacts selon le terme de recherche
    const filtered = contacts.filter(contact => {
      const searchLower = searchTerm.toLowerCase();
      return (
        contact.first_name.toLowerCase().includes(searchLower) ||
        contact.last_name.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.phone?.includes(searchTerm) ||
        contact.role?.toLowerCase().includes(searchLower) ||
        contact.city?.toLowerCase().includes(searchLower) ||
        contact.country?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredContacts(filtered);
    console.log('🔍 Filtered contacts:', filtered.length, 'of', contacts.length);
  }, [contacts, searchTerm]);

  const loadContacts = async () => {
    try {
      console.log('📊 Loading contacts from database');
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          events:event_id(title),
          event_types:event_type_id(name, color)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading contacts:', error);
        toast.error('Erreur lors du chargement des contacts');
        return;
      }

      console.log('✅ Contacts loaded:', data?.length || 0);
      setContacts(data || []);
    } catch (error) {
      console.error('❌ Exception loading contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadEventsAndEventTypes = async () => {
    try {
      // Charger les événements
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title')
        .order('title');
      setEvents(eventsData || []);

      // Charger les types d'événement
      const { data: eventTypesData } = await supabase
        .from('event_types')
        .select('id, name, color')
        .order('name');
      setEventTypes(eventTypesData || []);

      console.log('✅ Events and event types loaded');
    } catch (error) {
      console.error('Error loading events/event types:', error);
    }
  };

  const handleImport = (importedContacts: any[]) => {
    console.log('📥 Handling imported contacts:', importedContacts.length);
    toast.success(`${importedContacts.length} contacts importés !`);
    loadContacts(); // Recharger la liste
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }

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

      toast.success('Contact supprimé');
      loadContacts();
    } catch (error) {
      console.error('Exception deleting contact:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
  };

  const handleContactSaved = () => {
    setShowContactForm(false);
    setEditingContact(null);
    loadContacts();
  };

  const getEventTypeBadge = (eventType: any) => {
    if (!eventType) return null;
    
    return (
      <Badge 
        style={{ 
          backgroundColor: eventType.color || '#3B82F6',
          color: 'white'
        }}
        className="text-xs"
      >
        {eventType.name}
      </Badge>
    );
  };

  const formatAddress = (contact: Contact) => {
    const parts = [];
    if (contact.address) parts.push(contact.address);
    if (contact.postal_code || contact.city) {
      const cityPart = [contact.postal_code, contact.city].filter(Boolean).join(' ');
      if (cityPart) parts.push(cityPart);
    }
    if (contact.country) parts.push(contact.country);
    return parts.join(', ');
  };

  if (loading) {
    console.log('⏳ Contacts page loading...');
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des contacts...</p>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering contacts page with', filteredContacts.length, 'contacts');

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gérez vos contacts et organisez vos relations professionnelles
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={() => setShowImporter(true)}
            variant="outline"
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            <span>Importer CSV</span>
          </Button>
          <Button 
            onClick={() => setShowContactForm(true)}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Contact</span>
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xl md:text-2xl font-bold">{contacts.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Total Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {contacts.filter(c => c.accepts_marketing_emails).length}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">Marketing OK</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {events.length}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">Événements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {eventTypes.length}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">Types d'événements</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des contacts */}
      <div className="grid gap-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun contact trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {contacts.length === 0 
                  ? "Commencez par ajouter des contacts ou importer un fichier CSV"
                  : "Aucun contact ne correspond à votre recherche"
                }
              </p>
              {contacts.length === 0 && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => setShowImporter(true)} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer des contacts
                  </Button>
                  <Button onClick={() => setShowContactForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau contact
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {contact.first_name} {contact.last_name}
                          </h3>
                          {contact.role && (
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {contact.event_types && getEventTypeBadge(contact.event_types)}
                        {contact.accepts_marketing_emails && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Marketing OK
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      {contact.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="break-all">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {formatAddress(contact) && (
                        <div className="flex items-start space-x-2 lg:col-span-2">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{formatAddress(contact)}</span>
                        </div>
                      )}
                      {contact.events && (
                        <div className="flex items-center space-x-2 lg:col-span-2">
                          <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{contact.events.title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 md:ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditContact(contact)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Modifier</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:ml-2">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* CSV Importer */}
      <CSVImporter
        isOpen={showImporter}
        onClose={() => setShowImporter(false)}
        onImport={handleImport}
      />

      {/* Contact Form */}
      <ContactForm
        isOpen={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setEditingContact(null);
        }}
        onSave={handleContactSaved}
        contact={editingContact}
        events={events}
        eventTypes={eventTypes}
      />
    </div>
  );
};
