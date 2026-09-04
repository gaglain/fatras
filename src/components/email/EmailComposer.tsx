import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, X, Paperclip, Search } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { supabase } from '@/integrations/supabase/client';
import { useIndividualEmailTracking } from '@/hooks/useIndividualEmailTracking';
import { ImageGalleryPicker } from '@/components/website/ImageGalleryPicker';
import { UniversalSearch } from '@/components/UniversalSearch';
import { logger } from '@/lib/logger';
import { addAvatarToEmailSignature } from '@/hooks/useEmailSignature';
interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  toEmail?: string;
  subject?: string;
  preText?: string;
  /** Contact auquel rattacher l'email dans l'historique */
  contactId?: string;
  /** Type d'envoi: nouveau, réponse ou transfert */
  kind?: 'new' | 'reply' | 'forward';
  /** Email d'origine (pour réponse/transfert) */
  sourceEmail?: { id?: string; message_id?: string; subject?: string; thread_id?: string } | null;
  /** Callback après tentative d'envoi (succès ou échec) */
  onSent?: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  toEmail = '',
  subject = '',
  preText = '',
  contactId,
  kind = 'new',
  sourceEmail = null,
  onSent,
}) => {
  const { currentUser } = useUser();
  const { accounts, loadAccounts, sendEmail: sendViaNylas } = useNylasEmail();
  const { injectEmailTracking } = useIndividualEmailTracking();
  const [to, setTo] = useState(toEmail);
  const [emailSubject, setEmailSubject] = useState(subject);
  const [content, setContent] = useState(preText);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

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


  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!to || !emailSubject || !content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!selectedAccountId) {
      toast.error('Veuillez sélectionner un compte d\'envoi');
      return;
    }

    let createdEmailId: string | null = null;

    try {
      setSending(true);

      // Créer d'abord l'enregistrement email pour obtenir l'ID
      const { data: emailRecord, error: emailError } = await supabase
        .from('emails')
        .insert({
          user_id: currentUser?.id,
          to_email: to,
          subject: emailSubject,
          content,
          direction: 'sent',
          status: 'sending',
          contact_id: contactId || null,
          thread_id: sourceEmail?.thread_id || null,
          metadata: {
            kind,
            in_reply_to_email_id: sourceEmail?.id || null,
            in_reply_to_message_id: sourceEmail?.message_id || null,
            in_reply_to_subject: sourceEmail?.subject || null,
          },
        })
        .select()
        .single();

      if (emailError || !emailRecord) {
        logger.error('Erreur création enregistrement email:', emailError);
        throw new Error(
          `Erreur lors de la création de l'enregistrement email${emailError?.message ? `: ${emailError.message}` : ''}`
        );
      }
      createdEmailId = emailRecord.id;

      // Charger la signature depuis la base de données
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('email_signature, avatar_url')
        .eq('user_id', currentUser?.id)
        .single();

      const signature = addAvatarToEmailSignature(profileData?.email_signature || '', profileData?.avatar_url);
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${content}
          <br><br>
          <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
            ${signature}
          </div>
        </div>
      `;

      // Injecter le pixel de tracking et les liens trackés
      htmlContent = injectEmailTracking(emailRecord.id, htmlContent);

      // Upload attachments to Supabase Storage if any
      const attachmentUrls: Array<{name: string; url: string}> = [];
      if (attachments.length > 0) {
        setUploading(true);
        for (const file of attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('email-attachments')
            .upload(fileName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('email-attachments')
            .getPublicUrl(fileName);

          attachmentUrls.push({ name: file.name, url: publicUrl });
        }
        setUploading(false);
      }

      await sendViaNylas(selectedAccountId, {
        to,
        subject: emailSubject,
        content,
        html: htmlContent,
        attachments: attachmentUrls,
        includeSignature: false,
      });

      // Mettre à jour le statut de l'email (contenu HTML archivé pour l'historique)
      await supabase
        .from('emails')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          html_content: htmlContent,
          attachments: attachmentUrls.length ? attachmentUrls : null,
        })
        .eq('id', emailRecord.id);

      toast.success('Email envoyé avec succès (tracking activé)');
      onSent?.();
      onClose();
      setTo('');
      setEmailSubject('');
      setContent('');
      setAttachments([]);
    } catch (error: unknown) {
      logger.error('Erreur envoi email:', error);
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      // Tracer l'échec dans l'historique du contact
      if (createdEmailId) {
        await supabase
          .from('emails')
          .update({
            status: 'failed',
            metadata: {
              kind,
              in_reply_to_email_id: sourceEmail?.id || null,
              in_reply_to_message_id: sourceEmail?.message_id || null,
              in_reply_to_subject: sourceEmail?.subject || null,
              error: message,
              failed_at: new Date().toISOString(),
            },
          })
          .eq('id', createdEmailId);
      }
      onSent?.();
      toast.error(`Échec de l'envoi: ${message}`);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Composer un email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                Aucun compte email configuré. Veuillez configurer un compte dans les préférences.
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="from">Envoyer depuis *</Label>
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
            <div className="flex gap-2">
              <Input
                id="to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="email@exemple.com"
                required
                className="flex-1"
              />
              <UniversalSearch
                filterTypes={['contact']}
                onSelect={(item) => {
                  if (item.data?.email) {
                    setTo(item.data.email);
                  } else {
                    toast.error('Ce contact n\'a pas d\'adresse email');
                  }
                }}
                placeholder="Rechercher un contact..."
                triggerText={<Search className="h-4 w-4" />}
              />
            </div>
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
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Votre message..."
              className="min-h-[300px]"
            />
          </div>

          <div>
            <Label htmlFor="attachments">Pièces jointes</Label>
            <div className="space-y-2">
              <input
                id="attachments"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('attachments')?.click()}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Depuis l'ordinateur
                </Button>
                <ImageGalleryPicker
                  onSelect={async (url, type) => {
                    try {
                      // Télécharger le fichier depuis l'URL
                      const response = await fetch(url);
                      const blob = await response.blob();
                      const fileName = url.split('/').pop() || 'attachment';
                      const fileObj = new File([blob], fileName, { type: blob.type });
                      setAttachments(prev => [...prev, fileObj]);
                      toast.success('Fichier ajouté depuis la banque de médias');
                    } catch (error) {
                      toast.error('Erreur lors de l\'ajout du fichier');
                    }
                  }}
                  buttonText="Depuis la banque de médias"
                  acceptedTypes={['image', 'pdf', 'audio', 'video', 'text', 'other']}
                />
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/50 rounded-md">
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Une signature sera automatiquement ajoutée à votre email.</p>
            <p>• Le tracking des ouvertures et clics est activé automatiquement.</p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={sending || uploading || accounts.length === 0}
            >
              {uploading ? 'Téléchargement...' : sending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
};