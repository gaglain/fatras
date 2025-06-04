
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Download, 
  Eye, 
  Trash2,
  Upload,
  Folder,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

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
  { id: 'contracts', name: 'Contrats', description: 'Documents contractuels', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'other', name: 'Autres', description: 'Documents divers', color: 'bg-gray-100 text-gray-800' }
];

const sampleDocuments: Document[] = [
  {
    id: '1',
    name: 'Fiche technique spectacle.pdf',
    type: 'pdf',
    url: '/documents/tech-sheet.pdf',
    size: '2.4 MB',
    category: 'tech',
    description: 'Fiche technique complète du spectacle',
    uploadedAt: '2024-06-01',
    uploadedBy: 'user-1'
  },
  {
    id: '2',
    name: 'Playback chanson 1.mp3',
    type: 'audio',
    url: '/audio/playback1.mp3',
    size: '4.2 MB',
    category: 'music',
    description: 'Playback de la première chanson',
    uploadedAt: '2024-06-02',
    uploadedBy: 'user-2'
  },
  {
    id: '3',
    name: 'Promo video 2024.mp4',
    type: 'video',
    url: '/video/promo.mp4',
    size: '45.8 MB',
    category: 'video',
    description: 'Vidéo promotionnelle du spectacle 2024',
    uploadedAt: '2024-06-03',
    uploadedBy: 'user-1'
  }
];

export const ShowBible: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'text' as const,
    category: 'other',
    description: '',
    file: null as File | null
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: 'bg-gray-100 text-gray-800'
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio': return <Music className="h-6 w-6 text-purple-600" />;
      case 'video': return <Video className="h-6 w-6 text-red-600" />;
      case 'image': return <Image className="h-6 w-6 text-green-600" />;
      case 'pdf':
      case 'text': return <FileText className="h-6 w-6 text-blue-600" />;
      default: return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'other')!;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
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

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.name.trim()) {
      toast.error('Veuillez sélectionner un fichier et saisir un nom');
      return;
    }

    const newDocument: Document = {
      id: Date.now().toString(),
      name: uploadForm.name,
      type: uploadForm.type,
      url: URL.createObjectURL(uploadForm.file),
      size: formatFileSize(uploadForm.file.size),
      category: uploadForm.category,
      description: uploadForm.description,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'current-user'
    };

    setDocuments(prev => [...prev, newDocument]);
    setShowUploadDialog(false);
    setUploadForm({
      name: '',
      type: 'text',
      category: 'other',
      description: '',
      file: null
    });
    toast.success('Document ajouté à la bible du spectacle');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Document supprimé');
  };

  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) {
      toast.error('Veuillez saisir un nom de catégorie');
      return;
    }

    const newCategory: Category = {
      id: categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
      name: categoryForm.name,
      description: categoryForm.description,
      color: categoryForm.color
    };

    setCategories(prev => [...prev, newCategory]);
    setShowCategoryDialog(false);
    setCategoryForm({
      name: '',
      description: '',
      color: 'bg-gray-100 text-gray-800'
    });
    toast.success('Catégorie créée');
  };

  const getDocumentCountByCategory = (categoryId: string) => {
    return documents.filter(doc => doc.category === categoryId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bible du Spectacle</h1>
          <p className="text-gray-600 mt-2">Centralisez tous vos documents, médias et ressources</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Folder className="h-4 w-4 mr-2" />
                Nouvelle Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la catégorie</label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="ex: Chorégraphies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Description de la catégorie..."
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                  <Select value={categoryForm.color} onValueChange={(value) => setCategoryForm({ ...categoryForm, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg-blue-100 text-blue-800">Bleu</SelectItem>
                      <SelectItem value="bg-green-100 text-green-800">Vert</SelectItem>
                      <SelectItem value="bg-purple-100 text-purple-800">Violet</SelectItem>
                      <SelectItem value="bg-red-100 text-red-800">Rouge</SelectItem>
                      <SelectItem value="bg-yellow-100 text-yellow-800">Jaune</SelectItem>
                      <SelectItem value="bg-gray-100 text-gray-800">Gris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowCategoryDialog(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={handleAddCategory} className="flex-1">
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du document</label>
                  <Input
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="Nom d'affichage du document"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                  <Button onClick={handleUpload} className="flex-1">
                    Ajouter
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toutes les catégories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({getDocumentCountByCategory(category.id)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const count = getDocumentCountByCategory(category.id);
          return (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="mb-2">
                  <Badge className={category.color}>{category.name}</Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{count === 1 ? 'document' : 'documents'}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Aucun document ne correspond à votre recherche' : 'Commencez par ajouter votre premier document'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredDocuments.map((document) => {
            const categoryInfo = getCategoryInfo(document.category);
            return (
              <Card key={document.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(document.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{document.name}</h3>
                        <Badge className={categoryInfo.color} variant="outline">
                          {categoryInfo.name}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteDocument(document.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  {document.description && (
                    <p className="text-gray-600 text-sm mb-4">{document.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{document.size}</span>
                    <span>Ajouté le {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = document.url;
                        link.download = document.name;
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
