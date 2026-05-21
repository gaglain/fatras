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
import { Music, GripVertical, Trash2, Edit, Plus, Eye, Filter, FileText } from 'lucide-react';
import { useShowBibleSetlists, Setlist, SetlistSong, LibrarySong } from '@/hooks/useShowBibleSetlists';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SetlistSongDialog, SongFormData } from './setlist/SetlistSongDialog';

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
                                  {song.notes && <p className="text-sm text-muted-foreground mt-1">{song.notes}</p>}
                                  {song.lyrics && (
                                    <details className="mt-2">
                                      <summary className="text-xs text-primary cursor-pointer flex items-center gap-1"><FileText className="h-3 w-3" />Voir les paroles</summary>
                                      <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-2 rounded">{song.lyrics}</pre>
                                    </details>
                                  )}
                                </div>
                                <div className="flex gap-1">
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
    </div>
  );
};
