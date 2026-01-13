import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Send, Search, Edit, Trash2, Loader2, Calendar, Eye, ArrowLeft, MousePointer, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EmailCampaignEditor } from '@/components/EmailCampaignEditor';
import { EmailAnalytics } from '@/components/EmailAnalytics';
import { EmailCampaignManager } from '@/components/EmailCampaignManager';
import { useContactLists } from '@/hooks/useContactLists';

interface Campaign {
  id: string;
  name: string;
  subject?: string;
  status: string;
  created_at: string;
  updated_at: string;
  content?: string;
}

export const EmailCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCampaignManager, setShowCampaignManager] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const { contactLists } = useContactLists();

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les campagnes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setShowCampaignManager(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignManager(true);
  };

  const handleSaveCampaign = async (campaignData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (selectedCampaign) {
        // Update existing campaign
        const { error } = await supabase
          .from('email_campaigns')
          .update({
            name: campaignData.name,
            subject: campaignData.subject,
            content: JSON.stringify(campaignData.blocks),
            artist_id: campaignData.artist_id || null,
            event_id: campaignData.event_id || null,
          })
          .eq('id', selectedCampaign.id);

        if (error) throw error;
        toast({
          title: "Succès",
          description: "Campagne mise à jour avec succès"
        });
      } else {
        // Create new campaign
        const { error } = await supabase
          .from('email_campaigns')
          .insert({
            name: campaignData.name,
            subject: campaignData.subject,
            status: 'draft',
            content: JSON.stringify(campaignData.blocks),
            artist_id: campaignData.artist_id || null,
            event_id: campaignData.event_id || null,
            user_id: user.id
          });

        if (error) throw error;

        // Add contact lists to campaign
        if (campaignData.contactListIds && campaignData.contactListIds.length > 0) {
          const { data: newCampaign } = await supabase
            .from('email_campaigns')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (newCampaign) {
            const campaignContactLists = campaignData.contactListIds.map((listId: string) => ({
              campaign_id: newCampaign.id,
              contact_list_id: listId
            }));

            await supabase
              .from('campaign_contact_lists')
              .insert(campaignContactLists);
          }
        }

        toast({
          title: "Succès",
          description: "Campagne créée avec succès"
        });
      }

      await fetchCampaigns();
      setShowCampaignManager(false);
      setSelectedCampaign(null);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la campagne",
        variant: "destructive"
      });
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-campaign-emails', {
        body: { campaignId }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Campagne envoyée avec succès"
      });
      await fetchCampaigns();
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de la campagne",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;

    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      await fetchCampaigns();
      toast({
        title: "Succès",
        description: "Campagne supprimée"
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la campagne",
        variant: "destructive"
      });
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (campaign.subject && campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'scheduled': return 'Programmée';
      case 'sending': return 'En cours d\'envoi';
      case 'sent': return 'Envoyée';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  if (showCampaignManager) {
    return (
      <EmailCampaignManager
        campaignId={selectedCampaign?.id}
        onBack={() => {
          setShowCampaignManager(false);
          setSelectedCampaign(null);
        }}
      />
    );
  }

  if (showEditor) {
    return (
      <EmailCampaignEditor
        campaign={selectedCampaign ? {
          id: selectedCampaign.id,
          name: selectedCampaign.name,
          subject: selectedCampaign.subject || '',
          contactListIds: [],
          blocks: selectedCampaign.content ? JSON.parse(selectedCampaign.content) : [],
          status: selectedCampaign.status as "draft" | "scheduled" | "sent",
          scheduledDate: undefined
        } : {
          id: '',
          name: '',
          subject: '',
          contactListIds: [],
          blocks: [],
          status: 'draft',
          scheduledDate: undefined
        }}
        contactLists={contactLists.map(list => ({
          id: list.id,
          name: list.name,
          contactCount: list.contactCount || 0
        }))}
        onSave={handleSaveCampaign}
        onBack={() => setShowEditor(false)}
      />
    );
  }

  if (showAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setShowAnalytics(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {selectedCampaign ? selectedCampaign.name : 'Statistiques globales'}
              </h1>
              <p className="text-muted-foreground">
                {selectedCampaign ? 'Analytics de la campagne' : 'Vue d\'ensemble de toutes vos campagnes'}
              </p>
            </div>
          </div>
        </div>
        <EmailAnalytics />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Campagnes Email</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Créez et gérez vos campagnes
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(true)} 
            className="flex-1 md:flex-initial"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Statistiques</span>
            <span className="sm:hidden">Stats</span>
          </Button>
          <Button onClick={handleCreateCampaign} className="flex-1 md:flex-initial" size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Nouvelle Campagne</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-xl md:text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Mail className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-xl md:text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'draft').length}
                </p>
              </div>
              <Edit className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Programmées</p>
                <p className="text-xl md:text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Envoyées</p>
                <p className="text-xl md:text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'sent').length}
                </p>
              </div>
              <Send className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Rechercher des campagnes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Campaigns List */}
      <div className="grid gap-4 md:gap-6">
        {filteredCampaigns.map((campaign: any) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col gap-3">
                {/* Header: Title + Badge + Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <h3 className="text-base md:text-lg font-semibold truncate">{campaign.name}</h3>
                      <Badge className={`${getStatusColor(campaign.status)} shrink-0 text-xs`}>
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </div>
                    {campaign.subject && (
                      <p className="text-muted-foreground text-sm truncate">
                        Sujet: {campaign.subject}
                      </p>
                    )}
                  </div>
                  {/* Actions buttons */}
                  <div className="flex gap-1 shrink-0">
                    {campaign.status === 'sent' && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowAnalytics(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Stats badges for sent campaigns */}
                {campaign.status === 'sent' && (
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3" />
                      {campaign.sent_count || 0} envoyés
                    </Badge>
                    {campaign.open_rate !== null && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        {campaign.open_rate?.toFixed(1) || 0}%
                      </Badge>
                    )}
                    {campaign.click_rate !== null && (
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <MousePointer className="h-3 w-3" />
                        {campaign.click_rate?.toFixed(1) || 0}%
                      </Badge>
                    )}
                    {campaign.bounced_count > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                        <TrendingDown className="h-3 w-3" />
                        {campaign.bounced_count}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Date info */}
                <p className="text-xs text-muted-foreground">
                  Créée le {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                  {campaign.sent_at && ` • Envoyée le ${new Date(campaign.sent_at).toLocaleDateString('fr-FR')}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCampaigns.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune campagne trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {campaigns.length === 0 
                  ? "Commencez par créer votre première campagne email."
                  : "Aucune campagne ne correspond à votre recherche."
                }
              </p>
              <Button onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une campagne
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};