import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { useRoadshowNotes } from '@/hooks/useRoadshowNotes';
import { useUser } from '@/contexts/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RoadshowNotesProps {
  roadshowStopId?: string;
}

export const RoadshowNotes: React.FC<RoadshowNotesProps> = ({ roadshowStopId }) => {
  const { user } = useAuth();
  const { getUserById } = useUser();
  const { notes, loading, addNote, updateNote, deleteNote } = useRoadshowNotes(roadshowStopId);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    const success = await addNote(newNote.trim());
    if (success) setNewNote('');
  };

  const handleStartEdit = (noteId: string, content: string) => {
    setEditingId(noteId);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    await updateNote(editingId, editContent.trim());
    setEditingId(null);
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return;
    await deleteNote(noteId);
  };

  if (!roadshowStopId) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>Notes disponibles après la création de l'étape.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Ajouter une note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[60px]"
        />
        <Button onClick={handleAdd} size="sm" disabled={!newNote.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes list */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center">Chargement...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucune note. Ajoutez des commentaires collaboratifs.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map(note => {
            const author = getUserById(note.user_id);
            const isOwner = user?.id === note.user_id;
            const isEditing = editingId === note.id;

            return (
              <div key={note.id} className="p-3 rounded-lg border bg-card">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {author?.name || 'Utilisateur'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString('fr-FR')} à {new Date(note.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {isOwner && !isEditing && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleStartEdit(note.id, note.content)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDelete(note.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <div className="flex gap-2 mt-2">
                    <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[40px]" />
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setEditingId(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
