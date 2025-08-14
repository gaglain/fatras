
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
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/hooks/useAuth';

interface Document {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
  url: string;
  size: string;
  category: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  version: string;
}

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
  const { uploadFile, deleteFile, isUploading, uploadProgress } = useFileUpload();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories] = useState<Category[]>(defaultCategories);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState<{
    name: string;
    type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
    category: string;
    description: string;
    file: File | null;
    tags: string;
    version: string;
  }>({
    name: '',
    type: 'text',
    category: 'other',
    description: '',
    file: null,
    tags: '',
    version: '1.0'
  });

  // Charger les documents depuis localStorage au démarrage
  useEffect(() => {
    const savedDocuments = localStorage.getItem('showBible_documents');
    if (savedDocuments) {
      try {
        setDocuments(JSON.parse(savedDocuments));
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
      }
    }
  }, []);

  // Sauvegarder les documents dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('showBible_documents', JSON.stringify(documents));
  }, [documents]);

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

      const newDocument: Document = {
        id: Date.now().toString(),
        name: uploadForm.name,
        type: uploadForm.type,
        url: uploadResult.url,
        size: formatFileSize(uploadForm.file.size),
        category: uploadForm.category,
        description: uploadForm.description,
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: user.id,
        tags,
        version: uploadForm.version
      };

      setDocuments(prev => [...prev, newDocument]);
      setShowUploadDialog(false);
      setUploadForm({
        name: '',
        type: 'text',
        category: 'other',
        description: '',
        file: null,
        tags: '',
        version: '1.0'
      });
      toast.success('Document ajouté à la bible du spectacle');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    try {
      // Extraire le chemin du fichier depuis l'URL
      const url = new URL(doc.url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/'); // category/filename

      await deleteFile('show-bible', filePath);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success('Document supprimé');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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

{documents.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} style={{
              backgroundColor: 'var(--app-card-bg, #ffffff)',
              color: 'var(--app-card-text, #18181b)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{doc.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <span className="font-medium">{doc.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taille:</span>
                    <span>{doc.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Version:</span>
                    <span>{doc.version}</span>
                  </div>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {doc.description}
                    </p>
                  )}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-secondary px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
