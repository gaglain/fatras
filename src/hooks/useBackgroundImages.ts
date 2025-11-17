import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface BackgroundImage {
  id: string;
  user_id: string;
  name: string;
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  file_size?: number;
  created_at: string;
}

export const useBackgroundImages = () => {
  const { user } = useAuthContext();
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    if (!user) {
      setImages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching background images:', error);
      toast.error('Erreur lors du chargement des images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [user]);

  const uploadImage = async (file: File): Promise<BackgroundImage | null> => {
    if (!user) {
      toast.error('Vous devez être connecté pour uploader une image');
      return null;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('background-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('background-images')
        .getPublicUrl(fileName);

      // Create database record
      const { data, error: dbError } = await supabase
        .from('background_images')
        .insert({
          user_id: user.id,
          name: file.name,
          url: publicUrl,
          file_size: file.size
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Image uploadée avec succès');
      await fetchImages();
      return data;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!user) return;

    try {
      const image = images.find(img => img.id === imageId);
      if (!image) return;

      // Delete from storage
      const fileName = image.url.split('/').slice(-2).join('/');
      await supabase.storage
        .from('background-images')
        .remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from('background_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      toast.success('Image supprimée');
      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  return {
    images,
    loading,
    uploading,
    uploadImage,
    deleteImage,
    refetch: fetchImages
  };
};
