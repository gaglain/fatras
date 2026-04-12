import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EmailTemplateFormDialog } from './EmailTemplateFormDialog';

const categories = [
  { value: 'general', label: 'Général' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'reservation', label: 'Réservation' },
  { value: 'suivi', label: 'Suivi' },
  { value: 'confirmation', label: 'Confirmation' }
];

const emptyForm = { name: '', subject: '', content: '', category: 'general', variables: [] as string[], attachments: [] as Array<{ name: string; url: string; size: number }> };

export const EmailTemplateManager: React.FC = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useEmailTemplates();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [addingFromMediaBank, setAddingFromMediaBank] = useState(false);
  const confirmAction = useConfirm();

  const resetForm = () => { setFormData({ ...emptyForm }); setAttachmentFiles([]); };

  const uploadAttachments = async () => {
    const uploaded: Array<{ name: string; url: string; size: number }> = [];
    for (const file of attachmentFiles) {
      const filePath = `email-attachments/${Math.random()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('app-files').upload(filePath, file);
      if (error) { toast.error(`Erreur: ${file.name}`); continue; }
      const { data: { publicUrl } } = supabase.storage.from('app-files').getPublicUrl(filePath);
      uploaded.push({ name: file.name, url: publicUrl, size: file.size });
    }
    return uploaded;
  };

  const handleCreate = async () => {
    try { setUploading(true); await createTemplate({ ...formData, attachments: await uploadAttachments() }); setShowCreateDialog(false); resetForm(); }
    catch (e) { console.error(e); } finally { setUploading(false); }
  };

  const handleUpdate = async () => {
    if (!editingTemplate) return;
    try { setUploading(true); await updateTemplate(editingTemplate.id, { ...formData, attachments: [...(formData.attachments || []), ...(await uploadAttachments())] }); setEditingTemplate(null); resetForm(); }
    catch (e) { console.error(e); } finally { setUploading(false); }
  };

  const handleEdit = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setFormData({ name: t.name, subject: t.subject, content: t.content, category: t.category, variables: t.variables, attachments: t.attachments || [] });
    setAttachmentFiles([]);
  };

  const handleDelete = async (id: string) => {
    if (await confirmAction({ title: 'Supprimer le modèle', description: 'Êtes-vous sûr ?', variant: 'destructive' })) await deleteTemplate(id);
  };

  const handleMediaBankSelect = async (url: string) => {
    setAddingFromMediaBank(true);
    try { const r = await fetch(url); const b = await r.blob(); setAttachmentFiles(p => [...p, new File([b], decodeURIComponent(url.split('/').pop() || 'fichier'), { type: b.type })]); toast.success('Fichier ajouté'); }
    catch { toast.error("Erreur lors de l'ajout"); } finally { setAddingFromMediaBank(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Modèles d'email</h2>
        <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" />Nouveau modèle</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Chargement...</p> : templates.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucun modèle créé</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {templates.map(t => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><CardTitle className="text-lg">{t.name}</CardTitle><Badge variant="outline">{categories.find(c => c.value === t.category)?.label}</Badge></div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-2">Objet: {t.subject}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{t.content}</p>
                {t.variables.length > 0 && <div className="mt-3 flex flex-wrap gap-1">{t.variables.map(v => <Badge key={v} variant="secondary" className="text-xs">{`{{${v}}}`}</Badge>)}</div>}
                {t.attachments?.length > 0 && <p className="mt-3 text-xs text-muted-foreground">{t.attachments.length} pièce(s) jointe(s)</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EmailTemplateFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} title="Créer un modèle d'email"
        formData={formData} onFormDataChange={setFormData} attachmentFiles={attachmentFiles}
        onFileSelect={e => setAttachmentFiles(p => [...p, ...Array.from(e.target.files || [])])}
        onRemoveAttachment={i => setAttachmentFiles(p => p.filter((_, j) => j !== i))}
        onMediaBankSelect={handleMediaBankSelect} addingFromMediaBank={addingFromMediaBank}
        uploading={uploading} onSubmit={handleCreate} onCancel={() => { setShowCreateDialog(false); resetForm(); }}
        submitLabel="Créer" categories={categories} fileInputId="template-attachments" />

      <EmailTemplateFormDialog open={!!editingTemplate} onOpenChange={o => { if (!o) setEditingTemplate(null); }} title="Modifier le modèle"
        formData={formData} onFormDataChange={setFormData} attachmentFiles={attachmentFiles}
        onFileSelect={e => setAttachmentFiles(p => [...p, ...Array.from(e.target.files || [])])}
        onRemoveAttachment={i => setAttachmentFiles(p => p.filter((_, j) => j !== i))}
        onRemoveExistingAttachment={i => setFormData(p => ({ ...p, attachments: p.attachments.filter((_, j) => j !== i) }))}
        onMediaBankSelect={handleMediaBankSelect} addingFromMediaBank={addingFromMediaBank}
        uploading={uploading} onSubmit={handleUpdate} onCancel={() => { setEditingTemplate(null); resetForm(); }}
        submitLabel="Enregistrer" categories={categories} fileInputId="template-attachments-edit" showExistingAttachments />
    </div>
  );
};
