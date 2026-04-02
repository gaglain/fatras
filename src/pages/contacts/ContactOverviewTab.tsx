import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mail, Calendar, FileText, Target, CheckSquare, MapPin as MapIcon,
  Clock, Eye, User, Building
} from 'lucide-react';

interface Props {
  connections: any;
  connectionsLoading: boolean;
}

const getEntityIcon = (type: string) => {
  switch (type) {
    case 'event': return <Calendar className="h-4 w-4" />;
    case 'opportunity': return <Target className="h-4 w-4" />;
    case 'quote': return <FileText className="h-4 w-4" />;
    case 'task': return <CheckSquare className="h-4 w-4" />;
    case 'roadshow_stop': return <MapIcon className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getEntityLabel = (type: string) => {
  switch (type) {
    case 'event': return 'Événement';
    case 'opportunity': return 'Opportunité';
    case 'quote': return 'Devis';
    case 'task': return 'Tâche';
    case 'roadshow_stop': return 'Tournée';
    default: return type;
  }
};

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

export const getAllConnections = (connections: any) => {
  return [
    ...connections.events?.map((e: any) => ({ ...e, type: 'event' })) || [],
    ...connections.opportunities?.map((o: any) => ({ ...o, type: 'opportunity' })) || [],
    ...connections.quotes?.map((q: any) => ({ ...q, type: 'quote' })) || [],
    ...connections.tasks?.map((t: any) => ({ ...t, type: 'task' })) || [],
    ...connections.roadshow_stops?.map((r: any) => ({ ...r, type: 'roadshow_stop' })) || []
  ].sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());
};

export const ContactOverviewTab: React.FC<Props> = ({ connections, connectionsLoading }) => {
  const navigate = useNavigate();
  const allConnections = getAllConnections(connections);

  const navigateToEntity = (entity: any) => {
    const routes: Record<string, string> = {
      event: '/events', opportunity: '/opportunities', quote: '/quotes',
      task: '/tasks', roadshow_stop: '/roadshow'
    };
    navigate(routes[entity.type] || '/');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activité récente</span>
            {allConnections.length > 0 && (
              <Badge variant="secondary">{allConnections.length} élément{allConnections.length > 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : allConnections.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">Aucune activité enregistrée</p>
              <p className="text-sm text-muted-foreground mt-2">
                Les événements, opportunités, devis et tâches liés à ce contact apparaîtront ici
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {allConnections.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => navigateToEntity(item)}>
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {getEntityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium truncate">{item.title}</span>
                        <Badge variant="outline" className="text-xs shrink-0">{getEntityLabel(item.type)}</Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground flex-wrap">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        {item.date && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.date)}
                          </span>
                        )}
                        {item.role && <span>• {item.role}</span>}
                      </div>
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques complètes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Événements</span>
              </div>
              <Badge variant="secondary" className="text-base">{connections.events?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Opportunités</span>
              </div>
              <Badge variant="secondary" className="text-base">{connections.opportunities?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Devis</span>
              </div>
              <Badge variant="secondary" className="text-base">{connections.quotes?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Tâches</span>
              </div>
              <Badge variant="secondary" className="text-base">{connections.tasks?.length || 0}</Badge>
            </div>
            <Separator />
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Résumé</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total d'activités</span>
                  <span className="font-medium">{allConnections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dernière activité</span>
                  <span className="font-medium">
                    {allConnections.length > 0 ? formatDate(allConnections[0].date || allConnections[0].created_at) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
