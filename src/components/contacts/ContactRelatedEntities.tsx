import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Target, Briefcase, CheckSquare, Map, Eye, Plus } from 'lucide-react';
import { Contact } from '@/types/contact.types';
import { useEntityConnections } from '@/hooks/useEntityConnections';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface ContactRelatedEntitiesProps {
  contact: Contact;
}

export const ContactRelatedEntities: React.FC<ContactRelatedEntitiesProps> = ({ contact }) => {
  const { getContactConnections, loading } = useEntityConnections();
  const [connections, setConnections] = useState<any>({
    events: [],
    opportunities: [],
    quotes: [],
    tasks: [],
    roadshow_stops: []
  });
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    let isSubscribed = true;

    const loadData = async () => {
      if (!authLoading && contact.id && isSubscribed) {
        const data = await getContactConnections(contact.id);
        if (isSubscribed) setConnections(data);
      }
    };

    loadData();

    return () => {
      isSubscribed = false;
    };
  }, [contact.id, authLoading, user?.id]);

  const loadConnections = async () => {
    if (!contact.id) return;
    
    const data = await getContactConnections(contact.id);
    setConnections(data);
  };

  const getAllEntities = () => {
    const allEntities = [
      ...connections.events?.map((e: any) => ({ ...e, type: 'event' })) || [],
      ...connections.opportunities?.map((o: any) => ({ ...o, type: 'opportunity' })) || [],
      ...connections.quotes?.map((q: any) => ({ ...q, type: 'quote' })) || [],
      ...connections.tasks?.map((t: any) => ({ ...t, type: 'task' })) || [],
      ...connections.roadshow_stops?.map((r: any) => ({ ...r, type: 'roadshow_stop' })) || []
    ];
    return allEntities;
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'quote': return <FileText className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'roadshow_stop': return <Map className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
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
      case 'confirmed':
      case 'completed':
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending':
      case 'todo': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const navigateToEntity = (entity: any) => {
    const routes = {
      event: '/events',
      opportunity: '/opportunities',
      quote: '/quotes',
      task: '/tasks',
      roadshow_stop: '/roadshow'
    } as const;

    navigate(routes[entity.type as keyof typeof routes] || '/');
  };

  const allEntities = getAllEntities();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Éléments liés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (allEntities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Éléments liés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun élément lié à ce contact</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Éléments liés ({allEntities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allEntities.map((entity) => (
            <div 
              key={`${entity.type}-${entity.id}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
              onClick={() => navigateToEntity(entity)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  {getEntityIcon(entity.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{entity.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {getEntityLabel(entity.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Badge className={getStatusColor(entity.status)}>
                      {entity.status}
                    </Badge>
                    {entity.date && <span>{formatDate(entity.date)}</span>}
                    {entity.role && <span>• {entity.role}</span>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};