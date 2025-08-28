
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  FileText, 
  Upload,
  Folder,
  Download,
  Trash2,
  Loader2,
  Users,
  User,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/hooks/useAuth';
import { useShowBible, CreateDocumentData } from '@/hooks/useShowBible';
import { FilePreview } from '@/components/FilePreview';
import { DocumentPreview } from '@/components/DocumentPreview';
import { useCentralizedData } from '@/hooks/useCentralizedData';


interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: 'tech', name: 'Techniques', description: 'Fiches techniques et plans', color: 'bg-blue-100 text-blue-800' },
  { id: 'music', name: 'Musiques', description: 'Playbacks et arrangements', color: 'bg-purple-100 text-purple-800' },
  { id: 'video', name: 'Vidéos', description: 'Promo et extraits', color: 'bg-red-100 text-red-800' },
  { id: 'photos', name: 'Photos', description: 'Photos promo et spectacle', color: 'bg-green-100 text-green-800' },
  { id: 'scripts', name: 'Scripts', description: 'Scripts et scénarios', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'other', name: 'Autres', description: 'Documents divers', color: 'bg-gray-100 text-gray-800' }
];

export const ShowBible: React.FC = () => {
  const { user } = useAuth();
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();
  const { artists: spectacles } = useCentralizedData();
  const { documents, loading, createDocument, deleteDocument } = useShowBible();
  const [categories] = useState<Category[]>(defaultCategories);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [availableArtists, setAvailableArtists] = useState<{id: string, name: string}[]>([]);
  const [uploadForm, setUploadForm] = useState<{
    name: string;
    type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
    category: string;
    description: string;
    file: File | null;
    tags: string;
    version: string;
    artists: string[];
  }>({
    name: '',
    type: 'text',
    category: 'other',
    description: '',
    file: null,
    tags: '',
    version: '1.0',
    artists: []
  });

  // Récupérer tous les artistes uniques des documents
  useEffect(() => {
    const artistsFromDocuments = new Set<string>();
    documents.forEach(doc => {
      if (doc.artists) {
        doc.artists.forEach(artistId => artistsFromDocuments.add(artistId));
      }
    });

    // Mapper les IDs vers les noms
    const artistNameMap: Record<string, string> = {
      'artist-1': 'The Midnight Express',
      'artist-2': 'Sarah Mitchell', 
      'artist-3': 'Thunder Road',
      'artist-4': 'Acoustic Dreams'
    };

    const artistsList = Array.from(artistsFromDocuments).map(id => ({
      id,
      name: artistNameMap[id] || id.replace('artist-', 'Artiste ')
    }));

    setAvailableArtists(artistsList);
  }, [documents]);

  // Filtrer les documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesArtist = filterArtist === 'all' || (doc.artists && doc.artists.includes(filterArtist));
    return matchesCategory && matchesArtist;
  });


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ 
        ...prev, 
        file,
        name: file.name,
        type: getFileType(file.type)
      }));
    }
  };

  const getFileType = (mimeType: string): 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other' => {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'text';
    return 'other';
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.name.trim()) {
      toast.error('Veuillez sélectionner un fichier et saisir un nom');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour uploader des fichiers');
      return;
    }

    try {
      // Upload du fichier vers Supabase
      const uploadResult = await uploadFile(uploadForm.file, 'show-bible', uploadForm.category);
      
      const tags = uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const documentData: CreateDocumentData = {
        name: uploadForm.name,
        type: uploadForm.type,
        url: uploadResult.url,
        file_path: uploadResult.path,
        bucket_name: 'show-bible',
        file_size_bytes: uploadForm.file.size,
        file_size_display: formatFileSize(uploadForm.file.size),
        category: uploadForm.category,
        description: uploadForm.description || undefined,
        tags,
        version: uploadForm.version,
        artists: uploadForm.artists
      };

      const result = await createDocument(documentData);
      
      if (result) {
        setShowUploadDialog(false);
        setUploadForm({
          name: '',
          type: 'text',
          category: 'other',
          description: '',
          file: null,
          tags: '',
          version: '1.0',
          artists: []
        });
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    await deleteDocument(doc.id, doc.file_path, doc.bucket_name);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 p-4 lg:p-0" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>
            Bible du Spectacle
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Centralisez tous vos documents, médias et ressources
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="w-full lg:w-auto" style={{
              backgroundColor: 'var(--app-button-bg, #1632f4)',
              color: 'var(--app-button-text, #ffffff)'
            }}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajouter Document</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Fichier</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{
                    borderColor: 'var(--notification-border, #e5e7eb)'
                  }}>
                    <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--app-text, #666666)' }} />
                    <p className="text-sm mb-2" style={{ color: 'var(--app-text, #666666)' }}>
                      Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="*/*"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Sélectionner un fichier
                    </Button>
                    {uploadForm.file && (
                      <p className="text-sm text-green-600 mt-2">
                        Fichier sélectionné: {uploadForm.file.name}
                      </p>
                    )}
                  </div>
                </div>
                
                {uploadForm.file && (
                  <FilePreview file={uploadForm.file} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom du document</label>
                  <Input
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="Nom d'affichage du document"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Version</label>
                  <Input
                    value={uploadForm.version}
                    onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                    placeholder="ex: 1.0, 2.1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
                <Input
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="ex: urgent, technique, final"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Spectacles associés</label>
                <Select 
                  value={uploadForm.artists[0] || 'none'} 
                  onValueChange={(value) => setUploadForm({ 
                    ...uploadForm, 
                    artists: value === 'none' ? [] : [value] 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un spectacle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun spectacle</SelectItem>
                    {spectacles.map((spectacle) => (
                      <SelectItem key={spectacle.id} value={spectacle.id}>
                        {spectacle.name} - {spectacle.genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Description du document..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={handleUpload} 
                  className="flex-1"
                  disabled={isUploading || !uploadForm.file}
                >
                  {isUploading ? `Upload... ${uploadProgress}%` : 'Ajouter'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filtrer par catégorie</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filtrer par artiste</label>
          <Select value={filterArtist} onValueChange={setFilterArtist}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les artistes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les artistes</SelectItem>
              {availableArtists.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(filterCategory !== 'all' || filterArtist !== 'all') && (
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterCategory('all');
                setFilterArtist('all');
              }}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Effacer filtres
            </Button>
          </div>
        )}
      </div>

{loading ? (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="text-center py-12">
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Chargement...
            </h3>
            <p style={{ color: 'var(--app-text, #666666)' }}>
              Chargement des documents de la bible
            </p>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="text-center py-12">
            <Filter className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Aucun document trouvé
            </h3>
            <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
              {(filterCategory !== 'all' || filterArtist !== 'all') 
                ? 'Aucun document ne correspond aux filtres sélectionnés'
                : 'Commencez par ajouter votre premier document à la bible'
              }
            </p>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Aucun document
            </h3>
            <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
              Commencez par ajouter votre premier document à la bible
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} style={{
              backgroundColor: 'var(--app-card-bg, #ffffff)',
              color: 'var(--app-card-text, #18181b)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate text-sm">{doc.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Aperçu du document */}
                <DocumentPreview document={doc} />
                
                {/* Informations du document */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{doc.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taille:</span>
                    <span>{doc.file_size_display}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span>{doc.version}</span>
                  </div>
                  
                  {/* Catégorie */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Catégorie:</span>
                    <span className="font-medium">
                      {categories.find(cat => cat.id === doc.category)?.name || doc.category}
                    </span>
                  </div>
                </div>

                {/* Spectacles associés */}
                {doc.artists && doc.artists.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Spectacles associés
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.artists.map((artistId) => {
                        const spectacle = spectacles.find(s => s.id === artistId);
                        return spectacle ? (
                          <span key={artistId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {spectacle.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Description */}
                {doc.description && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-secondary px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
