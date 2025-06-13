
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Instagram, Facebook, Twitter, Mail, Bell } from 'lucide-react';

interface Publication {
  id: string;
  title: string;
  content: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'newsletter';
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published';
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
}

interface PublicationFormData {
  title: string;
  content: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'newsletter';
  scheduledDate: Date;
  tags: string[];
}

const defaultPublications: Publication[] = [
  {
    id: '1',
    title: 'Nouvelle chanson en préparation',
    content: 'Nous travaillons sur une nouvelle chanson qui sortira bientôt ! 🎵 #musique #nouveauté',
    platform: 'instagram',
    scheduledDate: new Date(2024, 5, 15, 14, 0),
    status: 'scheduled',
    tags: ['musique', 'nouveauté'],
    createdAt: new Date(2024, 5, 10)
  },
  {
    id: '2',
    title: 'Newsletter mensuelle',
    content: 'Notre newsletter mensuelle avec toutes les actualités du mois !',
    platform: 'newsletter',
    scheduledDate: new Date(2024, 5, 20, 10, 0),
    status: 'draft',
    tags: ['newsletter', 'actualités'],
    createdAt: new Date(2024, 5, 12)
  }
];

export const PublicationCalendar: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>(defaultPublications);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const [formData, setFormData] = useState<PublicationFormData>({
    title: '',
    content: '',
    platform: 'instagram',
    scheduledDate: new Date(),
    tags: []
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      platform: 'instagram',
      scheduledDate: new Date(),
      tags: []
    });
  };

  const handleCreatePublication = () => {
    const newPublication: Publication = {
      id: Date.now().toString(),
      ...formData,
      status: 'draft',
      createdAt: new Date()
    };
    
    setPublications([...publications, newPublication]);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditPublication = (publication: Publication) => {
    setSelectedPublication(publication);
    setFormData({
      title: publication.title,
      content: publication.content,
      platform: publication.platform,
      scheduledDate: publication.scheduledDate,
      tags: publication.tags
    });
    setShowEditDialog(true);
  };

  const handleUpdatePublication = () => {
    if (!selectedPublication) return;
    
    const updatedPublications = publications.map(publication => 
      publication.id === selectedPublication.id 
        ? { ...publication, ...formData }
        : publication
    );
    
    setPublications(updatedPublications);
    setShowEditDialog(false);
    setSelectedPublication(null);
    resetForm();
  };

  const handleDeletePublication = (publicationId: string) => {
    setPublications(publications.filter(publication => publication.id !== publicationId));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'newsletter': return <Mail className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white';
      case 'facebook': return 'bg-blue-600 text-white';
      case 'twitter': return 'bg-sky-500 text-white';
      case 'newsletter': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'scheduled': return 'Programmé';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };

  const todayPublications = publications.filter(pub => 
    format(pub.scheduledDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  const upcomingPublications = publications.filter(pub => 
    pub.scheduledDate > new Date() && pub.status === 'scheduled'
  ).sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendrier de Publication</h1>
          <p className="text-muted-foreground mt-2">Gérez vos publications sur les réseaux sociaux et newsletters</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}>
            {view === 'calendar' ? 'Vue Liste' : 'Vue Calendrier'}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Publication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle publication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de la publication"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Contenu de la publication..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plateforme</label>
                    <Select value={formData.platform} onValueChange={(value: any) => setFormData({ ...formData, platform: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                    <Input
                      type="datetime-local"
                      value={format(formData.scheduledDate, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: new Date(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreatePublication}>
                    Créer la publication
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notifications du jour */}
      {todayPublications.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Bell className="h-5 w-5 mr-2" />
              Publications d'aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayPublications.map((pub) => (
                <div key={pub.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded ${getPlatformColor(pub.platform)}`}>
                      {getPlatformIcon(pub.platform)}
                    </div>
                    <div>
                      <div className="font-medium">{pub.title}</div>
                      <div className="text-sm text-gray-600">
                        {format(pub.scheduledDate, 'HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(pub.status)}>
                    {getStatusLabel(pub.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Calendrier</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={fr}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publications programmées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPublications.slice(0, 5).map((pub) => (
                  <div key={pub.id} className="flex items-center space-x-3 p-2 border rounded">
                    <div className={`p-1 rounded ${getPlatformColor(pub.platform)}`}>
                      {getPlatformIcon(pub.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{pub.title}</div>
                      <div className="text-xs text-gray-500">
                        {format(pub.scheduledDate, 'dd MMM à HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Toutes les publications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publications.map((publication) => (
                <div key={publication.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded ${getPlatformColor(publication.platform)}`}>
                      {getPlatformIcon(publication.platform)}
                    </div>
                    <div>
                      <h3 className="font-medium">{publication.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{publication.content.substring(0, 100)}...</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-500">
                          {format(publication.scheduledDate, 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </span>
                        <Badge className={getStatusColor(publication.status)}>
                          {getStatusLabel(publication.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleEditPublication(publication)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeletePublication(publication.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la publication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la publication"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Contenu de la publication..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plateforme</label>
                <Select value={formData.platform} onValueChange={(value: any) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                <Input
                  type="datetime-local"
                  value={format(formData.scheduledDate, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: new Date(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdatePublication}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
