import React, { useState, useEffect } from 'react';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import { useContactLists } from '@/hooks/useContactLists';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ModernEmailEditor } from '@/components/EmailEditor/ModernEmailEditor';
import { EmailPreview } from '@/components/EmailEditor/EmailPreview';
import { EmailScheduler } from '@/components/EmailScheduler';
import { EmailBlock } from '@/components/EmailEditor/types';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Send, Save, Eye, Clock, Loader2, X } from 'lucide-react';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';

interface EmailCampaignManagerProps {
  campaignId?: string;
  onBack?: () => void;
}

export const EmailCampaignManager: React.FC<EmailCampaignManagerProps> = ({
  campaignId,
  onBack
}) => {
  const { campaigns, templates, createCampaign, updateCampaign, createTemplate } = useEmailCampaigns();
  const { contactLists } = useContactLists();
  
  const existingCampaign = campaignId ? campaigns.find(c => c.id === campaignId) : null;
  
  const [campaignData, setCampaignData] = useState({
    name: '',
    subject: '',
    content: [] as any[],
    selectedLists: [] as string[],
    templateId: '',
    artistId: '' as string | null,
    eventId: '' as string | null,
  });

  // Load campaign data when existingCampaign is available
  useEffect(() => {
    if (existingCampaign) {
      setCampaignData(prev => ({
        ...prev,
        name: (existingCampaign as any).name || '',
        subject: (existingCampaign as any).subject || '',
        content: (existingCampaign as any).content ? (typeof (existingCampaign as any).content === 'string' ? JSON.parse((existingCampaign as any).content) : (existingCampaign as any).content) : [],
        templateId: ''
      }));
    }
  }, [existingCampaign?.id]);

  // Load artist/event links for existing campaign
  useEffect(() => {
    const loadLinks = async () => {
      if (!campaignId) return;
      const { data } = await supabase
        .from('email_campaigns')
        .select('artist_id,event_id')
        .eq('id', campaignId)
        .single();
      if (data) {
        setCampaignData(prev => ({ ...prev, artistId: data.artist_id || null, eventId: data.event_id || null }));
      }
    };
    loadLinks();
  }, [campaignId]);

  // Load existing contact lists for the campaign
  useEffect(() => {
    const loadContactLists = async () => {
      if (!campaignId) return;
      
      try {
        const { data, error } = await supabase
          .from('campaign_contact_lists')
          .select('contact_list_id')
          .eq('campaign_id', campaignId);
        
        if (error) throw error;
        
        if (data) {
          setCampaignData(prev => ({
            ...prev,
            selectedLists: data.map(item => item.contact_list_id)
          }));
        }
      } catch {
        // Error loading contact lists
      }
    };
    
    loadContactLists();
  }, [campaignId]);
  
  const [activeTab, setActiveTab] = useState('design');
  const [sending, setSending] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Newsletter');
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmails, setTestEmails] = useState('');

  const handleSave = async () => {
    if (!campaignData.name || !campaignData.subject) {
      toast.error('Nom et sujet requis');
      return;
    }

    try {
      const campaignPayload: any = {
        name: campaignData.name,
        subject: campaignData.subject,
        content: JSON.stringify(campaignData.content),
        status: 'draft' as const,
        artist_id: campaignData.artistId || null,
        event_id: campaignData.eventId || null,
      };

      let finalCampaignId = campaignId;

      if (campaignId) {
        await updateCampaign(campaignId, campaignPayload);
        
        // Delete existing contact list associations
        await supabase
          .from('campaign_contact_lists')
          .delete()
          .eq('campaign_id', campaignId);
      } else {
        const campaign = await createCampaign(campaignPayload);
        finalCampaignId = (campaign as any).id;
      }

      // Save contact list associations
      if (finalCampaignId && campaignData.selectedLists.length > 0) {
        const associations = campaignData.selectedLists.map(listId => ({
          campaign_id: finalCampaignId,
          contact_list_id: listId
        }));
        
        const { error: associationError } = await supabase
          .from('campaign_contact_lists')
          .insert(associations);

        if (associationError) {
          throw associationError;
        }
      }

      toast.success(campaignId ? 'Campagne mise à jour' : 'Campagne créée');
      if (!campaignId) {
        onBack?.();
      }
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Nom du template requis');
      return;
    }
    try {
      await createTemplate({
        name: templateName.trim(),
        category: templateCategory,
        subject: campaignData.subject || 'Sans sujet',
        content: JSON.stringify(campaignData.content),
        variables: []
      });
      toast.success('Template enregistré');
      setTemplateName('');
    } catch (error: any) {
      toast.error("Erreur lors de l'enregistrement du template");
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
          status: 'scheduled',
          artist_id: campaignData.artistId || null,
          event_id: campaignData.eventId || null,
        } as any);
        finalCampaignId = (campaign as any).id;
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
      } else {
        // Ensure latest content/subject are saved before sending
        await supabase
          .from('email_campaigns')
          .update({
            name: campaignData.name,
            subject: campaignData.subject,
            content: JSON.stringify(campaignData.content),
            status: 'draft'
          })
          .eq('id', finalCampaignId);

        // Clean existing associations to avoid duplicates
        await supabase
          .from('campaign_contact_lists')
          .delete()
          .eq('campaign_id', finalCampaignId);
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

  const handleSendTest = async () => {
    if (!testEmails.trim()) {
      toast.error('Veuillez entrer au moins une adresse email');
      return;
    }

    if (!campaignData.subject || campaignData.content.length === 0) {
      toast.error('Veuillez définir un sujet et du contenu');
      return;
    }

    // Validate emails
    const emails = testEmails.split(',').map(e => e.trim()).filter(e => e);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(e => !emailRegex.test(e));
    
    if (invalidEmails.length > 0) {
      toast.error(`Adresses email invalides: ${invalidEmails.join(', ')}`);
      return;
    }

    setSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          blocks: campaignData.content,
          subject: campaignData.subject,
          testEmails: emails
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Email de test envoyé à ${data.sent} destinataire(s)`);
        if (data.failed > 0) {
          toast.error(`${data.failed} envoi(s) ont échoué`);
        }
      } else {
        throw new Error('Échec de l\'envoi');
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error('Erreur lors de l\'envoi du test: ' + (err.message || 'Erreur inconnue'));
    } finally {
      setSendingTest(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      try {
        // Parse content if it's a string, otherwise use as-is
        let parsedContent;
        if (typeof template.content === 'string') {
          parsedContent = JSON.parse(template.content || '[]');
        } else {
          parsedContent = template.content || [];
        }
        
        setCampaignData(prev => ({
          ...prev,
          templateId,
          content: parsedContent,
          subject: prev.subject || template.subject
        }));
      } catch {
        toast.error('Erreur lors du chargement du template');
      }
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Artiste (optionnel)</Label>
                  <UniversalSearch
                    filterTypes={['artist']}
                    placeholder="Rechercher un artiste..."
                    triggerText="Sélectionner un artiste"
                    onSelect={(item: SearchItem) => {
                      setCampaignData(prev => ({ ...prev, artistId: item.id }));
                    }}
                  />
                  {campaignData.artistId && (
                    <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                      <span className="text-sm">Artiste sélectionné</span>
                      <Button variant="ghost" size="sm" onClick={() => setCampaignData(prev => ({ ...prev, artistId: null }))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Spectacle (optionnel)</Label>
                  <UniversalSearch
                    filterTypes={['event']}
                    placeholder="Rechercher un spectacle..."
                    triggerText="Sélectionner un spectacle"
                    onSelect={(item: SearchItem) => {
                      setCampaignData(prev => ({ ...prev, eventId: item.id }));
                    }}
                  />
                  {campaignData.eventId && (
                    <div className="mt-2 p-2 bg-muted rounded-md flex items-center justify-between">
                      <span className="text-sm">Spectacle sélectionné</span>
                      <Button variant="ghost" size="sm" onClick={() => setCampaignData(prev => ({ ...prev, eventId: null }))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
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

        <TabsContent value="design" className="h-[calc(100vh-16rem)]">
          <ModernEmailEditor
            initialBlocks={campaignData.content as any}
            onChange={(blocks) => {
              setCampaignData(prev => ({ ...prev, content: blocks }));
            }}
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
            <CardContent className="space-y-4">
              {/* Test Email Section */}
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Envoyer un email de test</h3>
                  <Badge variant="outline">Test</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Envoyez cet email à des adresses de test pour validation avant l'envoi final
                </p>
                <div className="space-y-2">
                  <Label htmlFor="test-emails">Adresses email (séparées par des virgules)</Label>
                  <Input
                    id="test-emails"
                    placeholder="email1@example.com, email2@example.com"
                    value={testEmails}
                    onChange={(e) => setTestEmails(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email sera marqué avec le préfixe [TEST] dans le sujet
                  </p>
                </div>
                <Button 
                  onClick={handleSendTest} 
                  disabled={sendingTest || !campaignData.subject || campaignData.content.length === 0}
                  className="w-full"
                >
                  {sendingTest ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer l'email de test
                    </>
                  )}
                </Button>
              </div>

              {/* Email Preview */}
              <div className="border rounded-lg p-4 bg-white">
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-muted-foreground">De: Campaign &lt;onboarding@resend.dev&gt;</p>
                  <p className="text-sm text-muted-foreground">À: contact@example.com</p>
                  <p className="font-medium">{campaignData.subject}</p>
                </div>
                <EmailPreview 
                  blocks={campaignData.content} 
                  onClose={() => setActiveTab('design')} 
                  onSave={() => setActiveTab('design')} 
                />
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