
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, Users, Euro, MoreVertical, Edit, Trash2, Clock } from 'lucide-react';
import { Event } from '@/types/event.types';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return '';
    if (min && max) return `${min}€ - ${max}€`;
    if (min) return `À partir de ${min}€`;
    if (max) return `Jusqu'à ${max}€`;
    return '';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
            {event.event_type && (
              <p className="text-sm text-muted-foreground">{event.event_type}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(event)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => event.id && onDelete(event.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {event.start_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDate(event.start_date)}
              {event.end_date && event.end_date !== event.start_date && (
                <span> - {formatDate(event.end_date)}</span>
              )}
            </div>
          )}
          
          {(event.venue || event.city) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {event.venue && <span>{event.venue}</span>}
              {event.venue && event.city && <span>, </span>}
              {event.city && <span>{event.city}</span>}
            </div>
          )}
          
          {event.attendees_count && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              {event.attendees_count} participants
            </div>
          )}
          
          {(event.budget_min || event.budget_max) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Euro className="h-4 w-4 mr-2" />
              {formatBudget(event.budget_min, event.budget_max)}
            </div>
          )}
        </div>
        
        {event.description && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {event.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
