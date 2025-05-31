import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Phone, Mail, User, Calendar, ExternalLink, Globe } from 'lucide-react';
import { EmailPopup } from '@/components/EmailPopup';
import { useUser } from '@/contexts/UserContext';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  ownerId: string;
  company?: string;
  role?: string;
  linkedEventIds?: string[];
  source?: 'manual' | 'website';
  message?: string;
  eventName?: string;
  eventType?: string;
}

const sampleContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@venue.com',
    ownerId: 'user-1',
    company: 'Madison Square Garden',
    role: 'Gestionnaire de Lieu',
    linkedEventIds: ['event-1', 'event-3']
  },
  {
    id: 'contact-2',
    name: 'Sarah Wilson',
    phone: '+1 (555) 987-6543',
    email: 'sarah@festivalprods.com',
    ownerId: 'user-2',
    company: 'Festival Productions',
    role: 'Coordinateur d\'Événements',
    linkedEventIds: ['event-1', 'event-2']
  },
  {
    id: 'contact-3',
    name: 'Mike Rodriguez',
    phone: '+1 (555) 456-7890',
    email: 'mike.r@soundtech.com',
    ownerId: 'user-1',
    company: 'Sound Tech Solutions',
    role: 'Ingénieur Audio',
    linkedEventIds: ['event-3']
  },
  {
    id: 'contact-4',
    name: 'Marie Dubois',
    phone: '+33 6 12 34 56 78',
    email: 'marie.dubois@festival-ete.fr',
    ownerId: 'user-1',
    company: 'Festival d\'Été de Lyon',
    role: 'Coordinatrice Événements',
    source: 'website',
    eventName: 'Festival d\'Été 2024',
    eventType: 'festival',
    message: 'Bonjour, nous organisons un festival d\'été à Lyon et aimerions avoir des informations sur vos spectacles disponibles en juillet.'
  }
];

// Sample events for linking
const sampleEvents = [
  { id: 'event-1', name: 'Festival de Musique d\'Été 2024', date: '2024-07-15', ownerId: 'user-1' },
  { id: 'event-2', name: 'Soirée Acoustique', date: '2024-06-20', ownerId: 'user-2' },
  { id: 'event-3', name: 'Tournée Rock Legends', date: '2024-08-10', ownerId: 'user-1' }
];

