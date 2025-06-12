
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              placeholder="Titre du contrat" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Nom de l'artiste" 
                value={formData.artist}
                onChange={(e) => setFormData({...formData, artist: e.target.value})}
                required
              />
              <Input 
                placeholder="Lieu" 
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                type="date" 
                placeholder="Date d'événement" 
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                required
              />
              <Input 
                type="number"
                placeholder="Jauge attendue (personnes)" 
                value={formData.expectedAttendance}
                onChange={(e) => setFormData({...formData, expectedAttendance: Number(e.target.value)})}
              />
            </div>

            {/* Cost Details */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Détail des coûts</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="number"
                  placeholder="Cachet de performance (€)" 
                  value={formData.showFee}
                  onChange={(e) => setFormData({...formData, showFee: Number(e.target.value)})}
                />
                <Input 
                  type="number"
                  placeholder="Transport (€)" 
                  value={formData.transport}
                  onChange={(e) => setFormData({...formData, transport: Number(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input 
                  type="number"
                  placeholder="Péages (€)" 
                  value={formData.tolls}
                  onChange={(e) => setFormData({...formData, tolls: Number(e.target.value)})}
                />
                <Input 
                  type="number"
                  placeholder="Location sonorisation (€)" 
                  value={formData.soundRental}
                  onChange={(e) => setFormData({...formData, soundRental: Number(e.target.value)})}
                />
              </div>

              {/* Totals Display */}
              <div className="bg-muted p-4 rounded-lg mt-4">
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

            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Heure du spectacle" 
                value={formData.showTime}
                onChange={(e) => setFormData({...formData, showTime: e.target.value})}
              />
              <Input 
                placeholder="Heure de balance" 
                value={formData.soundCheckTime}
                onChange={(e) => setFormData({...formData, soundCheckTime: e.target.value})}
              />
            </div>
            <textarea 
              placeholder="Exigences spéciales / Notes"
              className="w-full p-3 border border-input rounded-md bg-background"
              rows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Partage merchandising %" 
                value={formData.merchandiseSplit}
                onChange={(e) => setFormData({...formData, merchandiseSplit: e.target.value})}
              />
              <Input 
                placeholder="Exigences d'hospitalité" 
                value={formData.hospitality}
                onChange={(e) => setFormData({...formData, hospitality: e.target.value})}
              />
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
