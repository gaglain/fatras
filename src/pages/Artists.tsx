import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Music, Calendar, BookOpen, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCentralizedData, CentralizedArtist as Artist } from '@/hooks/useCentralizedData';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { useOpportunities } from '@/hooks/useOpportunities';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArtistCard } from './artists/ArtistCard';
import { ArtistFormModal } from './artists/ArtistFormModal';

interface TourSchedule {
  id: string;
  artistId: string;
  venue: string;
  date: string;
  showTime: string;
  rehearsalTime: string;
  hotel?: string;
  notes?: string;
}

const sampleTourSchedule: TourSchedule[] = [
  { id: '1', artistId: '1', venue: 'Madison Square Garden', date: '2024-07-15', showTime: '20:00', rehearsalTime: '16:00', hotel: 'The Plaza Hotel', notes: 'Rencontre VIP après le spectacle' },
  { id: '2', artistId: '1', venue: 'Boston Garden', date: '2024-07-18', showTime: '19:30', rehearsalTime: '15:30', hotel: 'Four Seasons Boston' }
];

export const Artists: React.FC = () => {
  const navigate = useNavigate();
  const { artists, addArtist, updateArtist, deleteArtist } = useCentralizedData();
  const { opportunities } = useOpportunities();
  const [tourSchedule, setTourSchedule] = useState<TourSchedule[]>(sampleTourSchedule);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', genre: '', currentTour: '', bio: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const [upcomingShowsCounts, setUpcomingShowsCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchUpcomingShows = async () => {
      if (artists.length === 0) return;
      const { data, error } = await supabase
        .from('events').select('artist_id')
        .gte('start_date', new Date().toISOString())
        .not('artist_id', 'is', null);
      if (error) return;
      const counts: Record<string, number> = {};
      data?.forEach(event => { if (event.artist_id) counts[event.artist_id] = (counts[event.artist_id] || 0) + 1; });
      setUpcomingShowsCounts(counts);
    };
    fetchUpcomingShows();
  }, [artists]);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getArtistOpportunities = (artistId: string) => opportunities.filter(opp => opp.artist_id === artistId);
  const selectedArtistSchedule = tourSchedule.filter(s => s.artistId === selectedArtist);
  const selectedArtistOpportunities = selectedArtist ? getArtistOpportunities(selectedArtist) : [];

  const confirmAction = useConfirm();
  const handleDeleteArtist = async (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    const ok = await confirmAction({ title: 'Supprimer l\'artiste', description: `Êtes-vous sûr de vouloir supprimer l'artiste "${artist?.name}" ? Cette action est irréversible.`, variant: 'destructive' });
    if (ok) {
      deleteArtist(artistId);
      setTourSchedule(prev => prev.filter(s => s.artistId !== artistId));
      if (selectedArtist === artistId) setSelectedArtist(null);
      toast.success('Artiste supprimé avec succès');
    }
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({ name: artist.name, genre: artist.genre, currentTour: artist.current_tour || '', bio: artist.bio || '', image: artist.image || '' });
    setShowAddForm(true);
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Veuillez sélectionner un fichier image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('L\'image doit faire moins de 5MB'); return; }
    setUploading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { toast.error('Vous devez être connecté'); return; }
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('artist-photos').upload(filePath, file);
      if (uploadError) { toast.error('Erreur lors de l\'upload de l\'image'); return; }
      const { data } = supabase.storage.from('artist-photos').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
      toast.success('Image uploadée avec succès');
    } catch { toast.error('Erreur lors de l\'upload'); } finally { setUploading(false); }
  };

  const handleSaveArtist = () => {
    if (!formData.name || !formData.genre) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    const artistData = {
      name: formData.name, genre: formData.genre, status: 'active' as const,
      upcoming_shows: editingArtist?.upcoming_shows || 0, total_shows: editingArtist?.total_shows || 0,
      current_tour: formData.currentTour || undefined, bio: formData.bio || undefined, image: formData.image || undefined
    };
    if (editingArtist) { updateArtist(editingArtist.id, artistData); toast.success('Artiste modifié avec succès'); }
    else { addArtist(artistData); toast.success('Artiste créé avec succès'); }
    setShowAddForm(false);
    setEditingArtist(null);
    setFormData({ name: '', genre: '', currentTour: '', bio: '', image: '' });
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingArtist(null);
    setFormData({ name: '', genre: '', currentTour: '', bio: '', image: '' });
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Gestion des Spectacles</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Gérer les spectacles, tournées, plannings et logistique ({artists.length} spectacles)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => navigate('/show-bible')} className="w-full sm:w-auto">
            <BookOpen className="h-4 w-4 mr-2" />Ressources
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />Ajouter Spectacle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold">Spectacles</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-48" />
            </div>
          </div>
          <div className="grid gap-4">
            {filteredArtists.map((artist) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                upcomingCount={upcomingShowsCounts[artist.id] || 0}
                isSelected={selectedArtist === artist.id}
                onEdit={handleEditArtist}
                onDelete={handleDeleteArtist}
              />
            ))}
          </div>

          {/* Tour Schedule section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              {selectedArtist ? `Planning de Tournée - ${artists.find(a => a.id === selectedArtist)?.name}` : 'Sélectionner un artiste pour voir le planning de tournée'}
            </h2>
            {selectedArtist ? (
              <div className="space-y-4">
                {selectedArtistOpportunities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Opportunités liées</h3>
                    <div className="grid gap-3">
                      {selectedArtistOpportunities.map((opp) => (
                        <Card key={opp.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{opp.title}</h4>
                              <p className="text-sm text-muted-foreground">{opp.venue}</p>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                {opp.date ? new Date(opp.date).toLocaleDateString('fr-FR') : 'Date à définir'}
                                {opp.budget && <><span className="mx-2">•</span><span>{opp.budget.toLocaleString('fr-FR')} €</span></>}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                {selectedArtistSchedule.length === 0 && selectedArtistOpportunities.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">Aucune date de tournée ou opportunité programmée pour ce spectacle.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Sélectionnez un artiste dans la liste pour voir son planning de tournée.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <ArtistFormModal
          isEditing={!!editingArtist}
          formData={formData}
          setFormData={setFormData}
          uploading={uploading}
          onUploadImage={handleUploadImage}
          onSave={handleSaveArtist}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
};
