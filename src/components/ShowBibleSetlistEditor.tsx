import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Music, GripVertical, Trash2, Edit, Plus, Eye, Filter, FileText, FileDown, Link2, Share2 } from 'lucide-react';
import { useShowBibleSetlists, Setlist, SetlistSong, LibrarySong } from '@/hooks/useShowBibleSetlists';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SetlistSongDialog, SongFormData } from './setlist/SetlistSongDialog';
import { generateSongPDF } from '@/utils/songPdfGenerator';
import { generateSetlistPDF } from '@/utils/setlistPdfGenerator';

interface ShowBibleSetlistEditorProps {
  artistId?: string;
}

interface Artist {
  id: string;
  name: string;
}

const calculateTotalDuration = (songs: SetlistSong[]): string => {
  let totalSeconds = 0;
  songs.forEach(song => {
    if (song.duration) {
      const parts = song.duration.split(':').map(p => parseInt(p) || 0);
      if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1];
      else if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  });
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const ShowBibleSetlistEditor = ({ artistId }: ShowBibleSetlistEditorProps) => {
  const { setlists, librarySongs, loading, createSetlist, updateSetlist, deleteSetlist, addSong, addSongFromLibrary, updateSong, deleteSong, reorderSongs } = useShowBibleSetlists();

  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditSetlistDialogOpen, setIsEditSetlistDialogOpen] = useState(false);
  const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SetlistSong | null>(null);
  const [previewSong, setPreviewSong] = useState<SetlistSong | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [addSongTab, setAddSongTab] = useState<'new' | 'library'>('library');
  const [artistIdFilter, setArtistIdFilter] = useState<string>(artistId || 'all');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({ includeNotes: true, includeLyrics: true });

  const [newSetlistData, setNewSetlistData] = useState({ title: '', description: '', artist_id: artistId || '', sacem_program_number: '' });
  const [newSongData, setNewSongData] = useState<SongFormData>({ title: '', duration: '', notes: '', tonality: '', bpm: '', lyrics: '', sacem_number: '' });

  useEffect(() => {
    const fetchArtists = async () => {
      const { data } = await supabase.from('centralized_artists').select('id, name').eq('status', 'active').order('name');
      if (data) setArtists(data);
    };
    fetchArtists();
  }, []);

  const filteredLibrarySongs = useMemo(() => {
    let songs = librarySongs;
    if (selectedSetlist?.artist_id) songs = songs.filter(s => s.artist_id === selectedSetlist.artist_id);
    if (librarySearchQuery) {
      const query = librarySearchQuery.toLowerCase();
      songs = songs.filter(s => s.title.toLowerCase().includes(query) || s.tonality?.toLowerCase().includes(query));
    }
    return songs;
  }, [librarySongs, selectedSetlist?.artist_id, librarySearchQuery]);

  const resetNewSongData = () => setNewSongData({ title: '', duration: '', notes: '', tonality: '', bpm: '', lyrics: '', sacem_number: '' });

  const handleCreateSetlist = async () => {
    if (!newSetlistData.title.trim()) { toast.error('Le titre est requis'); return; }
    const result = await createSetlist({ title: newSetlistData.title, description: newSetlistData.description, artist_id: newSetlistData.artist_id || artistId, sacem_program_number: newSetlistData.sacem_program_number || undefined });
    if (result) { setIsCreateDialogOpen(false); setNewSetlistData({ title: '', description: '', artist_id: artistId || '', sacem_program_number: '' }); }
  };

  const handleAddSong = async () => {
    if (!selectedSetlist || !newSongData.title.trim()) { toast.error('Le titre de la chanson est requis'); return; }
    const result = await addSong(selectedSetlist.id, { title: newSongData.title, duration: newSongData.duration || undefined, notes: newSongData.notes || undefined, tonality: newSongData.tonality || undefined, bpm: newSongData.bpm ? parseInt(newSongData.bpm) : undefined, lyrics: newSongData.lyrics || undefined, sacem_number: newSongData.sacem_number || undefined }, selectedSetlist.artist_id || undefined);
    if (result) { setIsAddSongDialogOpen(false); resetNewSongData(); }
  };

  const handleAddFromLibrary = async (librarySong: LibrarySong) => {
    if (!selectedSetlist) return;
    const result = await addSongFromLibrary(selectedSetlist.id, librarySong);
    if (result) { setIsAddSongDialogOpen(false); setLibrarySearchQuery(''); }
  };

  const handleUpdateSong = async () => {
    if (!editingSong || !newSongData.title.trim()) { toast.error('Le titre de la chanson est requis'); return; }
    const result = await updateSong(editingSong.id, { title: newSongData.title, duration: newSongData.duration || undefined, notes: newSongData.notes || undefined, tonality: newSongData.tonality || undefined, bpm: newSongData.bpm ? parseInt(newSongData.bpm) : undefined, lyrics: newSongData.lyrics || undefined });
    if (result) { setEditingSong(null); resetNewSongData(); }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedSetlist) return;
    const songs = Array.from(selectedSetlist.songs || []);
    const [reorderedSong] = songs.splice(result.source.index, 1);
    songs.splice(result.destination.index, 0, reorderedSong);
    reorderSongs(selectedSetlist.id, songs);
  };

  const handleShareSetlist = async (setlist: Setlist, songId?: string) => {
    let token = setlist.share_token;
    if (!token) {
      const { data, error } = await supabase
        .from('show_bible_setlists')
        .update({ share_token: crypto.randomUUID() } as any)
        .eq('id', setlist.id)
        .select('share_token')
        .single();
      if (error || !data) { toast.error('Impossible de générer le lien'); return; }
      token = (data as any).share_token;
      setSelectedSetlist({ ...setlist, share_token: token } as Setlist);
    }
    const url = `${window.location.origin}/setlist/${token}${songId ? `#song-${songId}` : ''}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(songId ? 'Lien de la chanson copié' : 'Lien de la setlist copié');
    } catch {
      toast.info(url);
    }
  };

  const handleExportSetlist = () => {
    if (!selectedSetlist) return;
    generateSetlistPDF(
      {
        title: selectedSetlist.title,
        description: selectedSetlist.description || undefined,
        sacem_program_number: selectedSetlist.sacem_program_number || undefined,
        artistName: artists.find(a => a.id === selectedSetlist.artist_id)?.name,
      },
      (selectedSetlist.songs || []).map((s) => ({
        title: s.title,
        duration: s.duration || undefined,
        tonality: s.tonality || undefined,
        bpm: s.bpm || undefined,
        notes: s.notes || undefined,
        lyrics: s.lyrics || undefined,
        sacem_number: (s as any).sacem_number || undefined,
      })),
      exportOptions
    );
    setExportDialogOpen(false);
  };

  if (loading) return <div className="text-muted-foreground">Chargement...</div>;

  const filteredSetlists = artistIdFilter === 'all' ? setlists : setlists.filter(s => s.artist_id === artistIdFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold">Setlists</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle Setlist</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer une setlist</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {!artistId && (
                <div><Label>Artiste/Spectacle</Label>
                  <Select value={newSetlistData.artist_id} onValueChange={(value) => setNewSetlistData(prev => ({ ...prev, artist_id: value }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un artiste" /></SelectTrigger>
                    <SelectContent>{artists.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <div><Label>Titre</Label><Input value={newSetlistData.title} onChange={(e) => setNewSetlistData(prev => ({ ...prev, title: e.target.value }))} placeholder="Nom de la setlist" /></div>
              <div><Label>Description</Label><Textarea value={newSetlistData.description} onChange={(e) => setNewSetlistData(prev => ({ ...prev, description: e.target.value }))} placeholder="Description..." /></div>
              <div><Label>N° Programme SACEM</Label><Input value={newSetlistData.sacem_program_number} onChange={(e) => setNewSetlistData(prev => ({ ...prev, sacem_program_number: e.target.value }))} placeholder="Numéro de programme SACEM" /></div>
              <Button onClick={handleCreateSetlist} className="w-full">Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!artistId && artists.length > 0 && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={artistIdFilter} onValueChange={setArtistIdFilter}>
            <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder="Filtrer par spectacle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les spectacles</SelectItem>
              {artists.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <h4 className="font-medium mb-4">Mes Setlists ({filteredSetlists.length})</h4>
          {filteredSetlists.length === 0 ? <p className="text-sm text-muted-foreground">Aucune setlist</p> : filteredSetlists.map((setlist) => (
            <div key={setlist.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSetlist?.id === setlist.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setSelectedSetlist(setlist)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium truncate">{setlist.title}</h5>
                  {setlist.artist_id && <p className="text-xs text-muted-foreground truncate">{artists.find(a => a.id === setlist.artist_id)?.name}</p>}
                  <p className="text-xs text-muted-foreground">{setlist.songs?.length || 0} chanson(s)</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSetlist(setlist); }}><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteSetlist(setlist.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </div>
          ))}
        </Card>

        <Card className="md:col-span-2 p-4">
          {!selectedSetlist ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground"><Music className="h-12 w-12 mb-2" /><p>Sélectionnez une setlist</p></div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-semibold break-words">{selectedSetlist.title}</h4>
                  {selectedSetlist.description && <p className="text-sm text-muted-foreground mt-1">{selectedSetlist.description}</p>}
                  <div className="flex items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span>{selectedSetlist.songs?.length || 0} chanson(s)</span>
                    {selectedSetlist.songs && selectedSetlist.songs.length > 0 && <span className="font-medium">Durée: {calculateTotalDuration(selectedSetlist.songs)}</span>}
                    {selectedSetlist.sacem_program_number && <Badge variant="secondary" className="text-xs">SACEM: {selectedSetlist.sacem_program_number}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => { setNewSetlistData({ title: selectedSetlist.title, description: selectedSetlist.description || '', artist_id: selectedSetlist.artist_id || '', sacem_program_number: selectedSetlist.sacem_program_number || '' }); setIsEditSetlistDialogOpen(true); }}>
                    <Edit className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Modifier</span>
                  </Button>
                  <Button size="sm" onClick={() => setIsAddSongDialogOpen(true)}>
                    <Plus className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Ajouter</span>
                  </Button>
                </div>
              </div>

              {/* Add song dialog */}
              <SetlistSongDialog
                isOpen={isAddSongDialogOpen}
                onOpenChange={(open) => { setIsAddSongDialogOpen(open); if (!open) { resetNewSongData(); setLibrarySearchQuery(''); } }}
                addSongTab={addSongTab}
                onTabChange={setAddSongTab}
                filteredLibrarySongs={filteredLibrarySongs}
                librarySearchQuery={librarySearchQuery}
                onLibrarySearchChange={setLibrarySearchQuery}
                onAddFromLibrary={handleAddFromLibrary}
                newSongData={newSongData}
                onNewSongDataChange={setNewSongData}
                onAddSong={handleAddSong}
              />

              {/* Song list */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="songs">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {selectedSetlist.songs?.map((song, index) => (
                        <Draggable key={song.id} draggableId={song.id} index={index}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} className={`p-3 rounded-lg border bg-card ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div {...provided.dragHandleProps} className="mt-1"><GripVertical className="h-5 w-5 text-muted-foreground" /></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                    <h5 className="font-medium">{song.title}</h5>
                                    {song.duration && <span className="text-sm text-muted-foreground">({song.duration})</span>}
                                    {song.tonality && <Badge variant="outline" className="text-xs">{song.tonality}</Badge>}
                                    {song.bpm && <Badge variant="secondary" className="text-xs">{song.bpm} BPM</Badge>}
                                  </div>
                                  {song.notes && <div className="prose prose-sm max-w-none text-muted-foreground mt-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: song.notes }} />}
                                  {song.lyrics && (
                                    <details className="mt-2">
                                      <summary className="text-xs text-primary cursor-pointer flex items-center gap-1"><FileText className="h-3 w-3" />Voir les paroles</summary>
                                      <div className="prose prose-sm max-w-none text-muted-foreground mt-2 bg-muted/50 p-2 rounded [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: song.lyrics }} />
                                    </details>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => setPreviewSong(song)} title="Aperçu plein écran"><Eye className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => generateSongPDF({ title: song.title, duration: song.duration, tonality: song.tonality, bpm: song.bpm, notes: song.notes, lyrics: song.lyrics, sacem_number: (song as any).sacem_number }, selectedSetlist.title)} title="Exporter en PDF"><FileDown className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => { setEditingSong(song); setNewSongData({ title: song.title, duration: song.duration || '', notes: song.notes || '', tonality: song.tonality || '', bpm: song.bpm?.toString() || '', lyrics: song.lyrics || '', sacem_number: (song as any).sacem_number || '' }); }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteSong(song.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Edit song dialog */}
              {editingSong && (
                <SetlistSongDialog
                  isOpen={!!editingSong}
                  onOpenChange={(open) => { if (!open) { setEditingSong(null); resetNewSongData(); } }}
                  addSongTab="new"
                  onTabChange={() => {}}
                  filteredLibrarySongs={[]}
                  librarySearchQuery=""
                  onLibrarySearchChange={() => {}}
                  onAddFromLibrary={() => {}}
                  newSongData={newSongData}
                  onNewSongDataChange={setNewSongData}
                  onAddSong={() => {}}
                  isEditMode
                  onUpdateSong={handleUpdateSong}
                />
              )}

              {(!selectedSetlist.songs || selectedSetlist.songs.length === 0) && (
                <p className="text-center text-muted-foreground py-8">Aucune chanson dans cette setlist</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Setlist Dialog */}
      <Dialog open={isEditSetlistDialogOpen} onOpenChange={setIsEditSetlistDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier la setlist</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Titre</Label><Input value={newSetlistData.title} onChange={(e) => setNewSetlistData(prev => ({ ...prev, title: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={newSetlistData.description} onChange={(e) => setNewSetlistData(prev => ({ ...prev, description: e.target.value }))} /></div>
            <div><Label>N° Programme SACEM</Label><Input value={newSetlistData.sacem_program_number} onChange={(e) => setNewSetlistData(prev => ({ ...prev, sacem_program_number: e.target.value }))} placeholder="Numéro de programme SACEM" /></div>
            <Button onClick={async () => {
              if (!selectedSetlist) return;
              const result = await updateSetlist(selectedSetlist.id, { title: newSetlistData.title, description: newSetlistData.description, sacem_program_number: newSetlistData.sacem_program_number || undefined });
              if (result) { setIsEditSetlistDialogOpen(false); setSelectedSetlist(prev => prev ? { ...prev, title: newSetlistData.title, description: newSetlistData.description, sacem_program_number: newSetlistData.sacem_program_number || undefined } : prev); }
            }} className="w-full">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Song full-page preview */}
      <Dialog open={!!previewSong} onOpenChange={(open) => { if (!open) setPreviewSong(null); }}>
        <DialogContent className="sm:!max-w-5xl sm:!w-[95vw] sm:!h-[92vh] sm:!max-h-[92vh] !p-0 !flex !flex-col !overflow-hidden">
          {previewSong && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <DialogTitle className="text-2xl break-words pr-8">{previewSong.title}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {previewSong.duration && <Badge variant="outline">Durée : {previewSong.duration}</Badge>}
                  {previewSong.tonality && <Badge variant="outline">Tonalité : {previewSong.tonality}</Badge>}
                  {previewSong.bpm && <Badge variant="secondary">{previewSong.bpm} BPM</Badge>}
                  {(previewSong as any).sacem_number && <Badge variant="secondary">SACEM : {(previewSong as any).sacem_number}</Badge>}
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {previewSong.notes && (
                  <section>
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Notes</h4>
                    <div className="prose prose-base max-w-none leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic" dangerouslySetInnerHTML={{ __html: previewSong.notes }} />
                  </section>
                )}
                <section>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2"><FileText className="h-4 w-4" />Paroles</h4>
                  {previewSong.lyrics ? (
                    <div className="prose prose-lg max-w-none font-serif leading-8 bg-muted/30 rounded-lg p-6 border [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic" dangerouslySetInnerHTML={{ __html: previewSong.lyrics }} />
                  ) : (
                    <p className="text-muted-foreground italic">Aucune parole renseignée</p>
                  )}
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
