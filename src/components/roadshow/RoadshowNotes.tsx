import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { useRoadshowNotes } from '@/hooks/useRoadshowNotes';
import { useUser } from '@/contexts/UserContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { SongRichTextEditor } from '@/components/setlist/SongRichTextEditor';
import { sanitizeHtml } from '@/lib/sanitize';

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

  const confirmAction = useConfirm();
  const handleDelete = async (noteId: string) => {
    const ok = await confirmAction({ title: 'Supprimer', description: 'Supprimer cette note ?', variant: 'destructive' });
    if (!ok) return;
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

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

  return (
    <div className="space-y-4">
      {/* Add note */}
      <div className="space-y-2">
        <SongRichTextEditor
          value={newNote}
          onChange={setNewNote}
          placeholder="Ajouter une note..."
          minHeight={100}
        />
        <div className="flex justify-end">
          <Button onClick={handleAdd} size="sm" disabled={!stripHtml(newNote)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>
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
                  <div className="space-y-2 mt-2">
                    <SongRichTextEditor value={editContent} onChange={setEditContent} minHeight={80} />
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleSaveEdit}>
                        <Check className="h-3 w-3 mr-1" /> Enregistrer
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setEditingId(null)}>
                        <X className="h-3 w-3 mr-1" /> Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(note.content) }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
