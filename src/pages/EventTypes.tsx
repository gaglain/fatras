import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Edit, Trash2, Music, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtists } from '@/hooks/useArtists';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EventType {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export const EventTypes: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { artists } = useArtists();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<EventType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // Charger les types d'événements depuis Supabase
  useEffect(() => {
    if (!user) return;

    const fetchEventTypes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data && !error) {
        setEventTypes(data);
      }
      setLoading(false);
    };

    fetchEventTypes();
  }, [user]);

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleCreateType = async () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }

    if (!user) return;

    if (editingType) {
      // Modifier un type existant
      const { data, error } = await supabase
        .from('event_types')
        .update({
          name: formData.name,
          description: formData.description,
          color: formData.color
        })
        .eq('id', editingType.id)
        .select()
        .single();

      if (data && !error) {
        setEventTypes(prev => prev.map(type => 
          type.id === editingType.id ? data : type
        ));
        toast.success('Type d\'événement modifié avec succès');
      }
    } else {
      // Créer un nouveau type
      const { data, error } = await supabase
        .from('event_types')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          color: formData.color
        })
        .select()
        .single();

      if (data && !error) {
        setEventTypes(prev => [...prev, data]);
        toast.success('Type d\'événement créé avec succès');
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setIsFormOpen(false);
    setEditingType(null);
  };

  const handleEdit = (type: EventType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      color: type.color
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (typeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type d\'événement ?')) {
      const { error } = await supabase
        .from('event_types')
        .delete()
        .eq('id', typeId);

      if (!error) {
        setEventTypes(prev => prev.filter(type => type.id !== typeId));
        toast.success('Type d\'événement supprimé');
      }
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Types d'Événements</h1>
          <p className="text-gray-600 mt-2">Gérer les types d'événements pour votre organisation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/events')}>
            <Calendar className="h-4 w-4 mr-2" />
            Retour aux Événements
          </Button>
          <Button onClick={() => setIsFormOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Type
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{type.description}</p>

              <div className="flex space-x-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => handleEdit(type)} className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(type.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingType ? 'Modifier le Type' : 'Ajouter un Type d\'Événement'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Nom du type d'événement *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <textarea
                className="w-full p-3 border rounded-md min-h-24"
                placeholder="Description du type d'événement"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />

              <div>
                <label className="block text-sm font-medium mb-2">Couleur</label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-full h-10 rounded-md ${
                        formData.color === color ? 'ring-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleCreateType} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  {editingType ? 'Modifier' : 'Créer'} le Type
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};