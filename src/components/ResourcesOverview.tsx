import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Music, Image as ImageIcon, FileEdit, 
  ArrowRight, Pin, Clock, Folder, File as FileIcon
} from 'lucide-react';
import { useShowBible } from '@/hooks/useShowBible';
import { useShowBibleNotes } from '@/hooks/useShowBibleNotes';
import { useShowBibleSetlists } from '@/hooks/useShowBibleSetlists';
import { useBackgroundImages, type BackgroundImage } from '@/hooks/useBackgroundImages';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const isImageUrl = (url?: string, name?: string) => {
  const s = `${url || ''} ${name || ''}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?|$|#)/.test(s);
};
const isPdfUrl = (url?: string, name?: string) => {
  const s = `${url || ''} ${name || ''}`.toLowerCase();
  return /\.pdf(\?|$|#)/.test(s);
};

// Parses a Supabase storage URL and returns { bucket, path } when applicable
const parseSupabaseStorageUrl = (url: string): { bucket: string; path: string } | null => {
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+?)(?:\?|$)/);
  if (!m) return null;
  return { bucket: m[1], path: decodeURIComponent(m[2]) };
};

const MediaTile: React.FC<{ image: BackgroundImage }> = ({ image }) => {
  const initial = image.thumbnail_url || image.url;
  const [resolvedUrl, setResolvedUrl] = useState<string>(initial);
  const [linkUrl, setLinkUrl] = useState<string>(image.url);
  const [imgFailed, setImgFailed] = useState(false);
  const [triedSign, setTriedSign] = useState(false);
  const isImg = isImageUrl(image.url, image.name);
  const isPdf = !isImg && isPdfUrl(image.url, image.name);

  // If the (public) URL fails (private bucket), fall back to a signed URL
  const handleFailure = async () => {
    if (triedSign) { setImgFailed(true); return; }
    setTriedSign(true);
    const info = parseSupabaseStorageUrl(image.url);
    if (!info) { setImgFailed(true); return; }
    const { data } = await supabase.storage.from(info.bucket).createSignedUrl(info.path, 3600);
    if (data?.signedUrl) {
      setResolvedUrl(data.signedUrl);
      setLinkUrl(data.signedUrl);
      setImgFailed(false);
    } else {
      setImgFailed(true);
    }
  };

  // Pre-sign immediately for known-private buckets to avoid a failed request flash
  useEffect(() => {
    const info = parseSupabaseStorageUrl(image.url);
    if (!info) return;
    if (image.url.includes('/object/public/') && info.bucket !== 'background-images' && !triedSign) {
      supabase.storage.from(info.bucket).createSignedUrl(info.path, 3600).then(({ data }) => {
        if (data?.signedUrl) {
          setResolvedUrl(data.signedUrl);
          setLinkUrl(data.signedUrl);
          setImgFailed(false);
          setTriedSign(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.url]);

  const Fallback = (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2 text-center bg-muted">
      <FileIcon className="h-7 w-7 text-muted-foreground shrink-0" />
      <span className="text-[10px] leading-tight text-muted-foreground line-clamp-2 break-all">
        {image.name}
      </span>
    </div>
  );

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noreferrer"
      title={image.name}
      className="group block aspect-square rounded-md overflow-hidden bg-muted border border-border relative hover:ring-2 hover:ring-primary transition"
    >
      {isImg && !imgFailed ? (
        <img
          src={resolvedUrl}
          alt={image.name}
          loading="lazy"
          className="w-full h-full object-contain p-1 bg-card"
          onError={handleFailure}
        />
      ) : isPdf && !imgFailed ? (
        <>
          <object
            data={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&page=1`}
            type="application/pdf"
            className="w-full h-full pointer-events-none bg-card"
            aria-label={image.name}
          >
            {Fallback}
          </object>
          <div className="absolute bottom-0 inset-x-0 bg-background/90 backdrop-blur-sm border-t border-border px-1.5 py-1">
            <p className="text-[10px] font-medium truncate flex items-center gap-1">
              <FileText className="h-3 w-3 text-primary shrink-0" />
              {image.name}
            </p>
          </div>
        </>
      ) : (
        Fallback
      )}
    </a>
  );
};


interface ResourcesOverviewProps {
  onNavigate: (tab: string) => void;
}

export const ResourcesOverview: React.FC<ResourcesOverviewProps> = ({ onNavigate }) => {
  const { documents, loading: docsLoading } = useShowBible();
  const { notes, loading: notesLoading } = useShowBibleNotes();
  const { setlists, loading: setlistsLoading } = useShowBibleSetlists();
  const { images, loading: imagesLoading } = useBackgroundImages();

  const pinnedNotes = notes.filter(n => n.is_pinned).slice(0, 3);
  const recentNotes = notes.filter(n => !n.is_pinned).slice(0, 2);
  const recentSetlists = setlists.slice(0, 3);
  const recentDocs = documents.slice(0, 4);
  const recentImages = images.slice(0, 6);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM', { locale: fr });
    } catch {
      return '';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Notes Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileEdit className="h-5 w-5 text-primary" />
              Notes
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('notes')}>
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {notesLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : notes.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Aucune note créée
            </div>
          ) : (
            <>
              {pinnedNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => onNavigate('notes')}
                  className="w-full text-left flex items-start gap-2 p-2 rounded-lg bg-accent/30 border border-accent hover:bg-accent/50 transition"
                >
                  <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{note.content}</p>
                  </div>
                </button>
              ))}
              {recentNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => onNavigate('notes')}
                  className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-accent/20 transition"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{note.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(note.updated_at)}</span>
                    </div>
                  </div>
                </button>
              ))}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {notes.length} note{notes.length > 1 ? 's' : ''} au total
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Setlists Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Music className="h-5 w-5 text-primary" />
              Setlists
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('setlists')}>
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {setlistsLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : setlists.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Aucune setlist créée
            </div>
          ) : (
            <>
              {recentSetlists.map(setlist => (
                <div key={setlist.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/20 border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{setlist.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{setlist.songs?.length || 0} chanson{(setlist.songs?.length || 0) > 1 ? 's' : ''}</span>
                      {setlist.sacem_program_number && (
                        <Badge variant="secondary" className="text-xs py-0">
                          SACEM
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {setlists.length} setlist{setlists.length > 1 ? 's' : ''} au total
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Media Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
              Médias
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('media')}>
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {imagesLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : images.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Aucun média uploadé
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {recentImages.map(image => (
                  <MediaTile key={image.id} image={image} />
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-center pt-3 border-t mt-3">
                {images.length} média{images.length > 1 ? 's' : ''} au total
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Documents Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="h-5 w-5 text-primary" />
              Documents
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('documents')}>
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {docsLoading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : documents.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">
              Aucun document uploadé
            </div>
          ) : (
            <>
              {recentDocs.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/20 border">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{doc.file_size_display}</span>
                      <span>•</span>
                      <span>{doc.category}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                {documents.length} document{documents.length > 1 ? 's' : ''} au total
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
