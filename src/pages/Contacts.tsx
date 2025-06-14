
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Phone, Mail, User, Calendar, ExternalLink, Globe, FileText, CheckSquare, History, Upload, Trash2 } from 'lucide-react';
import { EmailPopup } from '@/components/EmailPopup';
import { useUser } from '@/contexts/UserContext';
import { CSVImporter } from '@/components/CSVImporter';
import { CreateEventFromContact } from '@/components/contacts/CreateEventFromContact';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  ownerId: string;
  company?: string;
  role?: string;
  linkedEventIds?: string[];
  source?: 'manual' | 'website' | 'csv';
  message?: string;
  eventName?: string;
  eventType?: string;
  contractIds?: string[];
  taskIds?: string[];
  acceptsPromotionalEmails: boolean;
  activityHistory?: Array<{
    id: string;
    type: 'email' | 'call' | 'meeting' | 'contract' | 'event';
    description: string;
    date: string;
    user: string;
  }>;
}

// Données nettoyées - seulement quelques exemples
const sampleContacts: Contact[] = [];

const sampleContracts = [];
const sampleTasks = [];
const sampleEvents = [];

export const Contacts: React.FC = () => {
  const { currentUser, users, getUserPermissions, changeOwnership } = useUser();
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [events, setEvents] = useState(sampleEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showCSVImporter, setShowCSVImporter] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    ownerId: currentUser?.id || 'user-1',
    acceptsPromotionalEmails: true
  });
  const [emailPopup, setEmailPopup] = useState<{ show: boolean; email: string; contactName: string }>({
    show: false,
    email: '',
    contactName: ''
  });

  const permissions = currentUser ? getUserPermissions(currentUser) : null;

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, ownerId: newOwnerId } : contact
    ));

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

  const handleDeleteContact = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    
    if (contact?.linkedEventIds) {
      setEvents(prev => prev.filter(event => !contact.linkedEventIds?.includes(event.id)));
    }
    
    setContacts(prev => prev.filter(c => c.id !== contactId));
    
    console.log(`Contact ${contactId} and linked events deleted`);
  };

  const handleAddContact = () => {
    if (!newContact.firstName || !newContact.lastName || !newContact.email) {
      return;
    }

    const contact: Contact = {
      id: `contact-${Date.now()}`,
      firstName: newContact.firstName,
      lastName: newContact.lastName,
      email: newContact.email,
      phone: newContact.phone,
      company: newContact.company,
      role: newContact.role,
      ownerId: newContact.ownerId,
      acceptsPromotionalEmails: newContact.acceptsPromotionalEmails,
      source: 'manual',
      linkedEventIds: [],
      contractIds: [],
      taskIds: [],
      activityHistory: [{
        id: `activity-${Date.now()}`,
        type: 'email',
        description: 'Contact créé manuellement',
        date: new Date().toISOString(),
        user: currentUser?.name || 'Utilisateur'
      }]
    };

    setContacts(prev => [...prev, contact]);
    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      ownerId: currentUser?.id || 'user-1',
      acceptsPromotionalEmails: true
    });
    setShowAddForm(false);
  };

  const getOwnerName = (ownerId: string) => {
    const owner = users.find(user => user.id === ownerId);
    return owner?.name || 'Utilisateur inconnu';
  };

  const handleCSVImport = (importedContacts: any[]) => {
    const newContacts = importedContacts.map((contact, index) => ({
      id: `imported-${Date.now()}-${index}`,
      firstName: contact.firstName || contact.name?.split(' ')[0] || '',
      lastName: contact.lastName || contact.name?.split(' ').slice(1).join(' ') || '',
      phone: contact.phone || '',
      email: contact.email || '',
      ownerId: currentUser?.id || 'user-1',
      company: contact.company,
      role: contact.role,
      source: 'csv' as const,
      eventName: contact.eventName,
      eventType: contact.eventType,
      message: contact.message,
      acceptsPromotionalEmails: contact.acceptsPromotionalEmails !== false,
      linkedEventIds: [],
      contractIds: [],
      taskIds: [],
      activityHistory: [{
        id: `activity-${Date.now()}`,
        type: 'email' as const,
        description: 'Contact importé via CSV',
        date: new Date().toISOString(),
        user: currentUser?.name || 'Utilisateur'
      }]
    }));

    setContacts(prev => [...prev, ...newContacts]);
    console.log(`${newContacts.length} contacts importés avec succès`);
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
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowCSVImporter(true)} 
              variant="outline"
              className="back-office-button"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer CSV
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="back-office-button">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Contact
            </Button>
          </div>
        )}
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
        <Button variant="outline" className="back-office-button">Exporter</Button>
      </div>

      {filteredContacts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun contact trouvé</h3>
            <p className="text-gray-500 mb-4">Commencez par ajouter votre premier contact</p>
            <Button onClick={() => setShowAddForm(true)} className="back-office-button">
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
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{contact.firstName} {contact.lastName}</CardTitle>
                      {contact.source === 'website' && (
                        <Globe className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{contact.role}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={contact.acceptsPromotionalEmails ? 'bg-green-100 text-green-800 text-xs' : 'bg-red-100 text-red-800 text-xs'}>
                      {contact.acceptsPromotionalEmails ? '✓ Emails' : '✗ Emails'}
                    </Badge>
                    {permissions.canEditAllContacts && (
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
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                  onClick={() => handleEmailClick(contact.email, `${contact.firstName} ${contact.lastName}`)}
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

                <div className="flex space-x-2 pt-3">
                  <CreateEventFromContact 
                    contactId={contact.id} 
                    contactName={`${contact.firstName} ${contact.lastName}`} 
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 back-office-button"
                    onClick={() => handleEmailClick(contact.email, `${contact.firstName} ${contact.lastName}`)}
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
          <Card className="w-full max-w-md mx-4">
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
                placeholder="Entreprise" 
                value={newContact.company}
                onChange={(e) => setNewContact({...newContact, company: e.target.value})}
              />
              <Input 
                placeholder="Rôle/Titre" 
                value={newContact.role}
                onChange={(e) => setNewContact({...newContact, role: e.target.value})}
              />
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newContact.acceptsPromotionalEmails}
                  onCheckedChange={(checked) => setNewContact({...newContact, acceptsPromotionalEmails: checked})}
                />
                <label className="text-sm font-medium">Accepte les emails promotionnels</label>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Propriétaire</label>
                <Select value={newContact.ownerId} onValueChange={(value) => setNewContact({...newContact, ownerId: value})}>
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
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1 back-office-button">
                  Annuler
                </Button>
                <Button onClick={handleAddContact} className="flex-1 back-office-button">
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

      <EmailPopup
        isOpen={emailPopup.show}
        onClose={() => setEmailPopup({ show: false, email: '', contactName: '' })}
        email={emailPopup.email}
        contactName={emailPopup.contactName}
      />
    </div>
  );
};
