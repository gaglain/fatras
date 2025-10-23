import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Image as ImageIcon, Search, Loader2, Check, FileText, Music, Video, File } from 'lucide-react';
import { useShowBible } from '@/hooks/useShowBible';

interface ImageGalleryPickerProps {
  onSelect: (url: string, type?: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'other') => void;
  selectedUrl?: string;
  buttonText?: string;
  acceptedTypes?: ('image' | 'pdf' | 'audio' | 'video' | 'text' | 'other')[];
}

export const ImageGalleryPicker: React.FC<ImageGalleryPickerProps> = ({
  onSelect,
  selectedUrl,
  buttonText = "Choisir depuis la bibliothèque",
  acceptedTypes = ['image', 'pdf', 'audio', 'video', 'text', 'other']
}) => {
  const { user } = useAuth();
  const { documents, loading } = useShowBible();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string>('all');

  // Get unique artists from all documents
  const allArtists = Array.from(new Set(documents.flatMap(doc => doc.artists || [])));

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = acceptedTypes.includes(doc.type);
    const matchesArtist = selectedArtist === 'all' || (doc.artists && doc.artists.includes(selectedArtist));
    return matchesSearch && matchesType && matchesArtist;
  });

  const handleSelect = (doc: any) => {
    onSelect(doc.url, doc.type);
    setIsOpen(false);
    toast.success(`${doc.name} sélectionné`);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

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
          <DialogTitle>Sélectionner depuis la banque de médias</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un fichier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">Tous les spectacles</option>
              {allArtists.map(artist => (
                <option key={artist} value={artist}>{artist}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun fichier trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={`relative cursor-pointer hover:shadow-lg transition-all group ${
                    selectedUrl === doc.url ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelect(doc)}
                >
                  <div className="p-4 space-y-3">
                    {doc.type === 'image' ? (
                      <div className="aspect-video rounded overflow-hidden bg-muted">
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : doc.type === 'video' ? (
                      <div className="aspect-video rounded overflow-hidden bg-muted relative">
                        <video
                          src={doc.url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          {getFileIcon(doc.type)}
                        </div>
                      </div>
                    ) : doc.type === 'pdf' ? (
                      <div className="aspect-video rounded overflow-hidden bg-muted">
                        <iframe
                          src={`${doc.url}#view=FitH`}
                          className="w-full h-full pointer-events-none"
                          title={doc.name}
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded bg-muted flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-background rounded-full">
                          {getFileIcon(doc.type)}
                        </div>
                        <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm font-medium line-clamp-1">{doc.name}</p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{doc.file_size_display}</p>
                        {doc.artists && doc.artists.length > 0 && (
                          <p className="text-xs text-primary font-medium truncate max-w-[120px]">
                            {doc.artists[0]}
                          </p>
                        )}
                      </div>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {doc.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedUrl === doc.url && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 border-t pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
