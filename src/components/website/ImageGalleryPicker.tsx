import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Image as ImageIcon, Search, Loader2, Check, FileText, Music, Video, File, FileSpreadsheet } from 'lucide-react';
import { useShowBible } from '@/hooks/useShowBible';
import { supabase } from '@/integrations/supabase/client';

interface ImageGalleryPickerProps {
  onSelect: (url: string, type?: 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'other') => void;
  selectedUrl?: string;
  buttonText?: string;
  acceptedTypes?: ('image' | 'pdf' | 'audio' | 'video' | 'text' | 'other')[];
}

let pdfWorkerConfigured = false;

async function ensurePdfWorker() {
  if (pdfWorkerConfigured) return;
  const pdfjs = await import('pdfjs-dist');
  // Vite/Esm worker config
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (pdfjs as any).GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  pdfWorkerConfigured = true;
}

function PdfThumbnail({ url, title }: { url: string; title: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  // Render the PDF first page into a canvas (works even when iframe is blocked)
  return (
    <div className="w-full h-full">
      <canvas
        ref={(canvas) => {
          if (!canvas) return;
          if (!url) return;
          if (status !== 'idle') return;

          (async () => {
            try {
              setStatus('loading');
              await ensurePdfWorker();
              const pdfjs = await import('pdfjs-dist');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const loadingTask = (pdfjs as any).getDocument({ url });
              const pdf = await loadingTask.promise;
              const page = await pdf.getPage(1);

              // Compute scale to fit width (canvas will be resized to the container by CSS)
              const viewport = page.getViewport({ scale: 1 });
              const desiredWidth = 640;
              const scale = desiredWidth / viewport.width;
              const scaledViewport = page.getViewport({ scale });

              const dpr = window.devicePixelRatio || 1;
              canvas.width = Math.floor(scaledViewport.width * dpr);
              canvas.height = Math.floor(scaledViewport.height * dpr);
              canvas.style.width = '100%';
              canvas.style.height = '100%';

              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('Canvas context not available');
              ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

              await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
              setStatus('ready');
            } catch {
              setStatus('error');
            }
          })();
        }}
        aria-label={`Aperçu PDF: ${title}`}
        className="w-full h-full object-cover"
      />

      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-background/60">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
          <div className="p-4 bg-background rounded-full">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 px-2">{title}</p>
        </div>
      )}
    </div>
  );
}

export const ImageGalleryPicker: React.FC<ImageGalleryPickerProps> = ({
  onSelect,
  selectedUrl,
  buttonText = 'Choisir depuis la bibliothèque',
  acceptedTypes = ['image', 'pdf', 'audio', 'video', 'text', 'other'],
}) => {
  const { documents, loading } = useShowBible();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string>('all');
  const [artistNames, setArtistNames] = useState<Record<string, string>>({});

  const allArtistIds = useMemo(
    () => Array.from(new Set(documents.flatMap((doc) => doc.artists || []).filter(Boolean))),
    [documents]
  );

  // Fetch artist names for IDs
  useEffect(() => {
    if (allArtistIds.length === 0) return;
    const idsToFetch = allArtistIds.filter(id => !artistNames[id]);
    if (idsToFetch.length === 0) return;
    supabase
      .from('centralized_artists')
      .select('id, name')
      .in('id', idsToFetch)
      .then(({ data }) => {
        if (data) {
          setArtistNames(prev => {
            const next = { ...prev };
            data.forEach(a => { next[a.id] = a.name; });
            return next;
          });
        }
      });
  }, [allArtistIds]);

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) => {
        const matchesSearch =
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = acceptedTypes.includes(doc.type);
        const matchesArtist =
          selectedArtist === 'all' || (doc.artists && doc.artists.includes(selectedArtist));
        return matchesSearch && matchesType && matchesArtist;
      }),
    [documents, searchTerm, acceptedTypes, selectedArtist]
  );

  const handleSelect = (doc: any) => {
    onSelect(doc.url, doc.type);
    setIsOpen(false);
    toast.success(`${doc.name} sélectionné`);
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
              {allArtistIds.map((artistId) => (
                <option key={artistId} value={artistId}>
                  {artistNames[artistId] || artistId}
                </option>
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
                          loading="lazy"
                        />
                      </div>
                    ) : doc.type === 'video' ? (
                      <div className="aspect-video rounded overflow-hidden bg-muted relative">
                        <video src={doc.url} className="w-full h-full object-cover" preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                          <Video className="h-8 w-8 text-background" />
                        </div>
                      </div>
                    ) : doc.type === 'pdf' ? (
                      <div className="aspect-video rounded overflow-hidden bg-muted relative">
                        <div className="absolute inset-0">
                          <PdfThumbnail url={doc.url} title={doc.name} />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                          PDF
                        </div>
                      </div>
                    ) : doc.type === 'audio' ? (
                      <div className="aspect-video rounded bg-muted flex flex-col items-center justify-center gap-2">
                        <div className="p-4 bg-background rounded-full">
                          <Music className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Audio</p>
                      </div>
                    ) : doc.type === 'text' ? (
                      <div className="aspect-video rounded bg-muted flex flex-col items-center justify-center gap-2">
                        <div className="p-4 bg-background rounded-full">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Document</p>
                      </div>
                    ) : (
                      // Fichiers autres (docx, xlsx, etc.) - affichage amélioré
                      <div className="aspect-video rounded bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 flex flex-col items-center justify-center gap-2 relative">
                        <div className="p-4 bg-background rounded-full shadow-sm">
                          {doc.name.toLowerCase().endsWith('.docx') || doc.name.toLowerCase().endsWith('.doc') ? (
                            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          ) : doc.name.toLowerCase().endsWith('.xlsx') || doc.name.toLowerCase().endsWith('.xls') ? (
                            <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
                          ) : (
                            <File className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground line-clamp-1 px-2">{doc.name.split('.').pop()?.toUpperCase()}</p>
                        {(doc.name.toLowerCase().endsWith('.docx') || doc.name.toLowerCase().endsWith('.doc')) && (
                          <div className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            WORD
                          </div>
                        )}
                        {(doc.name.toLowerCase().endsWith('.xlsx') || doc.name.toLowerCase().endsWith('.xls')) && (
                          <div className="absolute bottom-1 right-1 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            EXCEL
                          </div>
                        )}
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
                          {doc.tags.slice(0, 2).map((tag: string, idx: number) => (
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

