import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, FileText, Video } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CentralizedArtist } from '@/hooks/useCentralizedData';
import { logger } from '@/lib/logger';
import { ArtistAudioSection } from './ArtistAudioSection';

interface ArtistMediaManagerProps {
  artist: CentralizedArtist & {
    logo_url?: string; press_kit_url?: string; short_description?: string;
    official_photos?: string[]; presentation_text?: string; presentation_pdf_url?: string;
    tech_sheet_pdf_url?: string; video_url?: string; audio_files?: { name: string; url: string }[];
  };
  onUpdate: (updates: Partial<CentralizedArtist>) => void;
}

export const ArtistMediaManager: React.FC<ArtistMediaManagerProps> = ({ artist, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [shortDescription, setShortDescription] = useState(artist.short_description || '');
  const [presentationText, setPresentationText] = useState(artist.presentation_text || '');
  const [videoUrl, setVideoUrl] = useState(artist.video_url || '');

  const handleFileUpload = async (file: File, bucket: string, fieldName: string, isArray = false) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${artist.id}/${fieldName}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (isArray) { onUpdate({ official_photos: [...(artist.official_photos || []), publicUrl] } as any); }
      else { onUpdate({ [fieldName]: publicUrl } as any); }
      toast.success('Fichier uploadé avec succès');
    } catch (error) { logger.error('Error uploading file:', error); toast.error("Erreur lors de l'upload"); }
    finally { setUploading(false); }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    onUpdate({ official_photos: (artist.official_photos || []).filter(url => url !== photoUrl) } as any);
  };

  const handleSaveText = (field: string, value: string) => { onUpdate({ [field]: value } as any); toast.success('Texte enregistré'); };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') ? url.split('youtu.be/')[1]?.split('?')[0] : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) return `https://player.vimeo.com/video/${url.split('vimeo.com/')[1]?.split('?')[0]}`;
    if (url.includes('dailymotion.com')) return `https://www.dailymotion.com/embed/video/${url.split('video/')[1]?.split('?')[0]}`;
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card><CardHeader><CardTitle>Logo</CardTitle></CardHeader><CardContent><div className="space-y-4">
        {artist.logo_url && <div className="relative w-32 h-32"><img src={artist.logo_url} alt="Logo" className="w-full h-full object-cover rounded-lg" /></div>}
        <div><Label htmlFor="logo-upload">Télécharger un logo</Label><Input id="logo-upload" type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'artist-photos', 'logo_url'); }} disabled={uploading} /></div>
      </div></CardContent></Card>

      {/* Photos officielles */}
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Photos officielles</CardTitle></CardHeader><CardContent><div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(artist.official_photos || []).map((photoUrl, index) => (
            <div key={index} className="relative group"><img src={photoUrl} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
              <Button size="icon" variant="destructive" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemovePhoto(photoUrl)}><X className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <div><Label htmlFor="photos-upload">Ajouter des photos</Label><Input id="photos-upload" type="file" accept="image/*" multiple onChange={(e) => { Array.from(e.target.files || []).forEach(f => handleFileUpload(f, 'artist-photos', 'official_photos', true)); }} disabled={uploading} /></div>
      </div></CardContent></Card>

      {/* Présentation courte */}
      <Card><CardHeader><CardTitle>Présentation courte</CardTitle></CardHeader><CardContent><div className="space-y-4">
        <RichTextEditor value={shortDescription} onChange={setShortDescription} placeholder="Texte de présentation courte..." />
        <Button onClick={() => handleSaveText('short_description', shortDescription)}>Enregistrer</Button>
      </div></CardContent></Card>

      {/* Présentation */}
      <Card><CardHeader><CardTitle>Texte de présentation</CardTitle></CardHeader><CardContent><div className="space-y-4">
        <RichTextEditor value={presentationText} onChange={setPresentationText} placeholder="Texte de présentation complète..." />
        <Button onClick={() => handleSaveText('presentation_text', presentationText)}>Enregistrer</Button>
      </div></CardContent></Card>

      {/* Vidéo */}
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" />Vidéo</CardTitle></CardHeader><CardContent><div className="space-y-4">
        <div><Label htmlFor="video-url">URL de la vidéo (YouTube, Vimeo...)</Label><Input id="video-url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></div>
        {videoUrl && <div className="aspect-video bg-muted rounded-lg overflow-hidden"><iframe src={getEmbedUrl(videoUrl)} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" /></div>}
        <Button onClick={() => handleSaveText('video_url', videoUrl)}>Enregistrer</Button>
      </div></CardContent></Card>

      {/* Audio */}
      <ArtistAudioSection artistId={artist.id} audioFiles={artist.audio_files || []} onUpdate={(updates) => onUpdate(updates as any)} uploading={uploading} setUploading={setUploading} />

      {/* Documents */}
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Documents</CardTitle></CardHeader><CardContent><div className="space-y-4">
        {[
          { id: 'tech-sheet', label: 'Fiche technique', field: 'tech_sheet_pdf_url', url: artist.tech_sheet_pdf_url, linkLabel: 'Voir la fiche technique actuelle' },
          { id: 'presentation-pdf', label: 'Dossier de présentation', field: 'presentation_pdf_url', url: artist.presentation_pdf_url, linkLabel: 'Voir le dossier actuel' },
          { id: 'press-kit', label: 'Dossier de presse', field: 'press_kit_url', url: artist.press_kit_url, linkLabel: 'Voir le dossier de presse actuel' },
        ].map(doc => (
          <div key={doc.id}>
            <Label htmlFor={doc.id}>{doc.label}</Label>
            {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline block mb-2">{doc.linkLabel}</a>}
            <Input id={doc.id} type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'artist-documents', doc.field); }} disabled={uploading} />
          </div>
        ))}
      </div></CardContent></Card>
    </div>
  );
};
