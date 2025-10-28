import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Image as ImageIcon, FileText, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CentralizedArtist } from '@/hooks/useCentralizedData';

interface ArtistMediaManagerProps {
  artist: CentralizedArtist & {
    logo_url?: string;
    press_kit_url?: string;
    short_description?: string;
    official_photos?: string[];
    presentation_text?: string;
    presentation_pdf_url?: string;
    tech_sheet_pdf_url?: string;
    video_url?: string;
    audio_files?: { name: string; url: string }[];
  };
  onUpdate: (updates: Partial<CentralizedArtist>) => void;
}

export const ArtistMediaManager: React.FC<ArtistMediaManagerProps> = ({ artist, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [shortDescription, setShortDescription] = useState(artist.short_description || '');
  const [presentationText, setPresentationText] = useState(artist.presentation_text || '');
  const [videoUrl, setVideoUrl] = useState(artist.video_url || '');
  const [audioLink, setAudioLink] = useState('');
  const [audioLinkName, setAudioLinkName] = useState('');

  const handleFileUpload = async (
    file: File,
    bucket: string,
    fieldName: string,
    isArray: boolean = false
  ) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${artist.id}/${fieldName}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      if (isArray) {
        const currentPhotos = artist.official_photos || [];
        onUpdate({ official_photos: [...currentPhotos, publicUrl] } as any);
      } else {
        onUpdate({ [fieldName]: publicUrl } as any);
      }

      toast.success('Fichier uploadé avec succès');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    const updatedPhotos = (artist.official_photos || []).filter(url => url !== photoUrl);
    onUpdate({ official_photos: updatedPhotos } as any);
  };

  const handleSaveText = (field: string, value: string) => {
    onUpdate({ [field]: value } as any);
    toast.success('Texte enregistré');
  };

  const handleAddAudioLink = () => {
    if (!audioLink.trim()) {
      toast.error('Veuillez entrer une URL');
      return;
    }
    const currentAudio = artist.audio_files || [];
    const newAudio = {
      type: 'link',
      name: audioLinkName.trim() || 'Lien audio',
      url: audioLink.trim()
    };
    onUpdate({ audio_files: [...currentAudio, newAudio] } as any);
    setAudioLink('');
    setAudioLinkName('');
    toast.success('Lien audio ajouté');
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Dailymotion
    if (url.includes('dailymotion.com')) {
      const videoId = url.split('video/')[1]?.split('?')[0];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }
    
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {artist.logo_url && (
              <div className="relative w-32 h-32">
                <img
                  src={artist.logo_url}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
            <div>
              <Label htmlFor="logo-upload">Télécharger un logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'artist-photos', 'logo_url');
                }}
                disabled={uploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos officielles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Photos officielles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(artist.official_photos || []).map((photoUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photoUrl}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePhoto(photoUrl)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="photos-upload">Ajouter des photos</Label>
              <Input
                id="photos-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => handleFileUpload(file, 'artist-photos', 'official_photos', true));
                }}
                disabled={uploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texte de présentation courte */}
      <Card>
        <CardHeader>
          <CardTitle>Présentation courte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Texte de présentation courte..."
              rows={4}
            />
            <Button onClick={() => handleSaveText('short_description', shortDescription)}>
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Texte de présentation */}
      <Card>
        <CardHeader>
          <CardTitle>Texte de présentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={presentationText}
              onChange={(e) => setPresentationText(e.target.value)}
              placeholder="Texte de présentation complète..."
              rows={8}
            />
            <Button onClick={() => handleSaveText('presentation_text', presentationText)}>
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vidéo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Vidéo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-url">URL de la vidéo (YouTube, Vimeo...)</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            {videoUrl && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <iframe
                  src={getEmbedUrl(videoUrl)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}
            <Button onClick={() => handleSaveText('video_url', videoUrl)}>
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Fichiers Audio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              {(artist.audio_files || []).map((audio: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{audio.name}</p>
                    {audio.type === 'link' ? (
                      <a 
                        href={audio.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-1 block"
                      >
                        Écouter →
                      </a>
                    ) : (
                      <audio controls className="w-full mt-2">
                        <source src={audio.url} type="audio/mpeg" />
                      </audio>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      const updatedAudio = (artist.audio_files || []).filter((_: any, i: number) => i !== index);
                      onUpdate({ audio_files: updatedAudio } as any);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="audio-upload">Ajouter des fichiers audio</Label>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  for (const file of files) {
                    setUploading(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${artist.id}/audio-${Date.now()}.${fileExt}`;
                      
                      const { error: uploadError } = await supabase.storage
                        .from('artist-audio')
                        .upload(fileName, file);

                      if (uploadError) throw uploadError;

                      const { data: { publicUrl } } = supabase.storage
                        .from('artist-audio')
                        .getPublicUrl(fileName);

                      const currentAudio = artist.audio_files || [];
                      onUpdate({ 
                        audio_files: [...currentAudio, { type: 'file', name: file.name, url: publicUrl }] 
                      } as any);

                      toast.success('Fichier audio uploadé avec succès');
                    } catch (error) {
                      console.error('Error uploading audio:', error);
                      toast.error('Erreur lors de l\'upload du fichier audio');
                    } finally {
                      setUploading(false);
                    }
                  }
                }}
                disabled={uploading}
              />
            </div>
            
            <div className="border-t pt-4">
              <Label className="text-base font-semibold mb-3 block">Ou ajouter un lien audio</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="audio-link-name">Nom du lien (ex: Spotify, SoundCloud)</Label>
                  <Input
                    id="audio-link-name"
                    value={audioLinkName}
                    onChange={(e) => setAudioLinkName(e.target.value)}
                    placeholder="Spotify"
                  />
                </div>
                <div>
                  <Label htmlFor="audio-link">URL</Label>
                  <Input
                    id="audio-link"
                    value={audioLink}
                    onChange={(e) => setAudioLink(e.target.value)}
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
                <Button onClick={handleAddAudioLink} disabled={!audioLink.trim()}>
                  Ajouter le lien
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tech-sheet">Fiche technique</Label>
              {artist.tech_sheet_pdf_url && (
                <a
                  href={artist.tech_sheet_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline block mb-2"
                >
                  Voir la fiche technique actuelle
                </a>
              )}
              <Input
                id="tech-sheet"
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'artist-documents', 'tech_sheet_pdf_url');
                }}
                disabled={uploading}
              />
            </div>

            <div>
              <Label htmlFor="presentation-pdf">Dossier de présentation</Label>
              {artist.presentation_pdf_url && (
                <a
                  href={artist.presentation_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline block mb-2"
                >
                  Voir le dossier actuel
                </a>
              )}
              <Input
                id="presentation-pdf"
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'artist-documents', 'presentation_pdf_url');
                }}
                disabled={uploading}
              />
            </div>

            <div>
              <Label htmlFor="press-kit">Dossier de presse</Label>
              {artist.press_kit_url && (
                <a
                  href={artist.press_kit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline block mb-2"
                >
                  Voir le dossier de presse actuel
                </a>
              )}
              <Input
                id="press-kit"
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'artist-documents', 'press_kit_url');
                }}
                disabled={uploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};