
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Users, Mail, Phone, MapPin, Edit, Trash2, Eye, Upload } from 'lucide-react';
import { GlobalFileUpload } from '@/components/GlobalFileUpload';
import { CSVImporter } from '@/components/CSVImporter';
import { ContactForm } from '@/components/ContactForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position?: string;
  address?: string;
  city?: string;
  status: 'prospect' | 'client' | 'inactive';
  source?: string;
  notes?: string;
  tags: string[];
  accepts_marketing_emails: boolean;
  created_at: string;
}

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCSVImporter, setShowCSVImporter] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('📋 Contacts - Page loaded with', contacts.length, 'contacts');

  // Charger les contacts depuis Supabase
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const { data: contactsData, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contacts:', error);
        toast.error('Erreur lors du chargement des contacts');
        return;
      }

      const formattedContacts = contactsData?.map(contact => ({
        id: contact.id,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        position: contact.position || '',
        address: contact.address || '',
        city: contact.city || '',
        status: (contact.status as 'prospect' | 'client' | 'inactive') || 'prospect',
        source: contact.source || '',
        notes: contact.notes || '',
        tags: contact.tags || [],
        accepts_marketing_emails: contact.accepts_marketing_emails ?? true,
        created_at: contact.created_at || new Date().toISOString()
      })) || [];

      setContacts(formattedContacts);
      console.log('✅ Contacts loaded successfully:', formattedContacts.length);
    } catch (error) {
      console.error('Error in loadContacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContact = () => {
    console.log('➕ Creating new contact');
    setEditingContact(null);
    setShowCreateForm(true);
  };

  const handleEditContact = (contact: Contact) => {
    console.log('✏️ Editing contact:', contact.id);
    setEditingContact(contact);
    setShowCreateForm(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
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

        setContacts(prev => prev.filter(c => c.id !== contactId));
        toast.success('Contact supprimé');
      } catch (error) {
        console.error('Error in handleDeleteContact:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleFormSave = () => {
    loadContacts();
    setShowCreateForm(false);
    setEditingContact(null);
  };

  const handleCSVImport = (importedContacts: any[]) => {
    console.log('📥 CSV Import completed:', importedContacts.length, 'contacts');
    toast.success(`${importedContacts.length} contacts importés avec succès !`);
    loadContacts(); // Recharger la liste
    setShowCSVImporter(false);
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
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowCSVImporter(true)} 
            variant="outline"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <Button onClick={handleCreateContact} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email ou poste..."
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
                        {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      <p className="text-gray-600">{contact.position}</p>
                    </div>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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

      {/* Contact Form Dialog */}
      <ContactForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingContact(null);
        }}
        onSave={handleFormSave}
        contact={editingContact || undefined}
      />

      {/* CSV Importer Dialog */}
      <CSVImporter
        isOpen={showCSVImporter}
        onClose={() => setShowCSVImporter(false)}
        onImport={handleCSVImport}
      />
    </div>
  );
};
