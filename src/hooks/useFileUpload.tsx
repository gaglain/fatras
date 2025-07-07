
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string = 'public', path?: string) => {
    try {
      setUploading(true);
      console.log('🔄 Starting file upload:', file.name);

      // Créer le bucket s'il n'existe pas
      await createBucketIfNotExists(bucket);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = path 
        ? `${path}/${timestamp}-${randomString}.${fileExt}`
        : `${timestamp}-${randomString}.${fileExt}`;

      console.log('📁 Uploading to:', bucket, 'filename:', fileName);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw error;
      }

      console.log('✅ Upload successful:', data);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('🔗 Public URL:', publicUrl);
      toast.success('Fichier téléchargé avec succès !');
      return publicUrl;
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
      toast.error(`Erreur lors du téléchargement: ${error.message}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const createBucketIfNotExists = async (bucketName: string) => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log('📦 Creating bucket:', bucketName);
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*', 'application/*', 'text/*']
        });
        
        if (error && !error.message.includes('already exists')) {
          console.error('❌ Error creating bucket:', error);
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not create bucket, may already exist:', error);
    }
  };

  return { uploadFile, uploading };
};
