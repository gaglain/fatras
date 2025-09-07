import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Mail, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailSender } from '@/hooks/useEmailSender';
import { supabase } from '@/integrations/supabase/client';

export const EmailSenderComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const { sendEmail, sending } = useEmailSender();

  const handleSendEmail = async () => {
    if (!to.trim() || !subject.trim() || !content.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      console.log('Tentative d\'envoi d\'email...', { to, subject, content });
      
      // Utiliser directement la fonction Supabase send-email avec Resend
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: [to],
          subject,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #333;">${subject}</h2>
            <div style="line-height: 1.6; color: #555;">
              ${content.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #888;">
              Envoyé depuis votre application de gestion
            </p>
          </div>`
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Email envoyé avec succès:', data);
      toast.success('Email envoyé avec succès !');
      
      // Reset form
      setTo('');
      setSubject('');
      setContent('');
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      toast.error(`Erreur lors de l'envoi de l'email: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Centre d'Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Configuration requise</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Pour envoyer des emails, vous devez configurer votre clé API RESEND dans les paramètres du projet.
                Allez dans les paramètres Supabase pour ajouter la variable d'environnement RESEND_API_KEY.
              </p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 w-full">
                <Send className="h-4 w-4 mr-2" />
                Composer un email
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Composer un nouvel email</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="to">Destinataire(s)</Label>
                  <Input
                    id="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Sujet de l'email"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Votre message..."
                    rows={8}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSendEmail}
                    disabled={sending}
                  >
                    {sending ? 'Envoi...' : 'Envoyer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
};