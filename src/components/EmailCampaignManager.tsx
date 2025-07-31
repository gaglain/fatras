import React, { useState } from 'react';
import { useEmailSystem } from '@/hooks/useEmailSystem';
import { useContactLists } from '@/hooks/useContactLists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { EmailEditor } from '@/components/EmailEditor/EmailEditor';
import { EmailPreview } from '@/components/EmailEditor/EmailPreview';
import { EmailScheduler } from '@/components/EmailScheduler';
import { EmailBlock } from '@/components/EmailEditor/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Send, Save, Eye, Clock } from 'lucide-react';

interface EmailCampaignManagerProps {
  campaignId?: string;
  onBack?: () => void;
}

export const EmailCampaignManager: React.FC<EmailCampaignManagerProps> = ({
  campaignId,
  onBack
}) => {
  const { campaigns, templates, createCampaign, updateCampaign } = useEmailSystem();
  const { contactLists } = useContactLists();
  
  const existingCampaign = campaignId ? campaigns.find(c => c.id === campaignId) : null;
  
  const [campaignData, setCampaignData] = useState({
    name: existingCampaign?.name || '',
    subject: existingCampaign?.subject || '',
    content: existingCampaign?.content ? (typeof existingCampaign.content === 'string' ? JSON.parse(existingCampaign.content) : existingCampaign.content) : [],
    selectedLists: [],
    templateId: ''
  });
  
  const [activeTab, setActiveTab] = useState('design');
  const [sending, setSending] = useState(false);

  const handleSave = async () => {
    if (!campaignData.name || !campaignData.subject) {
      toast.error('Nom et sujet requis');
      return;
    }

    try {
      const campaignPayload = {
        name: campaignData.name,
        subject: campaignData.subject,
        content: JSON.stringify(campaignData.content),
        status: 'draft' as const
      };

      if (campaignId) {
        await updateCampaign(campaignId, campaignPayload);
        toast.success('Campagne mise à jour');
      } else {
        await createCampaign(campaignPayload);
        toast.success('Campagne créée');
        onBack?.();
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSchedule = async (scheduledFor: Date, autoSend: boolean) => {
    if (!campaignData.selectedLists.length) {
      toast.error('Sélectionnez au moins une liste de contacts');
      return;
    }

    try {
      let finalCampaignId = campaignId;
      
      if (!finalCampaignId) {
        const campaign = await createCampaign({
          name: campaignData.name,
          subject: campaignData.subject,
          content: JSON.stringify(campaignData.content),
          status: 'scheduled'
        });
        finalCampaignId = campaign.id;
      }

      // Add campaign-contact-list associations
      for (const listId of campaignData.selectedLists) {
        await supabase
          .from('campaign_contact_lists')
          .insert({
            campaign_id: finalCampaignId,
            contact_list_id: listId
          });
      }

      // Update campaign with schedule info
      await supabase
        .from('email_campaigns')
        .update({
          status: 'scheduled',
          scheduled_for: scheduledFor.toISOString(),
          auto_send: autoSend
        })
        .eq('id', finalCampaignId);

    } catch (error: any) {
      throw new Error('Erreur lors de la programmation: ' + error.message);
    }
  };

  const handleSendNow = async () => {
    if (!campaignData.selectedLists.length) {
      toast.error('Sélectionnez au moins une liste de contacts');
      return;
    }

    setSending(true);
    try {
      // First save the campaign
      let finalCampaignId = campaignId;
      
      if (!finalCampaignId) {
        const campaign = await createCampaign({
          name: campaignData.name,
          subject: campaignData.subject,
          content: JSON.stringify(campaignData.content),
          status: 'draft'
        });
        finalCampaignId = campaign.id;
      }

      // Add campaign-contact-list associations
      for (const listId of campaignData.selectedLists) {
        await supabase
          .from('campaign_contact_lists')
          .insert({
            campaign_id: finalCampaignId,
            contact_list_id: listId
          });
      }

      // Send campaign via edge function
      const { error } = await supabase.functions.invoke('send-campaign-emails', {
        body: { campaignId: finalCampaignId }
      });

      if (error) throw error;

      toast.success('Campagne envoyée avec succès !');
      onBack?.();
    } catch (error: any) {
      toast.error('Erreur lors de l\'envoi: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCampaignData(prev => ({
        ...prev,
        templateId,
        content: JSON.parse(template.content || '[]'),
        subject: prev.subject || template.subject
      }));
    }
  };

  const getTotalContacts = () => {
    return campaignData.selectedLists.reduce((total, listId) => {
      const list = contactLists.find(l => l.id === listId);
      return total + (list?.contactCount || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {campaignId ? 'Modifier la campagne' : 'Nouvelle campagne'}
            </h2>
            <p className="text-muted-foreground">
              {getTotalContacts()} contacts sélectionnés
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button onClick={handleSendNow} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
          <TabsTrigger value="schedule">
            <Clock className="h-4 w-4 mr-2" />
            Programmation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la campagne</Label>
                <Input
                  id="name"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Newsletter de janvier"
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Sujet de l'email</Label>
                <Input
                  id="subject"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ex: Votre newsletter mensuelle"
                />
              </div>

              {templates.length > 0 && (
                <div>
                  <Label>Template</Label>
                  <Select value={campaignData.templateId} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listes de contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactLists.map(list => (
                <div key={list.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={list.id}
                    checked={campaignData.selectedLists.includes(list.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setCampaignData(prev => ({
                          ...prev,
                          selectedLists: [...prev.selectedLists, list.id]
                        }));
                      } else {
                        setCampaignData(prev => ({
                          ...prev,
                          selectedLists: prev.selectedLists.filter(id => id !== list.id)
                        }));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={list.id} className="font-medium">
                      {list.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {list.contactCount} contacts
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <EmailEditor
            initialBlocks={campaignData.content}
            onSave={(blocks) => setCampaignData(prev => ({ ...prev, content: blocks }))}
            onPreview={() => {}}
          />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu de l'email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-muted-foreground">De: Campaign &lt;onboarding@resend.dev&gt;</p>
                  <p className="text-sm text-muted-foreground">À: contact@example.com</p>
                  <p className="font-medium">{campaignData.subject}</p>
                </div>
                <EmailPreview blocks={campaignData.content} onClose={() => {}} onSave={() => {}} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <EmailScheduler
            campaignId={campaignId || ''}
            onSchedule={handleSchedule}
            onSendNow={handleSendNow}
            currentSchedule={{
              scheduled_for: existingCampaign?.scheduled_for,
              auto_send: existingCampaign?.auto_send
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};