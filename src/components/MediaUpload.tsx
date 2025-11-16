import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image, Play } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

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

      // Upload réel vers Supabase Storage (bucket public publication-media)
      const result = await uploadFile(
        file,
        'publication-media',
        fileType === 'image' ? 'images' : 'videos'
      );

      setPreviewUrl(result.url);
      setMediaType(fileType);
      console.log('📸 Preview set to uploaded URL:', result.url);

      onMediaUploaded(result.url, fileType);
      toast.success(`${fileType === 'image' ? 'Image' : 'Vidéo'} téléchargée avec succès !`);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du téléchargement');
    }
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
        <div className="relative">
          {/* Aperçu du média */}
          <div className="mb-3 p-3 bg-muted rounded-lg border">
            {(previewUrl || currentMedia) && (
              <div className="flex items-center justify-center bg-background rounded border p-4">
                {mediaType === 'image' ? (
                  previewUrl || currentMedia ? (
                    <img 
                      src={previewUrl || currentMedia} 
                      alt="Aperçu" 
                      className="max-w-full max-h-48 object-contain rounded"
                      onLoad={() => console.log('✅ Image loaded successfully')}
                      onError={() => {
                        console.warn('❌ Aperçu indisponible, URL invalide ou expirée');
                        setPreviewUrl(null);
                      }}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucun média à prévisualiser</div>
                  )
                ) : (
                  (previewUrl || currentMedia) ? (
                    <video 
                      src={previewUrl || currentMedia}
                      className="max-w-full max-h-48 rounded"
                      controls
                      onError={() => {
                        console.warn('❌ Aperçu vidéo indisponible');
                        setPreviewUrl(null);
                      }}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground">Aucune vidéo à prévisualiser</div>
                  )
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <Image className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700 flex-1">
              {mediaType === 'image' ? 'Image' : 'Vidéo'} téléchargée avec succès
            </span>
            {(previewUrl || currentMedia) ? (
              <a
                href={previewUrl || currentMedia || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                Ouvrir
              </a>
            ) : (
              <span className="text-sm text-amber-600">Aperçu indisponible (ancien lien). Remplacez le média.</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
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
          <p className="text-gray-600 mb-4">
            Glissez-déposez votre média ici ou cliquez pour sélectionner
          </p>
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id="media-upload"
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            {isUploading ? 'Téléchargement...' : 'Choisir un fichier'}
          </Button>
        </div>
      )}
    </div>
  );
};
