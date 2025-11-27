import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
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
  category?: string;
  tags?: string[];
  source_type?: string;
  source_id?: string;
  created_at: string;
}

export const MEDIA_CATEGORIES = [
  { value: 'general', label: 'Général' },
  { value: 'notes_de_frais', label: 'Notes de frais' },
  { value: 'spectacles', label: 'Spectacles' },
  { value: 'artistes', label: 'Artistes' },
  { value: 'documents', label: 'Documents' },
  { value: 'photos', label: 'Photos' },
  { value: 'logos', label: 'Logos' },
] as const;

export const useBackgroundImages = (categoryFilter?: string) => {
  const { user } = useAuth();
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (!user) {
      setImages([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('background_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply category filter if provided
      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Cast the data to include new fields
      const typedData = (data || []).map(item => ({
        ...item,
        category: (item as any).category || 'general',
        tags: (item as any).tags || [],
        source_type: (item as any).source_type || 'upload',
        source_id: (item as any).source_id || null,
      })) as BackgroundImage[];
      
      setImages(typedData);
    } catch (error) {
      console.error('Error fetching background images:', error);
      toast.error('Erreur lors du chargement des images');
    } finally {
      setLoading(false);
    }
  }, [user, categoryFilter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const uploadImage = async (
    file: File, 
    category: string = 'general',
    tags: string[] = []
  ): Promise<BackgroundImage | null> => {
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

      // Create database record with category and tags
      const { data, error: dbError } = await supabase
        .from('background_images')
        .insert({
          user_id: user.id,
          name: file.name,
          url: publicUrl,
          file_size: file.size,
          category,
          tags,
          source_type: 'upload'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success('Image uploadée avec succès');
      await fetchImages();
      return data as BackgroundImage;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const updateImage = async (
    imageId: string, 
    updates: { category?: string; tags?: string[]; name?: string }
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('background_images')
        .update(updates)
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Image mise à jour');
      await fetchImages();
      return true;
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
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

  // Get images grouped by category
  const getImagesByCategory = useCallback(() => {
    const grouped: Record<string, BackgroundImage[]> = {};
    
    images.forEach(image => {
      const cat = image.category || 'general';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(image);
    });

    return grouped;
  }, [images]);

  // Get unique tags
  const getAllTags = useCallback(() => {
    const allTags = new Set<string>();
    images.forEach(image => {
      (image.tags || []).forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  }, [images]);

  return {
    images,
    loading,
    uploading,
    uploadImage,
    updateImage,
    deleteImage,
    refetch: fetchImages,
    getImagesByCategory,
    getAllTags
  };
};