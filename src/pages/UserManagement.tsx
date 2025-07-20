import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Mail, 
  Phone,
  User,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser, UserRole } from '@/contexts/UserContext';
import { useEmailSender } from '@/hooks/useEmailSender';
import { useUserManagement } from '@/hooks/useUserManagement';

export const UserManagement: React.FC = () => {
  const { currentUser } = useUser();
  const { sendUserWelcomeEmail, sending } = useEmailSender();
  const { users, loading, fetchUsers, createUser, updateUserProfile, deactivateUser } = useUserManagement();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userForm, setUserForm] = useState({
    email: '',
    username: '',
    name: '',
    lastName: '',
    phone: '',
    role: 'utilisateur' as UserRole,
    address: '',
    city: '',
    function_title: '',
    show_name: ''
  });

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin', 
    manager: 'Manager / Booker',
    artiste: 'Artiste',
    utilisateur: 'Utilisateur'
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-orange-100 text-orange-800';
      case 'artiste': return 'bg-green-100 text-green-800';
      case 'utilisateur': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleSaveUser = async () => {
    if (!userForm.email || !userForm.name || !userForm.lastName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      if (selectedUser) {
        // Modification
        await updateUserProfile(selectedUser.user_id, {
          first_name: userForm.name,
          last_name: userForm.lastName,
          username: userForm.username,
          phone: userForm.phone,
          role: userForm.role,
          address: userForm.address,
          city: userForm.city,
          function_title: userForm.function_title,
          show_name: userForm.show_name
        });
      } else {
        // Création
        const tempPassword = generateTempPassword();
        
        const success = await createUser({
          email: userForm.email,
          password: tempPassword,
          first_name: userForm.name,
          last_name: userForm.lastName,
          username: userForm.username,
          phone: userForm.phone,
          role: userForm.role,
          address: userForm.address,
          city: userForm.city,
          function_title: userForm.function_title,
          show_name: userForm.show_name
        });

        if (success) {
          // Envoyer l'email de bienvenue
          try {
            await sendUserWelcomeEmail(
              userForm.email,
              `${userForm.name} ${userForm.lastName}`,
              tempPassword
            );
            toast.success('Utilisateur créé et email de bienvenue envoyé !');
          } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
            toast.success('Utilisateur créé (erreur envoi email)');
          }
        }
      }

      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setUserForm({
      email: '',
      username: '',
      name: '',
      lastName: '',
      phone: '',
      role: 'utilisateur',
      address: '',
      city: '',
      function_title: '',
      show_name: ''
    });
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email || '',
      username: user.username || '',
      name: user.first_name || '',
      lastName: user.last_name || '',
      phone: user.phone || '',
      role: user.role || 'utilisateur',
      address: user.address || '',
      city: user.city || '',
      function_title: user.function_title || '',
      show_name: user.show_name || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      await deactivateUser(userId);
    }
  };

  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Charger les utilisateurs au montage du composant
  React.useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les utilisateurs et leurs permissions
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">@{user.username || user.email?.split('@')[0]}</p>
                  </div>
                </div>
                <Badge className={getRoleColor(user.role)}>
                  {roleLabels[user.role as UserRole] || user.role}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                )}
                {user.function_title && (
                  <div className="text-sm text-gray-600">
                    <strong>Fonction:</strong> {user.function_title}
                  </div>
                )}
                {user.show_name && (
                  <div className="text-sm text-gray-600">
                    <strong>Nom de scène:</strong> {user.show_name}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(user)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
                {user.user_id !== currentUser?.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(user.user_id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de création/modification */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Prénom *</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Prénom"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={userForm.lastName}
                onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Nom de famille"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemple.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                value={userForm.username}
                onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="nom_utilisateur"
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={userForm.phone}
                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div>
              <Label htmlFor="role">Rôle *</Label>
              <Select value={userForm.role} onValueChange={(value: UserRole) => setUserForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager / Booker</SelectItem>
                  <SelectItem value="artiste">Artiste</SelectItem>
                  <SelectItem value="utilisateur">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="function_title">Fonction</Label>
              <Input
                id="function_title"
                value={userForm.function_title}
                onChange={(e) => setUserForm(prev => ({ ...prev, function_title: e.target.value }))}
                placeholder="Titre de fonction"
              />
            </div>

            <div>
              <Label htmlFor="show_name">Nom de scène</Label>
              <Input
                id="show_name"
                value={userForm.show_name}
                onChange={(e) => setUserForm(prev => ({ ...prev, show_name: e.target.value }))}
                placeholder="Nom d'artiste"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={userForm.address}
                onChange={(e) => setUserForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse complète"
              />
            </div>

            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={userForm.city}
                onChange={(e) => setUserForm(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Ville"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button onClick={handleSaveUser} disabled={sending} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {sending ? 'Envoi...' : (selectedUser ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};