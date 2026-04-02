import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Edit, Download } from 'lucide-react';
import { Event } from '@/types/event.types';
import { downloadICSFile } from '@/utils/icsExport';

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'option': return 'Option';
    case 'confirmed': return 'Confirmé';
    case 'cancelled': return 'Annulé';
    case 'completed': return 'Terminé';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'option': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

interface Props {
  event: Event;
  onEdit: () => void;
}

export const EventDetailHeader: React.FC<Props> = ({ event, onEdit }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/events')} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold">{event.title}</h1>
            <Badge className={getStatusColor(event.status || 'pending')}>
              {getStatusLabel(event.status || 'pending')}
            </Badge>
          </div>
          {event.venue && (
            <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {event.venue}
              {event.city && ` - ${event.city}`}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {event.start_date && (
          <Button
            variant="outline"
            onClick={() => downloadICSFile({
              title: event.title,
              description: event.description,
              startDate: event.start_date!,
              endDate: event.end_date,
              venue: event.venue,
              address: event.address,
              city: event.city,
              country: event.country,
            })}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            .ics
          </Button>
        )}
        <Button onClick={onEdit} className="w-full sm:w-auto">
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>
    </div>
  );
};
