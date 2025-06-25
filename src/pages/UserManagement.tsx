
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  UserCheck,
  Crown,
  Users,
  Music
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser, type UserRole } from '@/contexts/UserContext';

// Mise à jour des types de rôles
type ExtendedUserRole = 'super_admin' | 'admin' | 'manager' | 'artist';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  pseudo: string;
  role: ExtendedUserRole;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

const sampleUsers: User[] = [
  {
    id: '1',
    email: 'superadmin@showmanager.com',
    firstName: 'Super',
    lastName: 'Admin',
    pseudo: 'SuperAdmin',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2024-06-12T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    permissions: ['all']
  },
  {
    id: '2',
    email: 'admin@showmanager.com',
    firstName: 'Admin',
    lastName: 'Principal',
    pseudo: 'AdminPrincipal',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-06-12T09:15:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    permissions: ['users', 'events', 'artists', 'contracts', 'website']
  },
  {
    id: '3',
    email: 'manager@showmanager.com',
    firstName: 'Marie',
    lastName: 'Martin',
    pseudo: 'MarieBooker',
    role: 'manager',
    status: 'active',
    lastLogin: '2024-06-11T15:45:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    permissions: ['contacts', 'events', 'artists', 'contracts']
  },
  {
    id: '4',
    email: 'artist@showmanager.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    pseudo: 'JeanMusic',
    role: 'artist',
    status: 'active',
    lastLogin: '2024-06-10T09:15:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    permissions: ['profile', 'events', 'merchandise']
  }
];

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager / Booker',
  artist: 'Artiste'
};

const statusLabels = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente'
};

const availablePermissions = [
  { value: 'contacts', label: 'Contacts' },
  { value: 'events', label: 'Événements' },
  { value: 'artists', label: 'Artistes' },
  { value: 'contracts', label: 'Contrats' },
  { value: 'tasks', label: 'Tâches' },
  { value: 'email', label: 'Email' },
  { value: 'agenda', label: 'Agenda' },
  { value: 'merchandise', label: 'Merchandise' },
  { value: 'opportunities', label: 'Opportunités' },
  { value: 'website', label: 'Site Web' },
  { value: 'users', label: 'Gestion Utilisateurs' },
  { value: 'profile', label: 'Profil Personnel' }
];

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
    pseudo: '',
    role: 'artist' as ExtendedUserRole,
    permissions: [] as string[]
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.pseudo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'artist': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      case 'manager': return Users;
      case 'artist': return Music;
      default: return User;
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
      pseudo: newUser.pseudo,
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
      pseudo: '',
      role: 'artist',
      permissions: []
    });
    toast.success('Utilisateur ajouté avec succès');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      pseudo: user.pseudo,
      role: user.role,
      permissions: user.permissions
    });
    setShowAddUser(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...newUser }
        : user
    );
    
    setUsers(updatedUsers);
    setShowAddUser(false);
    setEditingUser(null);
    setNewUser({
      email: '',
      firstName: '',
      lastName: '',
      pseudo: '',
      role: 'artist',
      permissions: []
    });
    toast.success('Utilisateur modifié avec succès');
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('Utilisateur supprimé');
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' as const }
        : user
    ));
  };

  const togglePermission = (permission: string) => {
    setNewUser(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground mt-2">Gérer les utilisateurs, rôles et permissions</p>
        </div>
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>
              
              <div>
                <Label>Pseudo</Label>
                <Input
                  value={newUser.pseudo}
                  onChange={(e) => setNewUser({ ...newUser, pseudo: e.target.value })}
                  placeholder="Pseudo pour les tâches et messagerie"
                />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              
              <div>
                <Label>Rôle</Label>
                <Select value={newUser.role} onValueChange={(value: ExtendedUserRole) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager / Booker</SelectItem>
                    <SelectItem value="artist">Artiste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.value}
                        checked={newUser.permissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="h-4 w-4 text-purple-600"
                      />
                      <Label htmlFor={permission.value} className="text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowAddUser(false)} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={editingUser ? handleUpdateUser : handleAddUser} 
                  className="flex-1"
                >
                  {editingUser ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager / Booker</SelectItem>
            <SelectItem value="artist">Artiste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <div className="text-sm text-muted-foreground">Utilisateurs totaux</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Actifs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'manager').length}
            </div>
            <div className="text-sm text-muted-foreground">Managers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.role === 'artist').length}
            </div>
            <div className="text-sm text-muted-foreground">Artistes</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Pseudo</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
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
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.pseudo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      <RoleIcon className="h-3 w-3 mr-1" />
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
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {availablePermissions.find(p => p.value === permission)?.label}
                        </Badge>
                      ))}
                      {user.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{user.permissions.length - 3}
                        </Badge>
                      )}
                    </div>
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
                        onClick={() => handleEditUser(user)}
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
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
