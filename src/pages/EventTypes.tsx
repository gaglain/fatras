
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface EventType {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
}

const sampleEventTypes: EventType[] = [
  { id: '1', name: 'Festival', description: 'Grands événements musicaux', color: 'bg-purple-500', isActive: true },
  { id: '2', name: 'Concert', description: 'Concerts en salle', color: 'bg-blue-500', isActive: true },
  { id: '3', name: 'Événement d\'entreprise', description: 'Événements corporatifs', color: 'bg-green-500', isActive: true },
  { id: '4', name: 'Événement privé', description: 'Fêtes privées', color: 'bg-orange-500', isActive: true },
  { id: '5', name: 'Mariage', description: 'Cérémonies de mariage', color: 'bg-pink-500', isActive: true },
];

export const EventTypes: React.FC = () => {
  const [eventTypes, setEventTypes] = useState<EventType[]>(sampleEventTypes);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState<EventType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-purple-500'
  });

  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500'
  ];

  const handleSubmit = () => {
    if (editingType) {
      setEventTypes(prev => prev.map(type => 
        type.id === editingType.id 
          ? { ...type, ...formData }
          : type
      ));
    } else {
      const newType: EventType = {
        id: Date.now().toString(),
        ...formData,
        isActive: true
      };
      setEventTypes(prev => [...prev, newType]);
    }
    
    setFormData({ name: '', description: '', color: 'bg-purple-500' });
    setShowAddForm(false);
    setEditingType(null);
  };

  const handleEdit = (type: EventType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      color: type.color
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setEventTypes(prev => prev.filter(type => type.id !== id));
  };

  const toggleActive = (id: string) => {
    setEventTypes(prev => prev.map(type => 
      type.id === id ? { ...type, isActive: !type.isActive } : type
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Types d'Événements</h1>
          <p className="text-gray-600 mt-2">Gérer les catégories d'événements disponibles</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-6 h-6 rounded-full ${type.color}`}></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{type.name}</h3>
                  {type.description && (
                    <p className="text-sm text-gray-600">{type.description}</p>
                  )}
                </div>
                <Badge className={type.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {type.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(type)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Modifier
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => toggleActive(type.id)}
                  className={type.isActive ? 'text-orange-600' : 'text-green-600'}
                >
                  {type.isActive ? 'Désactiver' : 'Activer'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDelete(type.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingType ? 'Modifier' : 'Ajouter'} Type d'Événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du type *</label>
                <Input 
                  placeholder="Nom du type d'événement"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input 
                  placeholder="Description (optionnel)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Couleur</label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full ${color} border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingType(null);
                    setFormData({ name: '', description: '', color: 'bg-purple-500' });
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingType ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
