import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Plus, Edit2, Trash2, Pin, PinOff, User, Tag, FileText, Clock, Loader2, Eye } from 'lucide-react';
import { useShowBibleNotes, ShowBibleNote, CreateNoteData } from '@/hooks/useShowBibleNotes';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShowBibleNoteDialog } from './ShowBibleNoteDialog';

interface UserProfile { user_id: string; first_name: string; last_name: string; username: string; email: string; }

export const ShowBibleNotesEditor: React.FC<{ artistId?: string }> = ({ artistId }) => {
  const { user } = useAuth();
  const { artists: spectacles } = useCentralizedData();
  const { notes, loading, createNote, updateNote, deleteNote, togglePin } = useShowBibleNotes();
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<ShowBibleNote | null>(null);
  const [viewingNote, setViewingNote] = useState<ShowBibleNote | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [artistIdFilter, setArtistIdFilter] = useState<string>(artistId || 'all');

  const [noteForm, setNoteForm] = useState<CreateNoteData>({
    title: '', content: '', content_type: 'markdown', artist_id: artistId || null,
    mentioned_users: [], tags: [], is_pinned: false
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('user_profiles').select('user_id, first_name, last_name, username, email').eq('is_active', true);
      if (data) setAvailableUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    if (editingNote) { await updateNote(editingNote.id, noteForm); } else { await createNote(noteForm); }
    setShowNoteDialog(false); setEditingNote(null);
    setNoteForm({ title: '', content: '', content_type: 'markdown', artist_id: artistId || null, mentioned_users: [], tags: [], is_pinned: false });
  };

  const handleEditNote = (note: ShowBibleNote) => {
    setEditingNote(note);
    setNoteForm({ title: note.title, content: note.content, content_type: note.content_type, artist_id: note.artist_id, mentioned_users: note.mentioned_users, tags: note.tags, is_pinned: note.is_pinned });
    setShowNoteDialog(true);
  };

  const confirmAction = useConfirm();
  const handleDeleteNote = async (noteId: string) => {
    const ok = await confirmAction({ title: 'Supprimer', description: 'Supprimer cette note ?', variant: 'destructive' });
    if (ok) await deleteNote(noteId);
  };

  const getSpectacleName = (noteArtistId: string | null) => {
    if (!noteArtistId) return 'Toutes les spectacles';
    const spectacle = spectacles.find(s => s.id === noteArtistId);
    return spectacle ? `${spectacle.name} - ${spectacle.genre}` : 'Spectacle inconnu';
  };

  const filteredNotes = artistIdFilter === 'all' ? notes : notes.filter(note => note.artist_id === artistIdFilter);

  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="h-4 w-4 md:h-5 md:w-5 shrink-0" /><span className="truncate">Notes Collaboratives</span>
          </CardTitle>
          <Button onClick={() => setShowNoteDialog(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Nouvelle Note</span><span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>
        {!artistId && spectacles.length > 0 && (
          <div className="mt-4">
            <Select value={artistIdFilter} onValueChange={setArtistIdFilter}>
              <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder="Filtrer par spectacle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les spectacles</SelectItem>
                {spectacles.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name} - {s.genre}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Aucune note pour le moment</p><p className="text-sm">Créez votre première note collaborative</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className={note.is_pinned ? 'border-primary' : ''}>
                <CardContent className="pt-4 px-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {note.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
                        <h3 className="font-semibold truncate">{note.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(note.updated_at), 'PPp', { locale: fr })}</span>
                        {note.artist_id && <Badge variant="outline" className="text-xs">{getSpectacleName(note.artist_id)}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => togglePin(note.id, note.is_pinned)} title={note.is_pinned ? "Désépingler" : "Épingler"}>
                        {note.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setViewingNote(note)} title="Aperçu"><Eye className="h-4 w-4" /></Button>
                      {note.user_id === user?.id && (
                        <>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEditNote(note)} title="Modifier"><Edit2 className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDeleteNote(note.id)} title="Supprimer"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-3 mb-2">{note.content}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.map(tag => (<Badge key={tag} variant="secondary" className="text-xs"><Tag className="h-3 w-3 mr-1" />{tag}</Badge>))}
                    {note.mentioned_users.length > 0 && (<Badge variant="outline" className="text-xs"><User className="h-3 w-3 mr-1" />{note.mentioned_users.length} mention{note.mentioned_users.length > 1 ? 's' : ''}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <ShowBibleNoteDialog open={showNoteDialog} onOpenChange={setShowNoteDialog} noteForm={noteForm} onFormChange={setNoteForm}
        onSave={handleSaveNote} isEditing={!!editingNote} artistId={artistId} spectacles={spectacles} availableUsers={availableUsers} />

      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2">{viewingNote?.is_pinned && <Pin className="h-5 w-5 text-primary" />}{viewingNote?.title}</DialogTitle></DialogHeader>
          {viewingNote && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(viewingNote.updated_at), 'PPp', { locale: fr })}</span>
                {viewingNote.artist_id && <Badge variant="outline">{getSpectacleName(viewingNote.artist_id)}</Badge>}
              </div>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted p-4 rounded-lg">{viewingNote.content}</div>
              <div className="flex flex-wrap gap-1.5">
                {viewingNote.tags.map(tag => (<Badge key={tag} variant="secondary"><Tag className="h-3 w-3 mr-1" />{tag}</Badge>))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
