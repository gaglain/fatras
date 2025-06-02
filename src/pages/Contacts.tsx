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

const sampleContacts: Contact[] = [
  {
    id: 'contact-1',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@venue.com',
    ownerId: 'user-1',
    company: 'Madison Square Garden',
    role: 'Gestionnaire de Lieu',
    linkedEventIds: ['event-1', 'event-3'],
    contractIds: ['contract-1'],
    taskIds: ['task-1', 'task-3'],
    acceptsPromotionalEmails: true,
    activityHistory: [
      {
        id: '1',
        type: 'email',
        description: 'Email envoyé: "Proposition pour Festival d\'Été"',
        date: '2024-05-20T14:30:00',
        user: 'Marie Dupont'
      },
      {
        id: '2',
        type: 'call',
        description: 'Appel téléphonique - Discussion tarifs',
        date: '2024-05-18T10:15:00',
        user: 'Jean Martin'
      }
    ]
  },
  {
    id: 'contact-4',
    firstName: 'Marie',
    lastName: 'Dubois',
    phone: '+33 6 12 34 56 78',
    email: 'marie.dubois@festival-ete.fr',
    ownerId: 'user-1',
    company: 'Festival d\'Été de Lyon',
    role: 'Coordinatrice Événements',
    source: 'website',
    eventName: 'Festival d\'Été 2024',
    eventType: 'Festival',
    acceptsPromotionalEmails: false,
    message: 'Bonjour, nous organisons un festival d\'été à Lyon et aimerions avoir des informations sur vos spectacles disponibles en juillet.',
    activityHistory: [
      {
        id: '4',
        type: 'email',
        description: 'Demande de booking reçue via le site web',
        date: '2024-05-25T09:45:00',
        user: 'Système'
      }
    ]
  }
];

// Sample related data
const sampleContracts = [
  {
    id: 'contract-1',
    name: 'Contrat Festival MSG 2024',
    status: 'signed',
    value: '15000€',
    date: '2024-05-01'
  }
];

const sampleTasks = [
  {
    id: 'task-1',
    title: 'Envoyer devis personnalisé',
    status: 'todo',
    dueDate: '2024-06-15'
  },
  {
    id: 'task-3',
    title: 'Confirmer disponibilités juillet',
    status: 'in-progress',
    dueDate: '2024-06-10'
  }
];

const sampleEvents = [
  { id: 'event-1', name: 'Festival de Musique d\'Été 2024', date: '2024-07-15', ownerId: 'user-1' },
  { id: 'event-3', name: 'Tournée Rock Legends', date: '2024-08-10', ownerId: 'user-1' }
];

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
    
    // Remove linked events
    if (contact?.linkedEventIds) {
      setEvents(prev => prev.filter(event => !contact.linkedEventIds?.includes(event.id)));
    }
    
    // Remove contact
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

  const getContactContracts = (contractIds?: string[]) => {
    if (!contractIds) return [];
    return sampleContracts.filter(contract => contractIds.includes(contract.id));
  };

  const getContactTasks = (taskIds?: string[]) => {
    if (!taskIds) return [];
    return sampleTasks.filter(task => taskIds.includes(task.id));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'call':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'meeting':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'contract':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-red-500" />;
      default:
        return <History className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderContactModal = () => {
    if (!selectedContact) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedContact.source === 'website' && <Globe className="h-5 w-5 text-blue-500" />}
                <span>{selectedContact.firstName} {selectedContact.lastName}</span>
                <Badge className={selectedContact.acceptsPromotionalEmails ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {selectedContact.acceptsPromotionalEmails ? 'Accepte emails promo' : 'Refuse emails promo'}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedContact(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="contracts">Contrats</TabsTrigger>
                <TabsTrigger value="tasks">Tâches</TabsTrigger>
                <TabsTrigger value="events">Événements</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom</label>
                    <p className="text-gray-700">{selectedContact.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <p className="text-gray-700">{selectedContact.lastName}</p>
                  </div>
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
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  {selectedContact.activityHistory && selectedContact.activityHistory.length > 0 ? (
                    selectedContact.activityHistory.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                            <span>{new Date(activity.date).toLocaleDateString('fr-FR')} à {new Date(activity.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span>Par {activity.user}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucun historique d'activité</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contracts" className="space-y-4">
                <div className="space-y-3">
                  {getContactContracts(selectedContact.contractIds).length > 0 ? (
                    getContactContracts(selectedContact.contractIds).map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-orange-500" />
                          <div>
                            <h4 className="font-medium">{contract.name}</h4>
                            <p className="text-sm text-gray-600">Valeur: {contract.value}</p>
                            <p className="text-xs text-gray-500">Date: {new Date(contract.date).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <Badge className={contract.status === 'signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {contract.status === 'signed' ? 'Signé' : 'En attente'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucun contrat lié</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="space-y-3">
                  {getContactTasks(selectedContact.taskIds).length > 0 ? (
                    getContactTasks(selectedContact.taskIds).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckSquare className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-medium">{task.title}</h4>
                            <p className="text-xs text-gray-500">Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <Badge className={
                          task.status === 'todo' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {task.status === 'todo' ? 'À faire' : task.status === 'in-progress' ? 'En cours' : 'Terminé'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucune tâche liée</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div className="space-y-3">
                  {selectedContact.linkedEventIds && getLinkedEvents(selectedContact.linkedEventIds).length > 0 ? (
                    getLinkedEvents(selectedContact.linkedEventIds).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          <div>
                            <h4 className="font-medium">{event.name}</h4>
                            <p className="text-sm text-gray-600">Date: {new Date(event.date).toLocaleDateString('fr-FR')}</p>
                            <p className="text-xs text-gray-500">Propriétaire: {getOwnerName(event.ownerId)}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucun événement lié</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex space-x-3 pt-6 border-t">
              <Button onClick={() => setSelectedContact(null)} variant="outline" className="flex-1">
                Fermer
              </Button>
              <Button 
                onClick={() => handleEmailClick(selectedContact.email, `${selectedContact.firstName} ${selectedContact.lastName}`)}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Envoyer Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer CSV
            </Button>
            <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Contact
            </Button>
          </div>
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
                            Êtes-vous sûr de vouloir supprimer ce contact ? Cette action supprimera également tous les événements liés et ne peut pas être annulée.
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
                className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-purple-600"
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

              {contact.source === 'website' && (
                <Badge className="bg-blue-100 text-blue-800">
                  Demande de booking
                </Badge>
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

      {/* Add Contact Form Modal */}
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
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleAddContact} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Sauvegarder Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Details Modal */}
      {renderContactModal()}

      {/* CSV Importer */}
      <CSVImporter
        isOpen={showCSVImporter}
        onClose={() => setShowCSVImporter(false)}
        onImport={handleCSVImport}
      />

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
