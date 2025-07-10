
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Users, Mail, Phone, MapPin, Edit, Trash2, Eye } from 'lucide-react';
import { GlobalFileUpload } from '@/components/GlobalFileUpload';
import { toast } from 'sonner';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  status: 'prospect' | 'client' | 'inactive';
  source?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('📋 Contacts - Page loaded with', contacts.length, 'contacts');

  // Simulation de données
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33 1 23 45 67 89',
        company: 'Tech Corp',
        position: 'Directeur Marketing',
        address: '123 Rue de la Paix',
        city: 'Paris',
        status: 'client',
        source: 'Site web',
        notes: 'Contact très intéressé par nos services',
        tags: ['VIP', 'Tech'],
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        phone: '+33 6 12 34 56 78',
        company: 'Event Solutions',
        position: 'Responsable Événements',
        address: '456 Avenue des Champs',
        city: 'Lyon',
        status: 'prospect',
        source: 'Recommandation',
        notes: 'À recontacter la semaine prochaine',
        tags: ['Événementiel'],
        createdAt: '2024-01-20'
      }
    ];

    setTimeout(() => {
      setContacts(mockContacts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContact = () => {
    console.log('➕ Creating new contact');
    setShowCreateForm(true);
  };

  const handleEditContact = (contact: Contact) => {
    console.log('✏️ Editing contact:', contact.id);
    setEditingContact(contact);
    setShowCreateForm(true);
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      console.log('🗑️ Deleting contact:', contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact supprimé');
    }
  };

  const handleFileUploaded = (file: { url: string; name: string; type: string }) => {
    console.log('📎 File uploaded for contacts:', file);
    toast.success(`Fichier "${file.name}" ajouté aux contacts`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Contacts
          </h1>
          <p className="mt-2 text-gray-600">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} enregistré{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreateContact} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload de fichiers */}
      <Card>
        <CardHeader>
          <CardTitle>Import de Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalFileUpload
            onFileUploaded={handleFileUploaded}
            acceptedTypes=".csv,.xlsx,.vcf"
            label="Importer des contacts (CSV, Excel, vCard)"
            maxSize={5}
          />
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      <p className="text-gray-600">{contact.position} {contact.company && `• ${contact.company}`}</p>
                    </div>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{contact.phone}</span>
                    </div>
                    {contact.city && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{contact.city}</span>
                      </div>
                    )}
                  </div>

                  {contact.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {contact.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditContact(contact)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun contact trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucun contact ne correspond à votre recherche.' : 'Commencez par ajouter votre premier contact.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateContact}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un contact
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
