import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { VehicleRate } from '@/hooks/useVehicleRates';

interface AddVehicleDialogProps {
  onSave: (data: Partial<VehicleRate>) => Promise<VehicleRate | null>;
  editingVehicle?: VehicleRate | null;
  trigger?: React.ReactNode;
}

export const AddVehicleDialog: React.FC<AddVehicleDialogProps> = ({
  onSave,
  editingVehicle,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [vehicleName, setVehicleName] = useState('');
  const [ratePerKm, setRatePerKm] = useState('0.50');
  const [fixedCost, setFixedCost] = useState('0');
  const [co2PerKm, setCo2PerKm] = useState('0.21');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    if (editingVehicle) {
      setVehicleName(editingVehicle.vehicle_name);
      setRatePerKm(String(editingVehicle.rate_per_km));
      setFixedCost(String(editingVehicle.fixed_cost));
      setCo2PerKm(String(editingVehicle.co2_per_km));
    } else {
      setVehicleName('');
      setRatePerKm('0.50');
      setFixedCost('0');
      setCo2PerKm('0.21');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim()) return;

    setSaving(true);
    const result = await onSave({
      vehicle_name: vehicleName.trim(),
      rate_per_km: parseFloat(ratePerKm) || 0,
      fixed_cost: parseFloat(fixedCost) || 0,
      co2_per_km: parseFloat(co2PerKm) || 0.21,
    });
    setSaving(false);

    if (result) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="icon" className="shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingVehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle-name">Nom du véhicule</Label>
            <Input
              id="vehicle-name"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="Ex: Voiture personnelle, Camionnette..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rate-km">€/km</Label>
              <Input
                id="rate-km"
                type="number"
                step="0.01"
                min="0"
                value={ratePerKm}
                onChange={(e) => setRatePerKm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fixed-cost">Coût fixe (€)</Label>
              <Input
                id="fixed-cost"
                type="number"
                step="0.01"
                min="0"
                value={fixedCost}
                onChange={(e) => setFixedCost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="co2-km">CO₂/km (kg)</Label>
              <Input
                id="co2-km"
                type="number"
                step="0.01"
                min="0"
                value={co2PerKm}
                onChange={(e) => setCo2PerKm(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={saving || !vehicleName.trim()}>
              {saving ? 'Enregistrement...' : editingVehicle ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
