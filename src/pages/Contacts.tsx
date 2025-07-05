
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Download, Upload, Trash2, Edit, Phone, Mail, MapPin, User, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CSVImporter } from '@/components/CSVImporter';
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
  accepts_marketing_emails?: boolean;
  event_id?: string;
  event_type_id?: string;
  created_at: string;
  events?: { title: string };
  event_types?: { name: string };
}

export const Contacts: React.FC = () => {
  console.log('👥 Contacts page loading');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImporter, setShowImporter] = useState(false);
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
        contact.role?.toLowerCase().includes(searchLower)
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
          event_types:event_type_id(name)
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Gérez vos contacts et organisez vos relations professionnelles
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowImporter(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Importer CSV</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nouveau Contact</span>
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{contacts.length}</div>
            <div className="text-sm text-muted-foreground">Total Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.accepts_marketing_emails).length}
            </div>
            <div className="text-sm text-muted-foreground">Acceptent le marketing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {events.length}
            </div>
            <div className="text-sm text-muted-foreground">Événements liés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {eventTypes.length}
            </div>
            <div className="text-sm text-muted-foreground">Types d'événements</div>
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
                <Button onClick={() => setShowImporter(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer des contacts
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
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
                      <div className="flex items-center space-x-2">
                        {contact.event_types && getEventTypeBadge(contact.event_types)}
                        {contact.accepts_marketing_emails && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Marketing OK
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {contact.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{contact.address}</span>
                        </div>
                      )}
                      {contact.events && (
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{contact.events.title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
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
    </div>
  );
};
