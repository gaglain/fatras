import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, FileText, X, Paperclip, Signature, Search } from 'lucide-react';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ImageGalleryPicker } from '@/components/website/ImageGalleryPicker';
import { UniversalSearch } from '@/components/UniversalSearch';
import { VariableInserter } from './VariableInserter';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  attachments?: Array<{ name: string; url: string; size: number }>;
  artist_id?: string | null;
}

interface EmailComposerFormProps {
  accounts: any[];
  selectedAccount: string;
  onSelectedAccountChange: (v: string) => void;
  fromName: string;
  onFromNameChange: (v: string) => void;
  to: string;
  onToChange: (v: string) => void;
  subject: string;
  onSubjectChange: (v: string) => void;
  content: string;
  onContentChange: (v: string) => void;
  selectedTemplate: EmailTemplate | null;
  onClearTemplate: () => void;
  templates: EmailTemplate[];
  showTemplates: boolean;
  onShowTemplatesChange: (v: boolean) => void;
  onApplyTemplate: (t: EmailTemplate) => void;
  attachments: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (i: number) => void;
  onMediaBankSelect: (url: string, type?: string) => void;
  addingFromMediaBank: boolean;
  includeSignature: boolean;
  onIncludeSignatureChange: (v: boolean) => void;
  signatureHtml?: string;
  sending: boolean;
  uploading: boolean;
  onSend: () => void;
}

export const EmailComposerForm: React.FC<EmailComposerFormProps> = (props) => {
  return (
    <>
      {props.accounts.length > 0 && (
        <div>
          <Label htmlFor="account">Envoyer depuis</Label>
          <Select value={props.selectedAccount} onValueChange={props.onSelectedAccountChange}>
            <SelectTrigger><SelectValue placeholder="Choisir un compte" /></SelectTrigger>
            <SelectContent>
              {props.accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>{acc.email} ({acc.provider})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {props.accounts.length === 0 && (
        <div>
          <Label htmlFor="fromName">Nom d'expéditeur (alias)</Label>
          <Input id="fromName" value={props.fromName} onChange={(e) => props.onFromNameChange(e.target.value)} placeholder="Votre nom ou alias" />
        </div>
      )}

      <div>
        <Label htmlFor="to">Destinataire *</Label>
        <div className="flex gap-2">
          <Input id="to" type="email" value={props.to} onChange={(e) => props.onToChange(e.target.value)} placeholder="email@exemple.com" required className="flex-1" />
          <UniversalSearch filterTypes={['contact']} onSelect={(item) => { if (item.data?.email) props.onToChange(item.data.email); else toast.error("Ce contact n'a pas d'adresse email"); }} placeholder="Rechercher un contact..." triggerText={<Search className="h-4 w-4" />} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="subject">Objet *</Label>
          <Dialog open={props.showTemplates} onOpenChange={props.onShowTemplatesChange}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1"><FileText className="h-3 w-3" />Modèles</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Choisir un modèle d'email</DialogTitle></DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {props.templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun modèle disponible.</p>
                ) : (
                  props.templates.map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => props.onApplyTemplate(template)}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.subject}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.content.substring(0, 100)}...</p>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Input id="subject" value={props.subject} onChange={(e) => props.onSubjectChange(e.target.value)} placeholder="Objet de l'email" required />
        {props.selectedTemplate && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">Modèle: {props.selectedTemplate.name}</Badge>
            <Button variant="ghost" size="sm" onClick={props.onClearTemplate}><X className="h-3 w-3" /></Button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="content">Message *</Label>
          <VariableInserter onInsert={(variable) => props.onContentChange(props.content + variable)} />
        </div>
        <RichTextEditor value={props.content} onChange={props.onContentChange} placeholder="Votre message..." className="min-h-[300px]" />
      </div>

      {props.selectedTemplate && props.selectedTemplate.variables.length > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Variables disponibles :</p>
          <div className="flex flex-wrap gap-1">
            {props.selectedTemplate.variables.map((variable) => (
              <Badge key={variable} variant="outline" className="text-xs">{`{{${variable}}}`}</Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Remplacez ces variables par les valeurs réelles avant d'envoyer</p>
        </div>
      )}

      <div>
        <Label htmlFor="attachments">Pièces jointes</Label>
        <div className="space-y-2">
          <input id="attachments" type="file" multiple onChange={props.onFileSelect} className="hidden" />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={() => document.getElementById('attachments')?.click()}>
              <Paperclip className="h-4 w-4 mr-2" />Depuis l'ordinateur
            </Button>
            <ImageGalleryPicker onSelect={props.onMediaBankSelect} buttonText={props.addingFromMediaBank ? "Chargement..." : "Depuis la banque de médias"} acceptedTypes={['image', 'pdf', 'audio', 'video', 'text', 'other']} />
          </div>
          {props.attachments.length > 0 && (
            <div className="space-y-1">
              {props.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-accent/50 rounded-md">
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => props.onRemoveAttachment(index)}><X className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input type="checkbox" id="includeSignature" checked={props.includeSignature} onChange={(e) => props.onIncludeSignatureChange(e.target.checked)} className="h-4 w-4" />
        <Label htmlFor="includeSignature" className="text-sm cursor-pointer">Inclure ma signature email</Label>
      </div>

      {props.includeSignature && props.signatureHtml && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Signature className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Aperçu de la signature</span>
          </div>
          <div className="text-xs border-l-2 border-primary pl-3" dangerouslySetInnerHTML={{ __html: props.signatureHtml }} />
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={props.onSend} disabled={props.sending || props.uploading || !props.to || !props.subject || !props.content} className="flex items-center gap-2">
          <Send className="h-4 w-4" />
          {props.uploading ? 'Téléchargement...' : props.sending ? 'Envoi...' : 'Envoyer'}
        </Button>
      </div>
    </>
  );
};
