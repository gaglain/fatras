import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Music, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SongAudioFieldProps {
  audioUrl: string;
  audioName: string;
  onChange: (audioUrl: string, audioName: string) => void;
}

export const SongAudioField: React.FC<SongAudioFieldProps> = ({ audioUrl, audioName, onChange }) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!user) { toast.error('Vous devez être connecté'); return; }
    if (!file.type.startsWith('audio/')) { toast.error('Veuillez choisir un fichier audio'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 50 Mo)'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'mp3';
      const path = `songs/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('artist-audio').upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('artist-audio').getPublicUrl(path);
      onChange(data.publicUrl, file.name);
      toast.success('Audio téléchargé');
    } catch (e: any) {
      toast.error(e?.message || "Erreur d'envoi");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2"><Music className="h-4 w-4" />Fichier audio</Label>
      <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {audioUrl ? (
        <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm truncate">{audioName || 'Fichier audio'}</span>
            <div className="flex items-center gap-1 shrink-0">
              <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange('', '')}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <audio controls src={audioUrl} className="w-full" preload="metadata" />
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading} className="w-full">
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Charger un fichier audio
        </Button>
      )}
    </div>
  );
};
