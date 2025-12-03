import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, GripVertical, Trash2, Edit, Plus, Library, FileText, Search } from 'lucide-react';
import { useShowBibleSetlists, Setlist, SetlistSong, LibrarySong } from '@/hooks/useShowBibleSetlists';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShowBibleSetlistEditorProps {
  artistId?: string;
}

interface Artist {
  id: string;
  name: string;
}

const TONALITIES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
const TONALITY_MODES = ['Majeur', 'Mineur'];

const calculateTotalDuration = (songs: SetlistSong[]): string => {
  let totalSeconds = 0;

  songs.forEach(song => {
    if (song.duration) {
      const parts = song.duration.split(':').map(p => parseInt(p) || 0);
      if (parts.length === 2) {
        totalSeconds += parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
  });

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

export const ShowBibleSetlistEditor = ({ artistId }: ShowBibleSetlistEditorProps) => {
  const { 
    setlists, 
    librarySongs,
    loading, 
    createSetlist, 
    updateSetlist, 
    deleteSetlist, 
    addSong, 
    addSongFromLibrary,
    updateSong, 
    deleteSong, 
    reorderSongs 
  } = useShowBibleSetlists(artistId);
  
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SetlistSong | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [addSongTab, setAddSongTab] = useState<'new' | 'library'>('library');

  const [newSetlistData, setNewSetlistData] = useState({
    title: '',
    description: '',
    artist_id: artistId || ''
  });

  const [newSongData, setNewSongData] = useState({
    title: '',
    duration: '',
    notes: '',
    tonality: '',
    bpm: '',
    lyrics: ''
  });

  useEffect(() => {
    const fetchArtists = async () => {
      const { data } = await supabase
        .from('centralized_artists')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (data) setArtists(data);
    };
    fetchArtists();
  }, []);

  // Filter library songs for the selected setlist's artist
  const filteredLibrarySongs = useMemo(() => {
    let songs = librarySongs;
    
    // Filter by artist if setlist has an artist
    if (selectedSetlist?.artist_id) {
      songs = songs.filter(s => s.artist_id === selectedSetlist.artist_id);
    }
    
    // Filter by search query
    if (librarySearchQuery) {
      const query = librarySearchQuery.toLowerCase();
      songs = songs.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.tonality?.toLowerCase().includes(query)
      );
    }
    
    return songs;
  }, [librarySongs, selectedSetlist?.artist_id, librarySearchQuery]);

  const handleCreateSetlist = async () => {
    if (!newSetlistData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    const result = await createSetlist({
      title: newSetlistData.title,
      description: newSetlistData.description,
      artist_id: newSetlistData.artist_id || artistId
    });

    if (result) {
      setIsCreateDialogOpen(false);
      setNewSetlistData({ title: '', description: '', artist_id: artistId || '' });
    }
  };

  const handleAddSong = async () => {
    if (!selectedSetlist || !newSongData.title.trim()) {
      toast.error('Le titre de la chanson est requis');
      return;
    }

    const result = await addSong(
      selectedSetlist.id, 
      {
        title: newSongData.title,
        duration: newSongData.duration || undefined,
        notes: newSongData.notes || undefined,
        tonality: newSongData.tonality || undefined,
        bpm: newSongData.bpm ? parseInt(newSongData.bpm) : undefined,
        lyrics: newSongData.lyrics || undefined
      },
      selectedSetlist.artist_id || undefined
    );

    if (result) {
      setIsAddSongDialogOpen(false);
      resetNewSongData();
    }
  };

  const handleAddFromLibrary = async (librarySong: LibrarySong) => {
    if (!selectedSetlist) return;
    
    const result = await addSongFromLibrary(selectedSetlist.id, librarySong);
    if (result) {
      setIsAddSongDialogOpen(false);
      setLibrarySearchQuery('');
    }
  };

  const handleUpdateSong = async () => {
    if (!editingSong || !newSongData.title.trim()) {
      toast.error('Le titre de la chanson est requis');
      return;
    }

    const result = await updateSong(editingSong.id, {
      title: newSongData.title,
      duration: newSongData.duration || undefined,
      notes: newSongData.notes || undefined,
      tonality: newSongData.tonality || undefined,
      bpm: newSongData.bpm ? parseInt(newSongData.bpm) : undefined,
      lyrics: newSongData.lyrics || undefined
    });

    if (result) {
      setEditingSong(null);
      resetNewSongData();
    }
  };

  const resetNewSongData = () => {
    setNewSongData({ title: '', duration: '', notes: '', tonality: '', bpm: '', lyrics: '' });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedSetlist) return;

    const songs = Array.from(selectedSetlist.songs || []);
    const [reorderedSong] = songs.splice(result.source.index, 1);
    songs.splice(result.destination.index, 0, reorderedSong);

    reorderSongs(selectedSetlist.id, songs);
  };

  const openEditDialog = (song: SetlistSong) => {
    setEditingSong(song);
    setNewSongData({
      title: song.title,
      duration: song.duration || '',
      notes: song.notes || '',
      tonality: song.tonality || '',
      bpm: song.bpm?.toString() || '',
      lyrics: song.lyrics || ''
    });
  };

  if (loading) {
    return <div className="text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Setlists</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Setlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une setlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {!artistId && (
                <div>
                  <Label>Artiste/Spectacle</Label>
                  <Select
                    value={newSetlistData.artist_id}
                    onValueChange={(value) => setNewSetlistData(prev => ({ ...prev, artist_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un artiste" />
                    </SelectTrigger>
                    <SelectContent>
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Titre</Label>
                <Input
                  value={newSetlistData.title}
                  onChange={(e) => setNewSetlistData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nom de la setlist"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newSetlistData.description}
                  onChange={(e) => setNewSetlistData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description..."
                />
              </div>
              <Button onClick={handleCreateSetlist} className="w-full">Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Setlists list */}
        <Card className="p-4 space-y-2">
          <h4 className="font-medium mb-4">Mes Setlists</h4>
          {setlists.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune setlist</p>
          ) : (
            setlists.map((setlist) => (
              <div
                key={setlist.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSetlist?.id === setlist.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedSetlist(setlist)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium truncate">{setlist.title}</h5>
                    {setlist.artist_id && (
                      <p className="text-xs text-muted-foreground truncate">
                        {artists.find(a => a.id === setlist.artist_id)?.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {setlist.songs?.length || 0} chanson(s)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSetlist(setlist.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Setlist details */}
        <Card className="md:col-span-2 p-4">
          {!selectedSetlist ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Music className="h-12 w-12 mb-2" />
              <p>Sélectionnez une setlist</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xl font-semibold">{selectedSetlist.title}</h4>
                  {selectedSetlist.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedSetlist.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{selectedSetlist.songs?.length || 0} chanson(s)</span>
                    {selectedSetlist.songs && selectedSetlist.songs.length > 0 && (
                      <span className="font-medium">
                        Durée totale: {calculateTotalDuration(selectedSetlist.songs)}
                      </span>
                    )}
                  </div>
                </div>
                <Dialog open={isAddSongDialogOpen} onOpenChange={(open) => {
                  setIsAddSongDialogOpen(open);
                  if (!open) {
                    resetNewSongData();
                    setLibrarySearchQuery('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Ajouter une chanson</DialogTitle>
                    </DialogHeader>
                    <Tabs value={addSongTab} onValueChange={(v) => setAddSongTab(v as 'new' | 'library')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="library" className="flex items-center gap-2">
                          <Library className="h-4 w-4" />
                          Bibliothèque
                        </TabsTrigger>
                        <TabsTrigger value="new" className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Nouvelle chanson
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="library" className="mt-4">
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher une chanson..."
                              value={librarySearchQuery}
                              onChange={(e) => setLibrarySearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <ScrollArea className="h-[300px]">
                            {filteredLibrarySongs.length === 0 ? (
                              <div className="text-center text-muted-foreground py-8">
                                <Library className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Aucune chanson dans la bibliothèque</p>
                                <p className="text-xs mt-1">Les chansons ajoutées aux setlists sont automatiquement enregistrées</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {filteredLibrarySongs.map((song) => (
                                  <div
                                    key={song.id}
                                    className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                    onClick={() => handleAddFromLibrary(song)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium">{song.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                          {song.duration && <span>{song.duration}</span>}
                                          {song.tonality && <Badge variant="outline" className="text-xs">{song.tonality}</Badge>}
                                          {song.bpm && <span>{song.bpm} BPM</span>}
                                        </div>
                                      </div>
                                      <Plus className="h-4 w-4 text-primary" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="new" className="mt-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label>Titre *</Label>
                              <Input
                                value={newSongData.title}
                                onChange={(e) => setNewSongData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Titre de la chanson"
                              />
                            </div>
                            <div>
                              <Label>Durée</Label>
                              <Input
                                value={newSongData.duration}
                                onChange={(e) => setNewSongData(prev => ({ ...prev, duration: e.target.value }))}
                                placeholder="ex: 3:45"
                              />
                            </div>
                            <div>
                              <Label>BPM</Label>
                              <Input
                                type="number"
                                value={newSongData.bpm}
                                onChange={(e) => setNewSongData(prev => ({ ...prev, bpm: e.target.value }))}
                                placeholder="ex: 120"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Tonalité</Label>
                              <Select
                                value={newSongData.tonality}
                                onValueChange={(value) => setNewSongData(prev => ({ ...prev, tonality: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une tonalité" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TONALITIES.map((tone) => (
                                    TONALITY_MODES.map((mode) => (
                                      <SelectItem key={`${tone}-${mode}`} value={`${tone} ${mode}`}>
                                        {tone} {mode}
                                      </SelectItem>
                                    ))
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-2">
                              <Label>Notes</Label>
                              <Textarea
                                value={newSongData.notes}
                                onChange={(e) => setNewSongData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Notes personnelles..."
                                rows={2}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Paroles
                              </Label>
                              <Textarea
                                value={newSongData.lyrics}
                                onChange={(e) => setNewSongData(prev => ({ ...prev, lyrics: e.target.value }))}
                                placeholder="Paroles de la chanson..."
                                rows={4}
                              />
                            </div>
                          </div>
                          <Button onClick={handleAddSong} className="w-full">Ajouter</Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="songs">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {selectedSetlist.songs?.map((song, index) => (
                        <Draggable key={song.id} draggableId={song.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`p-3 rounded-lg border bg-card ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div {...provided.dragHandleProps} className="mt-1">
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                    <h5 className="font-medium">{song.title}</h5>
                                    {song.duration && (
                                      <span className="text-sm text-muted-foreground">({song.duration})</span>
                                    )}
                                    {song.tonality && (
                                      <Badge variant="outline" className="text-xs">{song.tonality}</Badge>
                                    )}
                                    {song.bpm && (
                                      <Badge variant="secondary" className="text-xs">{song.bpm} BPM</Badge>
                                    )}
                                  </div>
                                  {song.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">{song.notes}</p>
                                  )}
                                  {song.lyrics && (
                                    <details className="mt-2">
                                      <summary className="text-xs text-primary cursor-pointer flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Voir les paroles
                                      </summary>
                                      <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap bg-muted/50 p-2 rounded">
                                        {song.lyrics}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Dialog
                                    open={editingSong?.id === song.id}
                                    onOpenChange={(open) => {
                                      if (open) {
                                        openEditDialog(song);
                                      } else {
                                        setEditingSong(null);
                                        resetNewSongData();
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Modifier la chanson</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="col-span-2">
                                            <Label>Titre *</Label>
                                            <Input
                                              value={newSongData.title}
                                              onChange={(e) => setNewSongData(prev => ({ ...prev, title: e.target.value }))}
                                            />
                                          </div>
                                          <div>
                                            <Label>Durée</Label>
                                            <Input
                                              value={newSongData.duration}
                                              onChange={(e) => setNewSongData(prev => ({ ...prev, duration: e.target.value }))}
                                              placeholder="ex: 3:45"
                                            />
                                          </div>
                                          <div>
                                            <Label>BPM</Label>
                                            <Input
                                              type="number"
                                              value={newSongData.bpm}
                                              onChange={(e) => setNewSongData(prev => ({ ...prev, bpm: e.target.value }))}
                                              placeholder="ex: 120"
                                            />
                                          </div>
                                          <div className="col-span-2">
                                            <Label>Tonalité</Label>
                                            <Select
                                              value={newSongData.tonality}
                                              onValueChange={(value) => setNewSongData(prev => ({ ...prev, tonality: value }))}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une tonalité" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {TONALITIES.map((tone) => (
                                                  TONALITY_MODES.map((mode) => (
                                                    <SelectItem key={`${tone}-${mode}`} value={`${tone} ${mode}`}>
                                                      {tone} {mode}
                                                    </SelectItem>
                                                  ))
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="col-span-2">
                                            <Label>Notes</Label>
                                            <Textarea
                                              value={newSongData.notes}
                                              onChange={(e) => setNewSongData(prev => ({ ...prev, notes: e.target.value }))}
                                              rows={2}
                                            />
                                          </div>
                                          <div className="col-span-2">
                                            <Label className="flex items-center gap-2">
                                              <FileText className="h-4 w-4" />
                                              Paroles
                                            </Label>
                                            <Textarea
                                              value={newSongData.lyrics}
                                              onChange={(e) => setNewSongData(prev => ({ ...prev, lyrics: e.target.value }))}
                                              rows={6}
                                            />
                                          </div>
                                        </div>
                                        <Button onClick={handleUpdateSong} className="w-full">Enregistrer</Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteSong(song.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
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

              {(!selectedSetlist.songs || selectedSetlist.songs.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Aucune chanson dans cette setlist
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
