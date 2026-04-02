import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Target, MapPin, Eye, User, Building } from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': case 'completed': case 'accepted': return 'bg-green-100 text-green-800';
    case 'pending': case 'todo': return 'bg-yellow-100 text-yellow-800';
    case 'cancelled': case 'rejected': return 'bg-red-100 text-red-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface Props {
  connections: any;
}

export const ContactLinkedEntities: React.FC<Props> = ({ connections }) => {
  const navigate = useNavigate();

  return (
    <>
      {connections.events && connections.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Événements liés ({connections.events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.events.map((event: any) => (
                <Card key={event.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate(`/events/${event.id}`)}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2">{event.title}</h4>
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      </div>
                      {event.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      )}
                      {event.role && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Badge variant="outline" className="text-xs">{event.role}</Badge>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />Voir détails</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {connections.opportunities && connections.opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Opportunités liées ({connections.opportunities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.opportunities.map((opp: any) => (
                <Card key={opp.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate('/opportunities')}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm line-clamp-2">{opp.title}</h4>
                        <Badge className={getStatusColor(opp.status)}>{opp.status}</Badge>
                      </div>
                      {opp.venue && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{opp.venue}</span>
                        </div>
                      )}
                      {opp.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatDate(opp.date)}</span>
                        </div>
                      )}
                      {opp.budget && opp.budget > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">{opp.budget}€</span>
                        </div>
                      )}
                      {opp.role && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Badge variant="outline" className="text-xs">{opp.role}</Badge>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />Voir détails</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
