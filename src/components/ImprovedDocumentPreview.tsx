import React, { useState, useMemo } from 'react';
import { FileText, Film, Music, Image as ImageIcon, FileType, Eye, ExternalLink, Maximize2 } from 'lucide-react';
import { ShowBibleDocument } from '@/hooks/useShowBible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ImprovedDocumentPreviewProps {
  document: ShowBibleDocument;
  className?: string;
}

export const ImprovedDocumentPreview: React.FC<ImprovedDocumentPreviewProps> = ({ document, className = "" }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Générer l'URL publique correcte depuis Supabase Storage
  const publicUrl = useMemo(() => {
    const { data } = supabase.storage
      .from(document.bucket_name)
      .getPublicUrl(document.file_path);
    return data.publicUrl;
  }, [document.bucket_name, document.file_path]);

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="h-4 w-4" />;
    if (type === 'video') return <Film className="h-4 w-4" />;
    if (type === 'audio') return <Music className="h-4 w-4" />;
    if (type === 'pdf') return <FileText className="h-4 w-4" />;
    return <FileType className="h-4 w-4" />;
  };

  const getPreviewContent = () => {
    // Pour les images
    if (document.type === 'image') {
      return (
        <div className="relative group">
          <img 
            src={publicUrl} 
            alt={document.name}
            className="w-full h-32 object-cover rounded cursor-pointer transition-opacity group-hover:opacity-75"
            onClick={() => setShowFullPreview(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded">
            <Maximize2 className="h-6 w-6 text-white" />
          </div>
        </div>
      );
    }

    // Pour les PDF - carte avec boutons d'action
    if (document.type === 'pdf') {
      return (
        <div 
          className="flex flex-col items-center justify-center h-32 border-2 border-border rounded bg-red-50 dark:bg-red-950/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors p-4"
          onClick={() => window.open(publicUrl, '_blank')}
        >
          <FileText className="h-12 w-12 text-red-600 dark:text-red-400 mb-2" />
          <span className="text-xs text-red-700 dark:text-red-300 font-medium">PDF</span>
          <ExternalLink className="h-4 w-4 text-red-500 mt-1" />
        </div>
      );
    }

    // Pour les vidéos
    if (document.type === 'video') {
      return (
        <div 
          className="flex flex-col items-center justify-center h-32 border-2 border-border rounded bg-blue-50 dark:bg-blue-950/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
          onClick={() => window.open(publicUrl, '_blank')}
        >
          <Film className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">VIDÉO</span>
          <ExternalLink className="h-4 w-4 text-blue-500 mt-1" />
        </div>
      );
    }

    // Pour les autres types de fichiers
    return (
      <div 
        className="flex flex-col items-center justify-center h-32 border-2 border-border rounded bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={() => window.open(publicUrl, '_blank')}
      >
        {getFileIcon(document.type)}
        <span className="text-xs text-muted-foreground font-medium mt-2">{document.type.toUpperCase()}</span>
        <ExternalLink className="h-4 w-4 text-muted-foreground mt-1" />
      </div>
    );
  };

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {getPreviewContent()}
        <p className="text-xs text-muted-foreground truncate text-center">{document.name}</p>
      </div>

      {/* Full preview dialog - images only */}
      {document.type === 'image' && (
        <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
          <DialogContent className="max-w-5xl h-[90vh]">
            <div className="flex flex-col h-full gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate flex-1">{document.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(publicUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir
                </Button>
              </div>
              <div className="flex-1 border-2 border-border rounded overflow-hidden">
                <img 
                  src={publicUrl} 
                  alt={document.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
