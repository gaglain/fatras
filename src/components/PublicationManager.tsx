import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

interface Publication {
  id: string;
  title: string;
  content: string;
  scheduled_date: string;
  platform: string;
  status: string;
  user_id: string;
  created_at: string;
}

export const PublicationManager: React.FC = () => {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPublications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des publications:', error);
      toast.error('Erreur lors du chargement des publications');
    } finally {
      setLoading(false);
    }
  };

  const createPublication = async (publicationData: Partial<Publication>) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const { error } = await supabase
        .from('publications')
        .insert({
          ...publicationData,
          user_id: user.id
        });

      if (error) throw error;
      toast.success('Publication créée');
      fetchPublications();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la publication');
    }
  };

  const deletePublication = async (id: string) => {
    if (!user) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return;

    try {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Publication supprimée');
      fetchPublications();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>
          <p className="text-muted-foreground">Gérez vos publications sur les réseaux sociaux</p>
        </div>
        <Button onClick={() => console.log('Créer une publication')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle publication
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : publications.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
          <p className="text-gray-500 mb-4">Créez votre première publication</p>
          <Button onClick={() => console.log('Créer une publication')}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une publication
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((publication) => (
            <Card key={publication.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{publication.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{publication.platform}</p>
                  </div>
                  <Badge variant="secondary">{publication.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3 mb-4">{publication.content}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(publication.scheduled_date).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePublication(publication.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};