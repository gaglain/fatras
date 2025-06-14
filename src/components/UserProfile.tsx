import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User, Save, Camera, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, updateUser } = useUser();
  const { user: authUser } = useAuth();
  const { uploadFile, uploading } = useFileUpload();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || ''
  });

  // S'assurer que les données sont à jour avec l'utilisateur connecté
  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || ''
      });
    }
  }, [currentUser]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser?.id) {
      console.log('No file selected or no user ID');
      return;
    }

    try {
      console.log('Starting avatar upload for user:', authUser.id);
      const imageUrl = await uploadFile(file, 'avatars', `${authUser.id}/profile`);
      console.log('Avatar uploaded successfully:', imageUrl);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
      toast.success('Photo de profil téléchargée avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de la photo');
    }
  };

  const handleSave = () => {
    if (currentUser?.id) {
      updateUser(currentUser.id, formData);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || '',
      avatar: currentUser?.avatar || ''
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
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#ec5f65] border-[#ec5f65]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-[#ec5f65]">
          <CardTitle className="flex items-center text-lg text-white">
            <User className="h-5 w-5 mr-2 text-white" />
            Profil utilisateur
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 bg-white">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.avatar || displayUser.avatar} alt={formData.name || displayUser.name} />
                <AvatarFallback className="text-lg bg-[#ec5f65] text-white">
                  {((formData.name || displayUser.name)?.charAt(0) || '') + ((formData.lastName || displayUser.lastName)?.charAt(0) || '')}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full border-[#1632f4] text-[#1632f4] hover:bg-[#1632f4] hover:text-white"
                disabled={!isEditing || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Upload className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1632f4]">Prénom</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                placeholder="Votre prénom"
                className="border-[#1632f4] focus:border-[#1632f4] focus:ring-[#1632f4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#1632f4]">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                placeholder="Votre nom"
                className="border-[#1632f4] focus:border-[#1632f4] focus:ring-[#1632f4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1632f4]">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                placeholder="votre@email.com"
                className="border-[#1632f4] focus:border-[#1632f4] focus:ring-[#1632f4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#1632f4]">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+33 6 12 34 56 78"
                className="border-[#1632f4] focus:border-[#1632f4] focus:ring-[#1632f4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[#1632f4]">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Une courte description..."
                className="border-[#1632f4] focus:border-[#1632f4] focus:ring-[#1632f4]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-2 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="w-full bg-[#1632f4] hover:bg-[#1632f4]/80 text-white">
                Modifier le profil
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} className="flex-1 border-[#1632f4] text-[#1632f4] hover:bg-[#1632f4] hover:text-white">
                  Annuler
                </Button>
                <Button onClick={handleSave} className="flex-1 bg-[#ec5f65] hover:bg-[#ec5f65]/80 text-white" disabled={uploading}>
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
