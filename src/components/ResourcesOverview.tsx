import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, Music, Image as ImageIcon, FileEdit, 
  ArrowRight, Pin, Clock, Folder, File as FileIcon
} from 'lucide-react';

const isImageUrl = (url?: string, name?: string) => {
  const s = `${url || ''} ${name || ''}`.toLowerCase();
  return /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?|$)/.test(s);
};
import { useShowBible } from '@/hooks/useShowBible';
import { useShowBibleNotes } from '@/hooks/useShowBibleNotes';
import { useShowBibleSetlists } from '@/hooks/useShowBibleSetlists';
import { useBackgroundImages } from '@/hooks/useBackgroundImages';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
                <div key={note.id} className="flex items-start gap-2 p-2 rounded-lg bg-accent/30 border border-accent">
                  <Pin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{note.content}</p>
                  </div>
                </div>
              ))}
              {recentNotes.map(note => (
                <div key={note.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent/20">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{note.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(note.updated_at)}</span>
                    </div>
                  </div>
                </div>
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
                  <div 
                    key={image.id} 
                    className="aspect-square rounded-md overflow-hidden bg-muted"
                  >
                    <img 
                      src={image.thumbnail_url || image.url} 
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
