import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Image as ImageIcon, Search, Loader2, Check, FileText, Music, Video, File, FileSpreadsheet, Filter, Tag, FolderOpen } from 'lucide-react';
import { useBackgroundImages, BackgroundImage, MEDIA_CATEGORIES } from '@/hooks/useBackgroundImages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDocumentUrl } from '@/utils/documentPermalinks';

interface ImageGalleryPickerProps {
  onSelect: (url: string, type?: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'other') => void;
  selectedUrl?: string;
  buttonText?: string;
  acceptedTypes?: ('image' | 'pdf' | 'audio' | 'video' | 'text' | 'other')[];
}

function getFileType(name: string, url: string): 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'other' {
  const lower = (name || url).toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/)) return 'image';
  if (lower.match(/\.pdf$/)) return 'pdf';
  if (lower.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/)) return 'audio';
  if (lower.match(/\.(mp4|mov|avi|webm|mkv)$/)) return 'video';
  if (lower.match(/\.(txt|md|csv|json|xml)$/)) return 'text';
  return 'other';
}

function getResolvedUrl(img: BackgroundImage): string {
  if (img.bucket_name && img.file_path) {
    return getDocumentUrl(img.bucket_name, img.file_path, img.category);
  }
  return img.url;
}

interface Artist { id: string; name: string; }

export const ImageGalleryPicker: React.FC<ImageGalleryPickerProps> = ({
  onSelect,
  selectedUrl,
  buttonText = 'Choisir depuis la bibliothèque',
  acceptedTypes = ['image', 'pdf', 'audio', 'video', 'text', 'other'],
}) => {
  const { user } = useAuth();
  const { images, loading } = useBackgroundImages();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [artistFilter, setArtistFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [artists, setArtists] = useState<Artist[]>([]);

  // Fetch artists for filter
  useEffect(() => {
    if (!user || !isOpen) return;
    supabase
      .from('centralized_artists')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name')
      .then(({ data }) => {
        if (data) setArtists(data);
      });
  }, [user, isOpen]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    images.forEach(img => (img.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [images]);

  const filteredImages = useMemo(() =>
    images.filter((img) => {
      const type = getFileType(img.name, img.url);
      if (!acceptedTypes.includes(type)) return false;
      if (searchTerm && !img.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (categoryFilter !== 'all' && img.category !== categoryFilter) return false;
      if (artistFilter !== 'all' && img.source_id !== artistFilter) return false;
      if (tagFilter !== 'all' && !(img.tags || []).includes(tagFilter)) return false;
      return true;
    }),
    [images, searchTerm, acceptedTypes, categoryFilter, artistFilter, tagFilter]
  );

  const handleSelect = (img: BackgroundImage) => {
    const url = getResolvedUrl(img);
    const type = getFileType(img.name, img.url);
    onSelect(url, type);
    setIsOpen(false);
    toast.success(`${img.name} sélectionné`);
  };

  const getArtistName = (sourceId?: string) => sourceId ? artists.find(a => a.id === sourceId)?.name : null;
  const getCategoryLabel = (category: string) => MEDIA_CATEGORIES.find(c => c.value === category)?.label || category;
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-muted text-muted-foreground',
      notes_de_frais: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      spectacles: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      artistes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      documents: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      photos: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      logos: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    };
    return colors[category] || colors.general;
  };

  const hasActiveFilters = categoryFilter !== 'all' || artistFilter !== 'all' || tagFilter !== 'all';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full">
          <ImageIcon className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Banque de Médias
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search + Filters - matching MediaBankManager */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un fichier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Toutes catégories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {MEDIA_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {artists.length > 0 && (
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-muted-foreground" />
                <Select value={artistFilter} onValueChange={setArtistFilter}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tous les spectacles" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les spectacles</SelectItem>
                    {artists.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tous les tags" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les tags</SelectItem>
                    {allTags.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter('all'); setArtistFilter('all'); setTagFilter('all'); }}>
                Réinitialiser
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun fichier trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[55vh] overflow-y-auto pr-2">
              {filteredImages.map((img) => {
                const resolvedUrl = getResolvedUrl(img);
                const isImage = img.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                const isSelected = selectedUrl === resolvedUrl || selectedUrl === img.url;

                return (
                  <div
                    key={img.id}
                    className={`group relative bg-muted rounded-lg overflow-hidden aspect-square cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelect(img)}
                  >
                    {/* Thumbnail */}
                    {isImage ? (
                      <img src={resolvedUrl} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        {img.url.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                          <Music className="h-8 w-8 text-muted-foreground" />
                        ) : img.url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                          <Video className="h-8 w-8 text-muted-foreground" />
                        ) : img.url.match(/\.pdf$/i) ? (
                          <FileText className="h-8 w-8 text-destructive" />
                        ) : img.url.match(/\.(xlsx?|csv)$/i) ? (
                          <FileSpreadsheet className="h-8 w-8 text-green-600" />
                        ) : img.url.match(/\.(docx?|odt)$/i) ? (
                          <FileText className="h-8 w-8 text-blue-600" />
                        ) : (
                          <File className="h-8 w-8 text-muted-foreground" />
                        )}
                        <p className="text-[10px] text-muted-foreground px-1 text-center line-clamp-1">
                          {img.name.split('.').pop()?.toUpperCase()}
                        </p>
                      </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-1 left-1">
                      <Badge className={`text-[10px] px-1 py-0 ${getCategoryColor(img.category || 'general')}`}>
                        {getCategoryLabel(img.category || 'general')}
                      </Badge>
                    </div>

                    {/* Artist badge */}
                    {img.source_id && (
                      <div className="absolute top-1 right-1">
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 max-w-[80px] truncate">
                          <Music className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                          {getArtistName(img.source_id) || '...'}
                        </Badge>
                      </div>
                    )}

                    {/* Hover overlay with name */}
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <p className="text-background text-xs truncate w-full">{img.name}</p>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-1.5">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <p className="text-sm text-muted-foreground">{filteredImages.length} fichier{filteredImages.length !== 1 ? 's' : ''}</p>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
