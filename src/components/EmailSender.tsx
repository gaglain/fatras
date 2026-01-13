import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, Plus, X, Paperclip } from 'lucide-react';

interface EmailRecipient {
  email: string;
  name?: string;
}

export const EmailSender: React.FC = () => {
  const [recipients, setRecipients] = useState<EmailRecipient[]>([{ email: '', name: '' }]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const addRecipient = () => {
    setRecipients([...recipients, { email: '', name: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof EmailRecipient, value: string) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index] = { ...updatedRecipients[index], [field]: value };
    setRecipients(updatedRecipients);
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
    // Validate form
    const validRecipients = recipients.filter(r => r.email && r.email.includes('@'));
    if (validRecipients.length === 0) {
      toast.error('Veuillez ajouter au moins un destinataire valide');
      return;
    }

    if (!subject.trim()) {
      toast.error('Veuillez saisir un sujet');
      return;
    }

    if (!content.trim()) {
      toast.error('Veuillez saisir le contenu de l\'email');
      return;
    }

    setSending(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload attachments to Supabase Storage if any
      setUploading(true);
      const attachmentUrls: Array<{name: string; url: string}> = [];
      if (attachments.length > 0) {
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
      }
      setUploading(false);

      // Create email record
      const { data: emailData, error: emailError } = await supabase
        .from('emails')
        .insert({
          user_id: user.id,
          from_email: 'campaign@resend.dev',
          to_email: validRecipients.map(r => r.email).join(','),
          subject,
          content,
          html_content: content,
          status: 'pending'
        })
        .select()
        .single();

      if (emailError) throw emailError;

      // Send via edge function
      const { error: sendError } = await supabase.functions.invoke('send-email', {
        body: {
          to: validRecipients.map(r => r.email),
          subject,
          html: content,
          emailId: emailData.id
        }
      });

      if (sendError) throw sendError;

      toast.success(`Email envoyé à ${validRecipients.length} destinataire(s)`);
      
      // Reset form
      setRecipients([{ email: '', name: '' }]);
      setSubject('');
      setContent('');
      setAttachments([]);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error('Erreur lors de l\'envoi: ' + message);
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Nouvel Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recipients */}
        <div>
          <Label className="text-base font-medium mb-3 block">Destinataires</Label>
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`email-${index}`} className="text-sm">Email</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      placeholder="contact@example.com"
                      value={recipient.email}
                      onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`name-${index}`} className="text-sm">Nom (optionnel)</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="Jean Dupont"
                      value={recipient.name || ''}
                      onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  {index === recipients.length - 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRecipient}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {recipients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRecipient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <Label htmlFor="subject">Sujet</Label>
          <Input
            id="subject"
            placeholder="Objet de votre email"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Content */}
        <div>
          <Label className="text-base font-medium mb-3 block">Contenu</Label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Rédigez votre email..."
            className="min-h-[300px]"
          />
        </div>

        {/* Pièces jointes */}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('attachments')?.click()}
              className="w-full"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Ajouter des pièces jointes
            </Button>
            
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

        {/* Send Button */}
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={sending || uploading}>
            <Send className="h-4 w-4 mr-2" />
            {uploading ? 'Téléchargement...' : sending ? 'Envoi...' : 'Envoyer l\'email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};