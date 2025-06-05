import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  eventType?: string;
  zipCode?: string;
  city?: string;
}

interface ContactList {
  id: string;
  name: string;
  description: string;
  contacts: string[];
  criteria: {
    eventTypes: string[];
    zipCodes: string[];
    cities: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const sampleContacts: Contact[] = [
  {
    id: 'contact-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    company: 'Productions Musicales',
    eventType: 'Festival',
    zipCode: '75001',
    city: 'Paris'
  },
  {
    id: 'contact-2',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    phone: '06 23 45 67 89',
    company: 'Festival d\'été',
    eventType: 'Concert',
    zipCode: '69001',
    city: 'Lyon'
  },
  {
    id: 'contact-3',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre.bernard@example.com',
    phone: '06 34 56 78 90',
    company: 'Événements Corporate',
    eventType: 'Événement d\'entreprise',
    zipCode: '75002',
    city: 'Paris'
  }
];

const eventTypes = [
  'Festival', 'Concert', 'Événement d\'entreprise', 'Événement privé', 'Mariage'
];

export const ContactLists: React.FC = () => {
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [contacts] = useState<Contact[]>(sampleContacts);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedContacts: [] as string[],
    eventTypes: [] as string[],
    zipCodes: [] as string[],
    cities: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      selectedContacts: [],
      eventTypes: [],
      zipCodes: [],
      cities: []
    });
  };

  const handleCreateList = () => {
    const newList: ContactList = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      contacts: formData.selectedContacts,
      criteria: {
        eventTypes: formData.eventTypes,
        zipCodes: formData.zipCodes,
        cities: formData.cities
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setContactLists([...contactLists, newList]);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditList = (list: ContactList) => {
    setSelectedList(list);
    setFormData({
      name: list.name,
      description: list.description,
      selectedContacts: list.contacts,
      eventTypes: list.criteria.eventTypes,
      zipCodes: list.criteria.zipCodes,
      cities: list.criteria.cities
    });
    setShowEditDialog(true);
  };

  const handleUpdateList = () => {
    if (!selectedList) return;
    
    const updatedLists = contactLists.map(list => 
      list.id === selectedList.id 
        ? { 
            ...list, 
            name: formData.name,
            description: formData.description,
            contacts: formData.selectedContacts,
            criteria: {
              eventTypes: formData.eventTypes,
              zipCodes: formData.zipCodes,
              cities: formData.cities
            },
            updatedAt: new Date().toISOString()
          }
        : list
    );
    
    setContactLists(updatedLists);
    setShowEditDialog(false);
    setSelectedList(null);
    resetForm();
  };

  const handleDeleteList = (listId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      setContactLists(contactLists.filter(list => list.id !== listId));
    }
  };

  const getFilteredContacts = () => {
    return contacts.filter(contact => {
      const matchesEventType = formData.eventTypes.length === 0 || 
        formData.eventTypes.includes(contact.eventType || '');
      const matchesZipCode = formData.zipCodes.length === 0 || 
        formData.zipCodes.includes(contact.zipCode || '');
      const matchesCity = formData.cities.length === 0 || 
        formData.cities.includes(contact.city || '');
      
      return matchesEventType && matchesZipCode && matchesCity;
    });
  };

  const availableZipCodes = [...new Set(contacts.map(c => c.zipCode).filter(Boolean))];
  const availableCities = [...new Set(contacts.map(c => c.city).filter(Boolean))];

  const filteredLists = contactLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listes de Contacts</h1>
          <p className="text-gray-600 mt-2">Créez et gérez vos listes pour les campagnes email</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Liste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle liste de contacts</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la liste</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Festivals été 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la liste"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Filtres automatiques</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Types d'événements</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {eventTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.eventTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, eventTypes: [...formData.eventTypes, type] });
                              } else {
                                setFormData({ ...formData, eventTypes: formData.eventTypes.filter(t => t !== type) });
                              }
                            }}
                          />
                          <span className="text-sm">{type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Codes postaux</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableZipCodes.map((zipCode) => (
                        <div key={zipCode} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.zipCodes.includes(zipCode)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, zipCodes: [...formData.zipCodes, zipCode] });
                              } else {
                                setFormData({ ...formData, zipCodes: formData.zipCodes.filter(z => z !== zipCode) });
                              }
                            }}
                          />
                          <span className="text-sm">{zipCode}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Villes</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {availableCities.map((city) => (
                        <div key={city} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.cities.includes(city)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({ ...formData, cities: [...formData.cities, city] });
                              } else {
                                setFormData({ ...formData, cities: formData.cities.filter(c => c !== city) });
                              }
                            }}
                          />
                          <span className="text-sm">{city}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Contacts correspondants ({getFilteredContacts().length})
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {getFilteredContacts().map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={formData.selectedContacts.includes(contact.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, selectedContacts: [...formData.selectedContacts, contact.id] });
                            } else {
                              setFormData({ ...formData, selectedContacts: formData.selectedContacts.filter(id => id !== contact.id) });
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{contact.company}</p>
                        <p className="text-xs text-gray-500">{contact.eventType} - {contact.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateList}>
                  Créer la liste
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher des listes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6">
        {filteredLists.map((list) => (
          <Card key={list.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">{list.name}</h3>
                    <Badge variant="outline">
                      {list.contacts.length} contacts
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{list.description}</p>
                  
                  <div className="space-y-2">
                    {list.criteria.eventTypes.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Types d'événements: </span>
                        <span className="text-sm text-gray-600">{list.criteria.eventTypes.join(', ')}</span>
                      </div>
                    )}
                    {list.criteria.cities.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Villes: </span>
                        <span className="text-sm text-gray-600">{list.criteria.cities.join(', ')}</span>
                      </div>
                    )}
                    {list.criteria.zipCodes.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Codes postaux: </span>
                        <span className="text-sm text-gray-600">{list.criteria.zipCodes.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 mt-3">
                    Créée le {new Date(list.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditList(list)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteList(list.id)}
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

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la liste de contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la liste</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Festivals été 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la liste"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateList}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
