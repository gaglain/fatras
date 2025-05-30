import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, Send, Calendar, Phone, FileText, Edit, Trash2 } from 'lucide-react';

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
  const [showCompose, setShowCompose] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Contrat', 'Réservation', 'Technique', 'Commercial', 'Finance'];

  const filteredTemplates = selectedCategory === 'all' 
    ? emailTemplates 
    : emailTemplates.filter(template => template.category === selectedCategory);

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateEditor(true);
  };

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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Envoyer Email</h3>
            <p className="text-sm text-gray-600">Composer et envoyer des emails aux contacts</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Programmer Réunion</h3>
            <p className="text-sm text-gray-600">Organiser des appels et réunions</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Appel Téléphonique</h3>
            <p className="text-sm text-gray-600">Enregistrer et suivre les communications téléphoniques</p>
          </CardContent>
        </Card>
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
              <Button onClick={handleCreateTemplate} variant="outline" size="sm">
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
                <Input placeholder="À" />
                <Input placeholder="CC (optionnel)" />
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Objet" className="flex-1" />
                <Select>
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
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Programmer pour plus tard</span>
                </label>
                <Input type="datetime-local" className="w-auto" />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCompose(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button variant="outline" className="flex-1">
                  Sauvegarder comme Brouillon
                </Button>
                <Button onClick={() => setShowCompose(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
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
