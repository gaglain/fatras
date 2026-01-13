import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Image, Link, MessageSquare, CheckCircle, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { PublicationFormMultiPlatform } from '@/components/PublicationFormMultiPlatform';
import { useCentralizedData, Publication, PublicationComment } from '@/contexts/CentralizedDataContext';
import { supabase } from '@/integrations/supabase/client';

const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' }
];

// On va chercher les vrais utilisateurs depuis useUserManagement
import { useUserManagement } from '@/hooks/useUserManagement';

export const PublicationCalendar: React.FC = () => {
  const { currentUser } = useUser();
  const { users, fetchUsers } = useUserManagement();
  const { publications, addPublication, updatePublication, deletePublication } = useCentralizedData();
  const [showForm, setShowForm] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [realPublications, setRealPublications] = useState<Publication[]>([]);

  // Charger les utilisateurs au démarrage
  useEffect(() => {
    fetchUsers();
  }, []);

  // Charger les données sauvegardées au démarrage
  const loadSavedFormData = () => {
    const saved = localStorage.getItem('publication_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erreur lors du chargement du brouillon:', e);
      }
    }
    return {
      title: '',
      content: '',
      scheduled_date: '',
      platforms: [] as string[],
      assigned_to: '',
      media_url: '',
      media_type: 'image' as 'image' | 'video',
      external_link: ''
    };
  };

  const [formData, setFormData] = useState(loadSavedFormData);

  // Sauvegarder automatiquement les modifications
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.content) {
        localStorage.setItem('publication_draft', JSON.stringify(formData));
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData]);

  // Charger les publications depuis Supabase
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchPublications = async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des publications:', error);
      } else {
        const formattedPublications: Publication[] = data.map(pub => ({
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
          created_by: pub.created_by || currentUser.id,
          user_id: pub.user_id,
          created_at: pub.created_at,
          updated_at: pub.updated_at,
          comments: [] // Les commentaires seront chargés séparément
        }));
        setRealPublications(formattedPublications);
      }
    };

    fetchPublications();
  }, [currentUser]);

  const handleFormSubmit = async (formData: any) => {
    if (!currentUser) {
      toast.error('Utilisateur non connecté');
      return;
    }

    setIsLoading(true);

    try {
      const assignedProfile = users.find(p => p.user_id === formData.assigned_to);

      // Créer une publication pour chaque plateforme sélectionnée
      const platforms = formData.platforms || [];
      
      if (platforms.length === 0) {
        toast.error('Veuillez sélectionner au moins une plateforme');
        setIsLoading(false);
        return;
      }

      const publicationPromises = platforms.map((platform: string) => {
        const publicationData = {
          title: formData.title,
          content: formData.content,
          scheduled_date: formData.scheduled_date,
          platform: platform,
          assigned_to: formData.assigned_to || null,
          assigned_username: assignedProfile?.username || '',
          media_url: formData.media_url || '',
          media_type: formData.media_type || 'image' as const,
          external_link: formData.external_link || '',
          status: editingPublication?.status || 'draft' as const,
          created_by: currentUser.id,
          user_id: currentUser.id,
          artist_id: formData.artist_id || null,
          event_id: formData.event_id || null,
        };

        if (editingPublication) {
          return supabase
            .from('publications')
            .update(publicationData)
            .eq('id', editingPublication.id)
            .eq('user_id', currentUser.id);
        } else {
          return supabase
            .from('publications')
            .insert(publicationData);
        }
      });

      // Exécuter toutes les insertions/mises à jour
      const results = await Promise.all(publicationPromises);
      
      // Vérifier les erreurs
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw errors[0].error;
      }

      // Recharger les publications
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedPublications: Publication[] = data.map(pub => ({
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
          created_by: pub.created_by || currentUser.id,
          user_id: pub.user_id,
          created_at: pub.created_at,
          updated_at: pub.updated_at,
          comments: []
        }));
        setRealPublications(formattedPublications);
      }

      toast.success(editingPublication 
        ? 'Publication modifiée avec succès' 
        : `${platforms.length} publication(s) créée(s) avec succès`
      );

      // Effacer le brouillon après création réussie
      localStorage.removeItem('publication_draft');
      
      setEditingPublication(null);
      setShowForm(false);
      setFormData(loadSavedFormData());
    } catch (error: unknown) {
      console.error('Erreur lors de la sauvegarde de la publication:', error);
      toast.error('Erreur lors de la sauvegarde de la publication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      try {
        const { error } = await supabase
          .from('publications')
          .delete()
          .eq('id', id)
          .eq('user_id', currentUser?.id);

        if (error) throw error;

        setRealPublications(prev => prev.filter(pub => pub.id !== id));
        toast.success('Publication supprimée');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const changeStatus = async (id: string, newStatus: Publication['status']) => {
    try {
      const { error } = await supabase
        .from('publications')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', currentUser?.id);

      if (error) throw error;

      setRealPublications(prev => prev.map(pub => 
        pub.id === id ? { ...pub, status: newStatus } : pub
      ));
      toast.success('Statut mis à jour');
    } catch (error: unknown) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const addComment = (publicationId: string) => {
    if (!newComment.trim() || !currentUser) return;

    const comment: PublicationComment = {
      id: `comment-${Date.now()}`,
      publication_id: publicationId,
      user_id: currentUser.id,
      username: currentUser.name || 'Utilisateur',
      comment: newComment.trim(),
      created_at: new Date().toISOString()
    };

    const publication = realPublications.find(p => p.id === publicationId);
    if (publication) {
      setRealPublications(prev => prev.map(pub => 
        pub.id === publicationId 
          ? { ...pub, comments: [...pub.comments, comment] }
          : pub
      ));
      setNewComment('');
      toast.success('Commentaire ajouté');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'scheduled': return 'Programmé';
      case 'published': return 'Publié';
      case 'pending_approval': return 'En attente';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendrier de Publication</h1>
          <p className="text-muted-foreground mt-2">Planifiez et gérez vos publications sur les réseaux sociaux ({realPublications.length} publications)</p>
        </div>
        <Button 
          onClick={() => {
            setEditingPublication(null);
            setShowForm(true);
          }} 
          className="bg-purple-600 hover:bg-purple-700 w-full lg:w-auto"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouvelle publication</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realPublications.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
            <p className="text-gray-500 mb-4">Créez votre première publication pour commencer</p>
            <Button 
              onClick={() => {
                setEditingPublication(null);
                setShowForm(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une publication
            </Button>
          </div>
        ) : (
          realPublications.map((publication) => (
            <Card key={publication.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{publication.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {platforms.find(p => p.value === publication.platform)?.label}
                    </p>
                  </div>
                  <Badge className={getStatusColor(publication.status)}>
                    {getStatusLabel(publication.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-3">{publication.content}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(publication.scheduled_date).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(publication.scheduled_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  {publication.assigned_username && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Assigné à @{publication.assigned_username}
                    </div>
                  )}

                  {publication.media_url && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Image className="h-4 w-4 mr-2" />
                      Média joint
                    </div>
                  )}

                  {publication.external_link && (
                    <div className="flex items-center text-sm text-blue-600">
                      <Link className="h-4 w-4 mr-2" />
                      Lien externe
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 pt-2 border-t">
                  {/* Status change buttons - visible on mobile */}
                  <div className="flex flex-wrap gap-1 md:hidden">
                    <Button
                      variant={publication.status === 'draft' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => changeStatus(publication.id, 'draft')}
                    >
                      Brouillon
                    </Button>
                    <Button
                      variant={publication.status === 'scheduled' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => changeStatus(publication.id, 'scheduled')}
                    >
                      Programmé
                    </Button>
                    <Button
                      variant={publication.status === 'published' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => changeStatus(publication.id, 'published')}
                    >
                      Publié
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowComments(showComments === publication.id ? null : publication.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{publication.comments.length}</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Desktop status buttons */}
                      {publication.status === 'pending_approval' && (
                        <div className="hidden md:flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => changeStatus(publication.id, 'scheduled')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => changeStatus(publication.id, 'draft')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(publication)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(publication.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments === publication.id && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {publication.comments.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <div className="font-medium">@{comment.username}</div>
                          <div className="text-muted-foreground">{comment.comment}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && addComment(publication.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => addComment(publication.id)}
                        disabled={!newComment.trim()}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Publication Form */}
      <PublicationFormMultiPlatform
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPublication(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingPublication ? {
          title: editingPublication.title,
          content: editingPublication.content,
          scheduled_date: editingPublication.scheduled_date ? new Date(editingPublication.scheduled_date).toISOString().slice(0, 16) : '',
          platforms: editingPublication.platform ? [editingPublication.platform] : [],
          assigned_to: editingPublication.assigned_to || '',
          media_url: editingPublication.media_url || '',
          media_type: editingPublication.media_type || 'image',
          external_link: editingPublication.external_link || '',
          artist_id: (editingPublication as any).artist_id,
          event_id: (editingPublication as any).event_id
        } : formData}
        userProfiles={users.map(u => ({ 
          user_id: u.user_id, 
          username: u.username || u.email, 
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          role: u.role || 'user'
        }))}
        isEditing={!!editingPublication}
      />
    </div>
  );
};
