import React, { useState } from 'react';
import { useBackgroundImages } from '@/hooks/useBackgroundImages';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Trash2, Check, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BackgroundImageManagerProps {
  selectedImageUrl?: string;
  onSelectImage: (url: string) => void;
}

export const BackgroundImageManager: React.FC<BackgroundImageManagerProps> = ({
  selectedImageUrl,
  onSelectImage
}) => {
  const { images, loading, uploading, uploadImage, deleteImage } = useBackgroundImages();
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }
    await uploadImage(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-primary bg-accent' : 'border-border'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
          id="bg-image-upload"
          disabled={uploading}
        />
        <label htmlFor="bg-image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {uploading ? 'Upload en cours...' : 'Cliquez ou glissez une image ici'}
            </div>
          </div>
        </label>
      </div>

      <ScrollArea className="h-[300px]">
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-video" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p className="text-sm">Aucune image de fond</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {images.map((image) => (
              <Card
                key={image.id}
                className={`relative group cursor-pointer overflow-hidden aspect-video ${
                  selectedImageUrl === image.url ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                {selectedImageUrl === image.url && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(image.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
