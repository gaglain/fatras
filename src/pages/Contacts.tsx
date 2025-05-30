
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Phone, Mail, User, Calendar, ExternalLink } from 'lucide-react';
import { EmailPopup } from '@/components/EmailPopup';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  owner: string;
  company?: string;
  role?: string;
  linkedEventIds?: string[];
}

const sampleContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@venue.com',
    owner: 'Alice Johnson',
    company: 'Madison Square Garden',
    role: 'Gestionnaire de Lieu',
    linkedEventIds: ['event-1', 'event-3']
  },
  {
    id: 'contact-2',
    name: 'Sarah Wilson',
    phone: '+1 (555) 987-6543',
    email: 'sarah@festivalprods.com',
    owner: 'Bob Miller',
    company: 'Festival Productions',
    role: 'Coordinateur d\'Événements',
    linkedEventIds: ['event-1', 'event-2']
  },
  {
    id: 'contact-3',
    name: 'Mike Rodriguez',
    phone: '+1 (555) 456-7890',
    email: 'mike.r@soundtech.com',
    owner: 'Alice Johnson',
    company: 'Sound Tech Solutions',
    role: 'Ingénieur Audio',
    linkedEventIds: ['event-3']
  }
];

// Sample events for linking
const sampleEvents = [
  { id: 'event-1', name: 'Festival de Musique d\'Été 2024', date: '2024-07-15' },
  { id: 'event-2', name: 'Soirée Acoustique', date: '2024-06-20' },
  { id: 'event-3', name: 'Tournée Rock Legends', date: '2024-08-10' }
];

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [emailPopup, setEmailPopup] = useState<{ show: boolean; email: string; contactName: string }>({
    show: false,
    email: '',
    contactName: ''
  });

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLinkedEvents = (eventIds?: string[]) => {
    if (!eventIds) return [];
    return sampleEvents.filter(event => eventIds.includes(event.id));
  };

  const handleEmailClick = (email: string, contactName: string) => {
    setEmailPopup({ show: true, email, contactName });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Gérer vos gestionnaires de lieux, promoteurs et contacts de l'industrie</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Contact
        </Button>
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
                <div>
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
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
              <div className="text-sm text-gray-600">
                <strong>Propriétaire:</strong> {contact.owner}
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
                  onClick={() => handleEmailClick(contact.email, contact.name)}
                >
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-3 w-3 mr-1" />
                  Appeler
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
              <Input placeholder="Propriétaire" />
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
