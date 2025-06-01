
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Eye, EyeOff } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  visible: boolean;
  order: number;
}

const defaultMenuItems: MenuItem[] = [
  { id: '1', label: 'Tableau de bord', href: '/', icon: 'LayoutDashboard', visible: true, order: 1 },
  { id: '2', label: 'Contacts', href: '/contacts', icon: 'Users', visible: true, order: 2 },
  { id: '3', label: 'Événements', href: '/events', icon: 'Calendar', visible: true, order: 3 },
  { id: '4', label: 'Types d\'événements', href: '/event-types', icon: 'Settings', visible: true, order: 4 },
  { id: '5', label: 'Artistes', href: '/artists', icon: 'Music', visible: true, order: 5 },
  { id: '6', label: 'Opportunités', href: '/opportunities', icon: 'FileText', visible: true, order: 6 },
  { id: '7', label: 'Contrats', href: '/contracts', icon: 'FileText', visible: true, order: 7 },
  { id: '8', label: 'Email', href: '/email', icon: 'Mail', visible: true, order: 8 },
  { id: '9', label: 'Campagnes Email', href: '/email-campaigns', icon: 'Mail', visible: true, order: 9 },
  { id: '10', label: 'Tâches', href: '/tasks', icon: 'CheckSquare', visible: true, order: 10 },
  { id: '11', label: 'Messagerie', href: '/messagerie', icon: 'Mail', visible: true, order: 11 },
  { id: '12', label: 'Agenda', href: '/agenda', icon: 'Calendar', visible: true, order: 12 },
  { id: '13', label: 'Bible du Spectacle', href: '/show-bible', icon: 'BookOpen', visible: true, order: 13 },
  { id: '14', label: 'Tournée', href: '/roadshow', icon: 'MapPin', visible: true, order: 14 },
  { id: '15', label: 'Boutique', href: '/merchandise', icon: 'ShoppingBag', visible: true, order: 15 },
  { id: '16', label: 'Site Web', href: '/website', icon: 'Globe', visible: true, order: 16 },
  { id: '17', label: 'Préférences', href: '/preferences', icon: 'Settings', visible: true, order: 17 },
];

export const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(menuItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setMenuItems(updatedItems);
  };

  const toggleVisibility = (id: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const updateLabel = (id: string, newLabel: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, label: newLabel } : item
      )
    );
  };

  const saveConfiguration = () => {
    localStorage.setItem('menuConfiguration', JSON.stringify(menuItems));
    alert('Configuration du menu sauvegardée !');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion du Menu Latéral</CardTitle>
        <p className="text-sm text-gray-600">
          Réorganisez et configurez les éléments du menu selon vos préférences.
        </p>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menuItems">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {menuItems
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border"
                        >
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <Switch
                            checked={item.visible}
                            onCheckedChange={() => toggleVisibility(item.id)}
                          />
                          
                          {item.visible ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          
                          <Input
                            value={item.label}
                            onChange={(e) => updateLabel(item.id, e.target.value)}
                            className="flex-1"
                          />
                          
                          <span className="text-xs text-gray-500">#{item.order}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <div className="mt-6">
          <Button onClick={saveConfiguration} className="w-full">
            Sauvegarder la Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
