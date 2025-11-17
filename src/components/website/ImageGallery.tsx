import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, X, Search, ImageIcon, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImageGalleryProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage?: string;
}

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  created_at: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ onImageSelect, selectedImage }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, user]);

  const loadImages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.storage
        .from('website-images')
        .list(user.id, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const imageList: GalleryImage[] = data
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          id: file.id || file.name,
          name: file.name,
          url: supabase.storage.from('website-images').getPublicUrl(`${user.id}/${file.name}`).data.publicUrl,
          created_at: file.created_at || ''
        }));

      setImages(imageList);
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      toast.error('Erreur lors du chargement des images');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier doit faire moins de 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('website-images')
        .upload(filePath, file);

      if (error) throw error;

      toast.success('Image uploadée avec succès !');
      loadImages();
    } catch (error: any) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    setIsOpen(false);
  };

  const deleteImage = async (imageName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.storage
        .from('website-images')
        .remove([`${user.id}/${imageName}`]);

      if (error) throw error;

      toast.success('Image supprimée');
      loadImages();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ImageIcon className="h-4 w-4 mr-2" />
          Choisir depuis la galerie
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Galerie d'images</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une image..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="gallery-upload"
              />
              <Button
                variant="outline"
                disabled={isUploading}
                asChild
              >
                <label htmlFor="gallery-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Upload...' : 'Ajouter'}
                </label>
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            {filteredImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune image trouvée</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredImages.map((image) => (
                  <Card
                    key={image.id}
                    className={`relative cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                      selectedImage === image.url ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleImageSelect(image.url)}
                  >
                    <CardContent className="p-2">
                      <div className="aspect-square relative">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover rounded"
                        />
                        {selectedImage === image.url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded">
                            <Check className="h-6 w-6 text-primary-foreground" />
                          </div>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.name);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs mt-1 truncate" title={image.name}>
                        {image.name}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};