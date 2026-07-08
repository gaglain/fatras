import React, { useState, useEffect } from 'react';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import { useContactLists } from '@/hooks/useContactLists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModernEmailEditor } from '@/components/EmailEditor/ModernEmailEditor';
import { EmailPreview } from '@/components/EmailEditor/EmailPreview';
import { EmailScheduler } from '@/components/EmailScheduler';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Send, Save, Eye, Clock, Loader2 } from 'lucide-react';
import { CampaignManagerSettings } from '@/components/email-campaign/CampaignManagerSettings';

interface EmailCampaignManagerProps {
  campaignId?: string;
  onBack?: () => void;
}

export const EmailCampaignManager: React.FC<EmailCampaignManagerProps> = ({ campaignId, onBack }) => {
  const { campaigns, templates, createCampaign, updateCampaign, createTemplate } = useEmailCampaigns();
  const { contactLists } = useContactLists();
  const existingCampaign = campaignId ? campaigns.find(c => c.id === campaignId) : null;

  const [campaignData, setCampaignData] = useState({
    name: '', subject: '', content: [] as any[], selectedLists: [] as string[], excludedLists: [] as string[], excludedCampaignIds: [] as string[], templateId: '', artistId: '' as string | null, eventId: '' as string | null, includeSignature: false,
  });

  useEffect(() => {
    if (existingCampaign) {
      setCampaignData(prev => ({
        ...prev, name: (existingCampaign as any).name || '', subject: (existingCampaign as any).subject || '',
        content: (existingCampaign as any).content ? (typeof (existingCampaign as any).content === 'string' ? JSON.parse((existingCampaign as any).content) : (existingCampaign as any).content) : [], templateId: ''
      }));
    }
  }, [existingCampaign?.id]);

  useEffect(() => {
    const loadLinks = async () => {
      if (!campaignId) return;
      const { data } = await supabase.from('email_campaigns').select('artist_id,event_id,include_signature,excluded_campaign_ids').eq('id', campaignId).single();
      if (data) setCampaignData(prev => ({ ...prev, artistId: data.artist_id || null, eventId: data.event_id || null, includeSignature: !!(data as any).include_signature, excludedCampaignIds: (data as any).excluded_campaign_ids || [] }));
    };
    loadLinks();
  }, [campaignId]);

  useEffect(() => {
    const loadContactLists = async () => {
      if (!campaignId) return;
      try {
        const { data, error } = await supabase.from('campaign_contact_lists').select('contact_list_id, kind').eq('campaign_id', campaignId);
        if (error) throw error;
        if (data) setCampaignData(prev => ({
          ...prev,
          selectedLists: data.filter((i: any) => (i.kind || 'include') === 'include').map((i: any) => i.contact_list_id),
          excludedLists: data.filter((i: any) => i.kind === 'exclude').map((i: any) => i.contact_list_id),
        }));
      } catch {}
    };
    loadContactLists();
  }, [campaignId]);

  const [activeTab, setActiveTab] = useState('design');
  const [sending, setSending] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Newsletter');
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmails, setTestEmails] = useState('');

  const insertCampaignLists = async (finalId: string) => {
    const rows = [
      ...campaignData.selectedLists.map(listId => ({ campaign_id: finalId, contact_list_id: listId, kind: 'include' })),
      ...(campaignData.excludedLists || []).map(listId => ({ campaign_id: finalId, contact_list_id: listId, kind: 'exclude' })),
    ];
    if (rows.length > 0) {
      const { error } = await supabase.from('campaign_contact_lists').insert(rows);
      if (error) throw error;
    }
  };

  const handleSave = async () => {
    if (!campaignData.name || !campaignData.subject) { toast.error('Nom et sujet requis'); return; }
    try {
      const basePayload: any = { name: campaignData.name, subject: campaignData.subject, content: JSON.stringify(campaignData.content), artist_id: campaignData.artistId || null, event_id: campaignData.eventId || null, include_signature: !!campaignData.includeSignature, excluded_campaign_ids: campaignData.excludedCampaignIds || [] };
      let finalId = campaignId;
      if (campaignId) {
        // Ne PAS écraser le status d'une campagne déjà envoyée/en cours/programmée
        await updateCampaign(campaignId, basePayload);
        await supabase.from('campaign_contact_lists').delete().eq('campaign_id', campaignId);
      }
      else { const campaign = await createCampaign({ ...basePayload, status: 'draft' as const }); finalId = (campaign as any).id; }
      if (finalId) await insertCampaignLists(finalId);
      toast.success(campaignId ? 'Campagne mise à jour' : 'Campagne créée');
      if (!campaignId) onBack?.();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) { toast.error('Nom du template requis'); return; }
    try {
      await createTemplate({ name: templateName.trim(), category: templateCategory, subject: campaignData.subject || 'Sans sujet', content: JSON.stringify(campaignData.content), variables: [] });
      toast.success('Template enregistré'); setTemplateName('');
    } catch { toast.error("Erreur lors de l'enregistrement du template"); }
  };

  const handleSchedule = async (scheduledFor: Date, autoSend: boolean) => {
    if (!campaignData.selectedLists.length) { toast.error('Sélectionnez au moins une liste de contacts'); return; }
    try {
      let finalId = campaignId;
      if (!finalId) { const campaign = await createCampaign({ name: campaignData.name, subject: campaignData.subject, content: JSON.stringify(campaignData.content), status: 'scheduled', artist_id: campaignData.artistId || null, event_id: campaignData.eventId || null, include_signature: !!campaignData.includeSignature } as any); finalId = (campaign as any).id; }
      else { await supabase.from('campaign_contact_lists').delete().eq('campaign_id', finalId); }
      if (finalId) await insertCampaignLists(finalId);
      await supabase.from('email_campaigns').update({ status: 'scheduled', scheduled_for: scheduledFor.toISOString(), auto_send: autoSend, excluded_campaign_ids: campaignData.excludedCampaignIds || [] }).eq('id', finalId);
    } catch (error: any) { throw new Error('Erreur lors de la programmation: ' + error.message); }
  };

  const handleSendNow = async () => {
    if (!campaignData.selectedLists.length) { toast.error('Sélectionnez au moins une liste de contacts'); return; }
    setSending(true);
    try {
      let finalId = campaignId;
      if (!finalId) { const campaign = await createCampaign({ name: campaignData.name, subject: campaignData.subject, content: JSON.stringify(campaignData.content), status: 'draft', include_signature: !!campaignData.includeSignature } as any); finalId = campaign.id; }
      else { await supabase.from('email_campaigns').update({ name: campaignData.name, subject: campaignData.subject, content: JSON.stringify(campaignData.content), status: 'draft', include_signature: !!campaignData.includeSignature }).eq('id', finalId); await supabase.from('campaign_contact_lists').delete().eq('campaign_id', finalId); }
      if (finalId) await insertCampaignLists(finalId);
      const { invokeEdgeFunction } = await import('@/lib/edgeFunctionClient');
      const result = await invokeEdgeFunction({ functionName: 'send-campaign-emails', body: { campaignId: finalId } });
      if (!result.success) throw new Error(result.error || 'Erreur envoi campagne');
      toast.success('Campagne envoyée avec succès !'); onBack?.();
    } catch (error: any) { toast.error('Erreur lors de l\'envoi: ' + error.message); }
    finally { setSending(false); }
  };

  const handleSendTest = async () => {
    if (!testEmails.trim()) { toast.error('Veuillez entrer au moins une adresse email'); return; }
    if (!campaignData.subject || campaignData.content.length === 0) { toast.error('Veuillez définir un sujet et du contenu'); return; }
    const emails = testEmails.split(',').map(e => e.trim()).filter(e => e);
    const invalidEmails = emails.filter(e => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (invalidEmails.length > 0) { toast.error(`Adresses email invalides: ${invalidEmails.join(', ')}`); return; }
    setSendingTest(true);
    try {
      const { invokeEdgeFunction } = await import('@/lib/edgeFunctionClient');
      const result = await invokeEdgeFunction<{ success: boolean; sent?: number; failed?: number }>({ functionName: 'send-test-email', body: { blocks: campaignData.content, subject: campaignData.subject, testEmails: emails } });
      if (!result.success) throw new Error(result.error || 'Erreur test');
      const data = result.data;
      if (data.success) { toast.success(`Email de test envoyé à ${data.sent} destinataire(s)`); if (data.failed > 0) toast.error(`${data.failed} envoi(s) ont échoué`); }
      else throw new Error('Échec de l\'envoi');
    } catch (error: unknown) { toast.error('Erreur lors de l\'envoi du test: ' + ((error as Error).message || 'Erreur inconnue')); }
    finally { setSendingTest(false); }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      try {
        const parsedContent = typeof template.content === 'string' ? JSON.parse(template.content || '[]') : template.content || [];
        setCampaignData(prev => ({ ...prev, templateId, content: parsedContent, subject: prev.subject || template.subject }));
      } catch { toast.error('Erreur lors du chargement du template'); }
    }
  };

  const getTotalContacts = () => campaignData.selectedLists.reduce((total, listId) => { const list = contactLists.find(l => l.id === listId); return total + (list?.contactCount || 0); }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>}
          <div>
            <h2 className="text-2xl font-bold">{campaignId ? 'Modifier la campagne' : 'Nouvelle campagne'}</h2>
            <p className="text-muted-foreground">{getTotalContacts()} contacts sélectionnés</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}><Save className="h-4 w-4 mr-2" />Sauvegarder</Button>
          <Button onClick={handleSendNow} disabled={sending}><Send className="h-4 w-4 mr-2" />{sending ? 'Envoi...' : 'Envoyer'}</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          <TabsTrigger value="schedule"><Clock className="h-4 w-4 mr-2" />Programmation</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <CampaignManagerSettings campaignData={campaignData} setCampaignData={setCampaignData} templates={templates} contactLists={contactLists} onTemplateSelect={handleTemplateSelect} />
        </TabsContent>

        <TabsContent value="design" className="h-[calc(100vh-16rem)]">
          <ModernEmailEditor initialBlocks={campaignData.content as any} onChange={(blocks) => setCampaignData(prev => ({ ...prev, content: blocks }))} />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />Aperçu de l'email</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between"><h3 className="font-semibold">Envoyer un email de test</h3><Badge variant="outline">Test</Badge></div>
                <p className="text-sm text-muted-foreground">Envoyez cet email à des adresses de test pour validation avant l'envoi final</p>
                <div className="space-y-2">
                  <Label htmlFor="test-emails">Adresses email (séparées par des virgules)</Label>
                  <Input id="test-emails" placeholder="email1@example.com, email2@example.com" value={testEmails} onChange={(e) => setTestEmails(e.target.value)} />
                  <p className="text-xs text-muted-foreground">L'email sera marqué avec le préfixe [TEST] dans le sujet</p>
                </div>
                <Button onClick={handleSendTest} disabled={sendingTest || !campaignData.subject || campaignData.content.length === 0} className="w-full">
                  {sendingTest ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi en cours...</> : <><Send className="h-4 w-4 mr-2" />Envoyer l'email de test</>}
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-white">
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-muted-foreground">De: Campaign &lt;onboarding@resend.dev&gt;</p>
                  <p className="text-sm text-muted-foreground">À: contact@example.com</p>
                  <p className="font-medium">{campaignData.subject}</p>
                </div>
                <EmailPreview blocks={campaignData.content} onClose={() => setActiveTab('design')} onSave={() => setActiveTab('design')} includeSignature={campaignData.includeSignature} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <EmailScheduler campaignId={campaignId || ''} onSchedule={handleSchedule} onSendNow={handleSendNow} currentSchedule={{ scheduled_for: existingCampaign?.scheduled_for, auto_send: existingCampaign?.auto_send }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
