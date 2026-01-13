import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Palette, Globe, Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

export const FaviconManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Récupérer le favicon actuel
    const currentFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (currentFavicon) {
      setFaviconUrl(currentFavicon.href);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image');
      return;
    }

    setUploading(true);
    try {
      // Simuler l'upload (en réalité, cela devrait utiliser Supabase Storage)
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulation d'un délai d'upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer une URL locale pour la démonstration
      const localUrl = URL.createObjectURL(file);
      setFaviconUrl(localUrl);
      
      toast.success('Favicon uploadé avec succès');
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlFavicon = () => {
    if (!faviconUrl.trim()) {
      toast.error('Veuillez entrer une URL valide');
      return;
    }

    try {
      new URL(faviconUrl);
      updateFavicon(faviconUrl);
      toast.success('Favicon mis à jour');
    } catch {
      toast.error('URL invalide');
    }
  };

  const updateFavicon = (url: string) => {
    // Mettre à jour le favicon dans le DOM
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = url;
    
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('customFavicon', url);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Gérer le Favicon</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Gestionnaire de Favicon</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aperçu actuel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aperçu actuel</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt="Favicon actuel" 
                  className="w-8 h-8"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/favicon.ico';
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <FileText className="h-4 w-4 text-gray-500" />
                </div>
              )}
              <span className="text-sm text-muted-foreground">
                {faviconUrl || 'Aucun favicon personnalisé'}
              </span>
            </CardContent>
          </Card>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload de fichier</TabsTrigger>
              <TabsTrigger value="url">URL externe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Uploader un nouveau favicon</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="favicon-file">Sélectionner un fichier image</Label>
                    <Input
                      id="favicon-file"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Formats recommandés: PNG, ICO, SVG. Taille idéale: 32x32px
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>URL externe</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="favicon-url">URL du favicon</Label>
                    <Input
                      id="favicon-url"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="https://example.com/favicon.png"
                      className="mt-2"
                    />
                  </div>
                  
                  <Button onClick={handleUrlFavicon} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Appliquer le favicon
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">Note importante</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Les changements de favicon peuvent prendre quelques minutes à apparaître 
                  en raison du cache du navigateur. Actualisez la page (Ctrl+F5) pour voir les changements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};