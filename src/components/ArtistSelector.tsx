
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Music, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Artist {
  id: string;
  name: string;
  genre: string;
  status: string;
}

interface ArtistSelectorProps {
  selectedArtists: string[];
  onArtistsChange: (artists: string[]) => void;
}

export const ArtistSelector: React.FC<ArtistSelectorProps> = ({
  selectedArtists,
  onArtistsChange
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistGenre, setNewArtistGenre] = useState('');

  // Fetch artists from database
  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('centralized_artists')
          .select('id, name, genre, status')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error) {
          console.error('Erreur lors du chargement des artistes:', error);
          return;
        }

        setArtists(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des artistes:', error);
      }
    };

    fetchArtists();
  }, [user]);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArtist = async () => {
    if (!newArtistName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('centralized_artists')
        .insert([{
          user_id: user.id,
          name: newArtistName.trim(),
          genre: newArtistGenre || 'Non spécifié',
          status: 'active',
          bio: '',
          contact_email: '',
          contact_phone: ''
        }])
        .select('id, name, genre, status')
        .single();

      if (error) {
        console.error('Erreur lors de l\'ajout de l\'artiste:', error);
        toast.error('Erreur lors de l\'ajout de l\'artiste');
        return;
      }

      if (data) {
        setArtists(prev => [...prev, data]);
        onArtistsChange([...selectedArtists, data.id]);
        setNewArtistName('');
        setNewArtistGenre('');
        toast.success(`Artiste "${data.name}" ajouté avec succès`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'artiste:', error);
      toast.error('Erreur lors de l\'ajout de l\'artiste');
    }
  };

  const toggleArtist = (artistId: string) => {
    const newSelection = selectedArtists.includes(artistId)
      ? selectedArtists.filter(id => id !== artistId)
      : [...selectedArtists, artistId];
    
    onArtistsChange(newSelection);
  };

  const getSelectedArtistNames = () => {
    return selectedArtists
      .map(id => artists.find(artist => artist.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="space-y-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Music className="h-4 w-4 mr-2" />
            {selectedArtists.length > 0 
              ? getSelectedArtistNames() 
              : 'Sélectionner des artistes'
            }
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sélectionner des artistes</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher un artiste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Add new artist */}
            <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium">Ajouter un nouvel artiste</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Nom de l'artiste"
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                />
                <Select value={newArtistGenre} onValueChange={setNewArtistGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Genre musical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rock">Rock</SelectItem>
                    <SelectItem value="Pop">Pop</SelectItem>
                    <SelectItem value="Jazz">Jazz</SelectItem>
                    <SelectItem value="Classical">Classique</SelectItem>
                    <SelectItem value="Electronic">Électronique</SelectItem>
                    <SelectItem value="Folk">Folk</SelectItem>
                    <SelectItem value="Metal">Metal</SelectItem>
                    <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddArtist} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter cet artiste
              </Button>
            </div>

            {/* Artist list */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className={`flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer transition-colors ${
                    selectedArtists.includes(artist.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleArtist(artist.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{artist.name}</h4>
                      <p className="text-sm text-muted-foreground">{artist.genre}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedArtists.includes(artist.id)}
                    onChange={() => {}}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
