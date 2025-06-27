
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, X, Image } from 'lucide-react';
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
  const { uploadFile, uploading } = useFileUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      const url = await uploadFile(file, 'publication-media', `media/${Date.now()}-${file.name}`);
      onMediaUploaded(url, mediaType);
      toast.success('Média téléchargé avec succès !');
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

  return (
    <div className="space-y-4">
      <Label>Média (image ou vidéo)</Label>
      
      {currentMedia ? (
        <div className="relative">
          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
            <Image className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-700">Média téléchargé</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMediaRemoved}
              className="ml-auto text-red-600 hover:text-red-700"
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
            disabled={uploading}
            className="hidden"
            id="media-upload"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('media-upload')?.click()}
          >
            {uploading ? 'Téléchargement...' : 'Choisir un fichier'}
          </Button>
        </div>
      )}
    </div>
  );
};
