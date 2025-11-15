import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBackgroundImages } from '@/hooks/useBackgroundImages';
import { Upload, Link2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  children?: React.ReactNode;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ value, onChange, children }) => {
  const [open, setOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { images, loading, uploadImage } = useBackgroundImages();
  const [uploading, setUploading] = useState(false);

  const handleUrlSubmit = () => {
    if (urlInput) {
      onChange(urlInput);
      setOpen(false);
      toast.success('Image ajoutée');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedImage = await uploadImage(file);
      if (uploadedImage?.url) {
        onChange(uploadedImage.url);
        setOpen(false);
        toast.success('Image téléchargée');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    onChange(imageUrl);
    setOpen(false);
    toast.success('Image sélectionnée');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <ImageIcon className="h-4 w-4 mr-2" />
            Choisir une image
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sélectionner une image</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery">
              <ImageIcon className="h-4 w-4 mr-2" />
              Galerie
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Télécharger
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement...</div>
              ) : images.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune image disponible</p>
                  <p className="text-sm mt-1">Téléchargez une image pour commencer</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => handleSelectImage(image.url)}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                    >
                      <img
                        src={image.thumbnail_url || image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Sélectionner</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload-input"
                  disabled={uploading}
                />
                <label htmlFor="image-upload-input" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium mb-1">
                    {uploading ? 'Téléchargement...' : 'Cliquez pour télécharger'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF jusqu'à 10MB
                  </p>
                </label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label>URL de l'image</Label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
              </div>
              {urlInput && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Aperçu :</p>
                  <img
                    src={urlInput}
                    alt="Aperçu"
                    className="max-w-full max-h-48 mx-auto rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Button onClick={handleUrlSubmit} className="w-full" disabled={!urlInput}>
                Utiliser cette URL
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
