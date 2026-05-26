import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, FileDown } from 'lucide-react';
import { generateSetlistPDF } from '@/utils/setlistPdfGenerator';

interface SharedSong {
  id: string;
  title: string;
  duration?: string | null;
  tonality?: string | null;
  bpm?: number | null;
  notes?: string | null;
  lyrics?: string | null;
  sacem_number?: string | null;
  position?: number;
}

interface SharedData {
  setlist: {
    id: string;
    title: string;
    description?: string | null;
    sacem_program_number?: string | null;
    artist_id?: string | null;
  };
  songs: SharedSong[];
  artistName?: string | null;
}

export const SetlistPublic: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/get-shared-setlist?token=${encodeURIComponent(token)}`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (!res.ok) throw new Error('Not found');
        setData(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <Music className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h1 className="text-xl font-semibold mb-2">Setlist introuvable</h1>
          <p className="text-sm text-muted-foreground">Le lien est invalide ou a été révoqué.</p>
        </Card>
      </div>
    );
  }

  const { setlist, songs, artistName } = data;

  const handleExport = () =>
    generateSetlistPDF(
      {
        title: setlist.title,
        description: setlist.description || undefined,
        sacem_program_number: setlist.sacem_program_number || undefined,
        artistName: artistName || undefined,
      },
      songs.map((s) => ({
        title: s.title,
        duration: s.duration || undefined,
        tonality: s.tonality || undefined,
        bpm: s.bpm || undefined,
        notes: s.notes || undefined,
        lyrics: s.lyrics || undefined,
        sacem_number: s.sacem_number || undefined,
      })),
      { includeNotes: true, includeLyrics: true }
    );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${setlist.title} — Setlist`} description={setlist.description || 'Setlist partagée'} />
      <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6">
        <header className="space-y-2">
          {artistName && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{artistName}</p>
          )}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{setlist.title}</h1>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />Exporter PDF
            </Button>
          </div>
          {setlist.description && (
            <p className="text-muted-foreground">{setlist.description}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            <span>{songs.length} chanson(s)</span>
            {setlist.sacem_program_number && (
              <Badge variant="secondary">SACEM : {setlist.sacem_program_number}</Badge>
            )}
          </div>
        </header>

        <div className="space-y-3">
          {songs.map((song, idx) => (
            <Card key={song.id} id={`song-${song.id}`} className="p-4">
              <div className="flex items-start gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground tabular-nums mt-1">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-medium">{song.title}</h2>
                    {song.duration && <span className="text-sm text-muted-foreground">({song.duration})</span>}
                    {song.tonality && <Badge variant="outline" className="text-xs">{song.tonality}</Badge>}
                    {song.bpm && <Badge variant="secondary" className="text-xs">{song.bpm} BPM</Badge>}
                    {song.sacem_number && <Badge variant="outline" className="text-xs">SACEM : {song.sacem_number}</Badge>}
                  </div>
                  {song.notes && (
                    <div
                      className="prose prose-sm max-w-none text-muted-foreground mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: song.notes }}
                    />
                  )}
                  {song.lyrics && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Paroles</p>
                      <div
                        className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                        dangerouslySetInnerHTML={{ __html: song.lyrics }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {songs.length === 0 && (
            <p className="text-center text-muted-foreground py-12">Aucune chanson</p>
          )}
        </div>

        <footer className="text-center text-xs text-muted-foreground pt-8">Fatras</footer>
      </div>
    </div>
  );
};

export default SetlistPublic;
