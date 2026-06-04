import React, { useState, useMemo, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { FileText, Film, Music, Image as ImageIcon, FileType, Eye, ExternalLink, Maximize2 } from 'lucide-react';
import { ShowBibleDocument } from '@/hooks/useShowBible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getDocumentUrl } from '@/utils/documentPermalinks';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface ImprovedDocumentPreviewProps {
  document: ShowBibleDocument;
  className?: string;
}

const PdfCanvasPreview: React.FC<{ url: string; title: string; variant: 'thumb' | 'dialog' }> = ({ url, title, variant }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    const render = async () => {
      setLoading(true);
      setPreviewUrl(null);
      setErrored(false);
      try {
        loadingTask = pdfjsLib.getDocument({ url, disableStream: true, disableRange: true });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        if (cancelled) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = variant === 'dialog' ? 1100 : 460;
        const viewport = page.getViewport({ scale: targetWidth / baseViewport.width });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas indisponible');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        if (!cancelled) setPreviewUrl(canvas.toDataURL('image/png'));
      } catch {
        if (!cancelled) setErrored(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    render();
    return () => {
      cancelled = true;
      loadingTask?.destroy();
    };
  }, [url, variant]);

  if (previewUrl) {
    return (
      <img
        src={previewUrl}
        alt={title}
        className={variant === 'dialog' ? 'w-full h-full object-contain bg-white' : 'w-full h-full object-contain bg-white'}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 p-3 text-center">
      <FileText className={variant === 'dialog' ? 'h-16 w-16 text-red-600 dark:text-red-400' : 'h-10 w-10 text-red-600 dark:text-red-400'} />
      <span className="text-xs text-red-700 dark:text-red-300 line-clamp-2 break-all">
        {loading ? 'Chargement du PDF…' : errored ? 'Aperçu indisponible' : title}
      </span>
    </div>
  );
};

export const ImprovedDocumentPreview: React.FC<ImprovedDocumentPreviewProps> = ({ document, className = "" }) => {
  const [showFullPreview, setShowFullPreview] = useState(false);

  const publicUrl = useMemo(() => {
    return getDocumentUrl(document.bucket_name, document.file_path, document.category);
  }, [document.bucket_name, document.file_path, document.category]);

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="h-4 w-4" />;
    if (type === 'video') return <Film className="h-4 w-4" />;
    if (type === 'audio') return <Music className="h-4 w-4" />;
    if (type === 'pdf') return <FileText className="h-4 w-4" />;
    return <FileType className="h-4 w-4" />;
  };

  const getPreviewContent = () => {
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

    if (document.type === 'pdf') {
      return (
        <div
          className="relative group h-40 border-2 border-border rounded overflow-hidden cursor-pointer bg-white"
          onClick={() => setShowFullPreview(true)}
        >
          <PdfCanvasPreview url={publicUrl} title={document.name} variant="thumb" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </div>
      );
    }

    if (document.type === 'video') {
      return (
        <div
          className="flex flex-col items-center justify-center h-32 border-2 border-border rounded bg-blue-50 dark:bg-blue-950/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
          onClick={() => setShowFullPreview(true)}
        >
          <Film className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">VIDÉO</span>
          <Eye className="h-4 w-4 text-blue-500 mt-1" />
        </div>
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center h-32 border-2 border-border rounded bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={() => setShowFullPreview(true)}
      >
        {getFileIcon(document.type)}
        <span className="text-xs text-muted-foreground font-medium mt-2">{document.type.toUpperCase()}</span>
        <Eye className="h-4 w-4 text-muted-foreground mt-1" />
      </div>
    );
  };

  const renderDialogContent = () => {
    if (document.type === 'image') {
      return (
        <div className="flex-1 border-2 border-border rounded overflow-hidden">
          <img src={publicUrl} alt={document.name} className="w-full h-full object-contain" />
        </div>
      );
    }

    if (document.type === 'pdf') {
      return (
        <div className="flex-1 border-2 border-border rounded overflow-hidden bg-white">
          <PdfCanvasPreview url={publicUrl} title={document.name} variant="dialog" />
        </div>
      );
    }

    if (document.type === 'video') {
      return (
        <div className="flex-1 border-2 border-border rounded overflow-hidden flex items-center justify-center bg-black">
          <video src={publicUrl} controls className="max-w-full max-h-full">
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
      );
    }

    if (document.type === 'audio') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
          <Music className="h-24 w-24 text-primary" />
          <audio src={publicUrl} controls className="w-full max-w-md">
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        {getFileIcon(document.type)}
        <p className="text-muted-foreground">Aperçu non disponible pour ce type de fichier</p>
        <Button onClick={() => window.open(publicUrl, '_blank')}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {getPreviewContent()}
        <p className="text-xs text-muted-foreground truncate text-center">{document.name}</p>
      </div>

      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <div className="flex flex-col h-full gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate flex-1">{document.name}</h3>
              <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir
              </Button>
            </div>
            {renderDialogContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
