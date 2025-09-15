import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, X } from 'lucide-react';
import { useEmailSender } from '@/hooks/useEmailSender';
import { generateEmailSignature } from '@/utils/emailSignature';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNylasEmail } from '@/hooks/useNylasEmail';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  toEmail?: string;
  subject?: string;
  preText?: string;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  toEmail = '',
  subject = '',
  preText = ''
}) => {
  const { currentUser } = useUser();
  const { sendEmail, sending } = useEmailSender();
  const { accounts, loadAccounts, sendEmail: sendViaNylas } = useNylasEmail();
  const [to, setTo] = useState(toEmail);
  const [emailSubject, setEmailSubject] = useState(subject);
  const [content, setContent] = useState(preText);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  React.useEffect(() => {
    setTo(toEmail);
    setEmailSubject(subject);
    setContent(preText);
  }, [toEmail, subject, preText, isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const handleSend = async () => {
    if (!to || !emailSubject || !content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const signature = generateEmailSignature(currentUser);
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${content.replace(/\n/g, '<br>')}
          ${signature}
        </div>
      `;

      if (selectedAccountId) {
        await sendViaNylas(selectedAccountId, {
          to,
          subject: emailSubject,
          content,
          html: htmlContent,
        });
      } else {
        await sendEmail({
          to: [to],
          subject: emailSubject,
          html: htmlContent,
          from: currentUser?.email || 'noreply@example.com'
        });
      }

      toast.success('Email envoyé avec succès');
      onClose();
      setTo('');
      setEmailSubject('');
      setContent('');
    } catch (error) {
      console.error('Erreur envoi email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Composer un email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {accounts.length > 0 && (
            <div>
              <Label htmlFor="from">Envoyer depuis</Label>
              <Select value={selectedAccountId ?? ''} onValueChange={(v) => setSelectedAccountId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un compte d'envoi" />
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

          <div>
            <Label htmlFor="subject">Objet *</Label>
            <Input
              id="subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Objet de l'email"
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Votre message..."
              rows={10}
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Une signature sera automatiquement ajoutée à votre email.</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};