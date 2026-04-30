import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Paperclip } from 'lucide-react';
import { ImageGalleryPicker } from '@/components/website/ImageGalleryPicker';

interface Attachment { name: string; url: string; size: number; }

interface FormData {
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  attachments: Attachment[];
  artist_id: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  attachmentFiles: File[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  onRemoveExistingAttachment?: (index: number) => void;
  onMediaBankSelect: (url: string, type?: string) => void;
  addingFromMediaBank: boolean;
  uploading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  categories: { value: string; label: string }[];
  fileInputId: string;
  showExistingAttachments?: boolean;
  artists?: Array<{ id: string; name: string }>;
}

const extractVariables = (text: string): string[] => {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = text.match(regex);
  return matches ? Array.from(new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))) : [];
};

export const EmailTemplateFormDialog: React.FC<Props> = ({
  open, onOpenChange, title, formData, onFormDataChange, attachmentFiles,
  onFileSelect, onRemoveAttachment, onRemoveExistingAttachment, onMediaBankSelect,
  addingFromMediaBank, uploading, onSubmit, onCancel, submitLabel, categories,
  fileInputId, showExistingAttachments, artists = []
}) => {
  const handleContentChange = (value: string) => {
    onFormDataChange({ ...formData, content: value, variables: extractVariables(value + ' ' + formData.subject) });
  };
  const handleSubjectChange = (value: string) => {
    onFormDataChange({ ...formData, subject: value, variables: extractVariables(formData.content + ' ' + value) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nom du modèle *</Label>
            <Input value={formData.name} onChange={e => onFormDataChange({ ...formData, name: e.target.value })} placeholder="Ex: Suivi de contrat" />
          </div>
          <div>
            <Label>Catégorie</Label>
            <Select value={formData.category} onValueChange={v => onFormDataChange({ ...formData, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Artiste (optionnel)</Label>
            <Select
              value={formData.artist_id || '__none__'}
              onValueChange={v => onFormDataChange({ ...formData, artist_id: v === '__none__' ? null : v })}
            >
              <SelectTrigger><SelectValue placeholder="Aucun artiste" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Aucun artiste</SelectItem>
                {artists.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Objet *</Label>
            <Input value={formData.subject} onChange={e => handleSubjectChange(e.target.value)} placeholder="Ex: Suivi du contrat pour {{event_name}}" />
          </div>
          <div>
            <Label>Contenu *</Label>
            <RichTextEditor value={formData.content} onChange={handleContentChange} className="min-h-[300px]" />
          </div>
          {formData.variables.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Variables détectées :</p>
              <div className="flex flex-wrap gap-1">
                {formData.variables.map(v => <Badge key={v} variant="outline" className="text-xs">{`{{${v}}}`}</Badge>)}
              </div>
            </div>
          )}
          <div>
            <Label>Pièces jointes{showExistingAttachments ? ' existantes' : ''}</Label>
            {showExistingAttachments && formData.attachments?.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-sm truncate flex-1">{att.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveExistingAttachment?.(i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
            <input type="file" id={fileInputId} multiple onChange={onFileSelect} className="hidden" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => document.getElementById(fileInputId)?.click()}>
                <Paperclip className="h-4 w-4 mr-2" />Depuis l'ordinateur
              </Button>
              <ImageGalleryPicker onSelect={onMediaBankSelect} buttonText={addingFromMediaBank ? "Chargement..." : "Depuis les médias"} acceptedTypes={['image', 'pdf', 'audio', 'video', 'text', 'other']} />
            </div>
            {attachmentFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachmentFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveAttachment(i)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}><X className="h-4 w-4 mr-2" />Annuler</Button>
            <Button onClick={onSubmit} disabled={!formData.name || !formData.subject || !formData.content || uploading}>
              <Save className="h-4 w-4 mr-2" />{uploading ? 'Téléchargement...' : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
