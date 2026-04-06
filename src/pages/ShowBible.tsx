
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FileEdit, Music, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAuth } from '@/hooks/useAuth';
import { useShowBible, CreateDocumentData } from '@/hooks/useShowBible';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { MediaBankManager } from '@/components/MediaBankManager';
import { ShowBibleNotesEditor } from '@/components/ShowBibleNotesEditor';
import { ShowBibleSetlistEditor } from '@/components/ShowBibleSetlistEditor';
import { ResourcesOverview } from '@/components/ResourcesOverview';
import { ShowBibleUploadDialog } from './showbible/ShowBibleUploadDialog';
import { ShowBibleDocumentsTab } from './showbible/ShowBibleDocumentsTab';

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
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'text' as 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other',
    category: 'other',
    description: '',
    file: null as File | null,
    tags: '',
    version: '1.0',
    artists: [] as string[]
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesArtist = filterArtist === 'all' || (doc.artists && doc.artists.includes(filterArtist));
    return matchesCategory && matchesArtist;
  });

  const getFileType = (mimeType: string): 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other' => {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'text';
    return 'other';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file, name: file.name, type: getFileType(file.type) }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
        setUploadForm({ name: '', type: 'text', category: 'other', description: '', file: null, tags: '', version: '1.0', artists: [] });
      }
    } catch {
      toast.error('Erreur lors de l\'upload du fichier');
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    await deleteDocument(doc.id, doc.file_path, doc.bucket_name);
  };

  return (
    <div className="space-y-6 p-4 lg:p-0" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>Ressources</h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Centralisez tous vos documents, médias et ressources collaboratifs
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
            <LayoutGrid className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Aperçu</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
            <FileEdit className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="setlists" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
            <Music className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Setlists</span>
            <span className="sm:hidden">Sets</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
            <ImageIcon className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Médias</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Documents</span>
            <span className="sm:hidden">Docs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ResourcesOverview onNavigate={setActiveTab} />
        </TabsContent>

        <TabsContent value="documents">
          <ShowBibleDocumentsTab
            documents={documents}
            filteredDocuments={filteredDocuments}
            loading={loading}
            categories={categories}
            spectacles={spectacles}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterArtist={filterArtist}
            setFilterArtist={setFilterArtist}
            onDeleteDocument={handleDeleteDocument}
            uploadDialogTrigger={
              <ShowBibleUploadDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                uploadForm={uploadForm}
                setUploadForm={setUploadForm}
                categories={categories}
                spectacles={spectacles}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onFileUpload={handleFileUpload}
                onUpload={handleUpload}
              />
            }
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaBankManager />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <ShowBibleNotesEditor />
        </TabsContent>

        <TabsContent value="setlists" className="mt-6">
          <ShowBibleSetlistEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
