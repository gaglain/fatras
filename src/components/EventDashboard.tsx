import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Mail, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventDashboardProps {
  eventId: string;
  eventName: string;
}

interface DashboardStats {
  totalPublications: number;
  upcomingPublications: number;
  contactLists: any[];
  campaigns: any[];
  publications: any[];
}

export const EventDashboard: React.FC<EventDashboardProps> = ({ eventId, eventName }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPublications: 0,
    upcomingPublications: 0,
    contactLists: [],
    campaigns: [],
    publications: []
  });
  const [loading, setLoading] = useState(true);
  const [contactLists, setContactLists] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch publications linked to this event
      const { data: publications, error: pubError } = await supabase
        .from('publications')
        .select('*')
        .eq('event_id', eventId)
        .order('scheduled_date', { ascending: false });

      if (pubError) throw pubError;

      // Fetch contact lists linked to this event
      const { data: lists, error: listsError } = await supabase
        .from('contact_lists')
        .select(`
          *,
          contact_list_members (
            count
          )
        `)
        .eq('event_id', eventId);

      if (listsError) throw listsError;

      // Fetch email campaigns linked to this event
      const { data: emailCampaigns, error: campaignsError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      const now = new Date();
      const upcoming = publications?.filter(p => new Date(p.scheduled_date) > now).length || 0;

      setStats({
        totalPublications: publications?.length || 0,
        upcomingPublications: upcoming,
        contactLists: lists || [],
        campaigns: emailCampaigns || [],
        publications: publications || []
      });
      setContactLists(lists || []);
      setCampaigns(emailCampaigns || []);
    } catch {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [eventId, user]);

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publications totales</p>
                <p className="text-2xl font-bold">{stats.totalPublications}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publications à venir</p>
                <p className="text-2xl font-bold">{stats.upcomingPublications}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Listes de contacts</p>
                <p className="text-2xl font-bold">{stats.contactLists.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campagnes email</p>
                <p className="text-2xl font-bold">{stats.campaigns.length}</p>
              </div>
              <Mail className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="publications" className="w-full">
        <TabsList>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="listes">Listes</TabsTrigger>
          <TabsTrigger value="campagnes">Campagnes</TabsTrigger>
        </TabsList>

        <TabsContent value="publications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publications liées à {eventName}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.publications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune publication liée à ce spectacle
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.publications.map((pub: any) => (
                    <div key={pub.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{pub.title || 'Sans titre'}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{pub.content?.substring(0, 100)}...</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(pub.scheduled_date), 'PPP', { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <Badge variant={pub.status === 'published' ? 'default' : 'secondary'}>
                          {pub.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listes de contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {contactLists.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune liste de contacts liée à ce spectacle
                </p>
              ) : (
                <div className="space-y-4">
                  {contactLists.map((list: any) => (
                    <div key={list.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{list.name}</h4>
                          {list.description && (
                            <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {list.contact_list_members?.[0]?.count || 0} contacts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campagnes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes email</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune campagne email liée à ce spectacle
                </p>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Objet: {campaign.subject}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Envoyés: {campaign.sent_count || 0}</span>
                            <span>Ouverts: {campaign.opened_count || 0}</span>
                            <span>Clics: {campaign.clicked_count || 0}</span>
                          </div>
                        </div>
                        <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
