
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Users, UserCheck, UserX } from 'lucide-react';
import { ContactCard } from '@/components/contacts/ContactCard';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  city?: string;
  status: string;
  role: string;
  tags?: string[];
}

export const Contacts: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, statusFilter, roleFilter]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(contact => 
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(contact => contact.role === roleFilter);
    }

    setFilteredContacts(filtered);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Contact supprimé avec succès');
      fetchContacts();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du contact');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingContact(null);
  };

  const getContactStats = () => {
    const total = contacts.length;
    const clients = contacts.filter(c => c.status === 'client').length;
    const prospects = contacts.filter(c => c.status === 'prospect').length;
    const inactifs = contacts.filter(c => c.status === 'inactif').length;
    
    return { total, clients, prospects, inactifs };
  };

  const stats = getContactStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos contacts, artistes, venues et partenaires
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau contact
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Clients</p>
              <p className="text-2xl font-bold text-green-600">{stats.clients}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Prospects</p>
              <p className="text-2xl font-bold text-blue-600">{stats.prospects}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-2">
            <UserX className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-muted-foreground">Inactifs</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactifs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="prospect">Prospects</SelectItem>
            <SelectItem value="client">Clients</SelectItem>
            <SelectItem value="partenaire">Partenaires</SelectItem>
            <SelectItem value="inactif">Inactifs</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="artiste">Artistes</SelectItem>
            <SelectItem value="manager">Managers</SelectItem>
            <SelectItem value="venue">Venues</SelectItem>
            <SelectItem value="organisateur">Organisateurs</SelectItem>
            <SelectItem value="media">Médias</SelectItem>
            <SelectItem value="contact">Contacts généraux</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {contacts.length === 0 ? 'Aucun contact' : 'Aucun résultat'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {contacts.length === 0 
              ? 'Commencez par ajouter votre premier contact'
              : 'Essayez de modifier vos filtres de recherche'
            }
          </p>
          {contacts.length === 0 && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un contact
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ContactDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        contact={editingContact}
        onSave={() => {
          fetchContacts();
          handleDialogClose();
        }}
      />
    </div>
  );
};
