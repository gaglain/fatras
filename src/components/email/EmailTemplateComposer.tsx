import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, FileText, X } from 'lucide-react';
import { useEmailSender } from '@/hooks/useEmailSender';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
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
    content: 'Cher {{contact_name}},\n\nNous sommes heureux de confirmer la réservation pour {{artist_name}} à {{venue_name}} le {{event_date}}.\n\nCordialement,\n{{user_name}}',
    variables: ['contact_name', 'artist_name', 'venue_name', 'event_date', 'user_name']
  }
];

export const EmailTemplateComposer: React.FC = () => {
  const { user } = useAuth();
  const { sendEmail, sending } = useEmailSender();
  const { accounts, loadAccounts, sendEmail: sendViaNylas } = useNylasEmail();
  
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [fromName, setFromName] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  React.useEffect(() => {
    loadAccounts();
  }, []);

  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const applyTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.content);
    setShowTemplates(false);
    toast.success(`Modèle "${template.name}" appliqué`);
  };

  const handleSend = async () => {
    if (!to || !subject || !content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${content.replace(/\n/g, '<br>')}
        </div>
      `;

      if (selectedAccount) {
        await sendViaNylas(selectedAccount, {
          to,
          subject,
          content,
          html: htmlContent,
        });
      } else {
        await sendEmail({
          to: [to],
          subject,
          html: htmlContent,
          from: fromName || 'Application'
        });
      }

      toast.success('Email envoyé avec succès');
      
      // Réinitialiser le formulaire
      setTo('');
      setSubject('');
      setContent('');
      setSelectedTemplate(null);
      setFromName('');
    } catch (error) {
      console.error('Erreur envoi email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Composer un email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélection du compte */}
        {accounts.length > 0 && (
          <div>
            <Label htmlFor="account">Envoyer depuis</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un compte" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.email} ({acc.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Nom d'expéditeur si pas de compte Nylas */}
        {accounts.length === 0 && (
          <div>
            <Label htmlFor="fromName">Nom d'expéditeur (alias)</Label>
            <Input
              id="fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Votre nom ou alias"
            />
          </div>
        )}

        {/* Destinataire */}
        <div>
          <Label htmlFor="to">Destinataire *</Label>
          <Input
            id="to"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="email@exemple.com"
            required
          />
        </div>

        {/* Sujet avec bouton modèle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="subject">Objet *</Label>
            <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Modèles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Choisir un modèle d'email</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {emailTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet de l'email"
            required
          />
          {selectedTemplate && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Modèle: {selectedTemplate.name}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(null);
                  setSubject('');
                  setContent('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div>
          <Label htmlFor="content">Message *</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Votre message..."
            rows={12}
            className="min-h-[200px]"
            required
          />
        </div>

        {/* Variables du modèle */}
        {selectedTemplate && selectedTemplate.variables.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Variables disponibles :</p>
            <div className="flex flex-wrap gap-1">
              {selectedTemplate.variables.map((variable) => (
                <Badge key={variable} variant="outline" className="text-xs">
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Remplacez ces variables par les valeurs réelles avant d'envoyer
            </p>
          </div>
        )}

        {/* Bouton d'envoi */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSend}
            disabled={sending || !to || !subject || !content}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};