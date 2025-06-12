
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon } from 'lucide-react';

interface Artist {
  id: string;
  name: string;
  genre: string;
}

// Données d'exemple d'artistes
const sampleArtists: Artist[] = [
  { id: '1', name: 'The Midnight Express', genre: 'Rock' },
  { id: '2', name: 'Sarah Mitchell', genre: 'Jazz' },
  { id: '3', name: 'Electric Dreams', genre: 'Electronic' },
  { id: '4', name: 'Blues Brothers Revival', genre: 'Blues' },
  { id: '5', name: 'Classical Harmony', genre: 'Classique' }
];

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  title: string;
  submitButtonText: string;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  title,
  submitButtonText
}) => {
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    artist: '',
    venue: '',
    eventDate: '',
    showFee: 0,
    transport: 0,
    tolls: 0,
    soundRental: 0,
    expectedAttendance: 0,
    ...initialData
  });

  const [artists] = useState<Artist[]>(sampleArtists);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
    }
  }, [initialData]);

  const handleArtistChange = (artistId: string) => {
    const selectedArtist = artists.find(artist => artist.id === artistId);
    setFormData({
      ...formData,
      artistId,
      artist: selectedArtist?.name || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      artistId: '',
      artist: '',
      venue: '',
      eventDate: '',
      showFee: 0,
      transport: 0,
      tolls: 0,
      soundRental: 0,
      expectedAttendance: 0
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du contrat</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Titre du contrat"
              required
            />
          </div>

          <div>
            <Label htmlFor="artist">Artiste</Label>
            <Select value={formData.artistId} onValueChange={handleArtistChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un artiste" />
              </SelectTrigger>
              <SelectContent>
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name} - {artist.genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="venue">Lieu</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              placeholder="Lieu de l'événement"
              required
            />
          </div>

          <div>
            <Label htmlFor="eventDate">Date de l'événement</Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleChange('eventDate', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="expectedAttendance">Nombre d'invités attendus</Label>
            <Input
              id="expectedAttendance"
              type="number"
              value={formData.expectedAttendance}
              onChange={(e) => handleChange('expectedAttendance', parseInt(e.target.value) || 0)}
              placeholder="Nombre d'invités"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="showFee">Cachet du spectacle (€)</Label>
              <Input
                id="showFee"
                type="number"
                value={formData.showFee}
                onChange={(e) => handleChange('showFee', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="transport">Transport (€)</Label>
              <Input
                id="transport"
                type="number"
                value={formData.transport}
                onChange={(e) => handleChange('transport', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tolls">Péages (€)</Label>
              <Input
                id="tolls"
                type="number"
                value={formData.tolls}
                onChange={(e) => handleChange('tolls', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="soundRental">Location de son (€)</Label>
              <Input
                id="soundRental"
                type="number"
                value={formData.soundRental}
                onChange={(e) => handleChange('soundRental', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total HT:</span>
                <span className="ml-2">
                  {(formData.showFee + formData.transport + formData.tolls + formData.soundRental).toLocaleString('fr-FR')} €
                </span>
              </div>
              <div>
                <span className="font-medium">Total TTC:</span>
                <span className="ml-2">
                  {((formData.showFee + formData.transport + formData.tolls + formData.soundRental) * 1.20).toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
              {submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
