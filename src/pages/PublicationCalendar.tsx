
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Edit, Trash2, Image, Link, MessageSquare, CheckCircle, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { PublicationForm } from '@/components/PublicationForm';

interface Publication {
  id: string;
  title: string;
  content: string;
  scheduled_date: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'pending_approval';
  assigned_to?: string;
  assigned_username?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  external_link?: string;
  comments: PublicationComment[];
  created_by: string;
  created_at: string;
}

interface PublicationComment {
  id: string;
  user_id: string;
  username: string;
  comment: string;
  created_at: string;
}

const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' }
];

export const PublicationCalendar: React.FC = () => {
  const { currentUser } = useUser();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadPublications();
    loadUserProfiles();
  }, []);

  const loadUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, first_name, last_name, role')
        .order('username');

      if (error) {
        console.error('Erreur Supabase:', error);
        // Fallback avec des données d'exemple
        setUserProfiles([
          { user_id: 'user1', username: 'admin', first_name: 'Admin', last_name: 'User', role: 'admin' },
          { user_id: 'user2', username: 'editor', first_name: 'Editor', last_name: 'User', role: 'editor' }
        ]);
      } else {
        setUserProfiles(data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error);
      // Fallback avec des données d'exemple
      setUserProfiles([
        { user_id: 'user1', username: 'admin', first_name: 'Admin', last_name: 'User', role: 'admin' },
        { user_id: 'user2', username: 'editor', first_name: 'Editor', last_name: 'User', role: 'editor' }
      ]);
    }
  };

  const loadPublications = () => {
    const saved = localStorage.getItem('publications');
    if (saved) {
      try {
        setPublications(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur chargement publications:', error);
      }
    }
  };

  const savePublications = (newPublications: Publication[]) => {
    localStorage.setItem('publications', JSON.stringify(newPublications));
    setPublications(newPublications);
  };

  const handleFormSubmit = async (formData: any) => {
    if (!currentUser) return;

    console.log('Submitting publication with data:', formData);

    const assignedProfile = userProfiles.find(p => p.user_id === formData.assigned_to);

    const publication: Publication = {
      id: editingPublication?.id || `pub-${Date.now()}`,
      ...formData,
      assigned_username: assignedProfile?.username || '',
      status: editingPublication?.status || 'draft',
      comments: editingPublication?.comments || [],
      created_by: currentUser.id,
      created_at: editingPublication?.created_at || new Date().toISOString()
    };

    const updatedPublications = editingPublication
      ? publications.map(p => p.id === editingPublication.id ? publication : p)
      : [...publications, publication];

    savePublications(updatedPublications);

    if (formData.assigned_to && !editingPublication) {
      await sendNotificationToUser(formData.assigned_to, {
        type: 'publication_assigned',
        title: 'Nouvelle publication assignée',
        message: `Une publication "${formData.title}" vous a été assignée pour le ${new Date(formData.scheduled_date).toLocaleDateString('fr-FR')}`
      });
    }

    setEditingPublication(null);
    setShowForm(false);
    toast.success(editingPublication ? 'Publication modifiée' : 'Publication créée');
  };

  const sendNotificationToUser = async (userId: string, notification: any) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          ...notification,
          data: { publication_id: notification.title }
        }]);

      if (error) {
        console.error('Erreur notification Supabase:', error);
      } else {
        console.log('Notification envoyée via Supabase à:', userId);
      }
    } catch (error) {
      console.error('Erreur envoi notification:', error);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      const updated = publications.filter(p => p.id !== id);
      savePublications(updated);
      toast.success('Publication supprimée');
    }
  };

  const changeStatus = (id: string, newStatus: Publication['status']) => {
    const updated = publications.map(p => 
      p.id === id ? { ...p, status: newStatus } : p
    );
    savePublications(updated);
    toast.success('Statut mis à jour');
  };

  const addComment = (publicationId: string) => {
    if (!newComment.trim() || !currentUser) return;

    const comment: PublicationComment = {
      id: `comment-${Date.now()}`,
      user_id: currentUser.id,
      username: currentUser.name || 'Utilisateur',
      comment: newComment.trim(),
      created_at: new Date().toISOString()
    };

    const updated = publications.map(p => 
      p.id === publicationId 
        ? { ...p, comments: [...p.comments, comment] }
        : p
    );

    savePublications(updated);
    setNewComment('');
    toast.success('Commentaire ajouté');
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendrier de Publication</h1>
          <p className="text-muted-foreground mt-2">Planifiez et gérez vos publications sur les réseaux sociaux</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle publication
        </Button>
      </div>

      {/* Publications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publications.map((publication) => (
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

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(showComments === publication.id ? null : publication.id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {publication.comments.length}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1">
                  {publication.status === 'pending_approval' && (
                    <>
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
                    </>
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
        ))}
      </div>

      {/* Publication Form */}
      <PublicationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPublication(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingPublication || {}}
        userProfiles={userProfiles}
        isEditing={!!editingPublication}
      />
    </div>
  );
};
