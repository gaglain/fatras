import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  currentAvatarUrl?: string;
  userInitials?: string;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  userInitials = 'U',
  onAvatarChange,
  size = 'lg'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('La taille du fichier ne peut pas dépasser 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner un fichier image');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      uploadAvatar(file);
    }
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // Structure: userId/fileName.ext

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarChange(publicUrl);
      setPreviewUrl(null);
      toast.success('Photo de profil mise à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      let errorMessage = 'Erreur lors de l\'upload de la photo';
      
      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Vous devez être connecté pour uploader une photo';
      } else if (error.message?.includes('violates')) {
        errorMessage = 'Permissions insuffisantes pour uploader dans ce dossier';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    onAvatarChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const avatarUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-2 border-border cursor-pointer transition-all duration-200 group-hover:border-primary`}>
          <AvatarImage src={avatarUrl} alt="Avatar" />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors"
          disabled={uploading}
        >
          <Camera className="h-3 w-3" />
        </button>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center space-x-1"
        >
          <Upload className="h-4 w-4" />
          <span>Changer</span>
        </Button>
        
        {(avatarUrl || previewUrl) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeAvatar}
            disabled={uploading}
            className="flex items-center space-x-1 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            <span>Supprimer</span>
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};