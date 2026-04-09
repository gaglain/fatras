import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { PublicationFormMultiPlatform } from '@/components/PublicationFormMultiPlatform';
import { Publication, PublicationComment } from '@/contexts/CentralizedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserManagement } from '@/hooks/useUserManagement';
import { PublicationCard } from './publication-calendar/PublicationCard';

const formatPublication = (pub: any, userId: string): Publication => ({
  id: pub.id,
  title: pub.title,
  content: pub.content,
  scheduled_date: pub.scheduled_date,
  platform: pub.platform,
  assigned_to: pub.assigned_to || '',
  assigned_username: pub.assigned_username || '',
  media_url: pub.media_url || '',
  media_type: (pub.media_type === 'gif' ? 'image' : pub.media_type) as 'image' | 'video',
  external_link: pub.external_link || '',
  status: pub.status as 'draft' | 'scheduled' | 'published' | 'pending_approval',
  created_by: pub.created_by || userId,
  user_id: pub.user_id,
  created_at: pub.created_at,
  updated_at: pub.updated_at,
  comments: []
});

export const PublicationCalendar: React.FC = () => {
  const { currentUser } = useUser();
  const { users, fetchUsers } = useUserManagement();
  const [showForm, setShowForm] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realPublications, setRealPublications] = useState<Publication[]>([]);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchPublications = async () => {
      const { data, error } = await supabase.from('publications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (!error && data) setRealPublications(data.map(pub => formatPublication(pub, currentUser.id)));
    };
    fetchPublications();
  }, [currentUser]);

  const loadSavedFormData = () => {
    const saved = localStorage.getItem('publication_draft');
    if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    return { title: '', content: '', scheduled_date: '', platforms: [] as string[], assigned_to: '', media_url: '', media_type: 'image' as const, external_link: '' };
  };

  const [formData, setFormData] = useState(loadSavedFormData);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.content) localStorage.setItem('publication_draft', JSON.stringify(formData));
    }, 500);
    return () => clearTimeout(timer);
  }, [formData]);

  const handleFormSubmit = async (formData: any) => {
    if (!currentUser) { toast.error('Utilisateur non connecté'); return; }
    setIsLoading(true);
    try {
      const assignedProfile = users.find(p => p.user_id === formData.assigned_to);
      const platforms = formData.platforms || [];
      if (platforms.length === 0) { toast.error('Veuillez sélectionner au moins une plateforme'); setIsLoading(false); return; }

      const results = await Promise.all(platforms.map((platform: string) => {
        const data = {
          title: formData.title, content: formData.content, scheduled_date: formData.scheduled_date, platform,
          assigned_to: formData.assigned_to || null, assigned_username: assignedProfile?.username || '',
          media_url: formData.media_url || '', media_type: formData.media_type || 'image' as const,
          external_link: formData.external_link || '', status: editingPublication?.status || 'draft' as const,
          created_by: currentUser.id, user_id: currentUser.id, artist_id: formData.artist_id || null, event_id: formData.event_id || null,
        };
        return editingPublication
          ? supabase.from('publications').update(data).eq('id', editingPublication.id).eq('user_id', currentUser.id)
          : supabase.from('publications').insert(data);
      }));

      if (results.some(r => r.error)) throw results.find(r => r.error)!.error;

      const { data } = await supabase.from('publications').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (data) setRealPublications(data.map(pub => formatPublication(pub, currentUser.id)));

      toast.success(editingPublication ? 'Publication modifiée avec succès' : `${platforms.length} publication(s) créée(s) avec succès`);
      localStorage.removeItem('publication_draft');
      setEditingPublication(null);
      setShowForm(false);
      setFormData(loadSavedFormData());
    } catch { toast.error('Erreur lors de la sauvegarde de la publication'); } finally { setIsLoading(false); }
  };

  const confirmAction = useConfirm();
  const handleDelete = async (id: string) => {
    const ok = await confirmAction({ title: 'Supprimer', description: 'Êtes-vous sûr de vouloir supprimer cette publication ?', variant: 'destructive' });
    if (!ok) return;
    try {
      const { error } = await supabase.from('publications').delete().eq('id', id).eq('user_id', currentUser?.id);
      if (error) throw error;
      setRealPublications(prev => prev.filter(pub => pub.id !== id));
      toast.success('Publication supprimée');
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const changeStatus = async (id: string, newStatus: Publication['status']) => {
    try {
      const { error } = await supabase.from('publications').update({ status: newStatus }).eq('id', id).eq('user_id', currentUser?.id);
      if (error) throw error;
      setRealPublications(prev => prev.map(pub => pub.id === id ? { ...pub, status: newStatus } : pub));
      toast.success('Statut mis à jour');
    } catch { toast.error('Erreur lors de la mise à jour'); }
  };

  const addComment = (publicationId: string, commentText: string) => {
    if (!currentUser) return;
    const comment: PublicationComment = { id: `comment-${Date.now()}`, publication_id: publicationId, user_id: currentUser.id, username: currentUser.name || 'Utilisateur', comment: commentText, created_at: new Date().toISOString() };
    setRealPublications(prev => prev.map(pub => pub.id === publicationId ? { ...pub, comments: [...pub.comments, comment] } : pub));
    toast.success('Commentaire ajouté');
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendrier de Publication</h1>
          <p className="text-muted-foreground mt-2">Planifiez et gérez vos publications sur les réseaux sociaux ({realPublications.length} publications)</p>
        </div>
        <Button onClick={() => { setEditingPublication(null); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700 w-full lg:w-auto" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouvelle publication</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realPublications.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
            <p className="text-gray-500 mb-4">Créez votre première publication pour commencer</p>
            <Button onClick={() => { setEditingPublication(null); setShowForm(true); }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />Créer une publication
            </Button>
          </div>
        ) : (
          realPublications.map((publication) => (
            <PublicationCard
              key={publication.id}
              publication={publication}
              showComments={showComments}
              onToggleComments={setShowComments}
              onEdit={(pub) => { setEditingPublication(pub); setShowForm(true); }}
              onDelete={handleDelete}
              onChangeStatus={changeStatus}
              onAddComment={addComment}
            />
          ))
        )}
      </div>

      <PublicationFormMultiPlatform
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingPublication(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingPublication ? {
          title: editingPublication.title, content: editingPublication.content,
          scheduled_date: editingPublication.scheduled_date ? new Date(editingPublication.scheduled_date).toISOString().slice(0, 16) : '',
          platforms: editingPublication.platform ? [editingPublication.platform] : [],
          assigned_to: editingPublication.assigned_to || '', media_url: editingPublication.media_url || '',
          media_type: editingPublication.media_type || 'image', external_link: editingPublication.external_link || '',
          artist_id: (editingPublication as any).artist_id, event_id: (editingPublication as any).event_id
        } : formData}
        userProfiles={users.map(u => ({ user_id: u.user_id, username: u.username || u.email, first_name: u.first_name || '', last_name: u.last_name || '', role: u.role || 'user' }))}
        isEditing={!!editingPublication}
      />
    </div>
  );
};
