import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Mail, Send, Calendar, Phone, FileText, Edit, Trash2, Inbox, Search, Star, Archive, 
         Paperclip, Reply, Forward, MoreHorizontal, Clock, Users, TrendingUp, Filter,
         Settings, RefreshCw, AlertCircle, CheckCircle, Zap, Layout } from 'lucide-react';
import EmailTemplates from '@/components/EmailTemplates';
import { EmailViewer } from '@/components/EmailViewer';
import { toast } from 'sonner';
import { useEmailSender } from '@/hooks/useEmailSender';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  content: string;
  variables: string[];
}

interface ScheduledEmail {
  id: string;
  to: string;
  subject: string;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'failed';
}

const sampleEmails: Email[] = [
  {
    id: '1',
    from: 'john.smith@venue.com',
    to: 'user@showmanager.com',
    subject: 'Confirmation de la réservation - Salle de Concert',
    content: 'Bonjour,\n\nNous confirmons votre réservation pour le 15 juillet 2024.\n\nVeuillez trouver les détails ci-dessous:\n- Date: 15 juillet 2024\n- Heure: 20h00\n- Lieu: Salle principale\n- Capacité: 500 personnes\n\nCordialement,\nJohn Smith\nGestionnaire de venue',
    date: '2024-06-13T10:30:00',
    isRead: false,
    isStarred: true,
    attachments: ['contract_final.pdf', 'technical_rider.pdf']
  },
  {
    id: '2',
    from: 'sarah@festivalprods.com',
    to: 'user@showmanager.com',
    subject: 'Demande de fiche technique - Thunder Road',
    content: 'Bonjour,\n\nPourriez-vous nous envoyer la fiche technique mise à jour pour Thunder Road?\n\nNous devons finaliser le setup pour le festival.\n\nMerci,\nSarah',
    date: '2024-06-12T14:15:00',
    isRead: true,
    isStarred: false
  },
  {
    id: '3',
    from: 'mike@production.com',
    to: 'user@showmanager.com',
    subject: 'Nouvelle date disponible - The Midnight Express',
    content: 'Salut,\n\nNous avons une nouvelle date qui s\'est libérée le 20 août.\n\nSeriez-vous intéressés pour The Midnight Express?\n\nFaites-moi savoir rapidement.\n\nMike',
    date: '2024-06-11T09:45:00',
    isRead: true,
    isStarred: false
  }
];

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Suivi de Contrat',
    subject: 'Suivi du contrat pour {{event_name}}',
    category: 'Contrat',
    content: 'Bonjour {{contact_name}},\n\nJ\'espère que ce email vous trouve en bonne santé. Je souhaitais faire le suivi du contrat que nous avons envoyé pour {{event_name}} le {{event_date}}.\n\nSi vous avez des questions, n\'hésitez pas à me contacter.\n\nCordialement,\n{{user_name}}',
    variables: ['contact_name', 'event_name', 'event_date', 'user_name']
  },
  {
    id: '2',
    name: 'Confirmation de Spectacle',
    subject: 'Confirmation de spectacle - {{artist_name}} à {{venue_name}}',
    category: 'Réservation',
    content: 'Cher {{contact_name}},\n\nNous sommes heureux de confirmer la réservation pour {{artist_name}} à {{venue_name}} le {{event_date}}.\n\nDétails de l\'événement :\n- Artiste : {{artist_name}}\n- Lieu : {{venue_name}}\n- Date : {{event_date}}\n- Heure : {{event_time}}\n- Montant : {{contract_amount}}\n\nNous vous enverrons la fiche technique sous peu.\n\nCordialement,\n{{user_name}}',
    variables: ['contact_name', 'artist_name', 'venue_name', 'event_date', 'event_time', 'contract_amount', 'user_name']
  },
  {
    id: '3',
    name: 'Exigences Techniques',
    subject: 'Fiche technique et exigences de scène - {{artist_name}}',
    category: 'Technique',
    content: 'Bonjour {{contact_name}},\n\nVeuillez trouver en pièce jointe la fiche technique et les exigences de scène pour {{artist_name}}.\n\nCette fiche contient :\n- Plan de scène\n- Liste du matériel requis\n- Exigences d\'éclairage\n- Exigences sonores\n- Besoins en personnel technique\n\nMerci de confirmer que ces exigences peuvent être respectées.\n\nCordialement,\n{{user_name}}',
    variables: ['contact_name', 'artist_name', 'user_name']
  },
  {
    id: '4',
    name: 'Demande de Renseignements',
    subject: 'Demande de renseignements - {{artist_name}}',
    category: 'Commercial',
    content: 'Bonjour {{contact_name}},\n\nNous organisons un événement le {{event_date}} à {{venue_name}} et aimerions avoir des informations concernant {{artist_name}}.\n\nPourriez-vous nous envoyer :\n- Vos tarifs pour cette date\n- Les disponibilités de l\'artiste\n- La fiche technique\n- Les conditions particulières\n\nNous attendons votre retour avec impatience.\n\nMerci d\'avance,\n{{user_name}}\n{{company_name}}',
    variables: ['contact_name', 'event_date', 'venue_name', 'artist_name', 'user_name', 'company_name']
  },
  {
    id: '5',
    name: 'Rappel de Paiement',
    subject: 'Rappel de paiement - {{event_name}}',
    category: 'Finance',
    content: 'Bonjour {{contact_name}},\n\nNous espérons que tout se passe bien pour vous.\n\nNous vous contactons concernant le paiement de {{contract_amount}} pour l\'événement {{event_name}} du {{event_date}}.\n\nSelon nos records, ce paiement était dû le {{due_date}}.\n\nPourriez-vous nous confirmer la date de règlement ?\n\nMerci pour votre attention.\n\nCordialement,\n{{user_name}}',
    variables: ['contact_name', 'contract_amount', 'event_name', 'event_date', 'due_date', 'user_name']
  }
];

