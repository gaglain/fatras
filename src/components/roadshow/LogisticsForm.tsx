
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormData } from '@/types/roadshow.types';

interface LogisticsFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const LogisticsForm: React.FC<LogisticsFormProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4">
      {/* Horaires détaillés */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">🕐 Horaires détaillés</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Arrivée équipe</label>
            <Input
              type="time"
              value={formData.checkInTime}
              onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Balance / Soundcheck</label>
            <Input
              type="time"
              value={formData.soundcheckTime || ''}
              onChange={(e) => setFormData({ ...formData, soundcheckTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Ouverture portes</label>
            <Input
              type="time"
              value={formData.doorsTime || ''}
              onChange={(e) => setFormData({ ...formData, doorsTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Début spectacle</label>
            <Input
              type="time"
              value={formData.showStartTime || ''}
              onChange={(e) => setFormData({ ...formData, showStartTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Fin spectacle</label>
            <Input
              type="time"
              value={formData.showEndTime || ''}
              onChange={(e) => setFormData({ ...formData, showEndTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Couvre-feu</label>
            <Input
              type="time"
              value={formData.curfewTime || ''}
              onChange={(e) => setFormData({ ...formData, curfewTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Heure de départ</label>
          <Input
            type="time"
            value={formData.departureTime}
            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Transport</label>
          <Select 
            value={formData.transport} 
            onValueChange={(value) => setFormData({ ...formData, transport: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Mode de transport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tour bus">Tour bus</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Train">Train</SelectItem>
              <SelectItem value="Avion">Avion</SelectItem>
              <SelectItem value="Individuel">Individuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Logement</label>
        <Input
          value={formData.accommodation}
          onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
          placeholder="Nom de l'hôtel, Airbnb, etc."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Adresse du logement</label>
        <Input
          value={formData.accommodationAddress}
          onChange={(e) => setFormData({ ...formData, accommodationAddress: e.target.value })}
          placeholder="Adresse complète du logement"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Équipement</label>
        <Textarea
          value={formData.equipment.join(', ')}
          onChange={(e) => setFormData({ ...formData, equipment: e.target.value.split(',').map(item => item.trim()) })}
          placeholder="Équipement nécessaire..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};
