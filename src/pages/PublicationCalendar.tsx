
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, Clock, Plus, Edit2, Trash2, Bell, Instagram, Facebook, Twitter, Mail, Linkedin, Video } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Publication {
  id: string;
  title: string;
  content: string;
  platforms: ('instagram' | 'facebook' | 'twitter' | 'newsletter' | 'linkedin' | 'tiktok' | 'youtube')[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published';
  notificationEnabled: boolean;
  tags: string[];
}

export const PublicationCalendar: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([
    {
      id: '1',
      title: 'Nouveau single de l\'artiste',
      content: 'Découvrez le nouveau single de notre artiste ! 🎵 #nouveauté #musique',
      platforms: ['instagram', 'facebook'],
      scheduledDate: '2024-06-15',
      scheduledTime: '18:00',
      status: 'scheduled',
      notificationEnabled: true,
      tags: ['musique', 'nouveauté']
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPublication, setNewPublication] = useState<Partial<Publication>>({
    title: '',
    content: '',
    platforms: [],
    scheduledDate: '',
    scheduledTime: '',
    status: 'draft',
    notificationEnabled: true,
    tags: []
  });

  const platformOptions = [
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-500' },
    { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { value: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-blue-400' },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { value: 'tiktok', label: 'TikTok', icon: Video, color: 'bg-black' },
    { value: 'youtube', label: 'YouTube', icon: Video, color: 'bg-red-600' },
    { value: 'newsletter', label: 'Newsletter', icon: Mail, color: 'bg-green-600' }
  ];

  const getPlatformInfo = (platform: string) => {
    return platformOptions.find(p => p.value === platform) || 
           { icon: Calendar, color: 'bg-gray-500' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'scheduled': return 'bg-orange-500';
      case 'published': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const togglePlatform = (platform: string) => {
    const currentPlatforms = newPublication.platforms || [];
    if (currentPlatforms.includes(platform as any)) {
      setNewPublication(prev => ({
        ...prev,
        platforms: currentPlatforms.filter(p => p !== platform)
      }));
    } else {
      setNewPublication(prev => ({
        ...prev,
        platforms: [...currentPlatforms, platform as any]
      }));
    }
  };

  const createPublication = () => {
    if (!newPublication.title || !newPublication.content || !newPublication.platforms?.length) {
      toast.error('Veuillez remplir tous les champs obligatoires et sélectionner au moins une plateforme');
      return;
    }

    const publication: Publication = {
      id: Date.now().toString(),
      title: newPublication.title!,
      content: newPublication.content!,
      platforms: newPublication.platforms!,
      scheduledDate: newPublication.scheduledDate || '',
      scheduledTime: newPublication.scheduledTime || '',
      status: newPublication.status as Publication['status'] || 'draft',
      notificationEnabled: newPublication.notificationEnabled || false,
      tags: newPublication.tags || []
    };

    setPublications(prev => [...prev, publication]);
    setNewPublication({
      title: '',
      content: '',
      platforms: [],
      scheduledDate: '',
      scheduledTime: '',
      status: 'draft',
      notificationEnabled: true,
      tags: []
    });
    setIsCreateDialogOpen(false);
    toast.success('Publication créée avec succès');
  };

  const deletePublication = (id: string) => {
    setPublications(prev => prev.filter(p => p.id !== id));
    toast.success('Publication supprimée');
  };

  const duplicatePublication = (publication: Publication) => {
    const duplicate: Publication = {
      ...publication,
      id: Date.now().toString(),
      title: `${publication.title} (Copie)`,
      status: 'draft'
    };
    setPublications(prev => [...prev, duplicate]);
    toast.success('Publication dupliquée');
  };

  const schedulePublication = (id: string) => {
    setPublications(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'scheduled' as const } : p
    ));
    toast.success('Publication programmée');
  };

  const getUpcomingNotifications = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return publications.filter(p => {
      if (!p.notificationEnabled || p.status !== 'scheduled') return false;
      const pubDate = new Date(`${p.scheduledDate} ${p.scheduledTime}`);
      return pubDate <= tomorrow && pubDate > now;
    });
  };

  const upcomingNotifications = getUpcomingNotifications();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendrier de publication</h1>
          <p className="text-muted-foreground mt-2">
            Planifiez et gérez vos publications sur les réseaux sociaux et newsletters
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle publication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle publication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={newPublication.title || ''}
                  onChange={(e) => setNewPublication(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la publication"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={newPublication.content || ''}
                  onChange={(e) => setNewPublication(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenu de la publication..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Plateformes *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {platformOptions.map((platform) => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform.value}
                        checked={(newPublication.platforms || []).includes(platform.value as any)}
                        onCheckedChange={() => togglePlatform(platform.value)}
                      />
                      <Label htmlFor={platform.value} className="flex items-center space-x-2 cursor-pointer">
                        <div className={`p-1 rounded text-white ${platform.color}`}>
                          <platform.icon className="h-3 w-3" />
                        </div>
                        <span className="text-sm">{platform.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={newPublication.status} 
                  onValueChange={(value) => setNewPublication(prev => ({ ...prev, status: value as Publication['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="scheduled">Programmé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date de publication</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newPublication.scheduledDate || ''}
                    onChange={(e) => setNewPublication(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Heure de publication</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newPublication.scheduledTime || ''}
                    onChange={(e) => setNewPublication(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Activer les notifications de rappel</Label>
                <Switch
                  id="notifications"
                  checked={newPublication.notificationEnabled || false}
                  onCheckedChange={(checked) => setNewPublication(prev => ({ ...prev, notificationEnabled: checked }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={createPublication}>
                  Créer la publication
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notifications urgentes */}
      {upcomingNotifications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Bell className="h-5 w-5 mr-2" />
              Publications à préparer bientôt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingNotifications.map(pub => (
                <div key={pub.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {pub.platforms.map(platform => {
                        const platformInfo = getPlatformInfo(platform);
                        return (
                          <div key={platform} className={`p-1 rounded text-white ${platformInfo.color}`}>
                            <platformInfo.icon className="h-3 w-3" />
                          </div>
                        );
                      })}
                    </div>
                    <span className="font-medium">{pub.title}</span>
                    <span className="text-sm text-muted-foreground">
                      le {new Date(pub.scheduledDate).toLocaleDateString('fr-FR')} à {pub.scheduledTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des publications */}
      <div className="grid gap-4">
        {publications.map(publication => (
          <Card key={publication.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2 flex-wrap">
                    <div className="flex space-x-1">
                      {publication.platforms.map(platform => {
                        const platformInfo = getPlatformInfo(platform);
                        return (
                          <div key={platform} className={`p-1 rounded text-white ${platformInfo.color}`}>
                            <platformInfo.icon className="h-4 w-4" />
                          </div>
                        );
                      })}
                    </div>
                    <h3 className="font-semibold">{publication.title}</h3>
                    <Badge className={`text-white ${getStatusColor(publication.status)}`}>
                      {publication.status === 'draft' && 'Brouillon'}
                      {publication.status === 'scheduled' && 'Programmé'}
                      {publication.status === 'published' && 'Publié'}
                    </Badge>
                    {publication.notificationEnabled && <Bell className="h-4 w-4 text-orange-500" />}
                  </div>
                  
                  <p className="text-muted-foreground mb-2 line-clamp-2">{publication.content}</p>
                  
                  {publication.scheduledDate && (
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {new Date(publication.scheduledDate).toLocaleDateString('fr-FR')}
                      </div>
                      {publication.scheduledTime && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {publication.scheduledTime}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => duplicatePublication(publication)}>
                    Dupliquer
                  </Button>
                  {publication.status === 'draft' && (
                    <Button size="sm" onClick={() => schedulePublication(publication.id)}>
                      Programmer
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deletePublication(publication.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