const scheduledEmails: ScheduledEmail[] = [
  {
    id: '1',
    to: 'john.smith@venue.com',
    subject: 'Suivi de contrat pour Festival d\'Été',
    scheduledFor: '2024-06-15T10:00:00',
    status: 'scheduled'
  },
  {
    id: '2',
    to: 'sarah@festivalprods.com',
    subject: 'Exigences techniques pour Thunder Road',
    scheduledFor: '2024-06-16T14:30:00',
    status: 'scheduled'
  }
];

export const Email: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>(sampleEmails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { sendEmail, sending } = useEmailSender();
  
  // Nouveaux états pour la composition d'email
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    subject: '',
    content: '',
    selectedTemplateId: ''
  });
  
  // État pour la gestion d'erreurs
  const [validationErrors, setValidationErrors] = useState<{
    to?: string;
    subject?: string;
    content?: string;
  }>({});

  const categories = ['all', 'Contrat', 'Réservation', 'Technique', 'Commercial', 'Finance'];

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !email.isRead) ||
                         (filterType === 'starred' && email.isStarred);

    return matchesSearch && matchesFilter;
  });

  const filteredTemplates = selectedCategory === 'all' 
    ? emailTemplates 
    : emailTemplates.filter(template => template.category === selectedCategory);

  const handleEmailClick = (email: Email) => {
    if (!email.isRead) {
      setEmails(emails.map(e => e.id === email.id ? { ...e, isRead: true } : e));
    }
    setSelectedEmail(email);
  };

  const handleReply = (email: Email) => {
    setSelectedEmail(null);
    setShowCompose(true);
    // Pre-fill compose form with reply data
  };

  const handleForward = (email: Email) => {
    setSelectedEmail(null);
    setShowCompose(true);
    // Pre-fill compose form with forward data
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setComposeData(prev => ({
        ...prev,
        subject: template.subject,
        content: template.content,
        selectedTemplateId: templateId
      }));
      toast.success(`Modèle "${template.name}" appliqué`);
    }
  };

  const validateForm = () => {
    const errors: typeof validationErrors = {};
    
    if (!composeData.to.trim()) {
      errors.to = 'L\'adresse email du destinataire est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(composeData.to.trim())) {
      errors.to = 'Format d\'email invalide';
    }
    
    if (!composeData.subject.trim()) {
      errors.subject = 'L\'objet de l\'email est requis';
    }
    
    if (!composeData.content.trim()) {
      errors.content = 'Le contenu de l\'email est requis';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendEmail = async () => {
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      console.log('Tentative d\'envoi d\'email via handleSendEmail...', { 
        to: composeData.to, 
        subject: composeData.subject, 
        content: composeData.content 
      });
      
      // Utiliser le vrai service d'envoi d'emails
      await sendEmail({
        to: [composeData.to],
        subject: composeData.subject,
        html: `<div style="font-family: Arial, sans-serif;">${composeData.content.replace(/\n/g, '<br>')}</div>`
      });
      
      // Ajouter l'email envoyé à la liste
      const newEmail: Email = {
        id: Date.now().toString(),
        from: 'user@showmanager.com',
        to: composeData.to,
        subject: composeData.subject,
        content: composeData.content,
        date: new Date().toISOString(),
        isRead: true,
        isStarred: false
      };

      setEmails(prev => [newEmail, ...prev]);
      
      // Réinitialiser le formulaire et les erreurs
      setComposeData({
        to: '',
        cc: '',
        subject: '',
        content: '',
        selectedTemplateId: ''
      });
      setValidationErrors({});
      
      setShowCompose(false);
      toast.success('✅ Email envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      
      // Gestion d'erreurs améliorée
      if (error instanceof Error) {
        if (error.message.includes('RESEND_API_KEY')) {
          toast.error('⚠️ Configuration email manquante. Contactez l\'administrateur.');
        } else if (error.message.includes('rate limit')) {
          toast.error('⏰ Limite d\'envoi atteinte. Réessayez plus tard.');
        } else if (error.message.includes('invalid')) {
          toast.error('❌ Données d\'email invalides. Vérifiez le format.');
        } else {
          toast.error(`❌ Erreur d'envoi: ${error.message}`);
        }
      } else {
        toast.error('❌ Erreur inconnue lors de l\'envoi');
      }
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleTemplateFromLibrary = (template: any) => {
    setComposeData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content
    }));
    setShowTemplates(false);
    setShowCompose(true);
    toast.success(`Template "${template.name}" appliqué`);
  };

  if (showTemplates) {
    return (
      <EmailTemplates
        onSelectTemplate={handleTemplateFromLibrary}
        onBack={() => setShowTemplates(false)}
      />
    );
  }

  if (selectedEmail) {
    return (
      <div className="h-full">
        <EmailViewer
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onReply={handleReply}
          onForward={handleForward}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header with glass effect */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Centre Email Pro
                </h1>
                <p className="text-muted-foreground text-sm">
                  Gestion avancée des communications email
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowScheduled(!showScheduled)} 
                    className="border-primary/20 hover:border-primary/40 hover:bg-primary/5">
              <Clock className="h-4 w-4 mr-2" />
              Programmés ({scheduledEmails.length})
            </Button>
            
            <Dialog open={showCompose} onOpenChange={setShowCompose}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 
                                 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Composer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 border-b">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                      <Edit className="h-5 w-5 text-primary" />
                      Composer un nouveau message
                    </DialogTitle>
                  </DialogHeader>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Enhanced Compose Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-sm font-medium text-muted-foreground">Destinataire *</label>
                       <Input 
                         placeholder="email@exemple.com"
                         value={composeData.to}
                         onChange={(e) => {
                           setComposeData(prev => ({ ...prev, to: e.target.value }));
                           if (validationErrors.to) {
                             setValidationErrors(prev => ({ ...prev, to: undefined }));
                           }
                         }}
                         className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 
                           ${validationErrors.to ? 'border-destructive focus:ring-destructive/20' : ''}`}
                       />
                       {validationErrors.to && (
                         <p className="text-xs text-destructive flex items-center gap-1">
                           <AlertCircle className="h-3 w-3" />
                           {validationErrors.to}
                         </p>
                       )}
                     </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">CC (optionnel)</label>
                      <Input 
                        placeholder="cc@exemple.com"
                        value={composeData.cc}
                        onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-muted-foreground">Objet *</label>
                     <Input 
                       placeholder="Objet de votre message"
                       value={composeData.subject}
                       onChange={(e) => {
                         setComposeData(prev => ({ ...prev, subject: e.target.value }));
                         if (validationErrors.subject) {
                           setValidationErrors(prev => ({ ...prev, subject: undefined }));
                         }
                       }}
                       className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 
                         ${validationErrors.subject ? 'border-destructive focus:ring-destructive/20' : ''}`}
                     />
                     {validationErrors.subject && (
                       <p className="text-xs text-destructive flex items-center gap-1">
                         <AlertCircle className="h-3 w-3" />
                         {validationErrors.subject}
                       </p>
                     )}
                   </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Template (optionnel)</label>
                    <Select value={composeData.selectedTemplateId} onValueChange={handleTemplateSelect}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Choisir un modèle..." />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {template.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-muted-foreground">Message *</label>
                     <RichTextEditor
                       placeholder="Rédigez votre message..."
                       value={composeData.content}
                       onChange={(content) => {
                         setComposeData(prev => ({ ...prev, content }));
                         if (validationErrors.content) {
                           setValidationErrors(prev => ({ ...prev, content: undefined }));
                         }
                       }}
                       className={`transition-all duration-200 focus:ring-2 focus:ring-primary/20 
                         ${validationErrors.content ? 'border-destructive focus:ring-destructive/20' : ''}`}
                     />
                     {validationErrors.content && (
                       <p className="text-xs text-destructive flex items-center gap-1">
                         <AlertCircle className="h-3 w-3" />
                         {validationErrors.content}
                       </p>
                     )}
                   </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Joindre
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Options
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowCompose(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleSendEmail} disabled={sending}
                              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                        {sending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Enhanced Email Dashboard */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Email List */}
          <div className="lg:col-span-3">
            <Card className="h-full border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-lg font-semibold">Boîte de réception</span>
                      <p className="text-sm text-muted-foreground font-normal">
                        {filteredEmails.length} message{filteredEmails.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </CardTitle>
                  
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Rechercher dans les emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-80 border-primary/20 focus:border-primary/40"
                      />
                    </div>
                    
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40 border-primary/20 focus:border-primary/40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Inbox className="h-4 w-4" />
                            Tous les emails
                          </div>
                        </SelectItem>
                        <SelectItem value="unread">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Non lus
                          </div>
                        </SelectItem>
                        <SelectItem value="starred">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Favoris
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-20rem)]">
                  <div className="divide-y divide-border/50">
                    {filteredEmails.map((email, index) => (
                      <div
                        key={email.id}
                        className={`p-4 hover:bg-muted/30 cursor-pointer transition-all duration-200 group
                          ${!email.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                        onClick={() => handleEmailClick(email)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-3">
                            {!email.isRead && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                            {email.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium text-sm
                                  ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {email.from}
                                </span>
                                {email.attachments && email.attachments.length > 0 && (
                                  <Paperclip className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(email.date).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            
                            <h4 className={`font-medium truncate text-sm
                              ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {email.subject}
                            </h4>
                            
                            <p className="text-xs text-muted-foreground truncate leading-relaxed">
                              {email.content.substring(0, 120)}...
                            </p>
                            
                            {email.attachments && email.attachments.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {email.attachments.map((attachment, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {attachment}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredEmails.length === 0 && (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">Aucun email trouvé</h3>
                        <p className="text-sm text-muted-foreground">
                          Essayez de modifier vos critères de recherche
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={() => setShowCompose(true)} 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 
                           shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Composer
                </Button>
                <Button variant="outline" className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programmer
                </Button>
                <Button variant="outline" className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5">
                  <Users className="h-4 w-4 mr-2" />
                  Listes diffusion
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => setShowTemplates(true)}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Stats */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <div className="text-2xl font-bold text-foreground">{emails.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {emails.filter(e => !e.isRead).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Non lus</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Favoris</span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {emails.filter(e => e.isStarred).length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Programmés</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {scheduledEmails.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Envoyés</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      12
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Scheduled Emails */}
      {showScheduled && (
        <Card>
          <CardHeader>
            <CardTitle>Emails Programmés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{email.subject}</h4>
                    <p className="text-sm text-gray-600">À: {email.to}</p>
                    <p className="text-sm text-gray-500">
                      Programmé pour: {new Date(email.scheduledFor).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={email.status === 'scheduled' ? 'default' : 'secondary'}>
                      {email.status === 'scheduled' ? 'Programmé' : email.status === 'sent' ? 'Envoyé' : 'Échec'}
                    </Badge>
                    <Button variant="outline" size="sm">Modifier</Button>
                    <Button variant="outline" size="sm">Annuler</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Modèles d'Email</CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowTemplateEditor(true)} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nouveau Modèle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Variables disponibles:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.variables.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {template.content.substring(0, 100)}...
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Send className="h-3 w-3 mr-1" />
                      Utiliser
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedTemplate ? 'Modifier le Modèle' : 'Créer un Nouveau Modèle'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Nom du modèle" defaultValue={selectedTemplate?.name} />
                <Select defaultValue={selectedTemplate?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Objet de l'email" defaultValue={selectedTemplate?.subject} />
              <textarea 
                placeholder="Contenu du modèle... Utilisez {{variable}} pour les champs dynamiques"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={12}
                defaultValue={selectedTemplate?.content}
              />
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">Variables disponibles:</h4>
                <div className="flex flex-wrap gap-1 text-xs">
                  {['contact_name', 'artist_name', 'event_name', 'event_date', 'venue_name', 'contract_amount', 'user_name', 'company_name'].map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowTemplateEditor(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {selectedTemplate ? 'Mettre à Jour' : 'Créer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Composer Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="À" 
                  value={composeData.to}
                  onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                />
                <Input 
                  placeholder="CC (optionnel)" 
                  value={composeData.cc}
                  onChange={(e) => setComposeData(prev => ({ ...prev, cc: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Objet" 
                  className="flex-1" 
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                />
                <Select value={composeData.selectedTemplateId} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <textarea 
                placeholder="Composez votre email..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={12}
                value={composeData.content}
                onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Programmer pour plus tard</span>
                </label>
                <Input type="datetime-local" className="w-auto" />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => {
                    setShowCompose(false);
                    setComposeData({
                      to: '',
                      cc: '',
                      subject: '',
                      content: '',
                      selectedTemplateId: ''
                    });
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button variant="outline" className="flex-1">
                  Sauvegarder comme Brouillon
                </Button>
                <Button 
                  onClick={handleSendEmail} 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
