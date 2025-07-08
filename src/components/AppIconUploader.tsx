
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { Upload, Image } from 'lucide-react';

export const AppIconUploader: React.FC = () => {
  const [iconUrl, setIconUrl] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const { uploadFile, isUploading } = useFileUpload();

  React.useEffect(() => {
    // Charger l'icône sauvegardée
    const savedIcon = localStorage.getItem('appIcon');
    if (savedIcon) {
      setIconUrl(savedIcon);
      setPreviewUrl(savedIcon);
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image (PNG, JPG, etc.)');
      return;
    }

    try {
      console.log('📱 Uploading app icon:', file.name);
      const result = await uploadFile(file, 'app-assets', 'icons');
      const url = result.url;
      setIconUrl(url);
      setPreviewUrl(url);
      
      // Sauvegarder dans localStorage
      localStorage.setItem('appIcon', url);
      
      // Mettre à jour le favicon
      updateFavicon(url);
      
      toast.success('Icône de l\'application mise à jour !');
    } catch (error) {
      console.error('❌ Error uploading icon:', error);
    }
  };

  const updateFavicon = (url: string) => {
    // Supprimer l'ancien favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Ajouter le nouveau favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    link.type = 'image/png';
    document.head.appendChild(link);
    
    console.log('🎯 Favicon updated:', url);
  };

  const handleUrlChange = (url: string) => {
    setIconUrl(url);
    setPreviewUrl(url);
    localStorage.setItem('appIcon', url);
    updateFavicon(url);
    toast.success('Icône mise à jour !');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Image className="h-5 w-5" />
          <span>Icône de l'Application</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label>Télécharger une image</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              {isUploading && (
                <p className="text-sm text-blue-600 mt-2">
                  ⏳ Téléchargement en cours...
                </p>
              )}
            </div>
          </div>

          <div className="text-center text-gray-500">ou</div>

          <div>
            <Label>URL de l'image</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                type="url"
                placeholder="https://example.com/icon.png"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
              />
              <Button 
                onClick={() => handleUrlChange(iconUrl)}
                disabled={!iconUrl}
                variant="outline"
              >
                Appliquer
              </Button>
            </div>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                <img 
                  src={previewUrl} 
                  alt="Icône de l'application" 
                  className="w-16 h-16 object-contain rounded-lg border"
                  onError={() => {
                    toast.error('Impossible de charger l\'image');
                    setPreviewUrl('');
                  }}
                />
                <div>
                  <p className="font-medium">Icône active</p>
                  <p className="text-sm text-gray-600">Cette icône sera utilisée comme favicon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
