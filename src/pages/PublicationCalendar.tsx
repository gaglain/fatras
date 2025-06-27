import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, Clock, Plus, Edit2, Trash2, Bell, Instagram, Facebook, Twitter, Mail, Linkedin, Video, Link, Image, MessageSquare, User, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface PublicationComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  role: 'admin' | 'manager' | 'artist' | 'super_admin';
}

interface Publication {
  id: string;
  title: string;
  content: string;
  platforms: ('instagram' | 'facebook' | 'twitter' | 'newsletter' | 'linkedin' | 'tiktok' | 'youtube')[];
  scheduledDate: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'pending_approval' | 'approved' | 'rejected';
  notificationEnabled: boolean;
  tags: string[];
  assignedTo?: string;
  assignedRole?: 'admin' | 'manager' | 'artist' | 'super_admin';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  linkUrl?: string;
  comments: PublicationComment[];
  approvedBy?: string;
  rejectedBy?: string;
  approvalDate?: string;
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
      status: 'pending_approval',
      notificationEnabled: true,
      tags: ['musique', 'nouveauté'],
      assignedTo: 'Manager Marketing',
      assignedRole: 'manager',
      comments: [],
      mediaUrl: '',
      linkUrl: ''
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newPublication, setNewPublication] = useState<Partial<Publication>>({
    title: '',
    content: '',
    platforms: [],
    scheduledDate: '',
    scheduledTime: '',
    status: 'draft',
    notificationEnabled: true,
    tags: [],
    comments: [],
    assignedRole: 'manager'
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

  const userRoles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'artist', label: 'Artiste' }
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
      case 'pending_approval': return 'bg-yellow-500';
      case 'approved': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'scheduled': return 'Programmé';
      case 'published': return 'Publié';
      case 'pending_approval': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const togglePlatform = (platform: string, isEdit = false) => {
    const target = isEdit ? editingPublication : newPublication;
    const setter = isEdit ? setEditingPublication : setNewPublication;
    
    const currentPlatforms = target?.platforms || [];
    if (currentPlatforms.includes(platform as any)) {
      setter(prev => ({
        ...prev,
        platforms: currentPlatforms.filter(p => p !== platform)
      }));
    } else {
      setter(prev => ({
        ...prev,
        platforms: [...currentPlatforms, platform as any]
      }));
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        
        if (isEdit && editingPublication) {
          setEditingPublication(prev => ({
            ...prev!,
            mediaUrl: result,
            mediaType
          }));
        } else {
          setNewPublication(prev => ({
            ...prev,
            mediaUrl: result,
            mediaType
          }));
        }
        toast.success('Média ajouté avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  const createPublication = () => {
    if (!newPublication.title || !newPublication.content || !newPublication.platforms?.length) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const publication: Publication = {
      id: Date.now().toString(),
      title: newPublication.title!,
      content: newPublication.content!,
      platforms: newPublication.platforms!,
      scheduledDate: newPublication.scheduledDate || '',
      scheduledTime: newPublication.scheduledTime || '',
      status: 'draft',
      notificationEnabled: newPublication.notificationEnabled || false,
      tags: newPublication.tags || [],
      assignedTo: newPublication.assignedTo || '',
      assignedRole: newPublication.assignedRole || 'manager',
      mediaUrl: newPublication.mediaUrl || '',
      mediaType: newPublication.mediaType,
      linkUrl: newPublication.linkUrl || '',
      comments: []
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
      tags: [],
      comments: [],
      assignedRole: 'manager'
    });
    setIsCreateDialogOpen(false);
    toast.success('Publication créée avec succès');
  };

  const updatePublication = () => {
    if (!editingPublication) return;

    setPublications(prev => prev.map(p => 
      p.id === editingPublication.id ? editingPublication : p
    ));
    setIsEditDialogOpen(false);
    setEditingPublication(null);
    toast.success('Publication mise à jour');
  };

  const deletePublication = (id: string) => {
    setPublications(prev => prev.filter(p => p.id !== id));
    toast.success('Publication supprimée');
  };

  const approvePublication = (id: string) => {
    setPublications(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        status: 'approved' as const,
        approvedBy: 'Admin',
        approvalDate: new Date().toISOString()
      } : p
    ));
    toast.success('Publication approuvée');
  };

  const rejectPublication = (id: string) => {
    setPublications(prev => prev.map(p => 
      p.id === id ? { 
        ...p, 
        status: 'rejected' as const,
        rejectedBy: 'Admin'
      } : p
    ));
    toast.success('Publication rejetée');
  };

  const addComment = (publicationId: string) => {
    if (!newComment.trim()) return;

    const comment: PublicationComment = {
      id: Date.now().toString(),
      author: 'Utilisateur Actuel',
      content: newComment,
      timestamp: new Date().toISOString(),
      role: 'admin'
    };

    setPublications(prev => prev.map(p => 
      p.id === publicationId ? {
        ...p,
        comments: [...p.comments, comment]
      } : p
    ));

    setNewComment('');
    toast.success('Commentaire ajouté');
  };

  const openEditDialog = (publication: Publication) => {
    setEditingPublication({ ...publication });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendrier de publication</h1>
          <p className="text-muted-foreground mt-2">
            Planifiez et gérez vos publications sur les réseaux sociaux
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle publication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
              
              <div>
                <Label htmlFor="assignedTo">Assigné à</Label>
                <Input
                  id="assignedTo"
                  value={newPublication.assignedTo || ''}
                  onChange={(e) => setNewPublication(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Nom de la personne"
                />
              </div>

              <div>
                <Label htmlFor="assignedRole">Rôle</Label>
                <Select 
                  value={newPublication.assignedRole} 
                  onValueChange={(value) => setNewPublication(prev => ({ ...prev, assignedRole: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="media">Média (Image/Vidéo)</Label>
                <Input
                  id="media"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleMediaUpload(e)}
                />
                {newPublication.mediaUrl && (
                  <div className="mt-2">
                    {newPublication.mediaType === 'image' ? (
                      <img src={newPublication.mediaUrl} alt="Media" className="h-20 w-20 object-cover rounded" />
                    ) : (
                      <video src={newPublication.mediaUrl} className="h-20 w-20 object-cover rounded" controls />
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="linkUrl">Lien (optionnel)</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={newPublication.linkUrl || ''}
                  onChange={(e) => setNewPublication(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="https://exemple.com"
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

      {/* Liste des publications avec nouvelles fonctionnalités */}
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
                      {getStatusLabel(publication.status)}
                    </Badge>
                    {publication.notificationEnabled && <Bell className="h-4 w-4 text-orange-500" />}
                    {publication.mediaUrl && <Image className="h-4 w-4 text-blue-500" />}
                    {publication.linkUrl && <Link className="h-4 w-4 text-green-500" />}
                  </div>
                  
                  <p className="text-muted-foreground mb-2 line-clamp-2">{publication.content}</p>
                  
                  {publication.assignedTo && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <User className="h-4 w-4 mr-1" />
                      Assigné à: {publication.assignedTo} ({publication.assignedRole})
                    </div>
                  )}
                  
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

                  {/* Commentaires */}
                  {publication.comments.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{publication.comments.length} commentaire(s)</span>
                      </div>
                      {publication.comments.slice(-2).map(comment => (
                        <div key={comment.id} className="text-xs text-gray-600 mb-1">
                          <strong>{comment.author}:</strong> {comment.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {publication.status === 'pending_approval' && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => approvePublication(publication.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => rejectPublication(publication.id)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeter
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(publication)}>
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

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la publication</DialogTitle>
          </DialogHeader>
          {editingPublication && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={editingPublication.title}
                  onChange={(e) => setEditingPublication(prev => ({ ...prev!, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-content">Contenu</Label>
                <Textarea
                  id="edit-content"
                  value={editingPublication.content}
                  onChange={(e) => setEditingPublication(prev => ({ ...prev!, content: e.target.value }))}
                  rows={4}
                />
              </div>

              <div>
                <Label>Plateformes</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {platformOptions.map((platform) => (
                    <div key={platform.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${platform.value}`}
                        checked={editingPublication.platforms.includes(platform.value as any)}
                        onCheckedChange={() => togglePlatform(platform.value, true)}
                      />
                      <Label htmlFor={`edit-${platform.value}`} className="flex items-center space-x-2 cursor-pointer">
                        <div className={`p-1 rounded text-white ${platform.color}`}>
                          <platform.icon className="h-3 w-3" />
                        </div>
                        <span className="text-sm">{platform.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ajouter un commentaire */}
              <div>
                <Label htmlFor="new-comment">Ajouter un commentaire</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Votre commentaire..."
                  />
                  <Button onClick={() => addComment(editingPublication.id)}>
                    Ajouter
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={updatePublication}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
