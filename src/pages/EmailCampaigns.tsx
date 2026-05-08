import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Mail, Send, Search, Edit, Calendar, Eye, ArrowLeft, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EmailCampaignEditor } from '@/components/EmailCampaignEditor';
import { EmailAnalytics } from '@/components/EmailAnalytics';
import { EmailCampaignManager } from '@/components/EmailCampaignManager';
import { CampaignContactStats } from '@/components/email/CampaignContactStats';
import { EmailEngagementDashboard } from '@/components/email/EmailEngagementDashboard';
import { CampaignListCard } from '@/pages/email-campaigns/CampaignListCard';
import { useContactLists } from '@/hooks/useContactLists';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { PageLoader } from '@/components/ui/page-loader';

interface Campaign {
  id: string;
  name: string;
  subject?: string;
  status: string;
  created_at: string;
  updated_at: string;
  content?: string;
  include_signature?: boolean;
}

export const EmailCampaigns: React.FC = () => {
  const confirm = useConfirm();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCampaignManager, setShowCampaignManager] = useState(false);
  const [showContactStats, setShowContactStats] = useState(false);
  const [showEngagementDashboard, setShowEngagementDashboard] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const { contactLists } = useContactLists();

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase.from('email_campaigns').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns(data || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les campagnes", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreateCampaign = () => { setSelectedCampaign(null); setShowCampaignManager(true); };
  const handleEditCampaign = (campaign: Campaign) => { setSelectedCampaign(campaign); setShowCampaignManager(true); };

  const handleSaveCampaign = async (campaignData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      if (selectedCampaign) {
        const { error } = await supabase.from('email_campaigns').update({ name: campaignData.name, subject: campaignData.subject, content: JSON.stringify(campaignData.blocks), artist_id: campaignData.artist_id || null, event_id: campaignData.event_id || null, include_signature: !!campaignData.include_signature }).eq('id', selectedCampaign.id);
        if (error) throw error;
        toast({ title: "Succès", description: "Campagne mise à jour avec succès" });
      } else {
        const { error } = await supabase.from('email_campaigns').insert({ name: campaignData.name, subject: campaignData.subject, status: 'draft', content: JSON.stringify(campaignData.blocks), artist_id: campaignData.artist_id || null, event_id: campaignData.event_id || null, include_signature: !!campaignData.include_signature, user_id: user.id });
        if (error) throw error;
        if (campaignData.contactListIds?.length > 0) {
          const { data: newCampaign } = await supabase.from('email_campaigns').select('id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
          if (newCampaign) {
            await supabase.from('campaign_contact_lists').insert(campaignData.contactListIds.map((listId: string) => ({ campaign_id: newCampaign.id, contact_list_id: listId })));
          }
        }
        toast({ title: "Succès", description: "Campagne créée avec succès" });
      }
      await fetchCampaigns();
      setShowCampaignManager(false);
      setSelectedCampaign(null);
    } catch { toast({ title: "Erreur", description: "Impossible de sauvegarder la campagne", variant: "destructive" }); }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const { invokeEdgeFunction } = await import('@/lib/edgeFunctionClient');
      const result = await invokeEdgeFunction({ functionName: 'send-campaign-emails', body: { campaignId } });
      if (!result.success) throw new Error(result.error || 'Erreur envoi');
      toast({ title: "Succès", description: "Campagne envoyée avec succès" });
      await fetchCampaigns();
    } catch { toast({ title: "Erreur", description: "Erreur lors de l'envoi de la campagne", variant: "destructive" }); }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const ok = await confirm({ title: 'Supprimer la campagne', description: 'Cette action est irréversible. Voulez-vous vraiment supprimer cette campagne ?', confirmText: 'Supprimer', variant: 'destructive' });
    if (!ok) return;
    try {
      const { error } = await supabase.from('email_campaigns').delete().eq('id', campaignId);
      if (error) throw error;
      await fetchCampaigns();
      toast({ title: "Succès", description: "Campagne supprimée" });
    } catch { toast({ title: "Erreur", description: "Impossible de supprimer la campagne", variant: "destructive" }); }
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data: fullCampaign, error: fetchError } = await supabase.from('email_campaigns').select('*').eq('id', campaign.id).single();
      if (fetchError || !fullCampaign) throw fetchError;
      const { data: newCampaign, error: insertError } = await supabase.from('email_campaigns').insert({ user_id: user.id, name: `${fullCampaign.name} (copie)`, subject: fullCampaign.subject, content: fullCampaign.content, status: 'draft', artist_id: fullCampaign.artist_id, event_id: fullCampaign.event_id, template_id: fullCampaign.template_id, include_signature: !!fullCampaign.include_signature }).select('id').single();
      if (insertError) throw insertError;
      if (newCampaign) {
        const { data: lists } = await supabase.from('campaign_contact_lists').select('contact_list_id').eq('campaign_id', campaign.id);
        if (lists?.length) await supabase.from('campaign_contact_lists').insert(lists.map(l => ({ campaign_id: newCampaign.id, contact_list_id: l.contact_list_id })));
      }
      toast({ title: "Succès", description: "Campagne dupliquée avec succès" });
      await fetchCampaigns();
    } catch { toast({ title: "Erreur", description: "Impossible de dupliquer la campagne", variant: "destructive" }); }
  };

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.subject && c.subject.toLowerCase().includes(searchTerm.toLowerCase())));

  if (showCampaignManager) return <EmailCampaignManager campaignId={selectedCampaign?.id} onBack={() => { setShowCampaignManager(false); setSelectedCampaign(null); }} />;
  if (showEditor) return <EmailCampaignEditor campaign={selectedCampaign ? { id: selectedCampaign.id, name: selectedCampaign.name, subject: selectedCampaign.subject || '', contactListIds: [], blocks: selectedCampaign.content ? JSON.parse(selectedCampaign.content) : [], status: selectedCampaign.status as any, scheduledDate: undefined, include_signature: selectedCampaign.include_signature ?? false } : { id: '', name: '', subject: '', contactListIds: [], blocks: [], status: 'draft', scheduledDate: undefined, include_signature: false }} contactLists={contactLists.map(l => ({ id: l.id, name: l.name, contactCount: l.contactCount || 0 }))} onSave={handleSaveCampaign} onBack={() => setShowEditor(false)} />;
  if (showEngagementDashboard) return (<div className="space-y-6"><div className="flex items-center space-x-4"><Button variant="ghost" onClick={() => setShowEngagementDashboard(false)}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button><div><h1 className="text-3xl font-bold">Engagement des contacts</h1><p className="text-muted-foreground">Score de fiabilité et classement par engagement email</p></div></div><EmailEngagementDashboard /></div>);
  if (showContactStats && selectedCampaign) return (<div className="space-y-6"><div className="flex items-center space-x-4"><Button variant="ghost" onClick={() => { setShowContactStats(false); setSelectedCampaign(null); }}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button><div><h1 className="text-3xl font-bold">{selectedCampaign.name}</h1><p className="text-muted-foreground">Statistiques par contact</p></div></div><CampaignContactStats campaignId={selectedCampaign.id} campaignName={selectedCampaign.name} /></div>);
  if (showAnalytics) return (<div className="space-y-6"><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><Button variant="ghost" onClick={() => setShowAnalytics(false)}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button><div><h1 className="text-3xl font-bold">{selectedCampaign ? selectedCampaign.name : 'Statistiques globales'}</h1><p className="text-muted-foreground">{selectedCampaign ? 'Analytics de la campagne' : 'Vue d\'ensemble de toutes vos campagnes'}</p></div></div></div><EmailAnalytics /></div>);
  if (loading) return <PageLoader message="Chargement des campagnes..." />;

  return (
    <div className="space-y-4 md:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold">Campagnes Email</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Créez et gérez vos campagnes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowEngagementDashboard(true)} className="flex-1 md:flex-initial" size="sm"><BarChart3 className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Engagement Contacts</span><span className="sm:hidden">Engagement</span></Button>
          <Button variant="outline" onClick={() => setShowAnalytics(true)} className="flex-1 md:flex-initial" size="sm"><Eye className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Statistiques</span><span className="sm:hidden">Stats</span></Button>
          <Button onClick={handleCreateCampaign} className="flex-1 md:flex-initial" size="sm"><Plus className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Nouvelle Campagne</span><span className="sm:hidden">Nouvelle</span></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Total', value: campaigns.length, icon: Mail },
          { label: 'Brouillons', value: campaigns.filter(c => c.status === 'draft').length, icon: Edit },
          { label: 'Programmées', value: campaigns.filter(c => c.status === 'scheduled').length, icon: Calendar },
          { label: 'Envoyées', value: campaigns.filter(c => c.status === 'sent').length, icon: Send },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3 md:p-6"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="text-xs md:text-sm font-medium text-muted-foreground">{s.label}</p><p className="text-xl md:text-2xl font-bold">{s.value}</p></div><s.icon className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground shrink-0" /></div></CardContent></Card>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Rechercher des campagnes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="grid gap-4 md:gap-6">
        {filteredCampaigns.map((campaign: any) => (
          <CampaignListCard key={campaign.id} campaign={campaign} onEdit={handleEditCampaign} onDelete={handleDeleteCampaign} onDuplicate={handleDuplicateCampaign}
            onViewContactStats={(c) => { setSelectedCampaign(c); setShowContactStats(true); }}
            onViewAnalytics={(c) => { setSelectedCampaign(c); setShowAnalytics(true); }} />
        ))}
        {filteredCampaigns.length === 0 && (
          <Card><CardContent className="p-6 text-center"><Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">Aucune campagne trouvée</h3><p className="text-muted-foreground mb-4">{campaigns.length === 0 ? "Commencez par créer votre première campagne email." : "Aucune campagne ne correspond à votre recherche."}</p><Button onClick={handleCreateCampaign}><Plus className="h-4 w-4 mr-2" />Créer une campagne</Button></CardContent></Card>
        )}
      </div>
    </div>
  );
};
