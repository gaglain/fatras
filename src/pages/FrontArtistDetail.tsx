import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';
import { 
  Mail, 
  Phone, 
  Globe, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Music,
  FileText,
  Video,
  Calendar,
  MapPin,
  Download,
  ArrowLeft
} from 'lucide-react';

export const FrontArtistDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tourDates, setTourDates] = useState<any[]>([]);

  useEffect(() => {
    loadArtistData();
  }, [id]);

  const loadArtistData = async () => {
    setLoading(true);
    try {
      // Charger les données de l'artiste
      const { data: artistData, error: artistError } = await supabase
        .from('centralized_artists')
        .select('*')
        .eq('id', id)
        .single();

      if (artistError) throw artistError;
      setArtist(artistData);

      // Charger les dates de tournée
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('artist_id', id)
        .in('status', ['confirmed', 'option'])
        .order('start_date', { ascending: true });

      setTourDates(eventsData || []);
    } catch (error) {
      console.error('Error loading artist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artiste non trouvé</h2>
          <Button onClick={() => navigate('/artistes')}>
            Retour aux artistes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${artist.name} - MusiConnect`}
        description={artist.short_description || artist.bio}
      />
      
      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/artistes')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux artistes
          </Button>

          {/* Hero Section */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-1">
                {artist.image && (
                  <div className="bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full aspect-square object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                    {artist.name}
                  </h1>
                  {artist.genre && (
                    <Badge variant="outline" className="text-lg px-4 py-1">
                      {artist.genre}
                    </Badge>
                  )}
                </div>

                {artist.short_description && (
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {artist.short_description}
                  </p>
                )}

                {/* Contact & Social */}
                <div className="flex flex-wrap gap-3">
                  {artist.contact_email && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${artist.contact_email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                  {artist.contact_phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${artist.contact_phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Téléphone
                      </a>
                    </Button>
                  )}
                  {artist.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Site Web
                      </a>
                    </Button>
                  )}
                  {artist.facebook && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.facebook} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {artist.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {artist.twitter && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {artist.youtube && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.youtube} target="_blank" rel="noopener noreferrer">
                        <Youtube className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="about">À propos</TabsTrigger>
              <TabsTrigger value="media">Médias</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="tour">Tournée</TabsTrigger>
            </TabsList>

            {/* À propos */}
            <TabsContent value="about">
              <Card>
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Présentation</h2>
                  <div className="prose prose-lg max-w-none">
                    {artist.presentation_text || artist.bio || "Aucune présentation disponible."}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Médias */}
            <TabsContent value="media" className="space-y-6">
              {/* Photos */}
              {artist.official_photos && artist.official_photos.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Photos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {artist.official_photos.map((photo: string, index: number) => (
                        <div key={index} className="bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={photo} 
                            alt={`${artist.name} - Photo ${index + 1}`}
                            className="w-full aspect-square object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(photo, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vidéo */}
              {artist.video_url && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Video className="h-5 w-5 mr-2" />
                      Vidéo
                    </h3>
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={artist.video_url.replace('watch?v=', 'embed/')}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audio */}
              {artist.audio_files && artist.audio_files.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Music className="h-5 w-5 mr-2" />
                      Extraits Audio
                    </h3>
                    <div className="space-y-4">
                      {artist.audio_files.map((audio: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{audio.name || `Audio ${index + 1}`}</p>
                            <audio controls className="w-full mt-2">
                              <source src={audio.url} type="audio/mpeg" />
                            </audio>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documents */}
            <TabsContent value="documents" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {artist.tech_sheet_pdf_url && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-bold mb-2">Fiche Technique</h3>
                      <Button asChild className="w-full">
                        <a href={artist.tech_sheet_pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {artist.presentation_pdf_url && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-bold mb-2">Dossier de Présentation</h3>
                      <Button asChild className="w-full">
                        <a href={artist.presentation_pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
                {artist.press_kit_url && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-bold mb-2">Dossier de Presse</h3>
                      <Button asChild className="w-full">
                        <a href={artist.press_kit_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
              {!artist.tech_sheet_pdf_url && !artist.presentation_pdf_url && !artist.press_kit_url && (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun document disponible pour le moment.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tournée */}
            <TabsContent value="tour">
              {tourDates.length > 0 ? (
                <div className="space-y-4">
                  {tourDates.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(event.start_date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {event.venue && `${event.venue}, `}{event.city}
                              </div>
                            </div>
                          </div>
                          <Badge className={
                            event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            event.status === 'option' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {event.status === 'confirmed' ? 'Confirmé' : 
                             event.status === 'option' ? 'Option' : event.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune date de tournée programmée pour le moment.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};