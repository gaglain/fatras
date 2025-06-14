
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User, Save, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, updateUser } = useUser();
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || ''
  });

  // S'assurer que les données sont à jour avec l'utilisateur connecté
  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    if (currentUser?.id) {
      updateUser(currentUser.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || ''
    });
    setIsEditing(false);
  };

  // Afficher les informations de l'utilisateur authentifié
  const displayUser = currentUser || {
    name: authUser?.user_metadata?.first_name || 'Utilisateur',
    lastName: authUser?.user_metadata?.last_name || '',
    email: authUser?.email || '',
    avatar: authUser?.user_metadata?.avatar_url || ''
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center text-lg">
            <User className="h-5 w-5 mr-2" />
            Profil utilisateur
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={displayUser.avatar} alt={displayUser.name} />
                <AvatarFallback className="text-lg">
                  {(displayUser.name?.charAt(0) || '') + (displayUser.lastName?.charAt(0) || '')}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                disabled={!isEditing}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Prénom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                placeholder="Votre prénom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Une courte description..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-2 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Modifier le profil
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
