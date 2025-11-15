import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { EmailTemplateComposer } from '@/components/email/EmailTemplateComposer';
import { ContactListAssignment } from '@/components/contacts/ContactListAssignment';
import { toast } from 'sonner';

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [defaultActiveTab, setDefaultActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadContact();
      loadConnections();
    }
  }, [id]);

  // Handle URL params for composing emails from tasks
  useEffect(() => {
    const shouldCompose = searchParams.get('compose');
    if (shouldCompose === 'true') {
      setShowEmailComposer(true);
      setDefaultActiveTab('email');
    }
  }, [searchParams]);

  const loadContact = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .maybeSingle();

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
    
    console.log('🔍 Chargement des connexions pour le contact:', id);
    const data = await getContactConnections(id);
    console.log('📊 Données de connexions reçues:', data);
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
    const allConns = [
      ...connections.events?.map((e: any) => ({ ...e, type: 'event' })) || [],
      ...connections.opportunities?.map((o: any) => ({ ...o, type: 'opportunity' })) || [],
      ...connections.quotes?.map((q: any) => ({ ...q, type: 'quote' })) || [],
      ...connections.tasks?.map((t: any) => ({ ...t, type: 'task' })) || [],
      ...connections.roadshow_stops?.map((r: any) => ({ ...r, type: 'roadshow_stop' })) || []
    ].sort((a, b) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime());
    
    console.log('🎯 getAllConnections - Total connexions:', allConns.length, {
      events: connections.events?.length || 0,
      opportunities: connections.opportunities?.length || 0,
      quotes: connections.quotes?.length || 0,
      tasks: connections.tasks?.length || 0,
      roadshow_stops: connections.roadshow_stops?.length || 0
    });
    
    return allConns;
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
        <div className="flex items-center gap-2">
          <ContactListAssignment 
            contactId={contact.id!}
            contactName={`${contact.first_name} ${contact.last_name}`}
          />
          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground truncate">{contact.email || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium">Téléphone</p>
                <p className="text-muted-foreground truncate">{contact.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium">Entreprise</p>
                <p className="text-muted-foreground truncate">{contact.company || 'Non renseigné'}</p>
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
      <Tabs value={defaultActiveTab} onValueChange={setDefaultActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="activity">Activité ({allConnections.length})</TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Envoyer un Email
          </TabsTrigger>
          <TabsTrigger value="emails">Historique Emails</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activité récente */}
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
                              <Badge variant="outline" className="text-xs shrink-0">
                                {getEntityLabel(item.type)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground flex-wrap">
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
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

            {/* Stats détaillées */}
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
                    <Badge variant="secondary" className="text-base">
                      {connections.events?.length || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Opportunités</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {connections.opportunities?.length || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Devis</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {connections.quotes?.length || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Tâches</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {connections.tasks?.length || 0}
                    </Badge>
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
                          {allConnections.length > 0 
                            ? formatDate(allConnections[0].date || allConnections[0].created_at)
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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

        <TabsContent value="email" className="space-y-4">
          <EmailTemplateComposer 
            defaultRecipient={contact?.email}
            defaultSubject={searchParams.get('subject') ? decodeURIComponent(searchParams.get('subject')!) : ''}
          />
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