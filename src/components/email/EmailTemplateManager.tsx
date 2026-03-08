import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit2, Trash2, Save, X, Paperclip, Image as ImageIcon } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { ImageGalleryPicker } from '@/components/website/ImageGalleryPicker';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const EmailTemplateManager: React.FC = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general',
    variables: [] as string[],
    attachments: [] as Array<{ name: string; url: string; size: number }>
  });
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [addingFromMediaBank, setAddingFromMediaBank] = useState(false);

  const categories = [
    { value: 'general', label: 'Général' },
    { value: 'contrat', label: 'Contrat' },
    { value: 'reservation', label: 'Réservation' },
    { value: 'suivi', label: 'Suivi' },
    { value: 'confirmation', label: 'Confirmation' }
  ];

  const handleCreate = async () => {
    try {
      setUploading(true);
      const uploadedAttachments = await uploadAttachments();
      await createTemplate({ ...formData, attachments: uploadedAttachments });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (editingTemplate) {
      try {
        setUploading(true);
        const uploadedAttachments = await uploadAttachments();
        const allAttachments = [...(formData.attachments || []), ...uploadedAttachments];
        await updateTemplate(editingTemplate.id, { ...formData, attachments: allAttachments });
        setEditingTemplate(null);
        resetForm();
      } catch (error) {
        console.error('Error updating template:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category,
      variables: template.variables,
      attachments: template.attachments || []
    });
    setAttachmentFiles([]);
  };

  const confirmAction = useConfirm();
  const handleDelete = async (id: string) => {
    const ok = await confirmAction({ title: 'Supprimer le modèle', description: 'Êtes-vous sûr de vouloir supprimer ce modèle ?', variant: 'destructive' });
    if (ok) {
      await deleteTemplate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'general',
      variables: [],
      attachments: []
    });
    setAttachmentFiles([]);
  };

  const uploadAttachments = async (): Promise<Array<{ name: string; url: string; size: number }>> => {
    if (attachmentFiles.length === 0) return [];

    const uploaded: Array<{ name: string; url: string; size: number }> = [];
    
    for (const file of attachmentFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `email-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('app-files')
        .upload(filePath, file);

      if (uploadError) {
        toast.error(`Erreur lors du téléchargement de ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('app-files')
        .getPublicUrl(filePath);

      uploaded.push({
        name: file.name,
        url: publicUrl,
        size: file.size
      });
    }

    return uploaded;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachmentFiles(prev => [...prev, ...files]);
  };

  const handleMediaBankSelect = async (url: string, type?: string) => {
    if (!url) return;
    
    setAddingFromMediaBank(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const urlParts = url.split('/');
      const fileName = decodeURIComponent(urlParts[urlParts.length - 1]) || 'fichier';
      const fileObj = new File([blob], fileName, { type: blob.type });
      setAttachmentFiles(prev => [...prev, fileObj]);
      toast.success('Fichier ajouté depuis la banque de médias');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du fichier');
    } finally {
      setAddingFromMediaBank(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments?.filter((_, i) => i !== index) || []
    }));
  };

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = text.match(regex);
    return matches ? Array.from(new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))) : [];
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value,
      variables: extractVariables(value + ' ' + prev.subject)
    }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value,
      variables: extractVariables(prev.content + ' ' + value)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Modèles d'email</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau modèle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un modèle d'email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du modèle *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Suivi de contrat"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Objet *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  placeholder="Ex: Suivi du contrat pour {{event_name}}"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenu *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Bonjour {{contact_name}},&#10;&#10;Votre message ici...&#10;&#10;Cordialement,&#10;{{user_name}}"
                  className="min-h-[300px]"
                />
              </div>

              {formData.variables.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Variables détectées :</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ces variables seront remplacées automatiquement lors de l'envoi
                  </p>
                </div>
              )}

              <div>
                <Label>Pièces jointes</Label>
                <input
                  type="file"
                  id="template-attachments"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('template-attachments')?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Depuis l'ordinateur
                  </Button>
                  <ImageGalleryPicker
                    onSelect={handleMediaBankSelect}
                    buttonText={addingFromMediaBank ? "Chargement..." : "Depuis les médias"}
                    acceptedTypes={['image', 'pdf', 'audio', 'video', 'text', 'other']}
                  />
                </div>
                {attachmentFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachmentFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
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

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                  Annuler
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || !formData.subject || !formData.content || uploading}>
                  <Save className="h-4 w-4 mr-2" />
                  {uploading ? 'Téléchargement...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun modèle d'email créé</p>
            <p className="text-sm text-muted-foreground mt-2">Créez votre premier modèle pour gagner du temps</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{categories.find(c => c.value === template.category)?.label}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">Objet: {template.subject}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                {template.variables.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                )}
                {template.attachments && template.attachments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {template.attachments.length} pièce(s) jointe(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le modèle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom du modèle *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-subject">Objet *</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-content">Contenu *</Label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                className="min-h-[300px]"
              />
            </div>

            {formData.variables.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Variables détectées :</p>
                <div className="flex flex-wrap gap-1">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Pièces jointes existantes</Label>
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {formData.attachments.map((att, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm truncate flex-1">{att.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExistingAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                id="template-attachments-edit"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('template-attachments-edit')?.click()}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Depuis l'ordinateur
                </Button>
                <ImageGalleryPicker
                  onSelect={handleMediaBankSelect}
                  buttonText={addingFromMediaBank ? "Chargement..." : "Depuis les médias"}
                  acceptedTypes={['image', 'pdf', 'audio', 'video', 'text', 'other']}
                />
              </div>
              {attachmentFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachmentFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
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

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditingTemplate(null); resetForm(); }}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={uploading}>
                <Save className="h-4 w-4 mr-2" />
                {uploading ? 'Téléchargement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
