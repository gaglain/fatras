import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AtSign } from 'lucide-react';
import { CreateNoteData } from '@/hooks/useShowBibleNotes';

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

interface ShowBibleNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteForm: CreateNoteData;
  onFormChange: (form: CreateNoteData) => void;
  onSave: () => void;
  isEditing: boolean;
  artistId?: string;
  spectacles: { id: string; name: string; genre: string }[];
  availableUsers: UserProfile[];
}

export const ShowBibleNoteDialog: React.FC<ShowBibleNoteDialogProps> = ({
  open, onOpenChange, noteForm, onFormChange, onSave, isEditing, artistId, spectacles, availableUsers
}) => {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onFormChange({ ...noteForm, content: value });
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    if (atIndex !== -1 && atIndex === cursorPos - 1) {
      setShowMentionSuggestions(true); setMentionSearch('');
    } else if (atIndex !== -1) {
      const searchTerm = textBeforeCursor.substring(atIndex + 1);
      if (searchTerm.length > 0 && !searchTerm.includes(' ')) {
        setShowMentionSuggestions(true); setMentionSearch(searchTerm);
      } else { setShowMentionSuggestions(false); }
    } else { setShowMentionSuggestions(false); }
  };

  const insertMention = (userProfile: UserProfile) => {
    const content = noteForm.content;
    const cursorPos = contentRef.current?.selectionStart || 0;
    const textBeforeCursor = content.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const userName = `${userProfile.first_name} ${userProfile.last_name}`.trim() || userProfile.username;
    const newContent = content.substring(0, atIndex) + `@${userName} ` + content.substring(cursorPos);
    onFormChange({ ...noteForm, content: newContent, mentioned_users: [...(noteForm.mentioned_users || []), userProfile.user_id] });
    setShowMentionSuggestions(false);
  };

  const filteredUsers = availableUsers.filter(u => {
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
    const search = mentionSearch.toLowerCase();
    return fullName.includes(search) || u.username.toLowerCase().includes(search);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Modifier la note' : 'Nouvelle note'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <Input value={noteForm.title} onChange={(e) => onFormChange({ ...noteForm, title: e.target.value })} placeholder="Titre de la note..." />
          </div>
          {!artistId && (
            <div>
              <label className="block text-sm font-medium mb-1">Spectacle</label>
              <Select value={noteForm.artist_id || 'none'} onValueChange={(value) => onFormChange({ ...noteForm, artist_id: value === 'none' ? null : value })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un spectacle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Toutes les spectacles</SelectItem>
                  {spectacles.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name} - {s.genre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Contenu (Markdown supporté - utilisez @ pour mentionner)</label>
            <Textarea ref={contentRef} value={noteForm.content} onChange={handleContentChange} placeholder="Écrivez votre note en markdown..." rows={10} className="font-mono text-sm" />
            {showMentionSuggestions && filteredUsers.length > 0 && (
              <Card className="absolute z-10 mt-1 max-h-48 overflow-y-auto">
                <CardContent className="p-2">
                  {filteredUsers.slice(0, 5).map((u) => (
                    <button key={u.user_id} className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm flex items-center gap-2" onClick={() => insertMention(u)}>
                      <AtSign className="h-4 w-4" /><span>{u.first_name} {u.last_name}</span><span className="text-xs text-muted-foreground">@{u.username}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
            <Input value={noteForm.tags.join(', ')} onChange={(e) => onFormChange({ ...noteForm, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="urgent, technique, à valider..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={noteForm.is_pinned} onChange={(e) => onFormChange({ ...noteForm, is_pinned: e.target.checked })} className="rounded" />
            <label className="text-sm">Épingler cette note</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={onSave}>{isEditing ? 'Mettre à jour' : 'Créer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
