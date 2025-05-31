
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Settings, 
  Users,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useUser, type UserRole } from '@/contexts/UserContext';

export const UserProfile: React.FC = () => {
  const { currentUser, users, getUserPermissions, addUser, updateUser, removeUser } = useUser();
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    lastName: '',
    email: '',
    role: 'user' as UserRole,
    department: '',
    phone: '',
    bio: ''
  });

  if (!currentUser) {
    return <div>Chargement...</div>;
  }

  const permissions = getUserPermissions(currentUser);

  const handleAddUser = () => {
    addUser({
      ...newUser,
      isActive: true
    });
    setNewUser({
      name: '',
      lastName: '',
      email: '',
      role: 'user',
      department: '',
      phone: '',
      bio: ''
    });
    setShowAddUserForm(false);
  };

  const handleUpdateUser = (userId: string, updates: any) => {
    updateUser(userId, updates);
    setEditingUser(null);
  };

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUser(userId, { isActive: !currentStatus });
  };

  const getRoleLabel = (role: UserRole) => {
    const roleLabels = {
      'super-admin': 'Super Admin',
      'booker': 'Booker',
      'artist': 'Artiste',
      'casting-artist': 'Artiste Casting',
      'user': 'Utilisateur',
      'external-user': 'Utilisateur Externe'
    };
    return roleLabels[role];
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      'super-admin': 'bg-red-100 text-red-800',
      'booker': 'bg-blue-100 text-blue-800',
      'artist': 'bg-purple-100 text-purple-800',
      'casting-artist': 'bg-pink-100 text-pink-800',
      'user': 'bg-gray-100 text-gray-800',
      'external-user': 'bg-orange-100 text-orange-800'
    };
    return colors[role];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profil Utilisateur</h1>
        {permissions.canManageUsers && (
          <Button onClick={() => setShowAddUserForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter Utilisateur
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
          {permissions.canManageUsers && (
            <TabsTrigger value="users">Gestion Utilisateurs</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informations Personnelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="text-lg">
                      {currentUser.name[0]}{currentUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Changer Photo
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label>Nom</Label>
                    <Input value={currentUser.name} />
                  </div>
                  <div>
                    <Label>Prénom</Label>
                    <Input value={currentUser.lastName} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={currentUser.email} />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={currentUser.phone || ''} placeholder="Numéro de téléphone" />
                  </div>
                  <div>
                    <Label>Département</Label>
                    <Input value={currentUser.department || ''} placeholder="Département" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Rôle & Permissions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Rôle</Label>
                  <Badge className={getRoleBadgeColor(currentUser.role)}>
                    {getRoleLabel(currentUser.role)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Permissions:</h4>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    {Object.entries(permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Intégrations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Google Calendar</span>
                    </div>
                    {currentUser.googleCalendarConnected ? (
                      <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                    ) : (
                      <Button size="sm" variant="outline">Connecter</Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Gmail</span>
                    </div>
                    {currentUser.gmailConnected ? (
                      <Badge className="bg-green-100 text-green-800">Connecté</Badge>
                    ) : (
                      <Button size="sm" variant="outline">Connecter</Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea 
                    value={currentUser.bio || ''} 
                    placeholder="Parlez-nous de vous..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Sauvegarder les Modifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {permissions.canManageUsers && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Gestion des Utilisateurs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name[0]}{user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{user.name} {user.lastName}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        {user.id !== currentUser.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Add User Modal */}
      {showAddUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ajouter Nouvel Utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prénom</Label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
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
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
              <div>
                <Label>Rôle</Label>
                <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                    <SelectItem value="booker">Booker</SelectItem>
                    <SelectItem value="artist">Artiste</SelectItem>
                    <SelectItem value="casting-artist">Artiste Casting</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="external-user">Utilisateur Externe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Département</Label>
                <Input
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="Département"
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Téléphone"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddUserForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleAddUser} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Créer Utilisateur
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
