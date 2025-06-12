
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Eye, EyeOff, Upload, Edit } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  visible: boolean;
  order: number;
  userRole?: string[];
  items?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { id: '1', label: 'Tableau de bord', href: '/dashboard', icon: 'Home', visible: true, order: 1, userRole: ['admin', 'manager', 'user'] },
  { 
    id: '2', 
    label: 'Contacts', 
    href: '/contacts', 
    icon: 'Users', 
    visible: true, 
    order: 2, 
    userRole: ['admin', 'manager'],
    items: [
      { id: '2a', label: 'Tous les contacts', href: '/contacts', icon: 'Users', visible: true, order: 1 },
      { id: '2b', label: 'Listes de contacts', href: '/contact-lists', icon: 'List', visible: true, order: 2 }
    ]
  },
  { id: '3', label: 'Artistes', href: '/artists', icon: 'Music', visible: true, order: 3, userRole: ['admin', 'manager'] },
  { 
    id: '4', 
    label: 'Événements', 
    href: '/events', 
    icon: 'Calendar', 
    visible: true, 
    order: 4, 
    userRole: ['admin', 'manager'],
    items: [
      { id: '4a', label: 'Tous les événements', href: '/events', icon: 'Calendar', visible: true, order: 1 },
      { id: '4b', label: 'Types d\'événements', href: '/event-types', icon: 'Settings', visible: true, order: 2 }
    ]
  },
  { id: '5', label: 'Tâches', href: '/tasks', icon: 'CheckSquare', visible: true, order: 5, userRole: ['admin', 'manager', 'user'] },
  { id: '6', label: 'Contrats', href: '/contracts', icon: 'FileText', visible: true, order: 6, userRole: ['admin', 'manager'] },
  { 
    id: '7', 
    label: 'Communication', 
    href: '/email', 
    icon: 'Mail', 
    visible: true, 
    order: 7, 
    userRole: ['admin', 'manager'],
    items: [
      { id: '7a', label: 'Emails', href: '/email', icon: 'Mail', visible: true, order: 1 },
      { id: '7b', label: 'Campagnes', href: '/email-campaigns', icon: 'MailOpen', visible: true, order: 2 },
      { id: '7c', label: 'Messagerie', href: '/messagerie', icon: 'MessageSquare', visible: true, order: 3 },
      { id: '7d', label: 'Formulaires', href: '/forms', icon: 'FileText', visible: true, order: 4 }
    ]
  },
  { id: '8', label: 'Agenda', href: '/agenda', icon: 'Clock', visible: true, order: 8, userRole: ['admin', 'manager', 'user'] },
  { id: '9', label: 'Show Bible', href: '/show-bible', icon: 'Book', visible: true, order: 9, userRole: ['admin', 'manager'] },
  { id: '10', label: 'Feuille de route', href: '/road-show', icon: 'MapPin', visible: true, order: 10, userRole: ['admin', 'manager'] },
  { id: '11', label: 'Merchandising', href: '/merchandise', icon: 'ShoppingBag', visible: true, order: 11, userRole: ['admin', 'manager'] },
  { id: '12', label: 'Opportunités', href: '/opportunities', icon: 'Target', visible: true, order: 12, userRole: ['admin', 'manager'] },
  { id: '13', label: 'Site Web', href: '/website', icon: 'Globe', visible: true, order: 13, userRole: ['admin'] },
  { id: '14', label: 'Préférences', href: '/preferences', icon: 'Settings', visible: true, order: 14, userRole: ['admin', 'manager', 'user'] }
];

const userRoles = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'Utilisateur' }
];

export const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [selectedUserRole, setSelectedUserRole] = useState<string>('admin');
  const [companyName, setCompanyName] = useState('MusicCRM');
  const [companyLogo, setCompanyLogo] = useState<string>('');

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

  const updateUserRole = (id: string, roles: string[]) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, userRole: roles } : item
      )
    );
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCompanyLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveConfiguration = () => {
    const config = {
      menuItems,
      companyName,
      companyLogo
    };
    localStorage.setItem('menuConfiguration', JSON.stringify(config));
    alert('Configuration du menu sauvegardée !');
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.userRole || item.userRole.includes(selectedUserRole)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Nom de l'entreprise</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="MusicCRM"
            />
          </div>
          
          <div>
            <Label htmlFor="companyLogo">Logo de l'entreprise</Label>
            <div className="flex items-center space-x-4 mt-2">
              {companyLogo && (
                <img src={companyLogo} alt="Logo" className="h-12 w-12 object-contain rounded" />
              )}
              <div>
                <Input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('companyLogo')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir un logo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gestion du Menu par Rôle Utilisateur</CardTitle>
          <div className="flex items-center space-x-4">
            <Label>Aperçu pour le rôle :</Label>
            <Select value={selectedUserRole} onValueChange={setSelectedUserRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {userRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menuItems">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {filteredMenuItems
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border"
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            
                            <Switch
                              checked={item.visible}
                              onCheckedChange={() => toggleVisibility(item.id)}
                            />
                            
                            {item.visible ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            
                            <Input
                              value={item.label}
                              onChange={(e) => updateLabel(item.id, e.target.value)}
                              className="flex-1"
                            />
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">#{item.order}</span>
                              {item.items && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {item.items.length} sous-éléments
                                </span>
                              )}
                            </div>
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
    </div>
  );
};
