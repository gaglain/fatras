import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Edit2, Plane } from 'lucide-react';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { ArtistDashboard } from '@/components/ArtistDashboard';
import { ArtistMediaManager } from '@/components/ArtistMediaManager';
import { ArtistUsersManager } from '@/components/ArtistUsersManager';
import { ArtistTemplatesManager } from '@/components/ArtistTemplatesManager';
import { toast } from 'sonner';

export const ArtistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { artists, updateArtist } = useCentralizedData();
  const [artist, setArtist] = useState(artists.find(a => a.id === id));
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    genre: '',
    bio: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    instagram: '',
    facebook: '',
    current_tour: ''
  });

  useEffect(() => {
    const foundArtist = artists.find(a => a.id === id);
    if (foundArtist) {
      setArtist(foundArtist);
      setEditForm({
        name: foundArtist.name || '',
        genre: foundArtist.genre || '',
        bio: foundArtist.bio || '',
        contact_email: foundArtist.contact_email || '',
        contact_phone: foundArtist.contact_phone || '',
        website: foundArtist.website || '',
        instagram: foundArtist.instagram || '',
        facebook: foundArtist.facebook || '',
        current_tour: foundArtist.current_tour || ''
      });
    }
  }, [id, artists]);

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Spectacle non trouvé</p>
          <Button onClick={() => navigate('/artists')} className="mt-4">
            Retour aux spectacles
          </Button>
        </div>
      </div>
    );
  }

  const handleUpdate = async (updates: any) => {
    await updateArtist(artist.id, updates);
    setArtist({ ...artist, ...updates });
  };

  const handleSaveGeneralInfo = async () => {
    await handleUpdate(editForm);
    setEditDialogOpen(false);
    toast.success('Informations mises à jour');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/artists')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{artist.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge>{artist.genre}</Badge>
              <Badge variant={artist.status === 'active' ? 'default' : 'secondary'}>
                {artist.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
              {(artist as any).is_touring && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Plane className="h-3 w-3 mr-1" />
                  En tournée
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Toggle disponible en tournée */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
            <Plane className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="touring-toggle" className="text-sm font-medium cursor-pointer">
              Disponible en tournée
            </Label>
            <Switch
              id="touring-toggle"
              checked={(artist as any).is_touring || false}
              onCheckedChange={async (checked) => {
                await handleUpdate({ is_touring: checked });
                toast.success(checked ? 'Spectacle marqué disponible en tournée' : 'Spectacle retiré de la tournée');
              }}
            />
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier les infos générales
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier les informations générales</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du spectacle</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={editForm.genre}
                    onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email de contact</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={editForm.contact_email}
                    onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Téléphone de contact</Label>
                  <Input
                    id="contact_phone"
                    value={editForm.contact_phone}
                    onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={editForm.instagram}
                    onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={editForm.facebook}
                    onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_tour">Tournée en cours</Label>
                <Input
                  id="current_tour"
                  value={editForm.current_tour}
                  onChange={(e) => setEditForm({ ...editForm, current_tour: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveGeneralInfo}>
                  Enregistrer
                </Button>
              </div>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Artist Image */}
      {artist.image && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{artist.name}</h3>
                {artist.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{artist.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="media">Médias & Docs</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="info">Infos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ArtistDashboard artist={artist} />
        </TabsContent>

        <TabsContent value="media">
          <ArtistMediaManager artist={artist} onUpdate={handleUpdate} />
        </TabsContent>

        <TabsContent value="users">
          <ArtistUsersManager artistId={artist.id} />
        </TabsContent>

        <TabsContent value="templates">
          <ArtistTemplatesManager
            artistId={artist.id}
            currentQuoteTemplateId={artist.quote_template_id}
            currentEmailTemplateId={artist.email_template_id}
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="info">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Biographie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {artist.bio || 'Aucune biographie disponible'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artist.contact_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{artist.contact_email}</p>
                  </div>
                )}
                {artist.contact_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{artist.contact_phone}</p>
                  </div>
                )}
                {artist.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Site web</p>
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {artist.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Réseaux sociaux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artist.instagram && (
                  <div>
                    <p className="text-sm text-muted-foreground">Instagram</p>
                    <p className="font-medium">{artist.instagram}</p>
                  </div>
                )}
                {artist.facebook && (
                  <div>
                    <p className="text-sm text-muted-foreground">Facebook</p>
                    <p className="font-medium">{artist.facebook}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournée en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {artist.current_tour || 'Aucune tournée en cours'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};