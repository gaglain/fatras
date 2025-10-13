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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = acceptedTypes.includes(doc.type);
    return matchesSearch && matchesType;
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
          <DialogTitle>Bibliothèque Show Bible</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un fichier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={`relative cursor-pointer hover:shadow-lg transition-all group ${
                    selectedUrl === doc.url ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelect(doc)}
                >
                  <div className="p-3 space-y-2">
                    {doc.type === 'image' ? (
                      <div className="aspect-square rounded overflow-hidden bg-muted">
                        <img
                          src={doc.url}
                          alt={doc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square rounded bg-muted flex items-center justify-center">
                        {getFileIcon(doc.type)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.file_size_display}</p>
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
