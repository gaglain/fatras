import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ImageGallery } from '@/components/website/ImageGallery';

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  bucket?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImage,
  bucket = 'website-images',
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const { user } = useAuthContext();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Le fichier doit faire moins de ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);

    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Uploader vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
      toast.success('Image uploadée avec succès !');

    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      <Label>Image</Label>
      
      {previewUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="p-6">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, WebP ou GIF (max {maxSizeMB}MB)
                    </p>
                  </div>
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  className="mt-4"
                  asChild
                >
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? 'Upload en cours...' : 'Nouveau fichier'}
                  </Label>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <ImageGallery 
            onImageSelect={(url) => {
              setPreviewUrl(url);
              onImageUploaded(url);
            }}
            selectedImage={previewUrl}
          />
        </div>
      )}
    </div>
  );
};