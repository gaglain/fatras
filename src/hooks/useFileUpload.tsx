
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadResult {
  url: string;
  path: string;
  name: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createBucketIfNotExists = async (bucketName: string) => {
    try {
      // Vérifier si le bucket existe
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (error) {
          console.error(`Error creating bucket ${bucketName}:`, error);
          throw error;
        }
        
        console.log(`✅ Bucket ${bucketName} created successfully`);
      }
    } catch (error) {
      console.error(`Error managing bucket ${bucketName}:`, error);
      // Continue même si la création du bucket échoue
    }
  };

  const uploadFile = async (
    file: File,
    bucketName: string = 'app-files',
    folder: string = 'uploads'
  ): Promise<UploadResult> => {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Créer le bucket si nécessaire
      await createBucketIfNotExists(bucketName);

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log(`🔄 Uploading file: ${fileName} to bucket: ${bucketName}`);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload le fichier
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      setUploadProgress(100);

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const result: UploadResult = {
        url: urlData.publicUrl,
        path: fileName,
        name: file.name
      };

      console.log('✅ File uploaded successfully:', result);
      toast.success(`Fichier "${file.name}" uploadé avec succès`);

      return result;

    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      toast.error(`Erreur lors de l'upload: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const uploadImage = async (file: File): Promise<UploadResult> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }
    return uploadFile(file, 'publication-media', 'images');
  };

  const uploadDocument = async (file: File): Promise<UploadResult> => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format de document non supporté');
    }
    
    return uploadFile(file, 'app-files', 'documents');
  };

  const uploadAvatar = async (file: File): Promise<UploadResult> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }
    return uploadFile(file, 'avatars', 'profiles');
  };

  const deleteFile = async (bucketName: string, filePath: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) throw error;
      
      console.log('✅ File deleted successfully:', filePath);
      toast.success('Fichier supprimé');
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
      throw error;
    }
  };

  return {
    uploadFile,
    uploadImage,
    uploadDocument,
    uploadAvatar,
    deleteFile,
    isUploading,
    uploadProgress
  };
};
