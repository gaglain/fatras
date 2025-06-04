
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Mail, Filter, Edit, Trash2, Download, Upload, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  status: 'prospect' | 'client' | 'lead';
  tags: string[];
  source?: string;
  leadScore: number;
}

interface ContactList {
  id: string;
  name: string;
  description: string;
  contacts: string[];
  filters: {
    status?: string[];
    tags?: string[];
    source?: string[];
    leadScoreMin?: number;
    company?: string;
  };
  isAutomatic: boolean;
  createdAt: string;
  updatedAt: string;
}

const sampleContacts: Contact[] = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@venue.com',
    company: 'Salle Concert Paris',
    status: 'client',
    tags: ['venue', 'paris'],
    source: 'website',
    leadScore: 85
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie@festival.com',
    company: 'Festival d\'Été',
    status: 'prospect',
    tags: ['festival', 'outdoor'],
    source: 'referral',
    leadScore: 70
  },
  {
    id: '3',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'p.bernard@prod.com',
    company: 'Production Live',
    status: 'lead',
    tags: ['production', 'technique'],
    source: 'linkedin',
    leadScore: 60
  }
];

const initialLists: ContactList[] = [
  {
    id: '1',
    name: 'Clients VIP',
    description: 'Nos meilleurs clients avec un score élevé',
    contacts: ['1'],
    filters: {
      status: ['client'],
      leadScoreMin: 80
    },
    isAutomatic: true,
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z'
  },
  {
    id: '2',
    name: 'Prospects Festivals',
    description: 'Organisateurs de festivals potentiels',
    contacts: ['2'],
    filters: {
      tags: ['festival'],
      status: ['prospect', 'lead']
    },
    isAutomatic: true,
    createdAt: '2024-06-02T10:00:00Z',
    updatedAt: '2024-06-02T10:00:00Z'
  }
];

