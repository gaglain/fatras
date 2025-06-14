
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${path}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true,
        });

      if (error) {
        throw error;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement du fichier');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};
