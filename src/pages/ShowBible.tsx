
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, Download, FileText, Image, Video, Music, File, Play } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  category: string;
  fileSize?: string;
  uploadedAt: string;
  tags: string[];
  url?: string; // In a real app, this would be the actual file URL
}

interface DocumentFormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
}

const defaultDocuments: Document[] = [
  {
    id: '1',
    name: 'Rider Technique Principal',
    description: 'Document principal du rider technique pour tous les concerts',
    type: 'document',
    category: 'Technique',
    fileSize: '2.4 MB',
    uploadedAt: '2024-01-15',
    tags: ['rider', 'technique', 'son'],
    url: '/placeholder.pdf'
  },
  {
    id: '2',
    name: 'Set List Tour 2024',
    description: 'Liste complète des morceaux pour la tournée 2024',
    type: 'text',
    category: 'Artistique',
    fileSize: '156 KB',
    uploadedAt: '2024-01-12',
    tags: ['setlist', 'musique', 'tour'],
    url: '/placeholder.txt'
  },
  {
    id: '3',
    name: 'Vidéo Promo Concert',
    description: 'Vidéo promotionnelle pour les réseaux sociaux',
    type: 'video',
    category: 'Promotion',
    fileSize: '25.8 MB',
    uploadedAt: '2024-01-10',
    tags: ['promo', 'video', 'social'],
    url: '/placeholder.mp4'
  },
  {
    id: '4',
    name: 'Démo Acoustique',
    description: 'Enregistrement démo acoustique des nouveaux titres',
    type: 'audio',
    category: 'Artistique',
    fileSize: '12.3 MB',
    uploadedAt: '2024-01-08',
    tags: ['demo', 'acoustique', 'nouveaux'],
    url: '/placeholder.mp3'
  }
];

const categories = [
  'Technique',
  'Artistique', 
  'Promotion',
  'Administratif',
  'Logistique',
  'Marketing'
];

export const ShowBible: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(defaultDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    description: '',
    category: '',
    tags: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: []
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Déterminer le type de fichier
    let fileType: Document['type'] = 'document';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';
    else if (file.type.startsWith('audio/')) fileType = 'audio';
    else if (file.type === 'text/plain') fileType = 'text';

    const newDocument: Document = {
      id: Date.now().toString(),
      name: formData.name || file.name,
      description: formData.description,
      type: fileType,
      category: formData.category,
      fileSize: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      uploadedAt: new Date().toISOString().split('T')[0],
      tags: formData.tags,
      url: URL.createObjectURL(file) // In a real app, this would be uploaded to a server
    };
    
    setDocuments([...documents, newDocument]);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setFormData({
      name: document.name,
      description: document.description,
      category: document.category,
      tags: document.tags
    });
    setShowEditDialog(true);
  };

  const handleUpdateDocument = () => {
    if (!selectedDocument) return;
    
    const updatedDocuments = documents.map(doc => 
      doc.id === selectedDocument.id 
        ? { ...doc, ...formData }
        : doc
    );
    
    setDocuments(updatedDocuments);
    setShowEditDialog(false);
    setSelectedDocument(null);
    resetForm();
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-6 w-6 text-blue-600" />;
      case 'image': return <Image className="h-6 w-6 text-green-600" />;
      case 'video': return <Video className="h-6 w-6 text-red-600" />;
      case 'audio': return <Music className="h-6 w-6 text-purple-600" />;
      case 'document': return <File className="h-6 w-6 text-orange-600" />;
      default: return <File className="h-6 w-6 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTagInput = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData({ ...formData, tags });
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const documentsByType = {
    text: documents.filter(doc => doc.type === 'text').length,
    image: documents.filter(doc => doc.type === 'image').length,
    video: documents.filter(doc => doc.type === 'video').length,
    audio: documents.filter(doc => doc.type === 'audio').length,
    document: documents.filter(doc => doc.type === 'document').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bible du Spectacle</h1>
          <p className="text-gray-600 mt-2">Centralisez tous vos documents artistiques et techniques</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du document</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom du document"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du document..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (séparés par des virgules)</label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagInput(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fichier</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Glissez-déposez votre fichier ici ou cliquez pour parcourir</p>
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
                    Choisir un fichier
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Textes</p>
                <p className="text-lg font-bold text-gray-900">{documentsByType.text}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Image className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Images</p>
                <p className="text-lg font-bold text-gray-900">{documentsByType.image}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Video className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Vidéos</p>
                <p className="text-lg font-bold text-gray-900">{documentsByType.video}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Music className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Audio</p>
                <p className="text-lg font-bold text-gray-900">{documentsByType.audio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <File className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Docs</p>
                <p className="text-lg font-bold text-gray-900">{documentsByType.document}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filtrer par catégorie:</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(document.type)}
                    <div>
                      <h3 className="font-medium text-sm">{document.name}</h3>
                      <p className="text-xs text-gray-500">{document.fileSize}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {document.type === 'video' || document.type === 'audio' ? (
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEditDocument(document)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteDocument(document.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-3">{document.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge className={getTypeColor(document.type)}>
                    {document.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{document.category}</span>
                </div>
                
                {document.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {document.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-2">Ajouté le {document.uploadedAt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du document</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du document"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du document..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (séparés par des virgules)</label>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagInput(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateDocument}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
