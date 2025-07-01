import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, Send, Calendar, Phone, FileText, Edit, Trash2, Inbox, Search, Star, Archive } from 'lucide-react';
import { EmailViewer } from '@/components/EmailViewer';
import { toast } from 'sonner';

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
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Nouveaux états pour la composition d'email
  const [composeData, setComposeData] = useState({
    to: '',
    cc: '',
    subject: '',
    content: '',
    selectedTemplateId: ''
  });

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

  const handleSendEmail = async () => {
    if (!composeData.to.trim() || !composeData.subject.trim() || !composeData.content.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Simuler l'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      
      // Réinitialiser le formulaire
      setComposeData({
        to: '',
        cc: '',
        subject: '',
        content: '',
        selectedTemplateId: ''
      });
      
      setShowCompose(false);
      toast.success('Email envoyé avec succès !');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion Email</h1>
          <p className="text-gray-600 mt-2">Envoyer des emails, programmer des communications et gérer les modèles</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowScheduled(!showScheduled)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Programmés ({scheduledEmails.length})
          </Button>
          <Button onClick={() => setShowCompose(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Composer Email
          </Button>
        </div>
      </div>

      {/* Email Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Inbox className="h-5 w-5 mr-2" />
                  Boîte de réception
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filtre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="unread">Non lus</SelectItem>
                      <SelectItem value="starred">Favoris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !email.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleEmailClick(email)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {email.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {!email.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                          <span className={`font-medium ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {email.from}
                          </span>
                        </div>
                        <h4 className={`font-medium truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-800'}`}>
                          {email.subject}
                        </h4>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {email.content.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500">
                          {new Date(email.date).toLocaleDateString('fr-FR')}
                        </p>
                        {email.attachments && email.attachments.length > 0 && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {email.attachments.length} pièce(s) jointe(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => setShowCompose(true)} className="w-full bg-purple-600 hover:bg-purple-700">
                <Mail className="h-4 w-4 mr-2" />
                Composer
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Programmer
              </Button>
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Appel rapide
              </Button>
            </CardContent>
          </Card>

          {/* Email Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-medium">{emails.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Non lus</span>
                <span className="font-medium text-blue-600">
                  {emails.filter(e => !e.isRead).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Favoris</span>
                <span className="font-medium text-yellow-600">
                  {emails.filter(e => e.isStarred).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Programmés</span>
                <span className="font-medium text-purple-600">
                  {scheduledEmails.length}
                </span>
              </div>
            </CardContent>
          </Card>
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
