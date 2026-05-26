import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, RefreshCw, Upload, Download, Link2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GlobalFileUpload } from '@/components/GlobalFileUpload';
import { toast } from 'sonner';

interface MediaItem {
  bucket: string;
  name: string;
  path: string;
  url: string;
  created_at?: string;
}

const BUCKETS = ['publication-media', 'app-files', 'avatars'];

export const Resources: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('images');

  const loadBucketFiles = async (bucket: string) => {
    const { data, error } = await supabase.storage.from(bucket).list('', {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    } as any);

    if (error) {
      console.error('Erreur listage bucket', bucket, error);
      return [] as MediaItem[];
    }

    const items: MediaItem[] = (data || [])
      .filter((f) => f.name && !f.name.endsWith('/'))
      .map((f) => {
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(f.name);
        return {
          bucket,
          name: f.name.split('/').pop() || f.name,
          path: f.name,
          url: pub.publicUrl,
          created_at: (f as any).created_at,
        };
      });
    return items;
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const all: MediaItem[] = [];
      for (const bucket of BUCKETS) {
        const items = await loadBucketFiles(bucket);
        all.push(...items);
      }
      // Images d'abord
      const images = all.filter((m) => m.url.match(/\.(png|jpe?g|gif|webp|svg)$/i));
      const others = all.filter((m) => !m.url.match(/\.(png|jpe?g|gif|webp|svg)$/i));
      setMedia([...images, ...others]);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = media.filter((m) =>
    filter === 'images' ? m.url.match(/\.(png|jpe?g|gif|webp|svg)$/i) : true
  );

  const handleDownload = async (m: MediaItem) => {
    try {
      const { data, error } = await supabase.storage.from(m.bucket).download(m.path);
      if (error || !data) throw error;
      const blobUrl = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = m.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleShare = async (m: MediaItem) => {
    try {
      const { data, error } = await supabase.storage
        .from(m.bucket)
        .createSignedUrl(m.path, 60 * 60 * 24 * 7); // 7 jours
      if (error || !data?.signedUrl) throw error;
      await navigator.clipboard.writeText(data.signedUrl);
      toast.success('Lien privé copié (valide 7 jours)');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la création du lien');
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Ressources médias</h1>
          <p className="text-muted-foreground">Bibliothèque complète d'images et fichiers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Rafraîchir
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploader des fichiers</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalFileUpload multiple acceptedTypes="image/*,application/pdf" label="Ajouter des images ou documents" onFileUploaded={() => loadAll()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Bibliothèque ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Label>Filtre:</Label>
            <select className="border rounded px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="images">Images</option>
              <option value="all">Tous les fichiers</option>
            </select>
          </div>
          {loading ? (
            <div>Chargement...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filtered.map((m) => (
                <div key={`${m.bucket}-${m.path}`} className="group block">
                  <a href={m.url} target="_blank" rel="noreferrer">
                    <div className="aspect-square overflow-hidden rounded border">
                      {m.url.match(/\.(png|jpe?g|gif|webp|svg)$/i) ? (
                        <img src={m.url} alt={`Media ${m.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">Fichier</div>
                      )}
                    </div>
                  </a>
                  <div className="mt-2 text-xs truncate" title={`${m.bucket}/${m.name}`}>{m.name}</div>
                  <div className="mt-1 flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 flex-1 px-2" onClick={() => handleDownload(m)}>
                      <Download className="h-3 w-3 mr-1" /> <span className="text-xs">Télécharger</span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleShare(m)} title="Copier un lien privé (7 jours)">
                      <Link2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Resources;
