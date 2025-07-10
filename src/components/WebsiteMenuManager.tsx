import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Plus, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
  isCustom?: boolean;
}

interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  status: string;
}

const defaultMenuItems: MenuItem[] = [
  { id: '1', label: 'Accueil', path: '/front', visible: true, order: 1, isCustom: false },
  { id: '2', label: 'Artistes', path: '/front/artists', visible: true, order: 2, isCustom: false },
  { id: '3', label: 'Événements', path: '/front/events', visible: true, order: 3, isCustom: false },
  { id: '4', label: 'Boutique', path: '/front/shop', visible: true, order: 4, isCustom: false },
  { id: '5', label: 'Contact', path: '/front/contact', visible: true, order: 5, isCustom: false }
];

export const WebsiteMenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemPath, setNewItemPath] = useState('');
  const [availablePages, setAvailablePages] = useState<WebsitePage[]>([]);
  const [selectedPageForMenu, setSelectedPageForMenu] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Charger le menu sauvegardé
    const savedMenu = localStorage.getItem('websiteMenu');
    if (savedMenu) {
      try {
        const parsedMenu = JSON.parse(savedMenu);
        setMenuItems(parsedMenu);
      } catch (error) {
        console.error('Erreur lors du chargement du menu:', error);
      }
    }

    // Charger les pages disponibles
    loadAvailablePages();

    // Écouter les mises à jour des pages
    const handlePagesUpdate = (event: CustomEvent) => {
      setAvailablePages(event.detail || []);
    };

    window.addEventListener('websitePagesUpdated', handlePagesUpdate as EventListener);

    return () => {
      window.removeEventListener('websitePagesUpdated', handlePagesUpdate as EventListener);
    };
  }, []);

  const loadAvailablePages = () => {
    const savedPages = localStorage.getItem('websitePages');
    if (savedPages) {
      try {
        const pages = JSON.parse(savedPages);
        setAvailablePages(pages.filter((page: WebsitePage) => page.status === 'published' || page.status === 'draft'));
      } catch (error) {
        console.error('Erreur chargement pages:', error);
      }
    }
  };

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

  const updatePath = (id: string, newPath: string) => {
    if (!newPath.startsWith('/')) {
      newPath = '/' + newPath;
    }
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, path: newPath } : item
      )
    );
  };

  const addPageToMenu = () => {
    if (!selectedPageForMenu) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une page",
        variant: "destructive"
      });
      return;
    }

    const selectedPage = availablePages.find(page => page.id === selectedPageForMenu);
    if (!selectedPage) return;

    const newItem: MenuItem = {
      id: `page-${selectedPage.id}`,
      label: selectedPage.title,
      path: selectedPage.slug.startsWith('/') ? `/front${selectedPage.slug}` : `/front/${selectedPage.slug}`,
      visible: true,
      order: menuItems.length + 1,
      isCustom: true
    };

    setMenuItems([...menuItems, newItem]);
    setSelectedPageForMenu('');
    
    toast({
      title: "Succès",
      description: "Page ajoutée au menu"
    });
  };

  const addMenuItem = () => {
    if (!newItemLabel.trim() || !newItemPath.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le libellé et le chemin",
        variant: "destructive"
      });
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: newItemLabel.trim(),
      path: newItemPath.startsWith('/') ? newItemPath : '/' + newItemPath,
      visible: true,
      order: menuItems.length + 1,
      isCustom: true
    };

    setMenuItems([...menuItems, newItem]);
    setNewItemLabel('');
    setNewItemPath('');
    
    toast({
      title: "Succès",
      description: "Élément de menu ajouté"
    });
  };

  const removeMenuItem = (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item && !item.isCustom) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer un élément de menu par défaut",
        variant: "destructive"
      });
      return;
    }

    setMenuItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Succès",
      description: "Élément de menu supprimé"
    });
  };

  const saveMenu = () => {
    localStorage.setItem('websiteMenu', JSON.stringify(menuItems));
    
    // Déclencher un événement pour que la navigation se mette à jour
    window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: menuItems }));
    
    toast({
      title: "Succès",
      description: "Menu du site sauvegardé"
    });
  };

  const visibleItems = menuItems.filter(item => item.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestionnaire du Menu du Site</CardTitle>
          <p className="text-sm text-muted-foreground">
            Personnalisez la navigation de votre site web public
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aperçu du menu */}
          <div>
            <Label className="text-base font-medium">Aperçu du menu</Label>
            <div className="mt-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-wrap gap-4">
                {visibleItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-3 py-1 bg-primary/10 text-primary rounded text-sm"
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ajouter une page existante au menu */}
          {availablePages.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Ajouter une page existante au menu</Label>
              <div className="flex space-x-2">
                <Select value={selectedPageForMenu} onValueChange={setSelectedPageForMenu}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner une page" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{page.title}</span>
                          <span className="text-xs text-muted-foreground">({page.slug})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addPageToMenu}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter au menu
                </Button>
              </div>
            </div>
          )}

          {/* Liste des éléments */}
          <div>
            <Label className="text-base font-medium">Éléments du menu</Label>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="menuItems">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 mt-2">
                    {menuItems
                      .sort((a, b) => a.order - b.order)
                      .map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center space-x-3 p-3 bg-card border rounded-lg"
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
                              
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input
                                  value={item.label}
                                  onChange={(e) => updateLabel(item.id, e.target.value)}
                                  placeholder="Libellé"
                                />
                                <Input
                                  value={item.path}
                                  onChange={(e) => updatePath(item.id, e.target.value)}
                                  placeholder="Chemin (ex: /front/page)"
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">#{item.order}</span>
                                {item.isCustom && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMenuItem(item.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
          </div>

          {/* Ajouter un nouvel élément personnalisé */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Ajouter un élément personnalisé</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Libellé (ex: À propos)"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
              />
              <Input
                placeholder="Chemin (ex: /front/about)"
                value={newItemPath}
                onChange={(e) => setNewItemPath(e.target.value)}
              />
              <Button onClick={addMenuItem}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          <Button onClick={saveMenu} className="w-full">
            Sauvegarder le Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
