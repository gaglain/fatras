import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface ArtistAudioSectionProps {
  artistId: string;
  audioFiles: Array<{ name: string; url: string; type?: string }>;
  onUpdate: (updates: any) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}

export const ArtistAudioSection: React.FC<ArtistAudioSectionProps> = ({
  artistId, audioFiles, onUpdate, uploading, setUploading
}) => {
  const [audioLink, setAudioLink] = React.useState('');
  const [audioLinkName, setAudioLinkName] = React.useState('');

  const handleAddAudioLink = () => {
    if (!audioLink.trim()) { toast.error('Veuillez entrer une URL'); return; }
    const currentAudio = audioFiles || [];
    onUpdate({ audio_files: [...currentAudio, { type: 'link', name: audioLinkName.trim() || 'Lien audio', url: audioLink.trim() }] });
    setAudioLink(''); setAudioLinkName('');
    toast.success('Lien audio ajouté');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Fichiers Audio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            {(audioFiles || []).map((audio: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{audio.name}</p>
                  {audio.type === 'link' ? (
                    <a href={audio.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 block">Écouter →</a>
                  ) : (
                    <audio controls className="w-full mt-2"><source src={audio.url} type="audio/mpeg" /></audio>
                  )}
                </div>
                <Button size="icon" variant="destructive" onClick={() => {
                  const updatedAudio = (audioFiles || []).filter((_: any, i: number) => i !== index);
                  onUpdate({ audio_files: updatedAudio });
                }}><X className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <div>
            <Label htmlFor="audio-upload">Ajouter des fichiers audio</Label>
            <Input id="audio-upload" type="file" accept="audio/*" multiple onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              for (const file of files) {
                setUploading(true);
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${artistId}/audio-${Date.now()}.${fileExt}`;
                  const { error: uploadError } = await supabase.storage.from('artist-audio').upload(fileName, file);
                  if (uploadError) throw uploadError;
                  const { data: { publicUrl } } = supabase.storage.from('artist-audio').getPublicUrl(fileName);
                  const currentAudio = audioFiles || [];
                  onUpdate({ audio_files: [...currentAudio, { type: 'file', name: file.name, url: publicUrl }] });
                  toast.success('Fichier audio uploadé avec succès');
                } catch (error) { logger.error('Error uploading audio:', error); toast.error("Erreur lors de l'upload"); }
                finally { setUploading(false); }
              }
            }} disabled={uploading} />
          </div>
          <div className="border-t pt-4">
            <Label className="text-base font-semibold mb-3 block">Ou ajouter un lien audio</Label>
            <div className="space-y-3">
              <div><Label htmlFor="audio-link-name">Nom du lien (ex: Spotify, SoundCloud)</Label><Input id="audio-link-name" value={audioLinkName} onChange={(e) => setAudioLinkName(e.target.value)} placeholder="Spotify" /></div>
              <div><Label htmlFor="audio-link">URL</Label><Input id="audio-link" value={audioLink} onChange={(e) => setAudioLink(e.target.value)} placeholder="https://open.spotify.com/..." /></div>
              <Button onClick={handleAddAudioLink} disabled={!audioLink.trim()}>Ajouter le lien</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
