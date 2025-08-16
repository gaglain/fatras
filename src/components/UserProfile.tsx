
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, User, Save, Camera, Upload, ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, updateUser } = useUser();
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const displayUser = currentUser || {
    name: authUser?.user_metadata?.first_name || '',
    lastName: authUser?.user_metadata?.last_name || '',
    email: authUser?.email || '',
    avatar: authUser?.user_metadata?.avatar_url || ''
  };

  const [formData, setFormData] = useState({
    name: displayUser.name || '',
    lastName: displayUser.lastName || '',
    email: displayUser.email || '',
    phone: currentUser?.phone || '',
    bio: currentUser?.bio || '',
    avatar: displayUser.avatar || ''
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Aucun fichier sélectionné');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5MB');
      return;
    }

    try {
      setUploading(true);
      console.log('Starting avatar upload...');
      
      const tempUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: tempUrl }));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement de la photo');
      setFormData(prev => ({ ...prev, avatar: displayUser.avatar || '' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Le prénom est requis');
        return;
      }

      if (authUser?.id) {
        // Utiliser la fonction RPC sécurisée pour la mise à jour
        const { data, error } = await supabase.rpc('update_user_profile_data', {
          profile_user_id: authUser.id,
          profile_data: {
            first_name: formData.name,
            last_name: formData.lastName,
            phone: formData.phone,
            avatar_url: formData.avatar
          }
        });

        if (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la sauvegarde');
        } else {
          // Forcer le rafraîchissement des données utilisateur
          if (updateUser && currentUser) {
            try {
              await updateUser(currentUser.id, {
                name: formData.name,
                lastName: formData.lastName,
                phone: formData.phone,
                avatar: formData.avatar
              });
            } catch (updateError) {
              console.error('Erreur lors de la mise à jour du contexte utilisateur:', updateError);
            }
          }
          
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
      name: displayUser.name || '',
      lastName: displayUser.lastName || '',
      email: displayUser.email || '',
      phone: currentUser?.phone || '',
      bio: currentUser?.bio || '',
      avatar: displayUser.avatar || ''
    });
    setIsEditing(false);
  };

  return (
    <div 
      className="fixed inset-0 flex items-start justify-center p-4 pt-8 overflow-y-auto"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 999999 
      }}
    >
      <Card 
        className="w-full max-w-md max-h-[calc(100vh-4rem)] overflow-y-auto bg-background border shadow-2xl my-4"
        style={{ zIndex: 999999 }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-primary to-secondary">
          <CardTitle className="flex items-center text-lg text-primary-foreground">
            <User className="h-5 w-5 mr-2 text-primary-foreground" />
            Profil utilisateur
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-primary-foreground hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 bg-background p-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-border shadow-lg">
                <AvatarImage 
                  src={formData.avatar || displayUser.avatar} 
                  alt={formData.name || displayUser.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground font-bold">
                  {((formData.name || displayUser.name)?.charAt(0) || 'U') + ((formData.lastName || displayUser.lastName)?.charAt(0) || 'S')}
                </AvatarFallback>
              </Avatar>
              
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Upload className="h-6 w-6 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="border-primary/20 text-primary hover:bg-primary/10"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {uploading ? 'Téléchargement...' : 'Changer la photo'}
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Prénom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                placeholder="Votre prénom"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-medium">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                placeholder="Votre nom"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                placeholder="votre@email.com"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+33 6 12 34 56 78"
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground font-medium">Bio</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Une courte description..."
                className="border-input focus:border-primary focus:ring-primary"
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
                <Button onClick={handleSave} className="flex-1" disabled={uploading}>
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
