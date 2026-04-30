import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Edit2, Trash2, Copy, Music } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { EmailTemplateFormDialog } from './EmailTemplateFormDialog';

const categories = [
  { value: 'general', label: 'Général' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'reservation', label: 'Réservation' },
  { value: 'suivi', label: 'Suivi' },
  { value: 'confirmation', label: 'Confirmation' }
];

const emptyForm = {
  name: '', subject: '', content: '', category: 'general',
  variables: [] as string[],
  attachments: [] as Array<{ name: string; url: string; size: number }>,
  artist_id: null as string | null,
};

export const EmailTemplateManager: React.FC = () => {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } = useEmailTemplates();
  const { user } = useAuth();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [addingFromMediaBank, setAddingFromMediaBank] = useState(false);
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const confirmAction = useConfirm();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('centralized_artists')
          .select('id, name')
          .eq('status', 'active')
          .order('name');
        if (error) throw error;
        setArtists(data || []);
      } catch (e) { logger.error('Error loading artists', e); }
    })();
  }, [user]);

  const artistMap = useMemo(() => Object.fromEntries(artists.map(a => [a.id, a.name])), [artists]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterArtist === 'all') return true;
      if (filterArtist === 'none') return !t.artist_id;
      return t.artist_id === filterArtist;
    });
  }, [templates, filterArtist, filterCategory]);

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
    setFormData({
      name: t.name, subject: t.subject, content: t.content, category: t.category,
      variables: t.variables, attachments: t.attachments || [], artist_id: t.artist_id ?? null,
    });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-2xl font-bold">Modèles d'email</h2>
        <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 mr-2" />Nouveau modèle</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={filterArtist} onValueChange={setFilterArtist}>
          <SelectTrigger className="sm:w-64"><SelectValue placeholder="Filtrer par artiste" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les artistes</SelectItem>
            <SelectItem value="none">Sans artiste</SelectItem>
            {artists.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="sm:w-56"><SelectValue placeholder="Filtrer par catégorie" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-muted-foreground">Chargement...</p> : filteredTemplates.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucun modèle</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map(t => (
            <Card key={t.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg">{t.name}</CardTitle>
                    <Badge variant="outline">{categories.find(c => c.value === t.category)?.label}</Badge>
                    {t.artist_id && artistMap[t.artist_id] && (
                      <Badge variant="secondary" className="gap-1"><Music className="h-3 w-3" />{artistMap[t.artist_id]}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => duplicateTemplate(t.id)} title="Dupliquer"><Copy className="h-4 w-4" /></Button>
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
        submitLabel="Créer" categories={categories} fileInputId="template-attachments" artists={artists} />

      <EmailTemplateFormDialog open={!!editingTemplate} onOpenChange={o => { if (!o) setEditingTemplate(null); }} title="Modifier le modèle"
        formData={formData} onFormDataChange={setFormData} attachmentFiles={attachmentFiles}
        onFileSelect={e => setAttachmentFiles(p => [...p, ...Array.from(e.target.files || [])])}
        onRemoveAttachment={i => setAttachmentFiles(p => p.filter((_, j) => j !== i))}
        onRemoveExistingAttachment={i => setFormData(p => ({ ...p, attachments: p.attachments.filter((_, j) => j !== i) }))}
        onMediaBankSelect={handleMediaBankSelect} addingFromMediaBank={addingFromMediaBank}
        uploading={uploading} onSubmit={handleUpdate} onCancel={() => { setEditingTemplate(null); resetForm(); }}
        submitLabel="Enregistrer" categories={categories} fileInputId="template-attachments-edit" showExistingAttachments artists={artists} />
    </div>
  );
};
