import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, ArrowLeft, Calendar, FileText, Target, CheckSquare, MapPin as MapIcon, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEntityConnections } from '@/hooks/useEntityConnections';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useContactEngagement } from '@/hooks/useContactEngagement';
import { Contact } from '@/types/contact.types';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { ContactEmailHistory } from '@/components/ContactEmailHistory';
import { EmailTemplateComposer } from '@/components/email/EmailTemplateComposer';
import { toast } from 'sonner';

import { ContactDetailHeader } from './contacts/ContactDetailHeader';
import { ContactOverviewTab, getAllConnections } from './contacts/ContactOverviewTab';
import { ContactLinkedEntities } from './contacts/ContactLinkedEntities';
import { ContactQuickActions } from './contacts/ContactQuickActions';

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { getContactConnections, loading: connectionsLoading } = useEntityConnections();
  const { getUserDisplayName } = useActiveUsers();
  const { stats: engagementStats } = useContactEngagement(id);
  const [contact, setContact] = useState<Contact | null>(null);
  const [connections, setConnections] = useState<any>({
    events: [], opportunities: [], quotes: [], tasks: [], roadshow_stops: []
  });
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [defaultActiveTab, setDefaultActiveTab] = useState('overview');

  useEffect(() => { if (id) loadContact(); }, [id]);

  useEffect(() => {
    if (id && !authLoading && user) loadConnections();
  }, [id, authLoading, user?.id]);

  useEffect(() => {
    const shouldCompose = searchParams.get('compose');
    if (shouldCompose === 'true') {
      setDefaultActiveTab('email');
    }
  }, [searchParams]);

  const loadContact = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase.from('contacts').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      setContact(data);
    } catch {
      toast.error('Contact non trouvé');
      navigate('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    if (!id) return;
    let data = await getContactConnections(id);

    const isAllEmpty = !data || ['events','opportunities','quotes','tasks','roadshow_stops']
      .every((k) => (data as any)[k]?.length === 0);

    if (isAllEmpty) {
      try {
        const [eventsRes, oppsRes] = await Promise.all([
          supabase.from('events').select('id, title, status, start_date').eq('contact_id', id),
          supabase.from('opportunities').select('id, title, status, date').eq('contact_id', id),
        ]);
        data = {
          events: eventsRes.data?.map((e: any) => ({ id: e.id, entity_type: 'event', entity_id: e.id, title: e.title, status: e.status, date: e.start_date })) || [],
          opportunities: oppsRes.data?.map((o: any) => ({ id: o.id, entity_type: 'opportunity', entity_id: o.id, title: o.title, status: o.status, date: o.date })) || [],
          quotes: [], tasks: [], artists: [], roadshow_stops: [], contacts: []
        } as any;
      } catch { /* silently ignore */ }
    }

    if (!data?.tasks || data.tasks.length === 0) {
      try {
        const [directTasksRes, viaEntitiesRes] = await Promise.all([
          supabase.from('tasks').select('id, title, status, due_date').eq('contact_id', id),
          supabase.from('task_entities').select('task_id, tasks(id, title, status, due_date)').eq('entity_type', 'contact').eq('entity_id', id)
        ]);
        const directTasks = directTasksRes.data?.map((t: any) => ({ id: t.id, entity_type: 'task', entity_id: t.id, title: t.title, status: t.status, date: t.due_date })) || [];
        const viaTasks = (viaEntitiesRes.data?.map((te: any) => te.tasks).filter(Boolean) || []).map((t: any) => ({ id: t.id, entity_type: 'task', entity_id: t.id, title: t.title, status: t.status, date: t.due_date }));
        const mergedMap = new Map<string, any>();
        [...directTasks, ...viaTasks].forEach((t) => mergedMap.set(t.id, t));
        data = { ...(data || {}), tasks: Array.from(mergedMap.values()) } as any;
      } catch { /* silently ignore */ }
    }

    if (!data?.quotes || data.quotes.length === 0) {
      try {
        const [directQuotesRes, viaQuotesRes] = await Promise.all([
          supabase.from('quotes').select('id, title, status, created_at').eq('contact_id', id),
          supabase.from('contact_quotes').select('quote_id, role, quotes(id, title, status, created_at)').eq('contact_id', id)
        ]);
        const directQuotes = directQuotesRes.data?.map((q: any) => ({ id: q.id, entity_type: 'quote', entity_id: q.id, title: q.title, status: q.status, date: q.created_at })) || [];
        const viaQuotes = (viaQuotesRes.data?.map((cq: any) => cq.quotes).filter(Boolean) || []).map((q: any) => ({ id: q.id, entity_type: 'quote', entity_id: q.id, title: q.title, status: q.status, date: q.created_at }));
        const mergedQuoteMap = new Map<string, any>();
        [...directQuotes, ...viaQuotes].forEach((q) => mergedQuoteMap.set(q.id, q));
        data = { ...(data || {}), quotes: Array.from(mergedQuoteMap.values()) } as any;
      } catch { /* silently ignore */ }
    }

    setConnections(data);
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

  const allConnections = getAllConnections(connections);

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 lg:px-0">
      <ContactDetailHeader
        contact={contact}
        engagementStats={engagementStats}
        onEdit={() => setEditDialogOpen(true)}
      />

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Mail, label: 'Email', value: contact.email },
          { icon: Mail, label: 'Téléphone', value: contact.phone },
          { icon: Mail, label: 'Entreprise', value: contact.company },
          { icon: Mail, label: 'Propriétaire', value: getUserDisplayName((contact as any)?.owner_id) || 'Non défini' },
        ].map((item, i) => (
          <Card key={i}><CardContent className="p-4"><div className="text-sm"><p className="font-medium">{item.label}</p><p className="text-muted-foreground truncate">{item.value || 'Non renseigné'}</p></div></CardContent></Card>
        ))}
        <Card><CardContent className="p-4"><div className="text-sm"><p className="font-medium">Statut</p><Badge variant="outline">{contact.status}</Badge></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="min-w-0">
      <Tabs value={defaultActiveTab} onValueChange={setDefaultActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="activity">Activité ({allConnections.length})</TabsTrigger>
          <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />Emails</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>


        <TabsContent value="overview" className="space-y-4">
          <ContactQuickActions contactId={id!} contactName={`${contact.first_name} ${contact.last_name}`} onCreated={loadConnections} />
          <ContactOverviewTab connections={connections} connectionsLoading={connectionsLoading} />
          <ContactLinkedEntities connections={connections} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Toute l'activité</CardTitle></CardHeader>
            <CardContent>
              {connectionsLoading ? <p className="text-muted-foreground">Chargement...</p> : allConnections.length === 0 ? <p className="text-muted-foreground">Aucune activité enregistrée</p> : (
                <div className="space-y-3">
                  {allConnections.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer" onClick={() => navigate({ event: '/events', opportunity: '/opportunities', quote: '/quotes', task: '/tasks', roadshow_stop: '/roadshow' }[item.type as string] || '/')}>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.title}</span>
                          <Badge variant="outline" className="text-xs">{item.type}</Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge>{item.status}</Badge>
                          {item.date && <span>{new Date(item.date).toLocaleDateString('fr-FR')}</span>}
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
          <ContactEmailHistory contactId={id!} contactEmail={contact?.email} />
        </TabsContent>


        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Informations de contact</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-muted-foreground">Nom complet</label><p>{contact.first_name} {contact.last_name}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Email</label><p>{contact.email || 'Non renseigné'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Téléphone</label><p>{contact.phone || 'Non renseigné'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Adresse</label><p>{contact.address && <span>{contact.address}<br /></span>}{contact.city && contact.postal_code && <span>{contact.postal_code} {contact.city}<br /></span>}{contact.country}</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Informations professionnelles</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><label className="text-sm font-medium text-muted-foreground">Entreprise</label><p>{contact.company || 'Non renseigné'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Poste</label><p>{contact.position || 'Non renseigné'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Type de contact</label><p>{contact.role || 'Non renseigné'}</p></div>
                <div><label className="text-sm font-medium text-muted-foreground">Source</label><p>{contact.source || 'Non renseigné'}</p></div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {contact.tags && contact.tags.length > 0 ? contact.tags.map((tag, index) => (<Badge key={index} variant="secondary">{tag}</Badge>)) : <span className="text-muted-foreground">Aucun tag</span>}
                  </div>
                </div>
                {contact.notes && <div><label className="text-sm font-medium text-muted-foreground">Notes</label><p className="text-sm">{contact.notes}</p></div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ContactDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        contact={contact}
        onSave={() => { loadContact(); loadConnections(); setEditDialogOpen(false); }}
      />
    </div>
  );
};
