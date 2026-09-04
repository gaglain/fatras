import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mail, Send, Calendar, FileText, Edit, Inbox, Search, Star,
         Paperclip, Clock, Users, TrendingUp, Filter, Settings, RefreshCw,
         AlertCircle, CheckCircle, Zap, Layout } from 'lucide-react';
import EmailTemplates from '@/components/EmailTemplates';
import { EmailViewer } from '@/components/EmailViewer';
import { EmailAnalytics } from '@/components/EmailAnalytics';
import { EmailDiagnostic } from '@/components/EmailDiagnostic';
import { UnifiedEmailInterface } from '@/components/email/UnifiedEmailInterface';
import { EmailTemplateComposer } from '@/components/email/EmailTemplateComposer';
import { EmailTemplateManager } from '@/components/email/EmailTemplateManager';
import { SyncManager } from '@/components/SyncManager';
import { toast } from 'sonner';
import { useEmailSender } from '@/hooks/useEmailSender';
import { useContacts } from '@/hooks/useContacts';
import { useSearchParams } from 'react-router-dom';
import { sampleEmails, emailTemplates, scheduledEmails, LocalEmail, LocalEmailTemplate } from './email/emailData';
import { EmailTemplateSection } from './email/EmailTemplateSection';
import { EmailInboxView, EmailSenderView, EmailAnalyticsView, EmailUnifiedView } from './email/EmailSubViews';