export const ContactLists: React.FC = () => {
  const [lists, setLists] = useState<ContactList[]>(initialLists);
  const [contacts] = useState<Contact[]>(sampleContacts);
  const [selectedList, setSelectedList] = useState<ContactList | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    isAutomatic: boolean;
    filters: {
      status: string[];
      tags: string[];
      source: string[];
      leadScoreMin: number;
      company: string;
    }
  }>({
    name: '',
    description: '',
    isAutomatic: false,
    filters: {
      status: [],
      tags: [],
      source: [],
      leadScoreMin: 0,
      company: ''
    }
  });

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getContactsForList = (list: ContactList): Contact[] => {
    if (list.isAutomatic) {
      return contacts.filter(contact => {
        const statusMatch = !list.filters.status?.length || list.filters.status.includes(contact.status);
        const tagsMatch = !list.filters.tags?.length || list.filters.tags.some(tag => contact.tags.includes(tag));
        const sourceMatch = !list.filters.source?.length || list.filters.source.includes(contact.source || '');
        const scoreMatch = !list.filters.leadScoreMin || contact.leadScore >= list.filters.leadScoreMin;
        const companyMatch = !list.filters.company || contact.company?.toLowerCase().includes(list.filters.company.toLowerCase());

        return statusMatch && tagsMatch && sourceMatch && scoreMatch && companyMatch;
      });
    } else {
      return contacts.filter(contact => list.contacts.includes(contact.id));
    }
  };

  const handleCreateList = () => {
    if (!formData.name) {
      toast.error('Le nom de la liste est obligatoire');
      return;
    }

    const newList: ContactList = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      contacts: formData.isAutomatic ? [] : selectedContacts,
      filters: formData.isAutomatic ? {
        status: formData.filters.status.length > 0 ? formData.filters.status : undefined,
        tags: formData.filters.tags.length > 0 ? formData.filters.tags : undefined,
        source: formData.filters.source.length > 0 ? formData.filters.source : undefined,
        leadScoreMin: formData.filters.leadScoreMin > 0 ? formData.filters.leadScoreMin : undefined,
        company: formData.filters.company ? formData.filters.company : undefined
      } : {},
      isAutomatic: formData.isAutomatic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setLists(prev => [...prev, newList]);
    toast.success('Liste créée avec succès');
    resetForm();
  };

  const handleEditList = () => {
    if (!selectedList || !formData.name) return;

    setLists(prev => prev.map(list =>
      list.id === selectedList.id
        ? {
            ...list,
            name: formData.name,
            description: formData.description,
            contacts: formData.isAutomatic ? list.contacts : selectedContacts,
            filters: formData.isAutomatic ? {
              status: formData.filters.status.length > 0 ? formData.filters.status : undefined,
              tags: formData.filters.tags.length > 0 ? formData.filters.tags : undefined,
              source: formData.filters.source.length > 0 ? formData.filters.source : undefined,
              leadScoreMin: formData.filters.leadScoreMin > 0 ? formData.filters.leadScoreMin : undefined,
              company: formData.filters.company ? formData.filters.company : undefined
            } : {},
            isAutomatic: formData.isAutomatic,
            updatedAt: new Date().toISOString()
          }
        : list
    ));

    toast.success('Liste mise à jour');
    resetForm();
  };

  const handleDeleteList = (listId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      setLists(prev => prev.filter(list => list.id !== listId));
      toast.success('Liste supprimée');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isAutomatic: false,
      filters: {
        status: [],
        tags: [],
        source: [],
        leadScoreMin: 0,
        company: ''
      }
    });
    setSelectedContacts([]);
    setShowCreateDialog(false);
    setShowEditDialog(false);
    setSelectedList(null);
  };

  const openEditDialog = (list: ContactList) => {
    setSelectedList(list);
    setFormData({
      name: list.name,
      description: list.description,
      isAutomatic: list.isAutomatic,
      filters: list.filters
    });
    setSelectedContacts(list.contacts);
    setShowEditDialog(true);
  };

  const exportList = (list: ContactList) => {
    const listContacts = getContactsForList(list);
    const csvContent = [
      ['Prénom', 'Nom', 'Email', 'Entreprise', 'Statut'].join(','),
      ...listContacts.map(contact => 
        [contact.firstName, contact.lastName, contact.email, contact.company || '', contact.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Liste exportée en CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listes de Contacts</h1>
          <p className="text-gray-600 mt-2">Gérer vos segments de contacts pour l'email marketing</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer Contacts
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Créer Liste
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher une liste..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLists.map((list) => {
          const listContacts = getContactsForList(list);
          return (
            <Card key={list.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                  <Badge variant={list.isAutomatic ? 'default' : 'secondary'}>
                    {list.isAutomatic ? 'Auto' : 'Manuelle'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{list.description}</p>
                
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">{listContacts.length} contacts</span>
                </div>

                {list.isAutomatic && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Filtres actifs:</p>
                    <div className="flex flex-wrap gap-1">
                      {list.filters.status?.map(status => (
                        <Badge key={status} variant="outline" className="text-xs">
                          {status}
                        </Badge>
                      ))}
                      {list.filters.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {list.filters.leadScoreMin && (
                        <Badge variant="outline" className="text-xs">
                          Score ≥ {list.filters.leadScoreMin}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => exportList(list)} className="flex-1">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(list)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteList(list.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? 'Modifier la Liste' : 'Créer une Nouvelle Liste'}
            </DialogTitle>
            <DialogDescription>
              {formData.isAutomatic 
                ? 'Cette liste sera automatiquement mise à jour selon les filtres définis.'
                : 'Sélectionnez manuellement les contacts pour cette liste.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Nom de la liste *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="automatic"
                  checked={formData.isAutomatic}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isAutomatic: !!checked }))
                  }
                />
                <label htmlFor="automatic" className="text-sm font-medium">
                  Liste automatique
                </label>
              </div>
            </div>

            <Input
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />

            {formData.isAutomatic ? (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium">Filtres automatiques</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Statut</label>
                    <div className="space-y-2 mt-1">
                      {['prospect', 'client', 'lead'].map(status => (
                        <label key={status} className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.filters.status.includes(status)}
                            onCheckedChange={(checked) => {
                              setFormData(prev => ({
                                ...prev,
                                filters: {
                                  ...prev.filters,
                                  status: checked
                                    ? [...prev.filters.status, status]
                                    : prev.filters.status.filter(s => s !== status)
                                }
                              }));
                            }}
                          />
                          <span className="text-sm">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Score minimum</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.filters.leadScoreMin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        filters: {
                          ...prev.filters,
                          leadScoreMin: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Input
                  placeholder="Entreprise (contient)"
                  value={formData.filters.company}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    filters: { ...prev.filters, company: e.target.value }
                  }))}
                />
              </div>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium">Sélectionner les contacts</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {contacts.map(contact => (
                    <label key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => {
                          setSelectedContacts(prev =>
                            checked
                              ? [...prev, contact.id]
                              : prev.filter(id => id !== contact.id)
                          );
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                        <p className="text-sm text-gray-600">{contact.email}</p>
                        {contact.company && (
                          <p className="text-xs text-gray-500">{contact.company}</p>
                        )}
                      </div>
                      <Badge variant="outline">{contact.status}</Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button onClick={resetForm} variant="outline" className="flex-1">
                Annuler
              </Button>
              <Button 
                onClick={showEditDialog ? handleEditList : handleCreateList} 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {showEditDialog ? 'Mettre à Jour' : 'Créer la Liste'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
