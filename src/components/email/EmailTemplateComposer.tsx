import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, FileText, X, Paperclip, Signature, Search, Image as ImageIcon } from 'lucide-react';
import { ImageGalleryPicker } from '@/components/website/ImageGalleryPicker';
import { useEmailSender } from '@/hooks/useEmailSender';
import { supabase } from '@/integrations/supabase/client';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { generateEmailSignature } from '@/utils/emailSignature';
import { useUser } from '@/contexts/UserContext';
import { VariableInserter } from './VariableInserter';
import { replaceEmailVariables } from '@/utils/emailVariables';
import { UniversalSearch } from '@/components/UniversalSearch';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  attachments?: Array<{ name: string; url: string; size: number }>;
}

// Templates are now loaded from database via useEmailTemplates hook

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

export const EmailTemplateComposer: React.FC<EmailTemplateComposerProps> = ({ 
  defaultRecipient = '', 
  defaultSubject = '',
  contactData,
  eventData,
  quoteData
}) => {
  const { user } = useAuth();
  const { currentUser } = useUser();
  const { sendEmail, sending } = useEmailSender();
  const { accounts, loadAccounts, sendEmail: sendViaNylas } = useNylasEmail();
  const { templates } = useEmailTemplates();
  
  const [selectedAccount, setSelectedAccount] = useState<string>('');
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

  React.useEffect(() => {
    loadAccounts();
  }, []);

  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  // Update recipient and subject when props change
  React.useEffect(() => {
    if (defaultRecipient) setTo(defaultRecipient);
    if (defaultSubject) setSubject(defaultSubject);
  }, [defaultRecipient, defaultSubject]);

  // Handler pour ajouter un fichier depuis la banque de médias
  const handleMediaBankSelect = async (url: string, type?: string) => {
    if (!url) return;
    
    setAddingFromMediaBank(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      // Extraire le nom du fichier depuis l'URL
      const urlParts = url.split('/');
      const fileName = decodeURIComponent(urlParts[urlParts.length - 1]) || 'fichier';
      const fileObj = new File([blob], fileName, { type: blob.type });
      setAttachments(prev => [...prev, fileObj]);
      toast.success('Fichier ajouté depuis la banque de médias');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du fichier');
    } finally {
      setAddingFromMediaBank(false);
    }
  };

  const applyTemplate = async (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setContent(template.content);
    
    // Charger les pièces jointes du modèle
    if (template.attachments && template.attachments.length > 0) {
      const templateFiles: File[] = [];
      for (const att of template.attachments) {
        try {
          const response = await fetch(att.url);
          const blob = await response.blob();
          const file = new File([blob], att.name, { type: blob.type });
          templateFiles.push(file);
        } catch {
          // Template attachment loading failed - continue with others
        }
      }
      setAttachments(templateFiles);
    }
    
    setShowTemplates(false);
    toast.success(`Modèle "${template.name}" appliqué avec ${template.attachments?.length || 0} pièce(s) jointe(s)`);
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
    if (!to || !subject || !content) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setUploading(true);
      
      // Remplacer les variables par les valeurs réelles
      let processedContent = replaceEmailVariables(content, {
        contact: contactData,
        event: eventData,
        quote: quoteData
      });
      let processedSubject = replaceEmailVariables(subject, {
        contact: contactData,
        event: eventData,
        quote: quoteData
      });
      
      // Ajouter la signature si demandée
      const signature = includeSignature && currentUser ? generateEmailSignature(currentUser) : '';
      const finalContent = signature ? `${processedContent}\n\n${signature}` : processedContent;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          ${finalContent.replace(/\n/g, '<br>')}
        </div>
      `;

      const resendAttachments: Array<{ name: string; content: string; contentType?: string; filename?: string }> = [];
      const attachmentUrls: Array<{name: string; url: string}> = [];
      if (attachments.length > 0) {
        if (selectedAccount) {
          for (const file of attachments) {
            const fileName = `${Date.now()}-${file.name}`;
            const { error } = await supabase.storage
              .from('email-attachments')
              .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
              .from('email-attachments')
              .getPublicUrl(fileName);

            attachmentUrls.push({ name: file.name, url: publicUrl });
          }
        } else {
          const encodedAttachments = await Promise.all(
            attachments.map(async (file) => ({
              name: file.name,
              filename: file.name,
              content: await fileToDataUrl(file),
              contentType: file.type || undefined,
            }))
          );

          resendAttachments.push(...encodedAttachments);
        }
      }

      if (selectedAccount) {
        await sendViaNylas(selectedAccount, {
          to,
          subject: processedSubject,
          content: finalContent,
          html: htmlContent,
          attachments: attachmentUrls,
        });
      } else {
        await sendEmail({
          to: [to],
          subject: processedSubject,
          html: htmlContent,
          from: fromName || 'Application',
          attachments: resendAttachments,
        });
      }

      toast.success('Email envoyé avec succès');
      
      // Réinitialiser le formulaire
      setTo('');
      setSubject('');
      setContent('');
      setSelectedTemplate(null);
      setFromName('');
      setAttachments([]);
    } catch {
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
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
                  {templates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun modèle disponible. Créez-en un dans la gestion des modèles.
                    </p>
                  ) : (
                    templates.map((template) => (
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
                    ))
                  )}
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
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="content">Message *</Label>
            <VariableInserter onInsert={(variable) => setContent(prev => prev + variable)} />
          </div>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Votre message..."
            className="min-h-[300px]"
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
                onSelect={handleMediaBankSelect}
                buttonText={addingFromMediaBank ? "Chargement..." : "Depuis la banque de médias"}
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

        {/* Signature */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="includeSignature"
            checked={includeSignature}
            onChange={(e) => setIncludeSignature(e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="includeSignature" className="text-sm cursor-pointer">
            Inclure ma signature email
          </Label>
        </div>

        {includeSignature && currentUser && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Signature className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Aperçu de la signature</span>
            </div>
            <div 
              className="text-xs border-l-2 border-primary pl-3"
              dangerouslySetInnerHTML={{ __html: generateEmailSignature(currentUser) }}
            />
          </div>
        )}

        {/* Bouton d'envoi */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSend}
            disabled={sending || uploading || !to || !subject || !content}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {uploading ? 'Téléchargement...' : sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </CardContent>
    </Card>

    </>
  );
};