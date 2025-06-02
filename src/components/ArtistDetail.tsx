
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Download, Calendar, Star } from 'lucide-react';

interface ArtistDetailProps {
  artist: any;
  setCurrentPage: (page: string) => void;
}

export const ArtistDetail: React.FC<ArtistDetailProps> = ({ artist, setCurrentPage }) => {
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
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Écouter un Extrait
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
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
