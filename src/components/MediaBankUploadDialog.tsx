
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MEDIA_CATEGORIES } from '@/hooks/useBackgroundImages';

interface Artist {
  id: string;
  name: string;
}

interface MediaBankUploadDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  artists: Artist[];
  uploadCategory: string;
  setUploadCategory: (v: string) => void;
  uploadArtistId: string;
  setUploadArtistId: (v: string) => void;
  uploadTags: string;
  setUploadTags: (v: string) => void;
  selectedFile: File | null;
  setSelectedFile: (f: File | null) => void;
  uploading: boolean;
  onUpload: () => void;
}

export const MediaBankUploadDialog: React.FC<MediaBankUploadDialogProps> = ({
  open, onOpenChange, artists, uploadCategory, setUploadCategory,
  uploadArtistId, setUploadArtistId, uploadTags, setUploadTags,
  selectedFile, setSelectedFile, uploading, onUpload
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Ajouter un fichier</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Fichier</Label>
            <Input type="file" accept="image/*,.pdf" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          </div>
          <div>
            <Label>Catégorie</Label>
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEDIA_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Artiste/Spectacle (optionnel)</Label>
            <Select value={uploadArtistId} onValueChange={setUploadArtistId}>
              <SelectTrigger><SelectValue placeholder="Aucun artiste" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun artiste</SelectItem>
                {artists.map(artist => (
                  <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tags (séparés par des virgules)</Label>
            <Input value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="roadshow, concert, 2024" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={onUpload} disabled={!selectedFile || uploading}>{uploading ? 'Upload...' : 'Ajouter'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
