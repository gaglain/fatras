
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Users, Music, Eye, Edit, Trash2, Home, Truck, Phone } from 'lucide-react';
import { TourStop, Artist } from '@/types/roadshow.types';
import { getStatusColor, getStatusLabel } from '@/utils/roadshow.utils';

interface TourStopCardProps {
  stop: TourStop;
  artists: Artist[];
  creator: { name: string } | undefined;
  onEdit: (stop: TourStop) => void;
  onDelete: (stopId: string) => void;
  getUserById: (id: string) => any | undefined;
}

export const TourStopCard: React.FC<TourStopCardProps> = ({ 
  stop, 
  artists, 
  creator, 
  onEdit, 
  onDelete, 
  getUserById 
}) => {
  const stopArtists = stop.artists.map(artistId => 
    artists.find(artist => artist.id === artistId)
  ).filter(Boolean);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="text-xl font-semibold">{stop.city} - {stop.venue}</h3>
              <Badge className={getStatusColor(stop.status)}>
                {getStatusLabel(stop.status)}
              </Badge>
            </div>
            
            {stop.address && (
              <p className="text-sm text-gray-500 ml-8 mb-4">{stop.address}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{new Date(stop.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Concert: {stop.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{stop.ticketsAvailable}/{stop.capacity} places</span>
              </div>
              <div className="flex items-center space-x-2">
                <Music className="h-4 w-4 text-gray-500" />
                <span>{stopArtists.map(artist => artist?.name).join(', ') || 'Aucun artiste'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {stop.checkInTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Check-in: {stop.checkInTime}</span>
                </div>
              )}
              {stop.departureTime && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Départ prévu: {stop.departureTime}</span>
                </div>
              )}
              {stop.transport && (
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span>Transport: {stop.transport}</span>
                </div>
              )}
              {stop.accommodation && (
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <span>Logement: {stop.accommodation}</span>
                  {stop.accommodationAddress && <span className="text-xs text-gray-500">({stop.accommodationAddress})</span>}
                </div>
              )}
              {stop.localContact && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>Contact: {stop.localContact} {stop.localContactPhone && <span>- {stop.localContactPhone}</span>}</span>
                </div>
              )}
            </div>
            
            {stop.artistLineup && stop.artistLineup.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Équipe artistique:</h4>
                <div className="flex flex-wrap gap-2">
                  {stop.artistLineup.map(artist => {
                    const user = getUserById(artist.userId);
                    if (!user) return null;
                    
                    return (
                      <Badge key={artist.userId} variant={artist.confirmed ? "default" : "outline"}>
                        {user.name} {artist.confirmed ? '✓' : '?'}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {stop.notes && (
              <p className="text-gray-600 mt-3 italic">"{stop.notes}"</p>
            )}
            
            <div className="text-sm text-gray-500 mt-3">
              Créé par: {creator?.name || 'Utilisateur inconnu'}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(stop)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(stop.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
