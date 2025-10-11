import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { ArtistDashboard } from '@/components/ArtistDashboard';
import { ArtistMediaManager } from '@/components/ArtistMediaManager';
import { ArtistUsersManager } from '@/components/ArtistUsersManager';
import { ArtistTemplatesManager } from '@/components/ArtistTemplatesManager';
import { toast } from 'sonner';

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { artists, updateArtist } = useCentralizedData();
  const [artist, setArtist] = useState(artists.find(a => a.id === id));

  useEffect(() => {
    const foundArtist = artists.find(a => a.id === id);
    if (foundArtist) {
      setArtist(foundArtist);
    }
  }, [id, artists]);

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Spectacle non trouvé</p>
          <Button onClick={() => navigate('/artists')} className="mt-4">
            Retour aux spectacles
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (updates: any) => {
    await updateArtist(artist.id, updates);
    setArtist({ ...artist, ...updates });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/artists')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{artist.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{artist.genre}</Badge>
              <Badge variant={artist.status === 'active' ? 'default' : 'secondary'}>
                {artist.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline">
          <Edit2 className="h-4 w-4 mr-2" />
          Modifier les infos générales
        </Button>
      </div>

      {/* Artist Image */}
      {artist.image && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Spectacles à venir</p>
                    <p className="text-2xl font-bold">{artist.upcoming_shows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total spectacles</p>
                    <p className="text-2xl font-bold">{artist.total_shows}</p>
                  </div>
                  {artist.rating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Note</p>
                      <p className="text-2xl font-bold">{artist.rating}/5</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="media">Médias & Docs</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="info">Infos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ArtistDashboard artist={artist} />
        </TabsContent>

        <TabsContent value="media">
          <ArtistMediaManager artist={artist} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="users">
          <ArtistUsersManager artistId={artist.id} />
        </TabsContent>

        <TabsContent value="templates">
          <ArtistTemplatesManager
            artistId={artist.id}
            currentQuoteTemplateId={artist.quote_template_id}
            currentEmailTemplateId={artist.email_template_id}
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Biographie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {artist.bio || 'Aucune biographie disponible'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artist.contact_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{artist.contact_email}</p>
                  </div>
                )}
                {artist.contact_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{artist.contact_phone}</p>
                  </div>
                )}
                {artist.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Site web</p>
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {artist.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Réseaux sociaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artist.instagram && (
                  <div>
                    <p className="text-sm text-muted-foreground">Instagram</p>
                    <p className="font-medium">{artist.instagram}</p>
                  </div>
                )}
                {artist.facebook && (
                  <div>
                    <p className="text-sm text-muted-foreground">Facebook</p>
                    <p className="font-medium">{artist.facebook}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournée en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {artist.current_tour || 'Aucune tournée en cours'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};