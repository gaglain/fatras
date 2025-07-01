
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Phone, Mail, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company?: string;
  role?: string;
  acceptsPromotionalEmails: boolean;
  source?: 'manual' | 'website' | 'csv';
}

const sampleContacts: Contact[] = [];

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    acceptsPromotionalEmails: true
  });

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEmailClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
    toast.success('Contact supprimé');
  };

  const handleAddContact = () => {
    if (!newContact.firstName || !newContact.lastName || !newContact.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
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
      acceptsPromotionalEmails: newContact.acceptsPromotionalEmails,
      source: 'manual'
    };

    setContacts(prev => [...prev, contact]);
    setNewContact({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      acceptsPromotionalEmails: true
    });
    setShowAddForm(false);
    toast.success('Contact ajouté');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Gérer vos gestionnaires de lieux, promoteurs et contacts de l'industrie</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Contact
        </Button>
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
                    <Badge className={contact.acceptsPromotionalEmails ? 'bg-green-100 text-green-800 text-xs' : 'bg-red-100 text-red-800 text-xs'}>
                      {contact.acceptsPromotionalEmails ? '✓ Emails' : '✗ Emails'}
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
                {contact.company && (
                  <div className="text-sm text-gray-600">
                    <strong>Entreprise:</strong> {contact.company}
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
    </div>
  );
};
