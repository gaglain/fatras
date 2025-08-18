import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, User, Edit2, Save } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useUserManagement } from '@/hooks/useUserManagement';
import { toast } from 'sonner';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser } = useUser();
  const { user: authUser } = useAuth();
  const { uploadFile } = useFileUpload();
  const { updateUserProfile, loading } = useUserManagement();
  const [isEditing, setIsEditing] = useState(false);

  // Utiliser currentUser comme source principale, avec authUser comme fallback
  const displayUser = currentUser || {
    id: authUser?.id || '',
    name: authUser?.user_metadata?.first_name || '',
    lastName: authUser?.user_metadata?.last_name || '',
    email: authUser?.email || '',
    role: 'utilisateur' as const,
    isActive: true,
    avatar: authUser?.user_metadata?.avatar_url || ''
  };

  const [formData, setFormData] = useState({
    firstName: displayUser.name || '',
    lastName: displayUser.lastName || '',
    email: displayUser.email || '',
    phone: currentUser?.phone || '',
    avatar: displayUser.avatar || ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.name || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        avatar: currentUser.avatar || ''
      });
    }
  }, [currentUser]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5MB');
      return;
    }

    try {
      const uploadResult = await uploadFile(file, 'avatars');
      setFormData(prev => ({ ...prev, avatar: uploadResult.url }));
      toast.success('Photo de profil mise à jour');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de la photo');
      setFormData(prev => ({ ...prev, avatar: displayUser.avatar || '' }));
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.firstName.trim()) {
        toast.error('Le prénom est requis');
        return;
      }

      if (authUser?.id) {
        const success = await updateUserProfile(authUser.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          avatar_url: formData.avatar
        });

        if (success) {
          setIsEditing(false);
          toast.success('Profil mis à jour avec succès');
        }
      } else {
        toast.error('Impossible de sauvegarder : utilisateur non connecté');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: displayUser.name || '',
      lastName: displayUser.lastName || '',
      email: displayUser.email || '',
      phone: currentUser?.phone || '',
      avatar: displayUser.avatar || ''
    });
    setIsEditing(false);
  };

  return (
    <div 
      className="fixed inset-0 flex items-start justify-center p-4 pt-8 overflow-y-auto bg-black/50 z-[999999]"
    >
      <Card className="w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto bg-background border shadow-2xl my-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center text-lg">
            <User className="h-5 w-5 mr-2" />
            Profil utilisateur
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-border shadow-lg">
                <AvatarImage 
                  src={formData.avatar} 
                  alt={formData.firstName}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl font-bold">
                  {(formData.firstName?.charAt(0) || 'U') + (formData.lastName?.charAt(0) || 'S')}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {isEditing && (
              <div className="text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Label 
                  htmlFor="avatar-upload"
                  className="cursor-pointer text-sm text-primary hover:underline"
                >
                  Changer la photo
                </Label>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              {isEditing ? (
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{displayUser.name || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              {isEditing ? (
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{displayUser.lastName || 'Non renseigné'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <p className="mt-1 text-sm text-muted-foreground">{displayUser.email || 'Non renseigné'}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{currentUser?.phone || 'Non renseigné'}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-2 pt-4">
            {!isEditing ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier le profil
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={handleSave}
                  disabled={loading}
                >
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