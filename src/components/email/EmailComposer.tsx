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
import { Checkbox } from '@/components/ui/checkbox';
import { sanitizeEmailHtml } from '@/lib/sanitize';
interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  toEmail?: string;
  subject?: string;
  preText?: string;
  /** HTML du message d'origine, affiché et cité avec sa mise en forme */
  quotedHtml?: string;
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
  quotedHtml = '',
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
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; subject: string; content: string }>>([]);
  const [followUp, setFollowUp] = useState(false);
  const [followUpDaysInput, setFollowUpDaysInput] = useState('7');
  const followUpDays = Math.min(90, Math.max(1, parseInt(followUpDaysInput, 10) || 1));
  const [followUpMode, setFollowUpMode] = useState<'auto' | 'task'>('auto');
  const [followUpContent, setFollowUpContent] = useState('<p>Bonjour,</p><p>Je me permets de revenir vers vous concernant mon précédent message. Avez-vous pu en prendre connaissance ?</p><p>Bien cordialement,</p>');

  React.useEffect(() => {
    setTo(toEmail);
    setEmailSubject(subject);
    setContent(preText);
    setFollowUp(false);
  }, [toEmail, subject, preText, isOpen]);

  React.useEffect(() => {
    if (isOpen) {
      loadAccounts();
      supabase.from('email_templates').select('id, name, subject, content').order('name')
        .then(({ data }) => setTemplates((data as any) || []));
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const applyTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setContent(t.content || '');
    if (kind === 'new' && t.subject) setEmailSubject(t.subject);
    toast.success(`Modèle « ${t.name} » appliqué`);
  };


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
      const quoteBlock = quotedHtml
        ? `<br><blockquote style="margin: 16px 0 0 0; padding-left: 12px; border-left: 3px solid #d1d5db; color: #444;">${sanitizeEmailHtml(quotedHtml)}</blockquote>`
        : '';
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${content}
          <br><br>
          <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">
            ${signature}
          </div>
          ${quoteBlock}
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

      if (followUp && currentUser?.id) {
        const due = new Date();
        due.setDate(due.getDate() + followUpDays);
        if (followUpMode === 'auto') {
          const fromEmail = accounts.find((a) => a.id === selectedAccountId)?.email || 'booking@fatras.net';
          const followSubject = emailSubject.match(/^(re|tr|fwd)\s*:/i) ? emailSubject : `Re: ${emailSubject}`;
          const followHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              ${followUpContent}
              <br><br>
              <div style="border-top: 1px solid #e5e7eb; margin-top: 20px; padding-top: 20px;">${signature}</div>
              <br><blockquote style="margin: 16px 0 0 0; padding-left: 12px; border-left: 3px solid #d1d5db; color: #444;">
                <p style="color:#666;font-size:13px;">Le ${new Date().toLocaleDateString('fr-FR')}, ${fromEmail} a écrit :</p>
                ${content}${quoteBlock}
              </blockquote>
            </div>`;
          const { error: fuError } = await supabase.from('email_followups').insert({
            user_id: currentUser.id,
            contact_id: contactId || null,
            original_email_id: emailRecord.id,
            to_email: to,
            from_email: fromEmail,
            subject: followSubject,
            html_content: followHtml,
            send_at: due.toISOString(),
          });
          if (fuError) toast.error(`Relance automatique non programmée : ${fuError.message}`);
          else toast.success(`Relance automatique le ${due.toLocaleDateString('fr-FR')} (annulée si réponse)`);
        } else {
          const { error: taskError } = await supabase.from('tasks').insert({
            user_id: currentUser.id,
            assigned_to: currentUser.id,
            contact_id: contactId || null,
            title: `Relancer ${to} — ${emailSubject}`,
            description: `Relance prévue suite à l'email « ${emailSubject} » envoyé le ${new Date().toLocaleDateString('fr-FR')}.`,
            due_date: due.toISOString(),
            priority: 'medium',
            status: 'todo',
            task_type: 'email',
          });
          if (taskError) toast.error(`Relance non créée : ${taskError.message}`);
          else toast.success(`Rappel de relance dans ${followUpDays} jour(s)`);
        }
      }

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
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Composer un email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 min-w-0 [&>*]:min-w-0">
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

          {templates.length > 0 && (
            <div>
              <Label>Appliquer un modèle</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un modèle..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="content">Message *</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Votre message..."
              className="min-h-[300px]"
            />
          </div>

          {quotedHtml && (
            <div>
              <Label>Message d'origine (conservé avec sa mise en forme)</Label>
              <div
                className="mt-1 max-h-72 overflow-auto break-words [overflow-wrap:anywhere] [&_*]:max-w-full [&_img]:h-auto [&_table]:w-full rounded-md border border-l-4 border-l-primary/40 bg-muted/30 p-3 text-sm min-w-0"
                dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(quotedHtml) }}
              />
            </div>
          )}

          <div className="rounded-md border p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="followup" checked={followUp} onCheckedChange={(v) => setFollowUp(!!v)} />
              <Label htmlFor="followup" className="cursor-pointer">Programmer une relance</Label>
            </div>
            {followUp && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" size="sm" variant={followUpMode === 'auto' ? 'default' : 'outline'} onClick={() => setFollowUpMode('auto')}>
                    Envoi automatique
                  </Button>
                  <Button type="button" size="sm" variant={followUpMode === 'task' ? 'default' : 'outline'} onClick={() => setFollowUpMode('task')}>
                    Simple rappel
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>{followUpMode === 'auto' ? 'Relancer automatiquement dans' : 'Me rappeler de relancer dans'}</span>
                  <Input type="number" min={1} max={90} inputMode="numeric" value={followUpDaysInput}
                    onChange={(e) => setFollowUpDaysInput(e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={() => setFollowUpDaysInput(String(followUpDays))}
                    className="w-20" />
                  <span>jours</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {followUpMode === 'auto' ? 'Envoi prévu le ' : 'Rappel le '}
                  {new Date(Date.now() + followUpDays * 86400000).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' — programmé au moment où vous cliquez sur « Envoyer ».'}
                </p>
                {followUpMode === 'auto' ? (
                  <>
                    {templates.length > 0 && (
                      <Select onValueChange={(id) => {
                        const t = templates.find((x) => x.id === id);
                        if (t) setFollowUpContent(t.content || '');
                      }}>
                        <SelectTrigger><SelectValue placeholder="Modèle de relance (optionnel)" /></SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    <RichTextEditor value={followUpContent} onChange={setFollowUpContent} placeholder="Texte de la relance..." className="min-h-[150px]" />
                    <p className="text-xs text-muted-foreground">La relance part toute seule à la date prévue, avec votre signature et le fil précédent. Elle est annulée si le contact vous répond d'ici là.</p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Une tâche de relance est créée avec cette échéance (rappels email/push habituels).</p>
                )}
              </div>
            )}
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

          <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-3 bg-background border-t flex justify-end gap-2">
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