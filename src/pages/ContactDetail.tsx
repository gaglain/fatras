import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  User, 
  Edit,
  Calendar,
  FileText,
  Target,
  CheckSquare,
  Map,
  Clock,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEntityConnections } from '@/hooks/useEntityConnections';
import { Contact } from '@/types/contact.types';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { ContactEmailHistory } from '@/components/ContactEmailHistory';
import { toast } from 'sonner';

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getContactConnections, loading: connectionsLoading } = useEntityConnections();
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [connections, setConnections] = useState<any>({
    events: [],
    opportunities: [],
    quotes: [],
    tasks: [],
    roadshow_stops: []
  });
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadContact();
      loadConnections();
    }
  }, [id, user]);

  const loadContact = async () => {
    if (!id || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error('Erreur lors du chargement du contact:', error);
      toast.error('Contact non trouvé');
      navigate('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    if (!id) return;
    
    const data = await getContactConnections(id);
    setConnections(data);
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'quote': return <FileText className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'roadshow_stop': return <Map className="h-4 w-4" />;
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

  const getAllConnections = () => {
    return [
      ...connections.events?.map((e: any) => ({ ...e, type: 'event' })) || [],
      ...connections.opportunities?.map((o: any) => ({ ...o, type: 'opportunity' })) || [],
      ...connections.quotes?.map((q: any) => ({ ...q, type: 'quote' })) || [],
      ...connections.tasks?.map((t: any) => ({ ...t, type: 'task' })) || [],
      ...connections.roadshow_stops?.map((r: any) => ({ ...r, type: 'roadshow_stop' })) || []
    ].sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());
  };

  const navigateToEntity = (entity: any) => {
    const routes = {
      event: '/events',
      opportunity: '/opportunities',
      quote: '/quotes',
      task: '/tasks',
      roadshow_stop: '/roadshow'
    };
    
    navigate(routes[entity.type as keyof typeof routes] || '/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement du contact...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Contact non trouvé</h2>
          <Button onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux contacts
          </Button>
        </div>
      </div>
    );
  }

  const allConnections = getAllConnections();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/contacts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {contact.first_name?.[0]}{contact.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {contact.first_name} {contact.last_name}
              </h1>
              <p className="text-muted-foreground">{contact.position} {contact.company && `• ${contact.company}`}</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">{contact.email || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Téléphone</p>
                <p className="text-muted-foreground">{contact.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Entreprise</p>
                <p className="text-muted-foreground">{contact.company || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Statut</p>
                <Badge variant="outline">{contact.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="activity">Activité ({allConnections.length})</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activité récente */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                {allConnections.length === 0 ? (
                  <p className="text-muted-foreground">Aucune activité enregistrée</p>
                ) : (
                  <div className="space-y-4">
                    {allConnections.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer" onClick={() => navigateToEntity(item)}>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {getEntityIcon(item.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {getEntityLabel(item.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            {item.date && <span>{formatDate(item.date)}</span>}
                            {item.role && <span>• {item.role}</span>}
                          </div>
                        </div>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Événements</span>
                  <span className="font-medium">{connections.events?.length || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Opportunités</span>
                  <span className="font-medium">{connections.opportunities?.length || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Devis</span>
                  <span className="font-medium">{connections.quotes?.length || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tâches</span>
                  <span className="font-medium">{connections.tasks?.length || 0}</span>
                </div>
                {/* Note: Email stats will be handled by ContactEmailHistory component */}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Toute l'activité</CardTitle>
            </CardHeader>
            <CardContent>
              {connectionsLoading ? (
                <p className="text-muted-foreground">Chargement...</p>
              ) : allConnections.length === 0 ? (
                <p className="text-muted-foreground">Aucune activité enregistrée</p>
              ) : (
                <div className="space-y-3">
                  {allConnections.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer" onClick={() => navigateToEntity(item)}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        {getEntityIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {getEntityLabel(item.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          {item.date && <span>{formatDate(item.date)}</span>}
                          {item.role && <span>• {item.role}</span>}
                        </div>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <ContactEmailHistory 
            contactId={id!} 
            contactEmail={contact?.email} 
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                  <p>{contact.first_name} {contact.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{contact.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  <p>{contact.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                  <p>
                    {contact.address && <span>{contact.address}<br /></span>}
                    {contact.city && contact.postal_code && <span>{contact.postal_code} {contact.city}<br /></span>}
                    {contact.country}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entreprise</label>
                  <p>{contact.company || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Poste</label>
                  <p>{contact.position || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type de contact</label>
                  <p>{contact.role || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Source</label>
                  <p>{contact.source || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {contact.tags && contact.tags.length > 0 ? (
                      contact.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Aucun tag</span>
                    )}
                  </div>
                </div>
                {contact.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm">{contact.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <ContactDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        contact={contact}
        onSave={() => {
          loadContact();
          loadConnections();
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
};