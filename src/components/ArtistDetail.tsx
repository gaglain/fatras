
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Download, Calendar, Star, Upload, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
    if (artist?.id) {
      fetchArtistData();
    }
  }, [artist?.id]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, role')
      .in('role', ['booker', 'admin', 'super_admin']);
    
    if (data) setUsers(data);
  };

  const fetchArtistData = async () => {
    const { data } = await supabase
      .from('centralized_artists')
      .select('*')
      .eq('id', artist.id)
      .single();
    
    if (data) {
      setArtistData({
        ...artist,
        presentation_text: data.presentation_text || '',
        photos: data.photos || [],
        presentation_pdf_url: data.presentation_pdf_url || '',
        video_url: data.video_url || '',
        audio_url: data.audio_url || '',
        tech_sheet_pdf_url: data.tech_sheet_pdf_url || '',
        technical_contact_id: data.technical_contact_id || '',
        booking_contact_id: data.booking_contact_id || '',
        sacem_program_number: data.sacem_program_number || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('centralized_artists')
        .update({
          presentation_text: artistData.presentation_text,
          photos: artistData.photos,
          presentation_pdf_url: artistData.presentation_pdf_url,
          video_url: artistData.video_url,
          audio_url: artistData.audio_url,
          tech_sheet_pdf_url: artistData.tech_sheet_pdf_url,
          technical_contact_id: artistData.technical_contact_id,
          booking_contact_id: artistData.booking_contact_id,
          sacem_program_number: artistData.sacem_program_number
        })
        .eq('id', artist.id);

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
      setArtistData({
        ...artistData,
        photos: [...(artistData.photos || []), newPhoto.trim()]
      });
      setNewPhoto('');
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = [...(artistData.photos || [])];
    updatedPhotos.splice(index, 1);
    setArtistData({
      ...artistData,
      photos: updatedPhotos
    });
  };

  if (!artist) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <p>Artiste non trouvé</p>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          onClick={() => setCurrentPage('artists')}
          variant="outline" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux artistes
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full aspect-square object-cover rounded-t-lg"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">{artist.genre}</Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">{artist.rating}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{artist.name}</h1>
                  <p className="text-gray-600 mb-6">{artist.bio}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-6">
                    <div className="flex justify-between">
                      <span>Spectacles à venir:</span>
                      <span className="font-medium">{artist.upcomingShows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total spectacles:</span>
                      <span className="font-medium">{artist.totalShows}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver un Spectacle
                  </Button>
                  <Button variant="outline" className="w-full mb-3">
                    <Play className="h-4 w-4 mr-2" />
                    Écouter un Extrait
                  </Button>
                  
                  {user?.role && ['admin', 'super_admin'].includes(user.role) && (
                    <Button 
                      onClick={() => setIsEditing(!isEditing)} 
                      variant={isEditing ? "destructive" : "secondary"}
                      className="w-full"
                    >
                      {isEditing ? 'Annuler' : 'Modifier les détails'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Section Présentation */}
            <Card>
              <CardHeader>
                <CardTitle>Texte de Présentation</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <RichTextEditor
                    value={artistData.presentation_text || ''}
                    onChange={(val) => setArtistData({...artistData, presentation_text: val})}
                    placeholder="Texte de présentation de l'artiste..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: artistData.presentation_text || 'Aucun texte de présentation disponible' }} />
                )}
              </CardContent>
            </Card>

            {/* Section Photographies */}
            <Card>
              <CardHeader>
                <CardTitle>Photographies</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing && (
                  <div className="mb-4 flex gap-2">
                    <Input
                      value={newPhoto}
                      onChange={(e) => setNewPhoto(e.target.value)}
                      placeholder="URL de la photo"
                    />
                    <Button onClick={addPhoto} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {artistData.photos?.map((photo: string, index: number) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {isEditing && (
                        <Button
                          onClick={() => removePhoto(index)}
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )) || (
                    <p className="text-gray-500 col-span-full">Aucune photo disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Section Fichiers et Médias */}
            <Card>
              <CardHeader>
                <CardTitle>Fichiers et Médias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Dossier de présentation (PDF)</Label>
                    {isEditing ? (
                      <Input
                        value={artistData.presentation_pdf_url || ''}
                        onChange={(e) => setArtistData({...artistData, presentation_pdf_url: e.target.value})}
                        placeholder="URL du dossier PDF"
                      />
                    ) : (
                      artistData.presentation_pdf_url ? (
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le dossier
                        </Button>
                      ) : (
                        <p className="text-gray-500">Aucun dossier disponible</p>
                      )
                    )}
                  </div>
                  
                  <div>
                    <Label>Fiche technique (PDF)</Label>
                    {isEditing ? (
                      <Input
                        value={artistData.tech_sheet_pdf_url || ''}
                        onChange={(e) => setArtistData({...artistData, tech_sheet_pdf_url: e.target.value})}
                        placeholder="URL de la fiche technique"
                      />
                    ) : (
                      artistData.tech_sheet_pdf_url ? (
                        <Button variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger la fiche technique
                        </Button>
                      ) : (
                        <p className="text-gray-500">Aucune fiche technique disponible</p>
                      )
                    )}
                  </div>

                  <div>
                    <Label>Vidéo</Label>
                    {isEditing ? (
                      <Input
                        value={artistData.video_url || ''}
                        onChange={(e) => setArtistData({...artistData, video_url: e.target.value})}
                        placeholder="URL de la vidéo"
                      />
                    ) : (
                      artistData.video_url ? (
                        <Button variant="outline" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Voir la vidéo
                        </Button>
                      ) : (
                        <p className="text-gray-500">Aucune vidéo disponible</p>
                      )
                    )}
                  </div>

                  <div>
                    <Label>Audio</Label>
                    {isEditing ? (
                      <Input
                        value={artistData.audio_url || ''}
                        onChange={(e) => setArtistData({...artistData, audio_url: e.target.value})}
                        placeholder="URL de l'audio"
                      />
                    ) : (
                      artistData.audio_url ? (
                        <Button variant="outline" className="w-full">
                          <Play className="h-4 w-4 mr-2" />
                          Écouter l'audio
                        </Button>
                      ) : (
                        <p className="text-gray-500">Aucun audio disponible</p>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Contacts */}
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Technique</Label>
                    {isEditing ? (
                      <Select 
                        value={artistData.technical_contact_id || ''} 
                        onValueChange={(value) => setArtistData({...artistData, technical_contact_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un contact technique" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-700">
                        {users.find(u => u.id === artistData.technical_contact_id)?.first_name || 'Non défini'}
                        {users.find(u => u.id === artistData.technical_contact_id)?.last_name && 
                          ` ${users.find(u => u.id === artistData.technical_contact_id)?.last_name}`}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Contact Booking</Label>
                    {isEditing ? (
                      <Select 
                        value={artistData.booking_contact_id || ''} 
                        onValueChange={(value) => setArtistData({...artistData, booking_contact_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un contact booking" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.filter(u => ['booker', 'admin', 'super_admin'].includes(u.role)).map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.first_name} {user.last_name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-gray-700">
                        {users.find(u => u.id === artistData.booking_contact_id)?.first_name || 'Non défini'}
                        {users.find(u => u.id === artistData.booking_contact_id)?.last_name && 
                          ` ${users.find(u => u.id === artistData.booking_contact_id)?.last_name}`}
                      </p>
                    )}
                  </div>

                  {/* Numéro de programme SACEM - Information interne */}
                  <div>
                    <Label>Numéro de programme SACEM (interne)</Label>
                    {isEditing ? (
                      <Input
                        value={artistData.sacem_program_number || ''}
                        onChange={(e) => setArtistData({...artistData, sacem_program_number: e.target.value})}
                        placeholder="Ex: 123456789"
                      />
                    ) : (
                      <p className="text-gray-700">
                        {artistData.sacem_program_number || 'Non défini'}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Information interne - non affichée sur le site public.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={handleSave} className="px-8">
                  Sauvegarder les modifications
                </Button>
              </div>
            )}

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Vidéos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artist.videos?.map((video: any, index: number) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{video.title}</span>
                        <Play className="h-5 w-5 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-500 capitalize">{video.type}</span>
                    </div>
                  )) || (
                    <p className="text-gray-500">Aucune vidéo disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Audio</h2>
                <div className="space-y-3">
                  {artist.audio?.map((track: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-gray-500">{track.duration}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500">Aucun audio disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Documents</h2>
                <div className="space-y-3">
                  {artist.documents?.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-gray-500 uppercase">{doc.type}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  )) || (
                    <p className="text-gray-500">Aucun document disponible</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
