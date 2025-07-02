
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

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockUsers: UserProfile[] = [
  {
    id: '1',
    email: 'admin@musiconnect.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'Principal',
    phone: '+33123456789',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01'
  }
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userForm, setUserForm] = useState<Partial<UserProfile>>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    status: 'active'
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveUser = () => {
    if (!userForm.email || !userForm.username || !userForm.firstName || !userForm.lastName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (selectedUser) {
      // Modification
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? { ...selectedUser, ...userForm } as UserProfile
          : u
      ));
      toast.success('Utilisateur modifié avec succès');
    } else {
      // Création
      const newUser: UserProfile = {
        id: Date.now().toString(),
        ...userForm as Omit<UserProfile, 'id' | 'createdAt'>,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('Utilisateur créé avec succès');
    }

    setIsFormOpen(false);
    setSelectedUser(null);
    setUserForm({
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      status: 'active'
    });
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUserForm(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Utilisateur supprimé');
    }
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setUserForm({
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      status: 'active'
    });
    setIsFormOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>
            Gestion des Utilisateurs
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <Button 
          onClick={handleNewUser}
          style={{
            backgroundColor: 'var(--app-button-bg, #1632f4)',
            color: 'var(--app-button-text, #ffffff)'
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'inactive').length}</p>
                <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>Inactifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
              Liste des Utilisateurs
            </CardTitle>
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              style={{
                color: 'var(--app-text, #18181b)',
                borderColor: 'var(--notification-border, #e5e7eb)'
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg" style={{
                borderColor: 'var(--notification-border, #e5e7eb)'
              }}>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                      backgroundColor: 'var(--app-button-bg, #1632f4)',
                      color: 'var(--app-button-text, #ffffff)'
                    }}>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--app-card-text, #18181b)' }}>
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                        <Phone className="h-4 w-4 mr-1" />
                        {user.phone}
                      </div>
                    )}
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditUser(user)}
                    style={{
                      color: 'var(--app-button-bg, #1632f4)',
                      borderColor: 'var(--app-button-bg, #1632f4)'
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour le formulaire utilisateur */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={userForm.firstName || ''}
                  onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={userForm.lastName || ''}
                  onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Nom"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="username">Pseudo *</Label>
              <Input
                id="username"
                value={userForm.username || ''}
                onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Pseudo unique"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email || ''}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={userForm.phone || ''}
                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+33123456789"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={userForm.role} onValueChange={(value: any) => setUserForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="moderator">Modérateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select value={userForm.status} onValueChange={(value: any) => setUserForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleSaveUser} className="flex-1" style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}>
                <Save className="h-4 w-4 mr-2" />
                {selectedUser ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
