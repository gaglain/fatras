
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Settings, Camera, Link } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export const UserProfile: React.FC = () => {
  const { currentUser, updateUser, connectGoogleCalendar, connectGmail } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    department: currentUser?.department || ''
  });

  if (!currentUser) return null;

  const handleSave = () => {
    updateUser(currentUser.id, formData);
    setIsEditing(false);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      'super-admin': 'Super Administrateur',
      'booker': 'Booker',
      'artist': 'Artiste',
      'casting-artist': 'Artiste Casting',
      'user': 'Utilisateur',
      'external-user': 'Utilisateur Externe'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      'super-admin': 'bg-red-100 text-red-800',
      'booker': 'bg-blue-100 text-blue-800',
      'artist': 'bg-purple-100 text-purple-800',
      'casting-artist': 'bg-pink-100 text-pink-800',
      'user': 'bg-green-100 text-green-800',
      'external-user': 'bg-gray-100 text-gray-800'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profil Utilisateur</span>
            </CardTitle>
            <Badge className={getRoleColor(currentUser.role)}>
              {getRoleLabel(currentUser.role)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo de profil */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center relative">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-medium">
                  {currentUser.name.charAt(0)}{currentUser.lastName.charAt(0)}
                </span>
              )}
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 p-1 h-8 w-8">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{currentUser.name} {currentUser.lastName}</h3>
              <p className="text-gray-600">{currentUser.email}</p>
              <p className="text-sm text-gray-500">{currentUser.department}</p>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4">
            <h4 className="font-medium">Informations personnelles</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Prénom</label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{currentUser.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Nom</label>
                {isEditing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{currentUser.lastName}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                {isEditing ? (
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{currentUser.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Téléphone</label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{currentUser.phone || 'Non renseigné'}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Bio</label>
              {isEditing ? (
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              ) : (
                <p className="font-medium">{currentUser.bio || 'Aucune bio'}</p>
              )}
            </div>
          </div>

          {/* Intégrations */}
          <div className="space-y-4">
            <h4 className="font-medium">Intégrations</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Google Calendar</p>
                    <p className="text-sm text-gray-600">Synchroniser votre agenda</p>
                  </div>
                </div>
                {currentUser.googleCalendarConnected ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Connecté
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => connectGoogleCalendar(currentUser.id)}>
                    <Link className="h-4 w-4 mr-2" />
                    Connecter
                  </Button>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Gmail</p>
                    <p className="text-sm text-gray-600">Envoyer des emails depuis l'app</p>
                  </div>
                </div>
                {currentUser.gmailConnected ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Connecté
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => connectGmail(currentUser.id)}>
                    <Link className="h-4 w-4 mr-2" />
                    Connecter
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Sauvegarder
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