export const Contacts: React.FC = () => {
  const { currentUser, users, getUserPermissions, changeOwnership } = useUser();
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [events, setEvents] = useState(sampleEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [emailPopup, setEmailPopup] = useState<{ show: boolean; email: string; contactName: string }>({
    show: false,
    email: '',
    contactName: ''
  });

  const permissions = currentUser ? getUserPermissions(currentUser) : null;

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Show all contacts if user can edit all, otherwise only show owned contacts
    const canView = permissions?.canEditAllContacts || contact.ownerId === currentUser?.id;
    
    return matchesSearch && canView;
  });

  const getLinkedEvents = (eventIds?: string[]) => {
    if (!eventIds) return [];
    return events.filter(event => eventIds.includes(event.id));
  };

  const handleEmailClick = (email: string, contactName: string) => {
    setEmailPopup({ show: true, email, contactName });
  };

  const handleOwnershipChange = (contactId: string, newOwnerId: string) => {
    // Update contact ownership
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, ownerId: newOwnerId } : contact
    ));

    // Update linked events ownership
    const contact = contacts.find(c => c.id === contactId);
    if (contact?.linkedEventIds) {
      setEvents(prev => prev.map(event => 
        contact.linkedEventIds?.includes(event.id) 
          ? { ...event, ownerId: newOwnerId }
          : event
      ));
    }

    changeOwnership('contact', contactId, newOwnerId);
  };

  const getOwnerName = (ownerId: string) => {
    const owner = users.find(user => user.id === ownerId);
    return owner?.name || 'Utilisateur inconnu';
  };

  const renderContactModal = () => {
    if (!selectedContact) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedContact.source === 'website' && <Globe className="h-5 w-5 text-blue-500" />}
              <span>{selectedContact.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <p className="text-gray-700">{selectedContact.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <p className="text-gray-700">{selectedContact.phone}</p>
              </div>
              {selectedContact.company && (
                <div>
                  <label className="block text-sm font-medium mb-1">Entreprise</label>
                  <p className="text-gray-700">{selectedContact.company}</p>
                </div>
              )}
              {selectedContact.role && (
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle</label>
                  <p className="text-gray-700">{selectedContact.role}</p>
                </div>
              )}
            </div>

            {selectedContact.source === 'website' && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-blue-900">Demande de Booking</h4>
                {selectedContact.eventName && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-800">Événement</label>
                    <p className="text-blue-700">{selectedContact.eventName}</p>
                  </div>
                )}
                {selectedContact.eventType && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-800">Type d'événement</label>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedContact.eventType}
                    </Badge>
                  </div>
                )}
                {selectedContact.message && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-blue-800">Message</label>
                    <p className="text-blue-700 bg-white p-3 rounded border">
                      {selectedContact.message}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button onClick={() => setSelectedContact(null)} variant="outline" className="flex-1">
                Fermer
              </Button>
              <Button 
                onClick={() => handleEmailClick(selectedContact.email, selectedContact.name)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Répondre
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!currentUser || !permissions) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Gérer vos gestionnaires de lieux, promoteurs et contacts de l'industrie</p>
        </div>
        {permissions.canCreateContacts && (
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Contact
          </Button>
        )}
      </div>

      {/* Search and Filters */}
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
        <Button variant="outline">Importer Contacts</Button>
        <Button variant="outline">Exporter</Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    {contact.source === 'website' && (
                      <Globe className="h-4 w-4 text-blue-500" title="Contact depuis le site web" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{contact.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-purple-600"
                onClick={() => handleEmailClick(contact.email, contact.name)}
              >
                <Mail className="h-4 w-4 mr-2" />
                {contact.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {contact.phone}
              </div>
              {contact.company && (
                <div className="text-sm text-gray-600">
                  <strong>Entreprise:</strong> {contact.company}
                </div>
              )}

              {/* Website Contact Badge */}
              {contact.source === 'website' && (
                <Badge className="bg-blue-100 text-blue-800">
                  Demande de booking
                </Badge>
              )}
              
              {/* Owner Management */}
              <div className="text-sm">
                <strong className="text-gray-700">Propriétaire:</strong>
                {permissions.canEditAllContacts ? (
                  <Select
                    value={contact.ownerId}
                    onValueChange={(value) => handleOwnershipChange(contact.id, value)}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(user => user.isActive).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="ml-2 text-gray-600">{getOwnerName(contact.ownerId)}</span>
                )}
              </div>

              {/* Linked Events */}
              {contact.linkedEventIds && contact.linkedEventIds.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Événements liés:</span>
                  </div>
                  <div className="space-y-1">
                    {getLinkedEvents(contact.linkedEventIds).map((event) => (
                      <div key={event.id} className="text-xs bg-blue-50 p-2 rounded">
                        <div className="font-medium text-blue-800">{event.name}</div>
                        <div className="text-blue-600">{new Date(event.date).toLocaleDateString('fr-FR')}</div>
                        <div className="text-xs text-gray-500">Propriétaire: {getOwnerName(event.ownerId)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedContact(contact)}
                >
                  {contact.source === 'website' ? 'Voir Demande' : 'Détails'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEmailClick(contact.email, contact.name)}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Contact Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ajouter Nouveau Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Nom complet" />
              <Input placeholder="Adresse email" />
              <Input placeholder="Numéro de téléphone" />
              <Input placeholder="Entreprise" />
              <Input placeholder="Rôle/Titre" />
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Propriétaire</label>
                <Select defaultValue={currentUser.id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(user => user.isActive).map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Sauvegarder Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Details Modal */}
      {renderContactModal()}

      {/* Email Popup */}
      <EmailPopup
        isOpen={emailPopup.show}
        onClose={() => setEmailPopup({ show: false, email: '', contactName: '' })}
        email={emailPopup.email}
        contactName={emailPopup.contactName}
      />
    </div>
  );
};
