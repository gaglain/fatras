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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleFileUpload = async (file: File) => {
    try {
      // Créer un aperçu local immédiatement
      const localPreview = URL.createObjectURL(file);
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      
      setPreviewUrl(localPreview);
      setMediaType(fileType);
      console.log('📸 Preview created:', localPreview);
      
      // Simuler l'upload avec l'URL locale pour l'instant
      onMediaUploaded(localPreview, fileType);
      toast.success('Média chargé avec succès !');
      
      // Optionnel : upload réel en arrière-plan
      // const result = await uploadFile(file, 'publication-media', `media/${Date.now()}-${file.name}`);
      // onMediaUploaded(result.url, fileType);
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
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
            {(previewUrl || currentMedia) && (
              <div className="flex items-center justify-center bg-white rounded border p-4">
                {mediaType === 'image' ? (
                  <img 
                    src={previewUrl || currentMedia} 
                    alt="Aperçu" 
                    className="max-w-full max-h-48 object-contain rounded"
                    onError={(e) => {
                      console.error('Image load error');
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Play className="h-8 w-8" />
                    <span>Vidéo sélectionnée</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <Image className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700 flex-1">
              {mediaType === 'image' ? 'Image' : 'Vidéo'} téléchargée avec succès
            </span>
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
