
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

const sampleUsers: User[] = [
  {
    id: '1',
    email: 'admin@showmanager.com',
    firstName: 'Admin',
    lastName: 'Principal',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-06-12T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    permissions: ['all']
  },
  {
    id: '2',
    email: 'manager@showmanager.com',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-06-11T15:45:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    permissions: ['contacts', 'events', 'artists', 'contracts']
  },
  {
    id: '3',
    email: 'user@showmanager.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'user',
    status: 'active',
    lastLogin: '2024-06-10T09:15:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    permissions: ['contacts', 'events']
  }
];

const roleLabels = {
  admin: 'Administrateur',
  manager: 'Manager',
  user: 'Utilisateur',
  viewer: 'Observateur'
};

const statusLabels = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente'
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'user' as const,
    permissions: [] as string[]
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddUser = () => {
    const user: User = {
      id: Date.now().toString(),
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      status: 'pending',
      lastLogin: '',
      createdAt: new Date().toISOString(),
      permissions: newUser.permissions
    };

    setUsers(prev => [...prev, user]);
    setShowAddUser(false);
    setNewUser({
      email: '',
      firstName: '',
      lastName: '',
      role: 'user',
      permissions: []
    });
    toast.success('Utilisateur ajouté avec succès');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('Utilisateur supprimé');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as const }
        : user
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérer les utilisateurs, rôles et permissions</p>
        </div>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <Input
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <Input
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="viewer">Observateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowAddUser(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleAddUser} className="flex-1">
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les rôles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">Utilisateur</SelectItem>
            <SelectItem value="viewer">Observateur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <div className="text-sm text-gray-500">Utilisateurs totaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Actifs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-500">Administrateurs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">En attente</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === 'active' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {statusLabels[user.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                    </div>
                  ) : (
                    <span className="text-gray-400">Jamais connecté</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
