
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Music, 
  Video, 
  FileText, 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  Star, 
  Upload,
  Play,
  Pause,
  Download,
  Eye,
  Edit
} from 'lucide-react';

interface ArtistDetailProps {
  artistId?: string;
}

const sampleArtist = {
  id: '1',
  name: 'Sarah Mitchell',
  genre: 'Folk/Acoustique',
  image: '/placeholder.svg',
  bio: 'Sarah Mitchell est une artiste folk reconnue avec plus de 10 ans de carrière. Sa voix envoûtante et ses compositions originales touchent le cœur de milliers de fans à travers le monde.',
  location: 'Paris, France',
  rating: 4.8,
  totalShows: 156,
  yearsActive: 12,
  website: 'https://sarahmitchell.com',
  social: {
    instagram: '@sarahmitchell_music',
    facebook: 'Sarah Mitchell Official',
    youtube: 'Sarah Mitchell Music'
  }
};

const castingData = [
  {
    id: '1',
    role: 'Chanteuse principale',
    description: 'Voix lead, guitare acoustique',
    requirements: 'Expérience scène, tessiture soprano',
    status: 'active'
  },
  {
    id: '2',
    role: 'Musicien accompagnateur',
    description: 'Guitare électrique, chœurs',
    requirements: 'Minimum 5 ans expérience',
    status: 'searching'
  }
];

const videos = [
  {
    id: '1',
    title: 'Concert Live - Olympia 2023',
    url: '/placeholder.svg',
    duration: '45:32',
    views: 12540,
    uploadDate: '2023-12-15'
  },
  {
    id: '2',
    title: 'Session Studio - Nouvel Album',
    url: '/placeholder.svg',
    duration: '12:45',
    views: 8920,
    uploadDate: '2024-01-10'
  }
];

const audioTracks = [
  {
    id: '1',
    title: 'Midnight Dreams',
    duration: '3:42',
    album: 'Acoustic Sessions',
    plays: 15420,
    isPlaying: false
  },
  {
    id: '2',
    title: 'River Song',
    duration: '4:18',
    album: 'Acoustic Sessions',
    plays: 12890,
    isPlaying: false
  }
];

const documents = [
  {
    id: '1',
    name: 'Rider Technique',
    type: 'PDF',
    size: '2.5 MB',
    uploadDate: '2024-02-15',
    category: 'technique'
  },
  {
    id: '2',
    name: 'Fiche Artiste 2024',
    type: 'PDF',
    size: '1.8 MB',
    uploadDate: '2024-03-01',
    category: 'promo'
  }
];

const merchandise = [
  {
    id: '1',
    name: 'T-Shirt Tour 2024',
    price: 25,
    image: '/placeholder.svg',
    stock: 150,
    sales: 89
  },
  {
    id: '2',
    name: 'Album CD Acoustic Sessions',
    price: 15,
    image: '/placeholder.svg',
    stock: 200,
    sales: 156
  }
];

export const ArtistDetail: React.FC<ArtistDetailProps> = ({ artistId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [artist, setArtist] = useState(sampleArtist);

  const handlePlayAudio = (trackId: string) => {
    setCurrentAudio(currentAudio === trackId ? null : trackId);
  };

  return (
    <div className="space-y-6">
      {/* Artist Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <img 
              src={artist.image} 
              alt={artist.name} 
              className="w-32 h-32 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{artist.name}</h1>
                  <Badge className="mt-2">{artist.genre}</Badge>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Sauvegarder' : 'Modifier'}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-bold">{artist.rating}</span>
                  </div>
                  <p className="text-xs text-gray-600">Note</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{artist.totalShows}</p>
                  <p className="text-xs text-gray-600">Spectacles</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{artist.yearsActive}</p>
                  <p className="text-xs text-gray-600">Ans de carrière</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MapPin className="h-4 w-4 mr-1" />
                  </div>
                  <p className="text-xs text-gray-600">{artist.location}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="bio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="bio">Biographie</TabsTrigger>
          <TabsTrigger value="casting">Casting</TabsTrigger>
          <TabsTrigger value="videos">Vidéos</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="merch">Merchandising</TabsTrigger>
        </TabsList>

        <TabsContent value="bio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Biographie</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={artist.bio}
                  onChange={(e) => setArtist({...artist, bio: e.target.value})}
                  className="min-h-[200px]"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations Complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Site Web</label>
                {isEditing ? (
                  <Input 
                    value={artist.website}
                    onChange={(e) => setArtist({...artist, website: e.target.value})}
                  />
                ) : (
                  <p className="text-blue-600 hover:underline">{artist.website}</p>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  {isEditing ? (
                    <Input 
                      value={artist.social.instagram}
                      onChange={(e) => setArtist({
                        ...artist, 
                        social: {...artist.social, instagram: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-blue-600">{artist.social.instagram}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook</label>
                  {isEditing ? (
                    <Input 
                      value={artist.social.facebook}
                      onChange={(e) => setArtist({
                        ...artist, 
                        social: {...artist.social, facebook: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-blue-600">{artist.social.facebook}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">YouTube</label>
                  {isEditing ? (
                    <Input 
                      value={artist.social.youtube}
                      onChange={(e) => setArtist({
                        ...artist, 
                        social: {...artist.social, youtube: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-blue-600">{artist.social.youtube}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="casting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Offres de Casting</span>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Nouvelle Offre
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {castingData.map((casting) => (
                  <div key={casting.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{casting.role}</h4>
                      <Badge variant={casting.status === 'active' ? 'default' : 'outline'}>
                        {casting.status === 'active' ? 'Actif' : 'Recherche'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{casting.description}</p>
                    <p className="text-sm text-gray-500">{casting.requirements}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vidéos</span>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter Vidéo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <div key={video.id} className="space-y-3">
                    <div className="relative">
                      <img 
                        src={video.url} 
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button size="lg" className="rounded-full">
                          <Video className="h-6 w-6" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">{video.title}</h4>
                      <p className="text-sm text-gray-600">
                        {video.views.toLocaleString()} vues • {new Date(video.uploadDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pistes Audio</span>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter Audio
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audioTracks.map((track) => (
                  <div key={track.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePlayAudio(track.id)}
                    >
                      {currentAudio === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <div className="flex-1">
                      <h4 className="font-medium">{track.title}</h4>
                      <p className="text-sm text-gray-600">{track.album} • {track.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{track.plays.toLocaleString()} lectures</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Documents</span>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter Document
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="bg-red-100 p-2 rounded">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{doc.name}</h4>
                      <p className="text-sm text-gray-600">
                        {doc.type} • {doc.size} • {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="merch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Merchandising</span>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Nouveau Produit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {merchandise.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-medium mb-2">{item.name}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-purple-600">{item.price}€</span>
                      <Badge variant="outline">Stock: {item.stock}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {item.sales} vendus
                    </p>
                    <Button size="sm" className="w-full">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Gérer
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