export const Email: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { contacts } = useContacts();
  const [emails, setEmails] = useState<LocalEmail[]>(sampleEmails);
  const [selectedEmail, setSelectedEmail] = useState<LocalEmail | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEmailSender, setShowEmailSender] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showUnifiedEmails, setShowUnifiedEmails] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedTemplate, setSelectedTemplate] = useState<LocalEmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { sendEmail, sending } = useEmailSender();

  const [composeData, setComposeData] = useState({
    to: '', cc: '', subject: '', content: '', selectedTemplateId: ''
  });
  const [validationErrors, setValidationErrors] = useState<{ to?: string; subject?: string; content?: string }>({});

  useEffect(() => {
    const shouldCompose = searchParams.get('compose');
    const contactId = searchParams.get('contactId');
    const subject = searchParams.get('subject');
    if (shouldCompose === 'true' && contactId) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        setComposeData({ to: contact.email || '', cc: '', subject: subject ? decodeURIComponent(subject) : '', content: '', selectedTemplateId: '' });
        setShowCompose(true);
        setShowTemplates(true);
      }
    }
  }, [searchParams, contacts]);

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || (filterType === 'unread' && !email.isRead) || (filterType === 'starred' && email.isStarred);
    return matchesSearch && matchesFilter;
  });

  const handleEmailClick = (email: LocalEmail) => {
    if (!email.isRead) setEmails(emails.map(e => e.id === email.id ? { ...e, isRead: true } : e));
    setSelectedEmail(email);
  };

  const handleReply = () => { setSelectedEmail(null); setShowCompose(true); };
  const handleForward = () => { setSelectedEmail(null); setShowCompose(true); };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setComposeData(prev => ({ ...prev, subject: template.subject, content: template.content, selectedTemplateId: templateId }));
      toast.success(`Modèle "${template.name}" appliqué`);
    }
  };

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    if (!composeData.to.trim()) errors.to = "L'adresse email du destinataire est requise";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(composeData.to.trim())) errors.to = "Format d'email invalide";
    if (!composeData.subject.trim()) errors.subject = "L'objet de l'email est requis";
    if (!composeData.content.trim()) errors.content = "Le contenu de l'email est requis";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendEmail = async () => {
    if (!validateForm()) { toast.error('Veuillez corriger les erreurs dans le formulaire'); return; }
    try {
      await sendEmail({ to: [composeData.to], subject: composeData.subject, html: `<div style="font-family: Arial, sans-serif;">${composeData.content.replace(/\n/g, '<br>')}</div>`, includeSignature: true });
      setEmails(prev => [{ id: Date.now().toString(), from: 'user@showmanager.com', to: composeData.to, subject: composeData.subject, content: composeData.content, date: new Date().toISOString(), isRead: true, isStarred: false }, ...prev]);
      setComposeData({ to: '', cc: '', subject: '', content: '', selectedTemplateId: '' });
      setValidationErrors({});
      setShowCompose(false);
      toast.success('✅ Email envoyé avec succès !');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('RESEND_API_KEY')) toast.error('⚠️ Configuration email manquante.');
        else if (error.message.includes('rate limit')) toast.error('⏰ Limite d\'envoi atteinte.');
        else toast.error(`❌ Erreur d'envoi: ${error.message}`);
      } else toast.error('❌ Erreur inconnue lors de l\'envoi');
    }
  };

  const handleTemplateFromLibrary = (template: any) => {
    setComposeData(prev => ({ ...prev, subject: template.subject, content: template.content }));
    setShowTemplates(false); setShowCompose(true);
    toast.success(`Modèle "${template.name}" appliqué`);
  };

  // Sub-view routing
  if (showTemplates) return <EmailTemplates onSelectTemplate={handleTemplateFromLibrary} onBack={() => setShowTemplates(false)} />;
  if (showUnifiedEmails) return <EmailUnifiedView onBack={() => setShowUnifiedEmails(false)} />;
  if (showInbox) return <EmailInboxView onBack={() => setShowInbox(false)} />;
  if (showEmailSender) return <EmailSenderView onBack={() => setShowEmailSender(false)} />;
  if (showAnalytics) return <EmailAnalyticsView onBack={() => setShowAnalytics(false)} />;
  if (selectedEmail) return <div className="h-full"><EmailViewer email={selectedEmail} onClose={() => setSelectedEmail(null)} onReply={handleReply} onForward={handleForward} /></div>;

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 max-w-7xl mx-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary"><Mail className="h-6 w-6" /></div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Centre Email Pro</h1>
                <p className="text-muted-foreground text-sm">Gestion avancée des communications email</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setShowEmailSender(true)} className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto">
              <Send className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Email Rapide</span><span className="sm:hidden">Rapide</span>
            </Button>
            <Button variant="default" size="sm" onClick={() => setShowUnifiedEmails(true)} className="w-full sm:w-auto">
              <Mail className="h-4 w-4 mr-2" />Mail
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowInbox(true)} className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto">
              <Inbox className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Boîte de réception</span><span className="sm:hidden">Boîte</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)} className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto">
              <TrendingUp className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Analytics</span><span className="sm:hidden">Stats</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowScheduled(!showScheduled)} className="border-primary/20 hover:border-primary/40 hover:bg-primary/5 w-full sm:w-auto">
              <Clock className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Programmés ({scheduledEmails.length})</span><span className="sm:hidden">Prog ({scheduledEmails.length})</span>
            </Button>
            <Dialog open={showCompose} onOpenChange={setShowCompose}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />Composer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                      <Edit className="h-5 w-5 text-primary" />Composer un nouveau message
                    </DialogTitle>
                  </DialogHeader>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Destinataire *</label>
                      <Input placeholder="email@exemple.com" value={composeData.to}
                        onChange={(e) => { setComposeData(prev => ({ ...prev, to: e.target.value })); if (validationErrors.to) setValidationErrors(prev => ({ ...prev, to: undefined })); }}
                        className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${validationErrors.to ? 'border-destructive' : ''}`} />
                      {validationErrors.to && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{validationErrors.to}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">CC (optionnel)</label>
                      <Input placeholder="cc@exemple.com" value={composeData.cc}
                        onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))} className="transition-all duration-200 focus:ring-2 focus:ring-primary/20" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Objet *</label>
                    <Input placeholder="Objet de votre message" value={composeData.subject}
                      onChange={(e) => { setComposeData(prev => ({ ...prev, subject: e.target.value })); if (validationErrors.subject) setValidationErrors(prev => ({ ...prev, subject: undefined })); }}
                      className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${validationErrors.subject ? 'border-destructive' : ''}`} />
                    {validationErrors.subject && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{validationErrors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Template (optionnel)</label>
                    <Select value={composeData.selectedTemplateId} onValueChange={handleTemplateSelect}>
                      <SelectTrigger><SelectValue placeholder="Choisir un modèle..." /></SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map(t => <SelectItem key={t.id} value={t.id}><div className="flex items-center gap-2"><FileText className="h-4 w-4" />{t.name}</div></SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Message *</label>
                    <RichTextEditor placeholder="Rédigez votre message..." value={composeData.content}
                      onChange={(content) => { setComposeData(prev => ({ ...prev, content })); if (validationErrors.content) setValidationErrors(prev => ({ ...prev, content: undefined })); }}
                      className={`transition-all duration-200 ${validationErrors.content ? 'border-destructive' : ''}`} />
                    {validationErrors.content && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{validationErrors.content}</p>}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm"><Paperclip className="h-4 w-4 mr-2" />Joindre</Button>
                      <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Options</Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowCompose(false)}>Annuler</Button>
                      <Button onClick={handleSendEmail} disabled={sending} className="bg-gradient-to-r from-primary to-primary/80">
                        {sending ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Envoi...</> : <><Send className="h-4 w-4 mr-2" />Envoyer</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-6 mb-6">
            <TabsTrigger value="inbox"><Inbox className="h-4 w-4 mr-2" />Boîte</TabsTrigger>
            <TabsTrigger value="send"><Send className="h-4 w-4 mr-2" />Envoyer</TabsTrigger>
            <TabsTrigger value="sync"><RefreshCw className="h-4 w-4 mr-2" />Sync</TabsTrigger>
            <TabsTrigger value="analytics"><TrendingUp className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="diagnostic"><AlertCircle className="h-4 w-4 mr-2" />Diagnostic</TabsTrigger>
            <TabsTrigger value="templates"><FileText className="h-4 w-4 mr-2" />Modèles</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary"><Inbox className="h-5 w-5" /></div>
                        <div>
                          <span className="text-lg font-semibold">Boîte de réception</span>
                          <p className="text-sm text-muted-foreground font-normal">{filteredEmails.length} message{filteredEmails.length > 1 ? 's' : ''}</p>
                        </div>
                      </CardTitle>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-80 border-primary/20" />
                        </div>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="w-40 border-primary/20"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filtre" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all"><div className="flex items-center gap-2"><Inbox className="h-4 w-4" />Tous</div></SelectItem>
                            <SelectItem value="unread"><div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Non lus</div></SelectItem>
                            <SelectItem value="starred"><div className="flex items-center gap-2"><Star className="h-4 w-4" />Favoris</div></SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                      <div className="divide-y divide-border/50">
                        <div className="p-4"><UnifiedEmailInterface /></div>
                        {filteredEmails.length === 0 && (
                          <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center"><Search className="h-8 w-8 text-muted-foreground" /></div>
                            <h3 className="font-medium text-foreground mb-2">Aucun email trouvé</h3>
                            <p className="text-sm text-muted-foreground">Essayez de modifier vos critères de recherche</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" />Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <Button onClick={() => setShowCompose(true)} className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-md"><Edit className="h-4 w-4 mr-2" />Composer</Button>
                    <Button variant="outline" className="w-full border-primary/20"><Calendar className="h-4 w-4 mr-2" />Programmer</Button>
                    <Button variant="outline" className="w-full border-primary/20"><Users className="h-4 w-4 mr-2" />Listes diffusion</Button>
                    <Button variant="outline" className="w-full border-primary/20" onClick={() => setShowTemplates(true)}><Layout className="h-4 w-4 mr-2" />Templates</Button>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/30 text-center"><div className="text-2xl font-bold text-foreground">{emails.length}</div><div className="text-xs text-muted-foreground">Total</div></div>
                      <div className="p-3 rounded-lg bg-primary/10 text-center"><div className="text-2xl font-bold text-primary">{emails.filter(e => !e.isRead).length}</div><div className="text-xs text-muted-foreground">Non lus</div></div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /><span className="text-sm font-medium">Favoris</span></div><Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{emails.filter(e => e.isStarred).length}</Badge></div>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /><span className="text-sm font-medium">Programmés</span></div><Badge variant="secondary" className="bg-blue-100 text-blue-800">{scheduledEmails.length}</Badge></div>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm font-medium">Envoyés</span></div><Badge variant="secondary" className="bg-green-100 text-green-800">12</Badge></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="send"><EmailTemplateComposer /></TabsContent>
          <TabsContent value="sync"><SyncManager /></TabsContent>
          <TabsContent value="analytics"><EmailAnalytics /></TabsContent>
          <TabsContent value="diagnostic"><EmailDiagnostic /></TabsContent>
          <TabsContent value="templates"><EmailTemplateManager /></TabsContent>
        </Tabs>
      </div>

      {/* Scheduled emails panel */}
      {showScheduled && (
        <Card className="max-w-7xl mx-auto mx-6">
          <CardHeader><CardTitle>Emails Programmés</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledEmails.map(email => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{email.subject}</h4>
                    <p className="text-sm text-muted-foreground">À: {email.to}</p>
                    <p className="text-sm text-muted-foreground">Programmé pour: {new Date(email.scheduledFor).toLocaleString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={email.status === 'scheduled' ? 'default' : 'secondary'}>{email.status === 'scheduled' ? 'Programmé' : email.status === 'sent' ? 'Envoyé' : 'Échec'}</Badge>
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="outline" size="sm">Annuler</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template section */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <EmailTemplateSection
          templates={emailTemplates}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onEditTemplate={(t) => { setSelectedTemplate(t); setShowTemplateEditor(true); }}
          onNewTemplate={() => setShowTemplateEditor(true)}
        />
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader><CardTitle>{selectedTemplate ? 'Modifier le Modèle' : 'Créer un Nouveau Modèle'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom du modèle" defaultValue={selectedTemplate?.name} />
                <Select defaultValue={selectedTemplate?.category}>
                  <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                  <SelectContent>
                    {['Contrat', 'Réservation', 'Technique', 'Commercial', 'Finance'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Objet de l'email" defaultValue={selectedTemplate?.subject} />
              <textarea placeholder="Contenu du modèle..." className="w-full p-3 border rounded-md" rows={12} defaultValue={selectedTemplate?.content} />
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Variables disponibles:</h4>
                <div className="flex flex-wrap gap-1 text-xs">
                  {['contact_name', 'artist_name', 'event_name', 'event_date', 'venue_name', 'contract_amount', 'user_name', 'company_name'].map(v => (
                    <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowTemplateEditor(false)} variant="outline" className="flex-1">Annuler</Button>
                <Button className="flex-1">{selectedTemplate ? 'Mettre à Jour' : 'Créer'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
