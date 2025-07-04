
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Phone, Mail, User, Trash2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CSVImporter } from '@/components/CSVImporter';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  eventId?: string;
  eventTypeId?: string;
  role?: string;
  address?: string;
  acceptsMarketingEmails: boolean;
  source?: 'manual' | 'website' | 'csv';
}

interface Event {
  id: string;
  title: string;
}

interface EventType {
  id: string;
  name: string;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVImporter, setShowCSVImporter] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventId: '',
    eventTypeId: '',
    role: '',
    address: '',
    acceptsMarketingEmails: true
  });

  useEffect(() => {
    fetchContacts();
    fetchEvents();
    fetchEventTypes();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          event_id,
          event_type_id,
          role,
          address,
          accepts_marketing_emails,
          source,
          events(title),
          event_types(name)
        `);

      if (error) throw error;

      const formattedContacts: Contact[] = data?.map(contact => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email || '',
        phone: contact.phone || '',
        eventId: contact.event_id,
        eventTypeId: contact.event_type_id,
        role: contact.role,
        address: contact.address,
        acceptsMarketingEmails: contact.accepts_marketing_emails ?? true,
        source: contact.source as 'manual' | 'website' | 'csv' || 'manual'
      })) || [];

      setContacts(formattedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setEventTypes(data || []);
    } catch (error) {
      console.error('Error fetching event types:', error);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           contact.address?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact supprimé');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleAddContact = async () => {
    if (!newContact.firstName || !newContact.lastName || !newContact.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Utilisateur non connecté');
        return;
      }

      const contactData = {
        user_id: userData.user.id,
        first_name: newContact.firstName,
        last_name: newContact.lastName,
        email: newContact.email,
        phone: newContact.phone || null,
        event_id: newContact.eventId || null,
        event_type_id: newContact.eventTypeId || null,
        role: newContact.role || null,
        address: newContact.address || null,
        accepts_marketing_emails: newContact.acceptsMarketingEmails,
        source: 'manual'
      };

      const { error } = await supabase
        .from('contacts')
        .insert([contactData]);

      if (error) throw error;

      await fetchContacts();
      setNewContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        eventId: '',
        eventTypeId: '',
        role: '',
        address: '',
        acceptsMarketingEmails: true
      });
      setShowAddForm(false);
      toast.success('Contact ajouté');
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Erreur lors de l\'ajout du contact');
    }
  };

  const handleCSVImport = async (importedContacts: any[]) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Utilisateur non connecté');
        return;
      }

      const contactsToInsert = importedContacts.map(contact => ({
        user_id: userData.user.id,
        first_name: contact.firstName || '',
        last_name: contact.lastName || '',
        email: contact.email || '',
        phone: contact.phone || null,
        event_id: contact.eventId || null,
        event_type_id: contact.eventTypeId || null,
        role: contact.role || null,
        address: contact.address || null,
        accepts_marketing_emails: contact.acceptsMarketingEmails ?? true,
        source: 'csv'
      }));

      const { error } = await supabase
        .from('contacts')
        .insert(contactsToInsert);

      if (error) throw error;

      await fetchContacts();
      toast.success(`${importedContacts.length} contacts importés avec succès`);
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast.error('Erreur lors de l\'importation');
    }
  };

  const getEventName = (eventId?: string) => {
    if (!eventId) return '';
    const event = events.find(e => e.id === eventId);
    return event ? event.title : '';
  };

  const getEventTypeName = (eventTypeId?: string) => {
    if (!eventTypeId) return '';
    const eventType = eventTypes.find(et => et.id === eventTypeId);
    return eventType ? eventType.name : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Gérer vos gestionnaires de lieux, promoteurs et contacts de l'industrie</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowCSVImporter(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Contact
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Exporter</Button>
      </div>

      {filteredContacts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contact trouvé</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre premier contact</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{contact.firstName} {contact.lastName}</CardTitle>
                    <p className="text-sm text-gray-500">{contact.role}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={contact.acceptsMarketingEmails ? 'bg-green-100 text-green-800 text-xs' : 'bg-red-100 text-red-800 text-xs'}>
                      {contact.acceptsMarketingEmails ? '✓ Marketing' : '✗ Marketing'}
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce contact ? Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteContact(contact.id)} className="bg-red-600 hover:bg-red-700">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                  onClick={() => handleEmailClick(contact.email)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {contact.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {contact.phone}
                </div>
                {contact.address && (
                  <div className="text-sm text-gray-600">
                    <strong>Adresse:</strong> {contact.address}
                  </div>
                )}
                {getEventName(contact.eventId) && (
                  <div className="text-sm text-gray-600">
                    <strong>Événement:</strong> {getEventName(contact.eventId)}
                  </div>
                )}
                {getEventTypeName(contact.eventTypeId) && (
                  <div className="text-sm text-gray-600">
                    <strong>Type:</strong> {getEventTypeName(contact.eventTypeId)}
                  </div>
                )}

                <div className="flex space-x-2 pt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEmailClick(contact.email)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Ajouter Nouveau Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Prénom *" 
                  value={newContact.firstName}
                  onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                />
                <Input 
                  placeholder="Nom *" 
                  value={newContact.lastName}
                  onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                />
              </div>
              <Input 
                placeholder="Adresse email *" 
                value={newContact.email}
                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
              />
              <Input 
                placeholder="Numéro de téléphone" 
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
              />
              <Input 
                placeholder="Adresse" 
                value={newContact.address}
                onChange={(e) => setNewContact({...newContact, address: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Événement</label>
                  <Select value={newContact.eventId} onValueChange={(value) => setNewContact({...newContact, eventId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un événement" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type d'événement</label>
                  <Select value={newContact.eventTypeId} onValueChange={(value) => setNewContact({...newContact, eventTypeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(eventType => (
                        <SelectItem key={eventType.id} value={eventType.id}>{eventType.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Input 
                placeholder="Rôle/Titre" 
                value={newContact.role}
                onChange={(e) => setNewContact({...newContact, role: e.target.value})}
              />
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newContact.acceptsMarketingEmails}
                  onCheckedChange={(checked) => setNewContact({...newContact, acceptsMarketingEmails: checked})}
                />
                <label className="text-sm font-medium">Accepte les emails marketing</label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleAddContact} className="flex-1">
                  Sauvegarder Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CSVImporter 
        isOpen={showCSVImporter}
        onClose={() => setShowCSVImporter(false)}
        onImport={handleCSVImport}
      />
    </div>
  );
};
