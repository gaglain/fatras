import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Users, Eye, Edit, Trash2, Download } from 'lucide-react';
import { TourStop, Artist } from '@/types/roadshow.types';
import { TourStopPreview } from './TourStopPreview';
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
    console.log('Téléchargement PDF direct pour:', stop);
    
    const content = `
FEUILLE DE ROUTE - ${stop.city.toUpperCase()}

Lieu: ${stop.venue}
Adresse: ${stop.address}
Date: ${new Date(stop.date).toLocaleDateString('fr-FR')}
Heure: ${stop.time}
Capacité: ${stop.capacity} personnes

Casting:
${stop.artistLineup.map(artist => {
  const user = getUserById(artist.userId);
  return `- ${user?.name || 'Artiste inconnu'} ${artist.confirmed ? '(Confirmé)' : '(En attente)'}`;
}).join('\n')}

${stop.notes ? `\nNotes: ${stop.notes}` : ''}

Statut: ${getStatusLabel(stop.status)}
Généré le ${new Date().toLocaleString('fr-FR')}
    `;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `feuille-route-${stop.city}-${stop.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success(`Feuille de route téléchargée: ${stop.city}`);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <span>{stop.city} - {stop.venue}</span>
            </CardTitle>
            <Badge className={getStatusColor(stop.status)}>
              {getStatusLabel(stop.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{new Date(stop.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{stop.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Capacité: {stop.capacity}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Adresse:</p>
            <p className="text-sm">{stop.address}</p>
          </div>

          {stop.artistLineup.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Casting:</p>
              <div className="flex flex-wrap gap-2">
                {stop.artistLineup.map((artistInfo) => {
                  const user = getUserById(artistInfo.userId);
                  return (
                    <Badge 
                      key={artistInfo.userId} 
                      variant={artistInfo.confirmed ? "default" : "secondary"}
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
              <p className="text-sm text-muted-foreground mb-1">Notes:</p>
              <p className="text-sm">{stop.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Créé par: {creator?.name || 'Utilisateur inconnu'}
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-3 w-3 mr-1" />
                Aperçu
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-3 w-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(stop)}>
                <Edit className="h-3 w-3 mr-1" />
                Modifier
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(stop.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Supprimer
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
