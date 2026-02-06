import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Check, X, Car, MapPin, Leaf } from 'lucide-react';
import { useVehicleRates, VehicleRate } from '@/hooks/useVehicleRates';
import { useRoadshowSettings } from '@/hooks/useRoadshowSettings';
import { toast } from 'sonner';

export const VehicleRatesSettings: React.FC = () => {
  const { rates, loading, createRate, updateRate, deleteRate } = useVehicleRates();
  const { settings, updateSetting, loading: settingsLoading } = useRoadshowSettings();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState({ vehicle_name: '', rate_per_km: 0.50, fixed_cost: 0, co2_per_km: 0.21 });
  const [editForm, setEditForm] = useState({ vehicle_name: '', rate_per_km: 0, fixed_cost: 0, co2_per_km: 0.21 });
  const [departureAddress, setDepartureAddress] = useState(settings.default_departure_address || '');

  // Sync departure address when settings load
  React.useEffect(() => {
    setDepartureAddress(settings.default_departure_address || '');
  }, [settings.default_departure_address]);

  const handleAddRate = async () => {
    if (!newRate.vehicle_name.trim()) {
      toast.error('Veuillez entrer un nom de véhicule');
      return;
    }
    await createRate(newRate);
    setNewRate({ vehicle_name: '', rate_per_km: 0.50, fixed_cost: 0, co2_per_km: 0.21 });
    setIsAdding(false);
  };

  const handleStartEdit = (rate: VehicleRate) => {
    setEditingId(rate.id);
    setEditForm({
      vehicle_name: rate.vehicle_name,
      rate_per_km: rate.rate_per_km,
      fixed_cost: rate.fixed_cost,
      co2_per_km: rate.co2_per_km || 0.21
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await updateRate(editingId, editForm);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ vehicle_name: '', rate_per_km: 0, fixed_cost: 0, co2_per_km: 0.21 });
  };

  const handleSaveDepartureAddress = async () => {
    await updateSetting('default_departure_address', departureAddress);
    toast.success('Adresse de départ enregistrée');
  };

  if (loading || settingsLoading) {
    return <div className="text-center py-8 text-muted-foreground">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Adresse de départ par défaut */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Point de départ / retour
          </CardTitle>
          <CardDescription>
            Adresse de départ et de retour par défaut pour le calcul des itinéraires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="departure-address" className="sr-only">Adresse de départ</Label>
              <Input
                id="departure-address"
                placeholder="Ex: 123 Rue de la Musique, 75001 Paris"
                value={departureAddress}
                onChange={(e) => setDepartureAddress(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveDepartureAddress}>
              Enregistrer
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Cette adresse sera utilisée comme point de départ et de retour pour calculer les distances totales.
          </p>
        </CardContent>
      </Card>

      {/* Tarifs véhicules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Barèmes kilométriques
              </CardTitle>
              <CardDescription>
                Définissez les tarifs et émissions CO₂ par type de véhicule
              </CardDescription>
            </div>
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Véhicule</TableHead>
                <TableHead className="text-right">Tarif / km (€)</TableHead>
                <TableHead className="text-right">Coût fixe (€)</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Leaf className="h-3 w-3 text-green-500" />
                    CO₂/km (kg)
                  </div>
                </TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow>
                  <TableCell>
                    <Input
                      placeholder="Nom du véhicule"
                      value={newRate.vehicle_name}
                      onChange={(e) => setNewRate(prev => ({ ...prev, vehicle_name: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newRate.rate_per_km}
                      onChange={(e) => setNewRate(prev => ({ ...prev, rate_per_km: parseFloat(e.target.value) || 0 }))}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newRate.fixed_cost}
                      onChange={(e) => setNewRate(prev => ({ ...prev, fixed_cost: parseFloat(e.target.value) || 0 }))}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={newRate.co2_per_km}
                      onChange={(e) => setNewRate(prev => ({ ...prev, co2_per_km: parseFloat(e.target.value) || 0 }))}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={handleAddRate}>
                        <Check className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {rates.length === 0 && !isAdding ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucun tarif véhicule configuré. Ajoutez-en un pour calculer les frais de route.
                  </TableCell>
                </TableRow>
              ) : (
                rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>
                      {editingId === rate.id ? (
                        <Input
                          value={editForm.vehicle_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, vehicle_name: e.target.value }))}
                        />
                      ) : (
                        <span className="font-medium">{rate.vehicle_name}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === rate.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.rate_per_km}
                          onChange={(e) => setEditForm(prev => ({ ...prev, rate_per_km: parseFloat(e.target.value) || 0 }))}
                          className="text-right"
                        />
                      ) : (
                        <span>{rate.rate_per_km.toFixed(2)} €</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === rate.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.fixed_cost}
                          onChange={(e) => setEditForm(prev => ({ ...prev, fixed_cost: parseFloat(e.target.value) || 0 }))}
                          className="text-right"
                        />
                      ) : (
                        <span>{rate.fixed_cost.toFixed(2)} €</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === rate.id ? (
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={editForm.co2_per_km}
                          onChange={(e) => setEditForm(prev => ({ ...prev, co2_per_km: parseFloat(e.target.value) || 0 }))}
                          className="text-right"
                        />
                      ) : (
                        <span className="text-green-600">{(rate.co2_per_km || 0.21).toFixed(3)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingId === rate.id ? (
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                            <Check className="h-4 w-4 text-primary" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleStartEdit(rate)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteRate(rate.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
