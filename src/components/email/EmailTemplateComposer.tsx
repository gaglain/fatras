import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useEmailSender } from '@/hooks/useEmailSender';
import { supabase } from '@/integrations/supabase/client';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { generateEmailSignature } from '@/utils/emailSignature';
import { useUser } from '@/contexts/UserContext';
import { replaceEmailVariables } from '@/utils/emailVariables';
import { EmailComposerForm } from './EmailComposerForm';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  attachments?: Array<{ name: string; url: string; size: number }>;
}

interface EmailTemplateComposerProps {
  defaultRecipient?: string;
  defaultSubject?: string;
  contactData?: any;
  eventData?: any;
  quoteData?: any;
}

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Impossible de lire le fichier ${file.name}`));
    reader.readAsDataURL(file);
  });

export const EmailTemplateComposer: React.FC<EmailTemplateComposerProps> = ({ defaultRecipient = '', defaultSubject = '', contactData, eventData, quoteData }) => {
  const { user } = useAuth();
  const { currentUser } = useUser();
  const { sendEmail, sending } = useEmailSender();
  const { accounts, loadAccounts, sendEmail: sendViaNylas } = useNylasEmail();
  const { templates } = useEmailTemplates();

  const [selectedAccount, setSelectedAccount] = useState('');
  const [fromName, setFromName] = useState('');
  const [to, setTo] = useState(defaultRecipient);
  const [subject, setSubject] = useState(defaultSubject);
  const [content, setContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [addingFromMediaBank, setAddingFromMediaBank] = useState(false);

  React.useEffect(() => { loadAccounts(); }, []);
  React.useEffect(() => { if (accounts.length > 0 && !selectedAccount) setSelectedAccount(accounts[0].id); }, [accounts, selectedAccount]);
  React.useEffect(() => { if (defaultRecipient) setTo(defaultRecipient); if (defaultSubject) setSubject(defaultSubject); }, [defaultRecipient, defaultSubject]);

  const handleMediaBankSelect = async (url: string) => {
    if (!url) return;
    setAddingFromMediaBank(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = decodeURIComponent(url.split('/').pop() || 'fichier');
      setAttachments(prev => [...prev, new File([blob], fileName, { type: blob.type })]);
      toast.success('Fichier ajouté depuis la banque de médias');
    } catch { toast.error("Erreur lors de l'ajout du fichier"); }
    finally { setAddingFromMediaBank(false); }
  };

  const applyTemplate = async (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.content);
    if (template.attachments?.length) {
      const files: File[] = [];
      for (const att of template.attachments) {
        try { const r = await fetch(att.url); const b = await r.blob(); files.push(new File([b], att.name, { type: b.type })); } catch {}
      }
      setAttachments(files);
    }
    setShowTemplates(false);
    toast.success(`Modèle "${template.name}" appliqué`);
  };

  const handleSend = async () => {
    if (!to || !subject || !content) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    try {
      setUploading(true);
      const ctx = { contact: contactData, event: eventData, quote: quoteData };
      const processedContent = replaceEmailVariables(content, ctx);
      const processedSubject = replaceEmailVariables(subject, ctx);
      const signature = includeSignature && currentUser ? generateEmailSignature(currentUser) : '';
      const finalContent = signature ? `${processedContent}\n\n${signature}` : processedContent;
      const htmlContent = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${finalContent.replace(/\n/g, '<br>')}</div>`;

      if (selectedAccount) {
        const attachmentUrls: Array<{ name: string; url: string }> = [];
        for (const file of attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const { error } = await supabase.storage.from('email-attachments').upload(fileName, file);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('email-attachments').getPublicUrl(fileName);
          attachmentUrls.push({ name: file.name, url: publicUrl });
        }
        await sendViaNylas(selectedAccount, { to, subject: processedSubject, content: finalContent, html: htmlContent, attachments: attachmentUrls });
      } else {
        const resendAttachments = await Promise.all(attachments.map(async (file) => ({
          name: file.name, filename: file.name, content: await fileToDataUrl(file), contentType: file.type || undefined,
        })));
        await sendEmail({ to: [to], subject: processedSubject, html: htmlContent, from: fromName || 'Application', attachments: resendAttachments });
      }

      toast.success('Email envoyé avec succès');
      setTo(''); setSubject(''); setContent(''); setSelectedTemplate(null); setFromName(''); setAttachments([]);
    } catch { toast.error("Erreur lors de l'envoi de l'email"); }
    finally { setUploading(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Composer un email</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <EmailComposerForm
          accounts={accounts} selectedAccount={selectedAccount} onSelectedAccountChange={setSelectedAccount}
          fromName={fromName} onFromNameChange={setFromName}
          to={to} onToChange={setTo} subject={subject} onSubjectChange={setSubject}
          content={content} onContentChange={setContent}
          selectedTemplate={selectedTemplate} onClearTemplate={() => { setSelectedTemplate(null); setSubject(''); setContent(''); }}
          templates={templates} showTemplates={showTemplates} onShowTemplatesChange={setShowTemplates} onApplyTemplate={applyTemplate}
          attachments={attachments} onFileSelect={(e) => { if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]); }}
          onRemoveAttachment={(i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
          onMediaBankSelect={handleMediaBankSelect} addingFromMediaBank={addingFromMediaBank}
          includeSignature={includeSignature} onIncludeSignatureChange={setIncludeSignature}
          signatureHtml={currentUser ? generateEmailSignature(currentUser) : undefined}
          sending={sending} uploading={uploading} onSend={handleSend}
        />
      </CardContent>
    </Card>
  );
};
