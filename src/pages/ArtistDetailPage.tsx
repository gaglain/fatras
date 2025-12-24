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
    current_tour: '',
    sacem_program_number: ''
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
        current_tour: foundArtist.current_tour || '',
        sacem_program_number: (foundArtist as any).sacem_program_number || ''
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
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      {/* Header */}
        <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 md:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/artists')} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold truncate">{artist.name}</h1>
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-2">
              <Badge className="text-xs md:text-sm">{artist.genre}</Badge>
              <Badge variant={artist.status === 'active' ? 'default' : 'secondary'} className="text-xs md:text-sm">
                {artist.status === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
              {(artist as any).is_touring && (
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs md:text-sm">
                  <Plane className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">En tournée</span>
                  <span className="sm:hidden">Tour</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Toggle disponible en tournée */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 px-3 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="touring-toggle" className="text-xs sm:text-sm font-medium cursor-pointer">
                <span className="hidden sm:inline">Disponible en tournée</span>
                <span className="sm:hidden">En tournée</span>
              </Label>
            </div>
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
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Edit2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Modifier les infos générales</span>
                <span className="sm:hidden">Modifier</span>
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
              <div className="space-y-2">
                <Label htmlFor="sacem_program_number">Numéro de programme SACEM (interne)</Label>
                <Input
                  id="sacem_program_number"
                  value={editForm.sacem_program_number}
                  onChange={(e) => setEditForm({ ...editForm, sacem_program_number: e.target.value })}
                  placeholder="Ex: 123456789"
                />
                <p className="text-xs text-muted-foreground">
                  Information interne - non affichée sur le site public.
                </p>
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
      <Tabs defaultValue="dashboard" className="space-y-4 md:space-y-6">
        <TabsList className="w-full h-auto flex overflow-x-auto">
          <TabsTrigger value="dashboard" className="flex-1 min-w-0 px-2 md:px-4 text-xs md:text-sm">
            <span className="hidden sm:inline">Tableau de bord</span>
            <span className="sm:hidden">Tableau</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex-1 min-w-0 px-2 md:px-4 text-xs md:text-sm">
            <span className="hidden sm:inline">Médias & Docs</span>
            <span className="sm:hidden">Médias</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 min-w-0 px-2 md:px-4 text-xs md:text-sm">
            <span className="hidden sm:inline">Utilisateurs</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 min-w-0 px-2 md:px-4 text-xs md:text-sm">Modèles</TabsTrigger>
          <TabsTrigger value="info" className="flex-1 min-w-0 px-2 md:px-4 text-xs md:text-sm">Infos</TabsTrigger>
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

            <Card>
              <CardHeader>
                <CardTitle>Informations internes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Numéro de programme SACEM</p>
                  <p className="font-medium">
                    {(artist as any).sacem_program_number || 'Non renseigné'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};