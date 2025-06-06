
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Heure de Check-in</label>
          <Input
            type="time"
            value={formData.checkInTime}
            onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Heure de départ prévue</label>
          <Input
            type="time"
            value={formData.departureTime}
            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transport</label>
        <Select 
          value={formData.transport} 
          onValueChange={(value) => setFormData({ ...formData, transport: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un mode de transport" />
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logement</label>
        <Input
          value={formData.accommodation}
          onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
          placeholder="Nom de l'hôtel, Airbnb, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse du logement</label>
        <Input
          value={formData.accommodationAddress}
          onChange={(e) => setFormData({ ...formData, accommodationAddress: e.target.value })}
          placeholder="Adresse complète du logement"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Équipement</label>
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
