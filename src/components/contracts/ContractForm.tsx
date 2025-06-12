
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ContractFormData {
  title: string;
  artist: string;
  venue: string;
  eventDate: string;
  showFee: number;
  transport: number;
  tolls: number;
  soundRental: number;
  expectedAttendance: number;
  showTime: string;
  soundCheckTime: string;
  requirements: string;
  merchandiseSplit: string;
  hospitality: string;
}

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContractFormData) => void;
  initialData?: Partial<ContractFormData>;
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
  const [formData, setFormData] = React.useState<ContractFormData>({
    title: '',
    artist: '',
    venue: '',
    eventDate: '',
    showFee: 0,
    transport: 0,
    tolls: 0,
    soundRental: 0,
    expectedAttendance: 0,
    showTime: '',
    soundCheckTime: '',
    requirements: '',
    merchandiseSplit: '',
    hospitality: '',
    ...initialData
  });

  const calculateTotals = () => {
    const totalHT = formData.showFee + formData.transport + formData.tolls + formData.soundRental;
    const totalTTC = totalHT * 1.20; // 20% TVA
    return { totalHT, totalTTC };
  };

  const { totalHT, totalTTC } = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Informations générales</h3>
              
              <div>
                <Label htmlFor="title">Titre du contrat</Label>
                <Input 
                  id="title"
                  placeholder="Titre du contrat" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="artist">Nom de l'artiste</Label>
                  <Input 
                    id="artist"
                    placeholder="Nom de l'artiste" 
                    value={formData.artist}
                    onChange={(e) => setFormData({...formData, artist: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="venue">Lieu de l'événement</Label>
                  <Input 
                    id="venue"
                    placeholder="Lieu" 
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Date de l'événement</Label>
                  <Input 
                    id="eventDate"
                    type="date" 
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expectedAttendance">Jauge attendue (nombre de personnes)</Label>
                  <Input 
                    id="expectedAttendance"
                    type="number"
                    placeholder="1500" 
                    value={formData.expectedAttendance}
                    onChange={(e) => setFormData({...formData, expectedAttendance: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* Détail financier */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Détail financier</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="showFee">Cachet de performance (€)</Label>
                  <Input 
                    id="showFee"
                    type="number"
                    placeholder="25000" 
                    value={formData.showFee}
                    onChange={(e) => setFormData({...formData, showFee: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="transport">Frais de transport (€)</Label>
                  <Input 
                    id="transport"
                    type="number"
                    placeholder="1500" 
                    value={formData.transport}
                    onChange={(e) => setFormData({...formData, transport: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tolls">Péages et frais de route (€)</Label>
                  <Input 
                    id="tolls"
                    type="number"
                    placeholder="150" 
                    value={formData.tolls}
                    onChange={(e) => setFormData({...formData, tolls: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="soundRental">Location de sonorisation (€)</Label>
                  <Input 
                    id="soundRental"
                    type="number"
                    placeholder="5000" 
                    value={formData.soundRental}
                    onChange={(e) => setFormData({...formData, soundRental: Number(e.target.value)})}
                  />
                </div>
              </div>

              {/* Affichage des totaux */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total HT</p>
                    <p className="text-xl font-bold">{totalHT.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total TTC (TVA 20%)</p>
                    <p className="text-xl font-bold text-green-600">{totalTTC.toLocaleString()} €</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails logistiques */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Détails logistiques</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="showTime">Heure du spectacle</Label>
                  <Input 
                    id="showTime"
                    placeholder="20:30" 
                    value={formData.showTime}
                    onChange={(e) => setFormData({...formData, showTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="soundCheckTime">Heure de la balance sonore</Label>
                  <Input 
                    id="soundCheckTime"
                    placeholder="18:00" 
                    value={formData.soundCheckTime}
                    onChange={(e) => setFormData({...formData, soundCheckTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Exigences techniques et besoins spéciaux</Label>
                <textarea 
                  id="requirements"
                  placeholder="Piano à queue, éclairage spécifique, loges particulières..."
                  className="w-full p-3 border border-input rounded-md bg-background"
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="merchandiseSplit">Partage merchandising (% artiste)</Label>
                  <Input 
                    id="merchandiseSplit"
                    placeholder="70%" 
                    value={formData.merchandiseSplit}
                    onChange={(e) => setFormData({...formData, merchandiseSplit: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="hospitality">Exigences d'hospitalité</Label>
                  <Input 
                    id="hospitality"
                    placeholder="Restauration, boissons, transport local..." 
                    value={formData.hospitality}
                    onChange={(e) => setFormData({...formData, hospitality: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1">
                Annuler
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                {submitButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
