import React, { useState } from 'react';
import { FileText, Film, Music, Image as ImageIcon, FileType, Eye, ExternalLink, Maximize2 } from 'lucide-react';
import { ShowBibleDocument } from '@/hooks/useShowBible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImprovedDocumentPreviewProps {
  document: ShowBibleDocument;
  className?: string;
}

export const ImprovedDocumentPreview: React.FC<ImprovedDocumentPreviewProps> = ({ document, className = "" }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

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
            src={document.url} 
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

    // Pour les PDF - aperçu avec iframe
    if (document.type === 'pdf') {
      return (
        <div className="space-y-2">
          <div 
            className="relative h-64 border-2 border-border rounded bg-muted overflow-hidden cursor-pointer hover:border-primary transition-colors group"
            onClick={() => setShowFullPreview(true)}
          >
            <iframe
              src={`${document.url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0&page=1`}
              className="w-full h-full pointer-events-none scale-105"
              title={document.name}
              style={{ marginTop: '-20px' }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
              <div className="flex flex-col items-center gap-2">
                <Maximize2 className="h-10 w-10 text-white" />
                <span className="text-white text-sm font-medium">Cliquez pour agrandir</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowFullPreview(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(document.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Pour les vidéos
    if (document.type === 'video') {
      return (
        <div 
          className="flex flex-col items-center justify-center h-32 border-2 border-border rounded bg-blue-50 dark:bg-blue-950/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
          onClick={() => window.open(document.url, '_blank')}
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
        onClick={() => window.open(document.url, '_blank')}
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

      {/* Full preview dialog */}
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <div className="flex flex-col h-full gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate flex-1">{document.name}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(document.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir
              </Button>
            </div>
            <div className="flex-1 border-2 border-border rounded overflow-hidden">
              {document.type === 'image' ? (
                <img 
                  src={document.url} 
                  alt={document.name}
                  className="w-full h-full object-contain"
                />
              ) : document.type === 'pdf' ? (
                <iframe
                  src={document.url}
                  className="w-full h-full"
                  title={document.name}
                />
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
