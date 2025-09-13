
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Plus, Trash2, Eye, EyeOff, Save, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  order: number;
  target: '_self' | '_blank';
  isSystem?: boolean;
}

const defaultMenuItems: MenuItem[] = [
  { id: 'home', label: 'Accueil', url: '/front', visible: true, order: 1, target: '_self', isSystem: true },
  { id: 'artists', label: 'Artistes', url: '/front/artists', visible: true, order: 2, target: '_self', isSystem: true },
  { id: 'events', label: 'Événements', url: '/front/events', visible: true, order: 3, target: '_self', isSystem: true },
  { id: 'shop', label: 'Boutique', url: '/front/shop', visible: true, order: 4, target: '_self', isSystem: true },
  { id: 'contact', label: 'Contact', url: '/front/contact', visible: true, order: 5, target: '_self', isSystem: true }
];

export const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [newItem, setNewItem] = useState({
    label: '',
    url: '',
    target: '_self' as '_self' | '_blank'
  });

  useEffect(() => {
    const savedMenu = localStorage.getItem('websiteMenu') || localStorage.getItem('website_menu');
    if (savedMenu) {
      try {
        setMenuItems(JSON.parse(savedMenu));
      } catch (error) {
        console.error('Erreur chargement menu:', error);
        localStorage.setItem('websiteMenu', JSON.stringify(defaultMenuItems));
        localStorage.setItem('website_menu', JSON.stringify(defaultMenuItems));
      }
    } else {
      localStorage.setItem('websiteMenu', JSON.stringify(defaultMenuItems));
      localStorage.setItem('website_menu', JSON.stringify(defaultMenuItems));
    }
  }, []);

  const saveMenu = () => {
    const normalized = menuItems.map((item) => ({
      ...item,
      // Ensure both url and path exist for all consumers
      path: (item as any).path || item.url || '/',
      url: item.url || (item as any).path || '/',
      visible: item.visible ?? true,
      order: typeof item.order === 'number' ? item.order : 0,
      target: item.target || '_self',
    }));

    localStorage.setItem('websiteMenu', JSON.stringify(normalized));
    localStorage.setItem('website_menu', JSON.stringify(normalized)); // compat
    // Déclencher la synchronisation pour le front (nouveau + compat)
    window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: normalized }));
    window.dispatchEvent(new CustomEvent('menuUpdated', { detail: normalized }));
    toast.success('Menu sauvegardé avec succès');
  };
  useEffect(() => {
    saveMenu();
  }, [menuItems]);

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

  const updateItem = (id: string, field: keyof MenuItem, value: any) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addNewItem = () => {
    if (!newItem.label.trim() || !newItem.url.trim()) {
      toast.error('Le libellé et l\'URL sont requis');
      return;
    }

    const menuItem: MenuItem = {
      id: Date.now().toString(),
      label: newItem.label,
      url: newItem.url.startsWith('/') ? newItem.url : '/' + newItem.url,
      visible: true,
      order: menuItems.length + 1,
      target: newItem.target,
      isSystem: false
    };

    setMenuItems(prev => [...prev, menuItem]);
    setNewItem({ label: '', url: '', target: '_self' });
    toast.success('Élément ajouté au menu');
  };

  const removeItem = (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item?.isSystem) {
      toast.error('Impossible de supprimer un élément système');
      return;
    }

    if (confirm('Supprimer cet élément du menu ?')) {
      setMenuItems(items => items.filter(item => item.id !== id));
      toast.success('Élément supprimé');
    }
  };

  const visibleItems = menuItems.filter(item => item.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestionnaire de Menu</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gérez la navigation de votre site web
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aperçu du menu */}
          <div>
            <h3 className="font-medium mb-3">Aperçu du menu public</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <nav className="flex flex-wrap gap-6">
                {visibleItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target={item.target}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    onClick={(e) => e.preventDefault()}
                  >
                    {item.label}
                    {item.target === '_blank' && (
                      <ExternalLink className="h-3 w-3 ml-1" />
                    )}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Gestion des éléments */}
          <div>
            <h3 className="font-medium mb-3">Éléments du menu</h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menu-items">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {menuItems
                      .sort((a, b) => a.order - b.order)
                      .map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="border"
                            >
                              <CardContent className="flex items-center space-x-4 p-4">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
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
                                
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                  <Input
                                    value={item.label}
                                    onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                                    placeholder="Libellé"
                                    disabled={item.isSystem}
                                  />
                                  <Input
                                    value={item.url}
                                    onChange={(e) => updateItem(item.id, 'url', e.target.value)}
                                    placeholder="URL"
                                    disabled={item.isSystem}
                                  />
                                  <select
                                    className="px-3 py-2 border rounded"
                                    value={item.target}
                                    onChange={(e) => updateItem(item.id, 'target', e.target.value)}
                                    disabled={item.isSystem}
                                  >
                                    <option value="_self">Même onglet</option>
                                    <option value="_blank">Nouvel onglet</option>
                                  </select>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">#{item.order}</span>
                                  {!item.isSystem && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeItem(item.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Ajouter un nouvel élément */}
          <Card className="border-2 border-dashed border-gray-200">
            <CardHeader>
              <CardTitle className="text-base">Ajouter un élément personnalisé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Libellé du menu"
                  value={newItem.label}
                  onChange={(e) => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                />
                <Input
                  placeholder="URL (ex: /ma-page)"
                  value={newItem.url}
                  onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                />
                <select
                  className="px-3 py-2 border rounded"
                  value={newItem.target}
                  onChange={(e) => setNewItem(prev => ({ ...prev, target: e.target.value as '_self' | '_blank' }))}
                >
                  <option value="_self">Même onglet</option>
                  <option value="_blank">Nouvel onglet</option>
                </select>
              </div>
              <Button onClick={addNewItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter au menu
              </Button>
            </CardContent>
          </Card>

          <div className="pt-4 border-t">
            <Button onClick={saveMenu} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder le menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
