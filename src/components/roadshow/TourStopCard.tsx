
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, Eye, Edit, Trash2, Download } from 'lucide-react';
import { TourStop, Artist } from '@/types/roadshow.types';
import { TourStopPreview } from './TourStopPreview';
import { generateTourStopPDF } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

interface TourStopCardProps {
  stop: TourStop;
  artists: Artist[];
  creator: { name: string } | undefined;
  onEdit: (stop: TourStop) => void;
  onDelete: (stopId: string) => void;
  getUserById: (userId: string) => { name: string } | undefined;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Confirmé';
    case 'pending':
      return 'En attente';
    case 'cancelled':
      return 'Annulé';
    default:
      return status;
  }
};

export const TourStopCard: React.FC<TourStopCardProps> = ({
  stop,
  artists,
  creator,
  onEdit,
  onDelete,
  getUserById
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = () => {
    console.log('Ouverture aperçu pour:', stop);
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    try {
      generateTourStopPDF(stop, getUserById);
      toast.success(`Feuille de route PDF téléchargée: ${stop.city}`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
              <span className="truncate">{stop.city} - {stop.venue}</span>
            </CardTitle>
            <Badge className={`${getStatusColor(stop.status)} w-fit`}>
              {getStatusLabel(stop.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm truncate">{new Date(stop.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">{stop.time || '-'}</span>
            </div>
            <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm">Capacité: {stop.capacity}</span>
            </div>
          </div>

          {stop.address && (
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Adresse:</p>
              <p className="text-xs sm:text-sm">{stop.address}</p>
            </div>
          )}

          {stop.artistLineup.length > 0 && (
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Casting:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {stop.artistLineup.map((artistInfo) => {
                  const user = getUserById(artistInfo.userId);
                  return (
                    <Badge 
                      key={artistInfo.userId} 
                      variant={artistInfo.confirmed ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user?.name} {artistInfo.confirmed ? '✓' : '?'}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {stop.notes && (
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Notes:</p>
              <p className="text-xs sm:text-sm line-clamp-2">{stop.notes}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Créé par: {creator?.name || 'Utilisateur inconnu'}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview} className="flex-1 sm:flex-none">
                <Eye className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Aperçu</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-1 sm:flex-none">
                <Download className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">PDF</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(stop)} className="flex-1 sm:flex-none">
                <Edit className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Modifier</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(stop.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Supprimer</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <TourStopPreview 
        stop={stop}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        getUserById={getUserById}
      />
    </>
  );
};
