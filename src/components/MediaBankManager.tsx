import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Upload, Image as ImageIcon, FileText, Trash2, Eye, 
  Filter, FolderOpen, Tag, X, Edit2, Music
} from 'lucide-react';
import { useBackgroundImages, BackgroundImage, MEDIA_CATEGORIES } from '@/hooks/useBackgroundImages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDocumentUrl } from '@/utils/documentPermalinks';

interface Artist {
  id: string;
  name: string;
}

export const MediaBankManager: React.FC = () => {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [artistFilter, setArtistFilter] = useState<string>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<BackgroundImage | null>(null);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadArtistId, setUploadArtistId] = useState<string>('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);

  const { 
    images, 
    loading, 
    uploading, 
    uploadImage, 
    updateImage,
    deleteImage, 
    getImagesByCategory,
    getAllTags 
  } = useBackgroundImages(categoryFilter === 'all' ? undefined : categoryFilter);

  // Fetch artists
  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
      
      if (data && !error) {
        setArtists(data);
      }
    };
    
    fetchArtists();
  }, [user]);

  const allTags = getAllTags();
  const imagesByCategory = getImagesByCategory();

  // Filter by tag and artist if specified
  let filteredImages = images;
  
  if (tagFilter && tagFilter !== 'all') {
    filteredImages = filteredImages.filter(img => (img.tags || []).includes(tagFilter));
  }
  
  if (artistFilter && artistFilter !== 'all') {
    filteredImages = filteredImages.filter(img => img.source_id === artistFilter);
  }

  // Get artist name for display
  const getArtistName = (sourceId?: string) => {
    if (!sourceId) return null;
    return artists.find(a => a.id === sourceId)?.name;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const tags = uploadTags.split(',').map(t => t.trim()).filter(Boolean);
    await uploadImage(selectedFile, uploadCategory, tags, uploadArtistId !== 'none' ? uploadArtistId : undefined);
    
    setShowUploadDialog(false);
    setSelectedFile(null);
    setUploadTags('');
    setUploadCategory('general');
    setUploadArtistId('none');
  };

  const handleDelete = async (image: BackgroundImage) => {
    if (confirm('Supprimer cette image définitivement ?')) {
      await deleteImage(image.id);
    }
  };

  const handleUpdateCategory = async (imageId: string, newCategory: string) => {
    await updateImage(imageId, { category: newCategory });
  };

  const getCategoryLabel = (category: string) => {
    return MEDIA_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-700',
      notes_de_frais: 'bg-green-100 text-green-700',
      spectacles: 'bg-purple-100 text-purple-700',
      artistes: 'bg-blue-100 text-blue-700',
      documents: 'bg-orange-100 text-orange-700',
      photos: 'bg-pink-100 text-pink-700',
      logos: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || colors.general;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Banque de Médias
          </CardTitle>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Ajouter un fichier
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {MEDIA_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label} ({imagesByCategory[cat.value]?.length || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {artists.length > 0 && (
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <Select value={artistFilter} onValueChange={setArtistFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les artistes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les artistes</SelectItem>
                  {artists.map(artist => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tous les tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(categoryFilter !== 'all' || tagFilter !== 'all' || artistFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setCategoryFilter('all');
                setTagFilter('all');
                setArtistFilter('all');
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun média trouvé</p>
            <p className="text-sm">Uploadez vos premiers fichiers</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <div 
                key={image.id} 
                className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                {/* Image preview */}
                {image.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img 
                    src={image.bucket_name && image.file_path 
                      ? getDocumentUrl(image.bucket_name, image.file_path, image.category)
                      : image.url
                    } 
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <FileText className="h-10 w-10 text-gray-400" />
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge className={`text-xs ${getCategoryColor(image.category || 'general')}`}>
                    {getCategoryLabel(image.category || 'general')}
                  </Badge>
                  {image.source_id && (
                    <Badge variant="secondary" className="text-xs">
                      <Music className="h-3 w-3 mr-1" />
                      {getArtistName(image.source_id)}
                    </Badge>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-2">
                    <a 
                      href={image.bucket_name && image.file_path 
                        ? getDocumentUrl(image.bucket_name, image.file_path, image.category)
                        : image.url
                      } 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </a>
                    <button 
                      onClick={() => setSelectedImage(image)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Edit2 className="h-4 w-4 text-gray-700" />
                    </button>
                    <button 
                      onClick={() => handleDelete(image)}
                      className="p-2 bg-white rounded-full hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                  <p className="text-white text-xs text-center px-2 truncate max-w-full">
                    {image.name}
                  </p>
                </div>

                {/* Tags */}
                {image.tags && image.tags.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                    {image.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{image.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un fichier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fichier</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIA_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Artiste/Spectacle (optionnel)</Label>
              <Select value={uploadArtistId} onValueChange={setUploadArtistId}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun artiste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun artiste</SelectItem>
                  {artists.map(artist => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (séparés par des virgules)</Label>
              <Input
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
                placeholder="roadshow, concert, 2024"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? 'Upload...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le fichier</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedImage.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <Label>Nom</Label>
                <p className="text-sm text-muted-foreground">{selectedImage.name}</p>
              </div>
              <div>
                <Label>Artiste/Spectacle</Label>
                <Select 
                  value={selectedImage.source_id || 'none'} 
                  onValueChange={(value) => updateImage(selectedImage.id, { source_id: value === 'none' ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun artiste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun artiste</SelectItem>
                    {artists.map(artist => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select 
                  value={selectedImage.category || 'general'} 
                  onValueChange={(value) => handleUpdateCategory(selectedImage.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDIA_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedImage.tags && selectedImage.tags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedImage.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedImage(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};