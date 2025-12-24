import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Edit2, Trash2, Pin, PinOff, User, Tag, 
  FileText, Clock, Loader2, AtSign
} from 'lucide-react';
import { useShowBibleNotes, ShowBibleNote, CreateNoteData } from '@/hooks/useShowBibleNotes';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

export const ShowBibleNotesEditor: React.FC<{ artistId?: string }> = ({ artistId }) => {
  const { user } = useAuth();
  const { artists: spectacles } = useCentralizedData();
  const { notes, loading, createNote, updateNote, deleteNote, togglePin } = useShowBibleNotes(artistId);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<ShowBibleNote | null>(null);
  const [viewingNote, setViewingNote] = useState<ShowBibleNote | null>(null);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [noteForm, setNoteForm] = useState<CreateNoteData>({
    title: '',
    content: '',
    content_type: 'markdown',
    artist_id: artistId || null,
    mentioned_users: [],
    tags: [],
    is_pinned: false
  });

  React.useEffect(() => {
    // Fetch available users for mentions
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, username, email')
        .eq('is_active', true);
      if (data) setAvailableUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      return;
    }

    if (editingNote) {
      await updateNote(editingNote.id, noteForm);
    } else {
      await createNote(noteForm);
    }

    setShowNoteDialog(false);
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      content_type: 'markdown',
      artist_id: artistId || null,
      mentioned_users: [],
      tags: [],
      is_pinned: false
    });
  };

  const handleEditNote = (note: ShowBibleNote) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      content_type: note.content_type,
      artist_id: note.artist_id,
      mentioned_users: note.mentioned_users,
      tags: note.tags,
      is_pinned: note.is_pinned
    });
    setShowNoteDialog(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Supprimer cette note ?')) {
      await deleteNote(noteId);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteForm({ ...noteForm, content: value });

    // Check for @ mention
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && atIndex === cursorPos - 1) {
      setShowMentionSuggestions(true);
      setMentionSearch('');
    } else if (atIndex !== -1) {
      const searchTerm = textBeforeCursor.substring(atIndex + 1);
      if (searchTerm.length > 0 && !searchTerm.includes(' ')) {
        setShowMentionSuggestions(true);
        setMentionSearch(searchTerm);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const insertMention = (userProfile: UserProfile) => {
    const content = noteForm.content;
    const cursorPos = contentRef.current?.selectionStart || 0;
    const textBeforeCursor = content.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    const userName = `${userProfile.first_name} ${userProfile.last_name}`.trim() || userProfile.username;
    const newContent = 
      content.substring(0, atIndex) + 
      `@${userName} ` + 
      content.substring(cursorPos);

    setNoteForm({ 
      ...noteForm, 
      content: newContent,
      mentioned_users: [...(noteForm.mentioned_users || []), userProfile.user_id]
    });
    setShowMentionSuggestions(false);
  };

  const filteredUsers = availableUsers.filter(u => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const search = mentionSearch.toLowerCase();
    return fullName.includes(search) || u.username.toLowerCase().includes(search);
  });

  const getSpectacleName = (artistId: string | null) => {
    if (!artistId) return 'Toutes les spectacles';
    const spectacle = spectacles.find(s => s.id === artistId);
    return spectacle ? `${spectacle.name} - ${spectacle.genre}` : 'Spectacle inconnu';
  };

  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
            <span className="truncate">Notes Collaboratives</span>
          </CardTitle>
          <Button onClick={() => setShowNoteDialog(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Nouvelle Note</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune note pour le moment</p>
            <p className="text-sm">Créez votre première note collaborative</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id} className={note.is_pinned ? 'border-primary' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {note.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                        <h3 className="font-semibold">{note.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(note.updated_at), 'PPp', { locale: fr })}
                        </span>
                        {note.artist_id && (
                          <Badge variant="outline" className="text-xs">
                            {getSpectacleName(note.artist_id)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => togglePin(note.id, note.is_pinned)}
                      >
                        {note.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setViewingNote(note)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {note.user_id === user?.id && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEditNote(note)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm line-clamp-3 mb-2">{note.content}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {note.mentioned_users.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {note.mentioned_users.length} mention{note.mentioned_users.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Modifier la note' : 'Nouvelle note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titre</label>
              <Input
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                placeholder="Titre de la note..."
              />
            </div>

            {!artistId && (
              <div>
                <label className="block text-sm font-medium mb-1">Spectacle</label>
                <Select
                  value={noteForm.artist_id || 'none'}
                  onValueChange={(value) => setNoteForm({ 
                    ...noteForm, 
                    artist_id: value === 'none' ? null : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un spectacle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Toutes les spectacles</SelectItem>
                    {spectacles.map((spectacle) => (
                      <SelectItem key={spectacle.id} value={spectacle.id}>
                        {spectacle.name} - {spectacle.genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Contenu (Markdown supporté - utilisez @ pour mentionner)
              </label>
              <Textarea
                ref={contentRef}
                value={noteForm.content}
                onChange={handleContentChange}
                placeholder="Écrivez votre note en markdown... Utilisez @ pour mentionner des utilisateurs"
                rows={10}
                className="font-mono text-sm"
              />
              
              {showMentionSuggestions && filteredUsers.length > 0 && (
                <Card className="absolute z-10 mt-1 max-h-48 overflow-y-auto">
                  <CardContent className="p-2">
                    {filteredUsers.slice(0, 5).map((userProfile) => (
                      <button
                        key={userProfile.user_id}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm flex items-center gap-2"
                        onClick={() => insertMention(userProfile)}
                      >
                        <AtSign className="h-4 w-4" />
                        <span>{userProfile.first_name} {userProfile.last_name}</span>
                        <span className="text-xs text-muted-foreground">@{userProfile.username}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
              <Input
                value={noteForm.tags.join(', ')}
                onChange={(e) => setNoteForm({ 
                  ...noteForm, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="urgent, technique, à valider..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={noteForm.is_pinned}
                onChange={(e) => setNoteForm({ ...noteForm, is_pinned: e.target.checked })}
                className="rounded"
              />
              <label className="text-sm">Épingler cette note</label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveNote}>
                {editingNote ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingNote} onOpenChange={() => setViewingNote(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingNote?.is_pinned && <Pin className="h-5 w-5 text-primary" />}
              {viewingNote?.title}
            </DialogTitle>
          </DialogHeader>
          {viewingNote && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(viewingNote.updated_at), 'PPp', { locale: fr })}
                </span>
                {viewingNote.artist_id && (
                  <Badge variant="outline">
                    {getSpectacleName(viewingNote.artist_id)}
                  </Badge>
                )}
              </div>
              
              <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted p-4 rounded-lg">
                {viewingNote.content}
              </div>
              
              {viewingNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {viewingNote.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {viewingNote.mentioned_users.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Utilisateurs mentionnés:</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingNote.mentioned_users.map(userId => (
                      <Badge key={userId} variant="outline">
                        <User className="h-3 w-3 mr-1" />
                        {availableUsers.find(u => u.user_id === userId)?.first_name || 'Utilisateur'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewingNote(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};