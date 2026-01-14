import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, User, Edit, Trash2, MoreHorizontal, Users, Euro, FileText, Eye } from 'lucide-react';
import { Event } from '@/types/event.types';
import { Contact } from '@/types/contact.types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ContactEventManager } from '@/components/contacts/ContactEventManager';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  viewMode: 'grid' | 'list';
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEdit,
  onDelete,
  viewMode
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [linkedContacts, setLinkedContacts] = useState<Contact[]>([]);
  const [contactManagerOpen, setContactManagerOpen] = useState(false);

  useEffect(() => {
    if (event.contact_id) {
      fetchContact();
    }
    fetchLinkedContacts();
  }, [event.contact_id, event.id]);

  const fetchContact = async () => {
    if (!event.contact_id) return;
    
    try {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', event.contact_id)
        .single();
      
      setContact(data);
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement du contact:', error);
    }
  };

  const fetchLinkedContacts = async () => {
    try {
      const { data } = await supabase
        .rpc('get_event_contacts', { event_id_param: event.id });
      
      if (data) {
        // Map the data to match Contact type
        const mappedContacts = data.map((item: any) => ({
          id: item.contact_id,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          phone: item.phone,
          company: item.company,
          role: item.role,
          status: 'prospect' // Default status
        }));
        setLinkedContacts(mappedContacts);
      }
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement des contacts liés:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return '';
    if (min && max && min === max) return `${min.toLocaleString()}€`;
    if (min && max) return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`;
    if (min) return `À partir de ${min.toLocaleString()}€`;
    if (max) return `Jusqu'à ${max.toLocaleString()}€`;
    return '';
  };

  if (viewMode === 'list') {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-semibold text-foreground">{event.title}</h3>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
              
              <div className="space-y-1">
                {event.start_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(event.start_date)}
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {event.venue}, {event.city}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {contact && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    {contact.first_name} {contact.last_name}
                  </div>
                )}
                {linkedContacts.length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {linkedContacts.length} contact{linkedContacts.length > 1 ? 's' : ''} lié{linkedContacts.length > 1 ? 's' : ''}
                  </div>
                )}
                {event.attendees_count && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {event.attendees_count} participants
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {formatBudget(event.budget_min, event.budget_max) && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Euro className="h-4 w-4 mr-1" />
                    {formatBudget(event.budget_min, event.budget_max)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setContactManagerOpen(true)}
              >
                <Users className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(event)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(event.id!)} 
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
        
        <ContactEventManager
          isOpen={contactManagerOpen}
          onClose={() => setContactManagerOpen(false)}
          eventId={event.id!}
          eventTitle={event.title}
        />
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground mb-2">
              {event.title}
            </CardTitle>
            <Badge className={getStatusColor(event.status)}>
              {getStatusLabel(event.status)}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigate(`/events/${event.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(event)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(event.id!)} 
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="space-y-2">
          {event.start_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{formatDate(event.start_date)}</span>
            </div>
          )}

          {event.venue && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{event.venue}, {event.city}</span>
            </div>
          )}

          {contact && (
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{contact.first_name} {contact.last_name}</span>
            </div>
          )}

          {linkedContacts.length > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{linkedContacts.length} contact{linkedContacts.length > 1 ? 's' : ''} lié{linkedContacts.length > 1 ? 's' : ''}</span>
            </div>
          )}

          {event.attendees_count && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{event.attendees_count} participants</span>
            </div>
          )}

          {formatBudget(event.budget_min, event.budget_max) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Euro className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{formatBudget(event.budget_min, event.budget_max)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Aperçu
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setContactManagerOpen(true)}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-1" />
            Contacts
          </Button>
        </div>
      </CardContent>

      <ContactEventManager
        isOpen={contactManagerOpen}
        onClose={() => setContactManagerOpen(false)}
        eventId={event.id!}
        eventTitle={event.title}
      />
    </Card>
  );
};