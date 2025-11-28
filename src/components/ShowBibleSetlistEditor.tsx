import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Music, GripVertical, Trash2, Edit, Plus } from 'lucide-react';
import { useShowBibleSetlists, Setlist, SetlistSong } from '@/hooks/useShowBibleSetlists';
import { toast } from 'sonner';

interface ShowBibleSetlistEditorProps {
  artistId?: string;
}

export const ShowBibleSetlistEditor = ({ artistId }: ShowBibleSetlistEditorProps) => {
  const { setlists, loading, createSetlist, updateSetlist, deleteSetlist, addSong, updateSong, deleteSong, reorderSongs } = useShowBibleSetlists(artistId);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddSongDialogOpen, setIsAddSongDialogOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SetlistSong | null>(null);

  const [newSetlistData, setNewSetlistData] = useState({
    title: '',
    description: ''
  });

  const [newSongData, setNewSongData] = useState({
    title: '',
    duration: '',
    notes: ''
  });

  const handleCreateSetlist = async () => {
    if (!newSetlistData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    const result = await createSetlist({
      title: newSetlistData.title,
      description: newSetlistData.description,
      artist_id: artistId
    });

    if (result) {
      setIsCreateDialogOpen(false);
      setNewSetlistData({ title: '', description: '' });
    }
  };

  const handleAddSong = async () => {
    if (!selectedSetlist || !newSongData.title.trim()) {
      toast.error('Le titre de la chanson est requis');
      return;
    }

    const result = await addSong(selectedSetlist.id, newSongData);
    if (result) {
      setIsAddSongDialogOpen(false);
      setNewSongData({ title: '', duration: '', notes: '' });
    }
  };

  const handleUpdateSong = async () => {
    if (!editingSong || !newSongData.title.trim()) {
      toast.error('Le titre de la chanson est requis');
      return;
    }

    const result = await updateSong(editingSong.id, newSongData);
    if (result) {
      setEditingSong(null);
      setNewSongData({ title: '', duration: '', notes: '' });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedSetlist) return;

    const songs = Array.from(selectedSetlist.songs || []);
    const [reorderedSong] = songs.splice(result.source.index, 1);
    songs.splice(result.destination.index, 0, reorderedSong);

    reorderSongs(selectedSetlist.id, songs);
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
                    <p className="text-xs text-muted-foreground truncate">
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
                <div>
                  <h4 className="text-xl font-semibold">{selectedSetlist.title}</h4>
                  {selectedSetlist.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedSetlist.description}</p>
                  )}
                </div>
                <Dialog open={isAddSongDialogOpen} onOpenChange={setIsAddSongDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une chanson</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Titre</Label>
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
                        <Label>Notes</Label>
                        <Textarea
                          value={newSongData.notes}
                          onChange={(e) => setNewSongData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Notes personnelles..."
                        />
                      </div>
                      <Button onClick={handleAddSong} className="w-full">Ajouter</Button>
                    </div>
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
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                    <h5 className="font-medium">{song.title}</h5>
                                    {song.duration && (
                                      <span className="text-sm text-muted-foreground">({song.duration})</span>
                                    )}
                                  </div>
                                  {song.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">{song.notes}</p>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Dialog
                                    open={editingSong?.id === song.id}
                                    onOpenChange={(open) => {
                                      if (open) {
                                        setEditingSong(song);
                                        setNewSongData({
                                          title: song.title,
                                          duration: song.duration || '',
                                          notes: song.notes || ''
                                        });
                                      } else {
                                        setEditingSong(null);
                                        setNewSongData({ title: '', duration: '', notes: '' });
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Modifier la chanson</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Titre</Label>
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
                                          />
                                        </div>
                                        <div>
                                          <Label>Notes</Label>
                                          <Textarea
                                            value={newSongData.notes}
                                            onChange={(e) => setNewSongData(prev => ({ ...prev, notes: e.target.value }))}
                                          />
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
