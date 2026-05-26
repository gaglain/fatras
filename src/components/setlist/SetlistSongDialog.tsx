import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Library, FileText } from 'lucide-react';
import { LibrarySong } from '@/hooks/useShowBibleSetlists';

const TONALITIES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'];
const TONALITY_MODES = ['Majeur', 'Mineur'];

interface SongFormData {
  title: string;
  duration: string;
  notes: string;
  tonality: string;
  bpm: string;
  lyrics: string;
  sacem_number: string;
}

interface SetlistSongDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  addSongTab: 'new' | 'library';
  onTabChange: (tab: 'new' | 'library') => void;
  filteredLibrarySongs: LibrarySong[];
  librarySearchQuery: string;
  onLibrarySearchChange: (query: string) => void;
  onAddFromLibrary: (song: LibrarySong) => void;
  newSongData: SongFormData;
  onNewSongDataChange: (data: SongFormData) => void;
  onAddSong: () => void;
  // Edit mode
  isEditMode?: boolean;
  onUpdateSong?: () => void;
}

export const SetlistSongDialog: React.FC<SetlistSongDialogProps> = ({
  isOpen,
  onOpenChange,
  addSongTab,
  onTabChange,
  filteredLibrarySongs,
  librarySearchQuery,
  onLibrarySearchChange,
  onAddFromLibrary,
  newSongData,
  onNewSongDataChange,
  onAddSong,
  isEditMode = false,
  onUpdateSong,
}) => {
  const renderSongForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Titre *</Label>
          <Input value={newSongData.title} onChange={(e) => onNewSongDataChange({ ...newSongData, title: e.target.value })} placeholder="Titre de la chanson" />
        </div>
        <div>
          <Label>Durée</Label>
          <Input value={newSongData.duration} onChange={(e) => onNewSongDataChange({ ...newSongData, duration: e.target.value })} placeholder="ex: 3:45" />
        </div>
        <div>
          <Label>BPM</Label>
          <Input type="number" value={newSongData.bpm} onChange={(e) => onNewSongDataChange({ ...newSongData, bpm: e.target.value })} placeholder="ex: 120" />
        </div>
        <div className="col-span-2">
          <Label>Tonalité</Label>
          <Select value={newSongData.tonality} onValueChange={(value) => onNewSongDataChange({ ...newSongData, tonality: value })}>
            <SelectTrigger><SelectValue placeholder="Sélectionner une tonalité" /></SelectTrigger>
            <SelectContent>
              {TONALITIES.map((tone) => TONALITY_MODES.map((mode) => (
                <SelectItem key={`${tone}-${mode}`} value={`${tone} ${mode}`}>{tone} {mode}</SelectItem>
              )))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea value={newSongData.notes} onChange={(e) => onNewSongDataChange({ ...newSongData, notes: e.target.value })} placeholder="Notes personnelles..." rows={isEditMode ? 4 : 2} />
        </div>
        <div className="col-span-2">
          <Label className="flex items-center gap-2"><FileText className="h-4 w-4" />Paroles</Label>
          <Textarea value={newSongData.lyrics} onChange={(e) => onNewSongDataChange({ ...newSongData, lyrics: e.target.value })} placeholder="Paroles de la chanson..." rows={isEditMode ? 24 : 4} className={isEditMode ? 'min-h-[500px] font-mono text-sm leading-relaxed' : ''} />
        </div>
        <div className="col-span-2">
          <Label>N° SACEM</Label>
          <Input value={newSongData.sacem_number} onChange={(e) => onNewSongDataChange({ ...newSongData, sacem_number: e.target.value })} placeholder="ex: 1234567890" />
        </div>
      </div>
      <Button onClick={isEditMode ? onUpdateSong : onAddSong} className="w-full">
        {isEditMode ? 'Enregistrer' : 'Ajouter'}
      </Button>
    </div>
  );

  if (isEditMode) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier la chanson</DialogTitle></DialogHeader>
          {renderSongForm()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Ajouter une chanson</DialogTitle></DialogHeader>
        <Tabs value={addSongTab} onValueChange={(v) => onTabChange(v as 'new' | 'library')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library" className="flex items-center gap-2"><Library className="h-4 w-4" />Bibliothèque</TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2"><Plus className="h-4 w-4" />Nouvelle chanson</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher une chanson..." value={librarySearchQuery} onChange={(e) => onLibrarySearchChange(e.target.value)} className="pl-10" />
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
                      <div key={song.id} className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => onAddFromLibrary(song)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{song.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                              {song.duration && <span>{song.duration}</span>}
                              {song.tonality && <Badge variant="outline" className="text-xs">{song.tonality}</Badge>}
                              {song.bpm && <span>{song.bpm} BPM</span>}
                              {song.sacem_number && <span className="text-primary">SACEM: {song.sacem_number}</span>}
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
          <TabsContent value="new" className="mt-4">{renderSongForm()}</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export type { SongFormData };
