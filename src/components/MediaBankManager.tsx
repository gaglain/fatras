import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { 
  Upload, Image as ImageIcon, FileText, Trash2, Eye, 
  Filter, FolderOpen, Tag, X, Music, ExternalLink
} from 'lucide-react';
import { useBackgroundImages, BackgroundImage, MEDIA_CATEGORIES } from '@/hooks/useBackgroundImages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDocumentUrl } from '@/utils/documentPermalinks';
import { MediaBankUploadDialog } from './MediaBankUploadDialog';

interface Artist { id: string; name: string; }

const mediaHasExtension = (image: BackgroundImage, extensions: string[]) => {
  return [image.url, image.name, image.file_path].some((value) => {
    if (!value) return false;
    const cleanValue = value.split(/[?#]/)[0].toLowerCase();
    return extensions.some((extension) => cleanValue.endsWith(`.${extension}`));
  });
};

const isImageMedia = (image: BackgroundImage) => mediaHasExtension(image, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg']);
const isPdfMedia = (image: BackgroundImage) => mediaHasExtension(image, ['pdf']);

const parseSupabaseStorageUrl = (url: string): { bucket: string; path: string } | null => {
  const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/);
  if (!match) return null;
  return { bucket: match[1], path: decodeURIComponent(match[2]) };
};

const getStorageInfo = (image: BackgroundImage): { bucket: string; path: string } | null => {
  if (image.bucket_name && image.file_path) return { bucket: image.bucket_name, path: image.file_path };
  return parseSupabaseStorageUrl(image.url);
};

const getInitialMediaUrl = (image: BackgroundImage) => {
  const storageInfo = getStorageInfo(image);
  if (storageInfo) return supabase.storage.from(storageInfo.bucket).getPublicUrl(storageInfo.path).data.publicUrl;
  return image.url;
};

const MediaPreview: React.FC<{ image: BackgroundImage; variant: 'thumb' | 'dialog' }> = ({ image, variant }) => {
  const [resolvedUrl, setResolvedUrl] = useState(() => getInitialMediaUrl(image));
  const [failed, setFailed] = useState(false);
  const [triedSignedUrl, setTriedSignedUrl] = useState(false);
  const imageMedia = isImageMedia(image);
  const pdfMedia = isPdfMedia(image);

  useEffect(() => {
    const initialUrl = getInitialMediaUrl(image);
    setResolvedUrl(initialUrl);
    setFailed(false);
    setTriedSignedUrl(false);

    const storageInfo = getStorageInfo(image);
    if (!storageInfo || storageInfo.bucket === 'background-images') return;

    setTriedSignedUrl(true);
    supabase.storage.from(storageInfo.bucket).createSignedUrl(storageInfo.path, 3600).then(({ data }) => {
      if (data?.signedUrl) setResolvedUrl(data.signedUrl);
    });
  }, [image.id, image.url, image.bucket_name, image.file_path]);

  const trySignedUrl = async () => {
    if (triedSignedUrl) {
      setFailed(true);
      return;
    }

    const storageInfo = getStorageInfo(image);
    if (!storageInfo) {
      setFailed(true);
      return;
    }

    setTriedSignedUrl(true);
    const { data } = await supabase.storage.from(storageInfo.bucket).createSignedUrl(storageInfo.path, 3600);
    if (data?.signedUrl) setResolvedUrl(data.signedUrl);
    else setFailed(true);
  };

  const fallback = (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted p-3 text-center">
      <FileText className={variant === 'dialog' ? 'h-16 w-16 text-muted-foreground' : 'h-10 w-10 text-muted-foreground'} />
      <span className="text-xs text-muted-foreground line-clamp-2 break-all">{image.name}</span>
    </div>
  );

  if (imageMedia && !failed) {
    return (
      <img
        src={resolvedUrl}
        alt={image.name}
        loading={variant === 'thumb' ? 'lazy' : undefined}
        className={variant === 'dialog' ? 'w-full h-full object-contain' : 'w-full h-full object-contain p-2'}
        onError={trySignedUrl}
      />
    );
  }

  if (pdfMedia && !failed) {
    return (
      <iframe
        src={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
        title={image.name}
        className="w-full h-full bg-card"
        onError={trySignedUrl}
      />
    );
  }

  return fallback;
};

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

  const { images, loading, uploading, uploadImage, updateImage, deleteImage, getImagesByCategory, getAllTags } = useBackgroundImages(categoryFilter === 'all' ? undefined : categoryFilter);

  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;
      const { data, error } = await supabase.from('centralized_artists').select('id, name').eq('user_id', user.id).order('name');
      if (data && !error) setArtists(data);
    };
    fetchArtists();
  }, [user]);

  const allTags = getAllTags();
  const imagesByCategory = getImagesByCategory();

  let filteredImages = images;
  if (tagFilter && tagFilter !== 'all') filteredImages = filteredImages.filter(img => (img.tags || []).includes(tagFilter));
  if (artistFilter && artistFilter !== 'all') filteredImages = filteredImages.filter(img => img.source_id === artistFilter);

  const getArtistName = (sourceId?: string) => sourceId ? artists.find(a => a.id === sourceId)?.name : null;

  const handleUpload = async () => {
    if (!selectedFile) return;
    const tags = uploadTags.split(',').map(t => t.trim()).filter(Boolean);
    await uploadImage(selectedFile, uploadCategory, tags, uploadArtistId !== 'none' ? uploadArtistId : undefined);
    setShowUploadDialog(false); setSelectedFile(null); setUploadTags(''); setUploadCategory('general'); setUploadArtistId('none');
  };

  const confirmAction = useConfirm();
  const handleDelete = async (image: BackgroundImage) => {
    const ok = await confirmAction({ title: 'Supprimer', description: 'Supprimer cette image définitivement ?', variant: 'destructive' });
    if (ok) await deleteImage(image.id);
  };

  const openMediaInNewTab = async (image: BackgroundImage) => {
    const storageInfo = getStorageInfo(image);
    if (storageInfo && storageInfo.bucket !== 'background-images') {
      const { data } = await supabase.storage.from(storageInfo.bucket).createSignedUrl(storageInfo.path, 3600);
      window.open(data?.signedUrl || getInitialMediaUrl(image), '_blank');
      return;
    }

    window.open(getInitialMediaUrl(image), '_blank');
  };

  const getCategoryLabel = (category: string) => MEDIA_CATEGORIES.find(c => c.value === category)?.label || category;
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-700', notes_de_frais: 'bg-green-100 text-green-700',
      spectacles: 'bg-purple-100 text-purple-700', artistes: 'bg-blue-100 text-blue-700',
      documents: 'bg-orange-100 text-orange-700', photos: 'bg-pink-100 text-pink-700', logos: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || colors.general;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" />Banque de Médias</CardTitle>
          <Button onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4 mr-2" />Ajouter un fichier</Button>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Toutes catégories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {MEDIA_CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label} ({imagesByCategory[cat.value]?.length || 0})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {artists.length > 0 && (
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <Select value={artistFilter} onValueChange={setArtistFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Tous les artistes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les artistes</SelectItem>
                  {artists.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tous les tags" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les tags</SelectItem>
                  {allTags.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {(categoryFilter !== 'all' || tagFilter !== 'all' || artistFilter !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter('all'); setTagFilter('all'); setArtistFilter('all'); }}>
              <X className="h-4 w-4 mr-1" />Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Aucun média trouvé</p><p className="text-sm">Uploadez vos premiers fichiers</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <div key={image.id} className="group relative bg-muted rounded-lg overflow-hidden aspect-square border border-border">
                <MediaPreview image={image} variant="thumb" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <Badge className={`text-xs ${getCategoryColor(image.category || 'general')}`}>{getCategoryLabel(image.category || 'general')}</Badge>
                  {image.source_id && <Badge variant="secondary" className="text-xs"><Music className="h-3 w-3 mr-1" />{getArtistName(image.source_id)}</Badge>}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedImage(image)} className="p-2 bg-white rounded-full hover:bg-gray-100" title="Aperçu"><Eye className="h-4 w-4 text-gray-700" /></button>
                    <button onClick={() => handleDelete(image)} className="p-2 bg-white rounded-full hover:bg-red-100" title="Supprimer"><Trash2 className="h-4 w-4 text-red-600" /></button>
                  </div>
                  <p className="text-white text-xs text-center px-2 truncate max-w-full">{image.name}</p>
                </div>
                {image.tags && image.tags.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                    {image.tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    {image.tags.length > 2 && <Badge variant="secondary" className="text-xs">+{image.tags.length - 2}</Badge>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <MediaBankUploadDialog
        open={showUploadDialog} onOpenChange={setShowUploadDialog} artists={artists}
        uploadCategory={uploadCategory} setUploadCategory={setUploadCategory}
        uploadArtistId={uploadArtistId} setUploadArtistId={setUploadArtistId}
        uploadTags={uploadTags} setUploadTags={setUploadTags}
        selectedFile={selectedFile} setSelectedFile={setSelectedFile}
        uploading={uploading} onUpload={handleUpload}
      />

      {/* Preview/Edit Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{selectedImage?.name}</span>
              <Button variant="outline" size="sm" onClick={() => {
                if (selectedImage) {
                  const url = selectedImage.bucket_name && selectedImage.file_path ? getDocumentUrl(selectedImage.bucket_name, selectedImage.file_path, selectedImage.category) : selectedImage.url;
                  window.open(url, '_blank');
                }
              }}>
                <ExternalLink className="h-4 w-4 mr-2" />Ouvrir
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedImage.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={selectedImage.bucket_name && selectedImage.file_path ? getDocumentUrl(selectedImage.bucket_name, selectedImage.file_path, selectedImage.category) : selectedImage.url} alt={selectedImage.name} className="w-full h-full object-contain" />
                ) : selectedImage.url.match(/\.pdf$/i) ? (
                  <iframe src={selectedImage.bucket_name && selectedImage.file_path ? getDocumentUrl(selectedImage.bucket_name, selectedImage.file_path, selectedImage.category) : selectedImage.url} title={selectedImage.name} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><FileText className="h-16 w-16 text-muted-foreground" /></div>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Artiste/Spectacle</Label>
                  <Select value={selectedImage.source_id || 'none'} onValueChange={async (value) => {
                    const newSourceId = value === 'none' ? null : value;
                    await updateImage(selectedImage.id, { source_id: newSourceId });
                    setSelectedImage({ ...selectedImage, source_id: newSourceId || undefined });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Aucun artiste" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun artiste</SelectItem>
                      {artists.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Select value={selectedImage.category || 'general'} onValueChange={async (value) => {
                    await updateImage(selectedImage.id, { category: value });
                    setSelectedImage({ ...selectedImage, category: value });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEDIA_CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedImage.tags && selectedImage.tags.length > 0 && (
                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">{selectedImage.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="destructive" onClick={() => { handleDelete(selectedImage); setSelectedImage(null); }}>
                  <Trash2 className="h-4 w-4 mr-2" />Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
