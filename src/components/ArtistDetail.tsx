
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Calendar, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ArtistDetailEditForm } from '@/components/ArtistDetailEditForm';

type PageType = 'home' | 'artists' | 'artist-detail' | 'contact' | 'tour' | 'shop';

interface ArtistDetailProps {
  artist: any;
  setCurrentPage: (page: PageType) => void;
}

export const ArtistDetail: React.FC<ArtistDetailProps> = ({ artist, setCurrentPage }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [artistData, setArtistData] = useState(artist);
  const [users, setUsers] = useState<any[]>([]);
  const [newPhoto, setNewPhoto] = useState('');

  useEffect(() => {
    fetchUsers();
    if (artist?.id) fetchArtistData();
  }, [artist?.id]);

  const fetchUsers = async () => {
    const { data } = await supabase.from('user_profiles').select('id, first_name, last_name, role').in('role', ['booker', 'admin', 'super_admin']);
    if (data) setUsers(data);
  };

  const fetchArtistData = async () => {
    const { data } = await supabase.from('centralized_artists').select('*').eq('id', artist.id).single();
    if (data) {
      setArtistData({
        ...artist,
        presentation_text: data.presentation_text || '', photos: data.photos || [],
        presentation_pdf_url: data.presentation_pdf_url || '', video_url: data.video_url || '',
        audio_url: data.audio_url || '', tech_sheet_pdf_url: data.tech_sheet_pdf_url || '',
        technical_contact_id: data.technical_contact_id || '', booking_contact_id: data.booking_contact_id || '',
        sacem_program_number: data.sacem_program_number || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('centralized_artists').update({
        presentation_text: artistData.presentation_text, photos: artistData.photos,
        presentation_pdf_url: artistData.presentation_pdf_url, video_url: artistData.video_url,
        audio_url: artistData.audio_url, tech_sheet_pdf_url: artistData.tech_sheet_pdf_url,
        technical_contact_id: artistData.technical_contact_id, booking_contact_id: artistData.booking_contact_id,
        sacem_program_number: artistData.sacem_program_number
      }).eq('id', artist.id);
      if (error) throw error;
      toast.success('Informations mises à jour');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating artist:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const addPhoto = () => {
    if (newPhoto.trim()) {
      setArtistData({ ...artistData, photos: [...(artistData.photos || []), newPhoto.trim()] });
      setNewPhoto('');
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = [...(artistData.photos || [])];
    updatedPhotos.splice(index, 1);
    setArtistData({ ...artistData, photos: updatedPhotos });
  };

  if (!artist) {
    return <div className="pt-20 min-h-screen flex items-center justify-center"><p>Artiste non trouvé</p></div>;
  }

  return (
    <div className="pt-20 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button onClick={() => setCurrentPage('artists')} variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />Retour aux artistes
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <img src={artist.image} alt={artist.name} className="w-full aspect-square object-cover rounded-t-lg" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{artist.genre}</Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm text-muted-foreground">{artist.rating}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">{artist.name}</h1>
                  <p className="text-muted-foreground mb-6">{artist.bio}</p>
                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    <div className="flex justify-between"><span>Spectacles à venir:</span><span className="font-medium">{artist.upcomingShows}</span></div>
                    <div className="flex justify-between"><span>Total spectacles:</span><span className="font-medium">{artist.totalShows}</span></div>
                  </div>
                  <Button className="w-full mb-3"><Calendar className="h-4 w-4 mr-2" />Réserver un Spectacle</Button>
                  <Button variant="outline" className="w-full mb-3"><Play className="h-4 w-4 mr-2" />Écouter un Extrait</Button>
                  {user?.role && ['admin', 'super_admin'].includes(user.role) && (
                    <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "destructive" : "secondary"} className="w-full">
                      {isEditing ? 'Annuler' : 'Modifier les détails'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <ArtistDetailEditForm
            artistData={artistData} setArtistData={setArtistData} isEditing={isEditing}
            users={users} newPhoto={newPhoto} setNewPhoto={setNewPhoto}
            addPhoto={addPhoto} removePhoto={removePhoto} handleSave={handleSave}
          />
        </div>

        {/* Videos & Audio sections */}
        <div className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Vidéos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artist.videos?.map((video: any, index: number) => (
                  <div key={index} className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between"><span className="font-medium">{video.title}</span><Play className="h-5 w-5 text-muted-foreground" /></div>
                    <span className="text-sm text-muted-foreground capitalize">{video.type}</span>
                  </div>
                )) || <p className="text-muted-foreground">Aucune vidéo disponible</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Audio</h2>
              <div className="space-y-3">
                {artist.audio?.map((track: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div><p className="font-medium">{track.title}</p><p className="text-sm text-muted-foreground">{track.duration}</p></div>
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                )) || <p className="text-muted-foreground">Aucun audio disponible</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
