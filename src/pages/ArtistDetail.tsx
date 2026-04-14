
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Star, MapPin, Edit } from 'lucide-react';
import { ArtistBioTab, ArtistCastingTab, ArtistVideosTab, ArtistAudioTab, ArtistDocumentsTab, ArtistMerchTab } from './ArtistDetailTabs';

interface ArtistDetailProps { artistId?: string; }

const sampleArtist = {
  id: '1', name: 'Sarah Mitchell', genre: 'Folk/Acoustique', image: '/placeholder.svg',
  bio: 'Sarah Mitchell est une artiste folk reconnue avec plus de 10 ans de carrière.',
  location: 'Paris, France', rating: 4.8, totalShows: 156, yearsActive: 12, website: 'https://sarahmitchell.com',
  social: { instagram: '@sarahmitchell_music', facebook: 'Sarah Mitchell Official', youtube: 'Sarah Mitchell Music' }
};

export const ArtistDetail: React.FC<ArtistDetailProps> = ({ artistId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [artist, setArtist] = useState(sampleArtist);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <img src={artist.image} alt={artist.name} className="w-32 h-32 rounded-lg object-cover" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div><h1 className="text-3xl font-bold">{artist.name}</h1><Badge className="mt-2">{artist.genre}</Badge></div>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}><Edit className="h-4 w-4 mr-2" />{isEditing ? 'Sauvegarder' : 'Modifier'}</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center"><div className="flex items-center justify-center mb-1"><Star className="h-4 w-4 text-yellow-500 mr-1" /><span className="font-bold">{artist.rating}</span></div><p className="text-xs text-muted-foreground">Note</p></div>
                <div className="text-center"><p className="font-bold">{artist.totalShows}</p><p className="text-xs text-muted-foreground">Spectacles</p></div>
                <div className="text-center"><p className="font-bold">{artist.yearsActive}</p><p className="text-xs text-muted-foreground">Ans de carrière</p></div>
                <div className="text-center"><div className="flex items-center justify-center mb-1"><MapPin className="h-4 w-4 mr-1" /></div><p className="text-xs text-muted-foreground">{artist.location}</p></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="bio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="bio">Biographie</TabsTrigger>
          <TabsTrigger value="casting">Casting</TabsTrigger>
          <TabsTrigger value="videos">Vidéos</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="merch">Merchandising</TabsTrigger>
        </TabsList>
        <TabsContent value="bio"><ArtistBioTab artist={artist} isEditing={isEditing} setArtist={setArtist} currentAudio={currentAudio} handlePlayAudio={(id) => setCurrentAudio(currentAudio === id ? null : id)} /></TabsContent>
        <TabsContent value="casting"><ArtistCastingTab /></TabsContent>
        <TabsContent value="videos"><ArtistVideosTab /></TabsContent>
        <TabsContent value="audio"><ArtistAudioTab currentAudio={currentAudio} handlePlayAudio={(id) => setCurrentAudio(currentAudio === id ? null : id)} /></TabsContent>
        <TabsContent value="documents"><ArtistDocumentsTab /></TabsContent>
        <TabsContent value="merch"><ArtistMerchTab /></TabsContent>
      </Tabs>
    </div>
  );
};
