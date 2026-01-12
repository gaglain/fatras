import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { optimizeImage, createOptimizedFile, shouldOptimize, OptimizationOptions } from '@/utils/imageOptimizer';
import { logger } from '@/lib/logger';

interface UploadResult {
  url: string;
  path: string;
  name: string;
  optimized?: boolean;
  originalSize?: number;
  finalSize?: number;
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
        logger.debug(`Creating bucket: ${bucketName}`);
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (error) {
          logger.error(`Error creating bucket ${bucketName}:`, error);
          throw error;
        }
        
        logger.debug(`Bucket ${bucketName} created successfully`);
      }
    } catch (error) {
      logger.error(`Error managing bucket ${bucketName}:`, error);
      // Continue même si la création du bucket échoue
    }
  };

  const uploadFile = async (
    file: File,
    bucketName: string = 'app-files',
    folder: string = 'uploads',
    optimizationOptions?: OptimizationOptions
  ): Promise<UploadResult> => {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Créer le bucket si nécessaire
      await createBucketIfNotExists(bucketName);

      let fileToUpload: File = file;
      let wasOptimized = false;
      let originalSize = file.size;

      // Optimiser automatiquement les images si nécessaire
      if (file.type.startsWith('image/') && shouldOptimize(file, 100)) {
        logger.debug('Optimisation automatique de l\'image...');
        setUploadProgress(10);
        
        const result = await optimizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: 'webp',
          maxSizeKB: 300,
          ...optimizationOptions
        });

        if (result.compressionRatio > 1.1) {
          fileToUpload = createOptimizedFile(result.blob, file.name, result.format);
          wasOptimized = true;
          logger.debug(`Image optimisée: ${(originalSize / 1024).toFixed(0)}KB → ${(result.optimizedSize / 1024).toFixed(0)}KB`);
        }
        
        setUploadProgress(30);
      }

      // Générer un nom de fichier unique
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      logger.debug(`Uploading file: ${fileName} to bucket: ${bucketName}`);

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload le fichier
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        logger.error('Upload error:', error);
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
        name: file.name,
        optimized: wasOptimized,
        originalSize: originalSize,
        finalSize: fileToUpload.size
      };

      logger.debug('File uploaded successfully:', result.path);
      
      if (wasOptimized) {
        const savedKB = ((originalSize - fileToUpload.size) / 1024).toFixed(0);
        toast.success(`Image optimisée ! ${savedKB}KB économisés`);
      } else {
        toast.success(`Fichier "${file.name}" uploadé avec succès`);
      }

      return result;

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Upload failed:', error);
      toast.error(`Erreur lors de l'upload: ${msg}`);
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
      
      logger.debug('File deleted successfully:', filePath);
      toast.success('Fichier supprimé');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      logger.error('Delete failed:', error);
      toast.error(`Erreur lors de la suppression: ${msg}`);
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
