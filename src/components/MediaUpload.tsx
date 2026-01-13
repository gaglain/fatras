import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image, Play, Folder, Zap } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { ImageGalleryPicker } from '@/components/website/ImageGalleryPicker';
import { optimizeImage, createOptimizedFile, shouldOptimize } from '@/utils/imageOptimizer';

interface MediaUploadProps {
  onMediaUploaded: (url: string, type: 'image' | 'video') => void;
  currentMedia?: string;
  onMediaRemoved: () => void;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaUploaded,
  currentMedia,
  onMediaRemoved
}) => {
  const { uploadFile, isUploading } = useFileUpload();
  const [dragOver, setDragOver] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentMedia || null);
  
  // Détecter automatiquement le type de média
  const detectMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const isVideo = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    return isVideo ? 'video' : 'image';
  };
  
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    currentMedia ? detectMediaType(currentMedia) : 'image'
  );

  // Mettre à jour previewUrl quand currentMedia change
  React.useEffect(() => {
    if (currentMedia) {
      setPreviewUrl(currentMedia);
      setMediaType(detectMediaType(currentMedia));
    }
  }, [currentMedia]);

  const handleFileUpload = async (file: File) => {
    try {
      const fileType: 'image' | 'video' = file.type.startsWith('image/') ? 'image' : 'video';

      let fileToUpload = file;
      let savedBytes = 0;

      // Optimiser automatiquement les images
      if (fileType === 'image' && shouldOptimize(file, 100)) {
        setIsOptimizing(true);
        
        const result = await optimizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: 'webp',
          maxSizeKB: 300
        });

        if (result.compressionRatio > 1.1) {
          fileToUpload = createOptimizedFile(result.blob, file.name, result.format);
          savedBytes = file.size - result.optimizedSize;
        }
        setIsOptimizing(false);
      }

      // Upload vers Supabase Storage (bucket public publication-media)
      const result = await uploadFile(
        fileToUpload,
        'publication-media',
        fileType === 'image' ? 'images' : 'videos'
      );

      setPreviewUrl(result.url);
      setMediaType(fileType);

      onMediaUploaded(result.url, fileType);
      
      if (savedBytes > 0) {
        toast.success(`Image optimisée ! ${(savedBytes / 1024).toFixed(0)}KB économisés`);
      } else {
        toast.success(`${fileType === 'image' ? 'Image' : 'Vidéo'} téléchargée avec succès !`);
      }
    } catch {
      setIsOptimizing(false);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleLibrarySelect = (url: string, type?: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'other') => {
    const mediaType: 'image' | 'video' = (type === 'video') ? 'video' : 'image';
    setPreviewUrl(url);
    setMediaType(mediaType);
    onMediaUploaded(url, mediaType);
    toast.success(`${mediaType === 'image' ? 'Image' : 'Vidéo'} sélectionnée depuis la bibliothèque`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onMediaRemoved();
  };

  return (
    <div className="space-y-4">
      <Label>Média (image ou vidéo)</Label>
      
      {(currentMedia || previewUrl) ? (
        <div className="space-y-3">
          {/* Aperçu du média */}
          <div className="p-3 bg-muted rounded-lg border">
            {(previewUrl || currentMedia) && (
              <div className="flex items-center justify-center bg-background rounded border p-4">
                {mediaType === 'image' ? (
                  previewUrl || currentMedia ? (
                    <img 
                      src={previewUrl || currentMedia} 
                      alt="Aperçu" 
                      className="max-w-full max-h-48 object-contain rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-sm text-muted-foreground space-y-2">
                      <Image className="h-12 w-12 text-muted-foreground/30" />
                      <span>Aucun média à prévisualiser</span>
                    </div>
                  )
                ) : (
                  (previewUrl || currentMedia) ? (
                    <video 
                      src={previewUrl || currentMedia}
                      className="max-w-full max-h-48 rounded"
                      controls
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-sm text-muted-foreground space-y-2">
                      <Play className="h-12 w-12 text-muted-foreground/30" />
                      <span>Aucune vidéo à prévisualiser</span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">
                {mediaType === 'image' ? 'Image' : 'Vidéo'} téléchargée
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(previewUrl || currentMedia) && (
                <a
                  href={previewUrl || currentMedia || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Ouvrir
                </a>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Options de remplacement */}
          <div className="flex flex-col gap-2">
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              disabled={isUploading || isOptimizing}
              className="hidden"
              id="media-replace"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading || isOptimizing}
              onClick={() => document.getElementById('media-replace')?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Optimisation...' : isUploading ? 'Téléchargement...' : 'Remplacer par un autre fichier'}
            </Button>
            
            <ImageGalleryPicker
              onSelect={handleLibrarySelect}
              buttonText="Remplacer depuis la bibliothèque"
              acceptedTypes={['image', 'video']}
            />
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">
            Glissez-déposez votre média ici ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-green-600 flex items-center justify-center gap-1 mb-4">
            <Zap className="h-3 w-3" />
            Optimisation automatique des images
          </p>
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            disabled={isUploading || isOptimizing}
            className="hidden"
            id="media-upload"
          />
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading || isOptimizing}
              onClick={() => document.getElementById('media-upload')?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isOptimizing ? 'Optimisation...' : isUploading ? 'Téléchargement...' : 'Depuis l\'ordinateur'}
            </Button>
            
            <ImageGalleryPicker
              onSelect={handleLibrarySelect}
              buttonText="Choisir depuis la bibliothèque"
              acceptedTypes={['image', 'video']}
            />
          </div>
        </div>
      )}
    </div>
  );
};
