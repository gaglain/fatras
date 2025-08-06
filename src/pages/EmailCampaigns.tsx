import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Send, Search, Edit, Trash2, Loader2, Calendar, Eye, ArrowLeft } from 'lucide-react';
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
  type: string;
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
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
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
          .from('campaigns')
          .update({
            name: campaignData.name,
            subject: campaignData.subject,
            content: JSON.stringify(campaignData.blocks),
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
          .from('campaigns')
          .insert({
            name: campaignData.name,
            subject: campaignData.subject,
            type: 'email',
            status: 'draft',
            content: JSON.stringify(campaignData.blocks),
            user_id: user.id
          });

        if (error) throw error;

        // Add contact lists to campaign
        if (campaignData.contactListIds && campaignData.contactListIds.length > 0) {
          const { data: newCampaign } = await supabase
            .from('campaigns')
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
    } catch (error) {
      console.error('Error saving campaign:', error);
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
    } catch (error: any) {
      console.error('Error sending campaign:', error);
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
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      await fetchCampaigns();
      toast({
        title: "Succès",
        description: "Campagne supprimée"
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
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

  if (showAnalytics && selectedCampaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => setShowAnalytics(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{selectedCampaign.name}</h1>
              <p className="text-muted-foreground">Analytics de la campagne</p>
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
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campagnes Email</h1>
          <p className="text-muted-foreground mt-2">
            Créez et gérez vos campagnes de marketing par email
          </p>
        </div>
        <Button onClick={handleCreateCampaign} className="w-full lg:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouvelle Campagne</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'draft').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Programmées</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Envoyées</p>
                <p className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'sent').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-muted-foreground" />
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
      <div className="grid gap-6">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </div>
                  {campaign.subject && (
                    <p className="text-muted-foreground mb-2">
                      Sujet: {campaign.subject}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Créée le {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {campaign.status === 'sent' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowAnalytics(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {campaign.status === 'draft' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSendCampaign(campaign.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleEditCampaign(campaign)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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