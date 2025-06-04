
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Edit, Trash2, Music, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventType {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  order: number;
  recommendedArtists: string[];
}

interface Artist {
  id: string;
  name: string;
  genre: string;
}

const sampleArtists: Artist[] = [
  { id: '1', name: 'The Midnight Express', genre: 'Rock' },
  { id: '2', name: 'Sarah Mitchell', genre: 'Folk/Acoustique' },
  { id: '3', name: 'Thunder Road', genre: 'Rock Classique' }
];

const initialEventTypes: EventType[] = [
  {
    id: '1',
    name: 'Festival',
    description: 'Grands événements musicaux en plein air',
    color: 'bg-purple-500',
    isActive: true,
    order: 1,
    recommendedArtists: ['1', '3']
  },
  {
    id: '2',
    name: 'Concert',
    description: 'Concerts en salle',
    color: 'bg-blue-500',
    isActive: true,
    order: 2,
    recommendedArtists: ['1', '2', '3']
  },
  {
    id: '3',
    name: 'Événement d\'entreprise',
    description: 'Événements corporatifs',
    color: 'bg-green-500',
    isActive: true,
    order: 3,
    recommendedArtists: ['2']
  },
  {
    id: '4',
    name: 'Événement privé',
    description: 'Fêtes privées',
    color: 'bg-orange-500',
    isActive: true,
    order: 4,
    recommendedArtists: ['2']
  },
  {
    id: '5',
    name: 'Mariage',
    description: 'Cérémonies de mariage',
    color: 'bg-pink-500',
    isActive: true,
    order: 5,
    recommendedArtists: ['2']
  }
];

export const EventTypes: React.FC = () => {
  const navigate = useNavigate();
  const [eventTypes, setEventTypes] = useState<EventType[]>(initialEventTypes);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState<EventType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-purple-500',
    recommendedArtists: [] as string[]
  });

  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 
    'bg-pink-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'
  ];

  const handleCreateType = () => {
    if (!formData.name) {
      alert('Le nom est obligatoire');
      return;
    }

    const newType: EventType = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      color: formData.color,
      isActive: true,
      order: eventTypes.length + 1,
      recommendedArtists: formData.recommendedArtists
    };

    if (editingType) {
      setEventTypes(prev => prev.map(type => 
        type.id === editingType.id ? { ...newType, id: editingType.id, order: editingType.order } : type
      ));
    } else {
      setEventTypes(prev => [...prev, newType]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: 'bg-purple-500',
      recommendedArtists: []
    });
    setShowCreateForm(false);
    setEditingType(null);
  };

  const handleEdit = (type: EventType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description,
      color: type.color,
      recommendedArtists: type.recommendedArtists
    });
    setShowCreateForm(true);
  };

  const handleDelete = (typeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type d\'événement ?')) {
      setEventTypes(prev => prev.filter(type => type.id !== typeId));
    }
  };

  const toggleActive = (typeId: string) => {
    setEventTypes(prev => prev.map(type => 
      type.id === typeId ? { ...type, isActive: !type.isActive } : type
    ));
  };

  const moveType = (typeId: string, direction: 'up' | 'down') => {
    setEventTypes(prev => {
      const types = [...prev];
      const index = types.findIndex(t => t.id === typeId);
      if (index === -1) return prev;

      if (direction === 'up' && index > 0) {
        [types[index], types[index - 1]] = [types[index - 1], types[index]];
      } else if (direction === 'down' && index < types.length - 1) {
        [types[index], types[index + 1]] = [types[index + 1], types[index]];
      }

      return types.map((type, i) => ({ ...type, order: i + 1 }));
    });
  };

  const handleArtistToggle = (artistId: string) => {
    setFormData(prev => ({
      ...prev,
      recommendedArtists: prev.recommendedArtists.includes(artistId)
        ? prev.recommendedArtists.filter(id => id !== artistId)
        : [...prev.recommendedArtists, artistId]
    }));
  };

  const getArtistName = (artistId: string) => {
    return sampleArtists.find(a => a.id === artistId)?.name || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Types d'Événements</h1>
          <p className="text-gray-600 mt-2">Gérer les types d'événements et les artistes recommandés</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/events')}>
            <Calendar className="h-4 w-4 mr-2" />
            Retour aux Événements
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Type
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.sort((a, b) => a.order - b.order).map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${type.color}`}></div>
                  <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveType(type.id, 'up')}
                    disabled={type.order === 1}
                    className="p-1 h-6 w-6"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveType(type.id, 'down')}
                    disabled={type.order === eventTypes.length}
                    className="p-1 h-6 w-6"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{type.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Statut:</span>
                  <Badge 
                    variant={type.isActive ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => toggleActive(type.id)}
                  >
                    {type.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Artistes recommandés:</span>
                  <div className="space-y-1">
                    {type.recommendedArtists.length > 0 ? (
                      type.recommendedArtists.map(artistId => (
                        <div key={artistId} className="flex items-center space-x-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm text-gray-600">{getArtistName(artistId)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Aucun artiste recommandé</span>
                    )}
                  </div>
                </div>
              </div>

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
      {showCreateForm && (
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
                      className={`w-full h-10 rounded-md ${color} ${
                        formData.color === color ? 'ring-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Artistes recommandés</label>
                <div className="space-y-2">
                  {sampleArtists.map(artist => (
                    <label key={artist.id} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.recommendedArtists.includes(artist.id)}
                        onChange={() => handleArtistToggle(artist.id)}
                        className="rounded"
                      />
                      <Music className="h-4 w-4 text-purple-600" />
                      <div>
                        <span className="font-medium">{artist.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({artist.genre})</span>
                      </div>
                    </label>
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
