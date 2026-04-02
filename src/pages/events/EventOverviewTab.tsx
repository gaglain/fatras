import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Users, Target, CheckSquare, User } from 'lucide-react';
import { Event } from '@/types/event.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Owner {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
}

interface Props {
  event: Event;
  owner: Owner | null;
  linkedContacts: any[];
  linkedOpportunities: any[];
  linkedTasks: any[];
}

export const EventOverviewTab: React.FC<Props> = ({
  event, owner, linkedContacts, linkedOpportunities, linkedTasks
}) => {
  const totalConnections = linkedContacts.length + linkedOpportunities.length + linkedTasks.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Détails de l'événement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.start_date && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date de début</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.start_date), 'PPP', { locale: fr })}
                </p>
              </div>
            )}
            {event.end_date && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date de fin</p>
                <p className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(event.end_date), 'PPP', { locale: fr })}
                </p>
              </div>
            )}
            {event.event_type && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="font-semibold">{event.event_type}</p>
              </div>
            )}
            {event.attendees_count && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Jauge / Participants</p>
                <p className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {event.attendees_count.toLocaleString('fr-FR')}
                </p>
              </div>
            )}
            {(event.budget_min || event.budget_max) && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Budget / Prix</p>
                <p className="font-semibold">
                  {event.budget_min && event.budget_max
                    ? `${event.budget_min.toLocaleString('fr-FR')}€ - ${event.budget_max.toLocaleString('fr-FR')}€`
                    : event.budget_min
                      ? `À partir de ${event.budget_min.toLocaleString('fr-FR')}€`
                      : `Jusqu'à ${event.budget_max?.toLocaleString('fr-FR')}€`}
                </p>
              </div>
            )}
          </div>

          {(event.venue || event.address || event.city || event.postal_code || event.country) && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Lieu / Adresse</p>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  {event.venue && <p className="font-semibold">{event.venue}</p>}
                  {event.address && <p className="text-foreground">{event.address}</p>}
                  {(event.postal_code || event.city) && (
                    <p className="text-foreground">{[event.postal_code, event.city].filter(Boolean).join(' ')}</p>
                  )}
                  {event.country && <p className="text-muted-foreground">{event.country}</p>}
                </div>
              </div>
            </div>
          )}

          {event.description && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-foreground">{event.description}</p>
            </div>
          )}
          {event.requirements && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Besoins techniques</p>
              <p className="text-foreground whitespace-pre-wrap">{event.requirements}</p>
            </div>
          )}
          {event.notes && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Notes</p>
              <p className="text-foreground whitespace-pre-wrap">{event.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Contacts liés</span>
              </div>
              <Badge variant="secondary" className="text-base">{linkedContacts.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Opportunités</span>
              </div>
              <Badge variant="secondary" className="text-base">{linkedOpportunities.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Tâches</span>
              </div>
              <Badge variant="secondary" className="text-base">{linkedTasks.length}</Badge>
            </div>
            <Separator />
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Résumé</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total d'éléments liés</span>
                  <span className="font-medium">{totalConnections}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
