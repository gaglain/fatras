import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calculator, Save } from 'lucide-react';

export interface QuoteFormData {
  // Infos artiste
  artistName: string;
  referent: string;
  phone: string;
  email: string;
  nbArtists: number;
  nbTech: number;
  sonoReady: boolean;
  vehicle: string;
  trailer: boolean;
  
  // Frais
  feesWithoutHighway: number;
  feesWithHighway: number;
  
  // Calculs automatiques
  artisticFees: number;
  transport: number;
  accommodation: number;
  technical: number;
  production: number;
  otherCosts: number;
  companyMargin: number;
  
  // Résultats
  totalHT: number;
  vatRate: number;
  vatAmount: number;
  totalTTC: number;
  finalPrice: number;
}

interface SimpleQuoteCalculatorProps {
  onCalculationChange?: (values: QuoteFormData) => void;
  initialValues?: Partial<QuoteFormData>;
  onSave?: (values: QuoteFormData) => void;
}

export const SimpleQuoteCalculator: React.FC<SimpleQuoteCalculatorProps> = ({
  onCalculationChange,
  initialValues = {},
  onSave
}) => {
  const [values, setValues] = useState<QuoteFormData>({
    artistName: '',
    referent: '',
    phone: '',
    email: '',
    nbArtists: 1,
    nbTech: 1,
    sonoReady: false,
    vehicle: 'perso',
    trailer: false,
    feesWithoutHighway: 0.25,
    feesWithHighway: 0.35,
    artisticFees: 0,
    transport: 0,
    accommodation: 0,
    technical: 0,
    production: 0,
    otherCosts: 0,
    companyMargin: 0,
    totalHT: 0,
    vatRate: 20,
    vatAmount: 0,
    totalTTC: 0,
    finalPrice: 0,
    ...initialValues
  });

  // Calculs automatiques comme dans Google Sheets
  useEffect(() => {
    // Calcul des coûts basé sur le nombre d'artistes et techniciens
    const baseArtisticFees = values.nbArtists * 500; // Base 500€ par artiste
    const baseTechnicalFees = values.nbTech * 300; // Base 300€ par technicien
    
    // Ajustement selon les équipements
    const sonoAdjustment = values.sonoReady ? 200 : 0;
    const vehicleAdjustment = values.vehicle === 'meca' ? 150 : values.vehicle === 'loc' ? 100 : 0;
    const trailerAdjustment = values.trailer ? 100 : 0;
    
    const totalHT = values.artisticFees + values.transport + values.accommodation + 
                   values.technical + values.production + values.otherCosts;
    
    const vatAmount = (totalHT * values.vatRate) / 100;
    const totalTTC = totalHT + vatAmount;
    const finalPrice = totalTTC + values.companyMargin;

    const newValues = {
      ...values,
      artisticFees: baseArtisticFees + sonoAdjustment,
      technical: baseTechnicalFees + vehicleAdjustment + trailerAdjustment,
      totalHT,
      vatAmount,
      totalTTC,
      finalPrice
    };

    setValues(newValues);
    
    if (onCalculationChange) {
      onCalculationChange(newValues);
    }
  }, [
    values.nbArtists,
    values.nbTech,
    values.sonoReady,
    values.vehicle,
    values.trailer,
    values.transport,
    values.accommodation,
    values.production,
    values.otherCosts,
    values.vatRate,
    values.companyMargin
  ]);

  const handleInputChange = (field: keyof QuoteFormData, value: string | number | boolean) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(values);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Formulaire de Calcul de Cession
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations artiste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="artistName">Nom du groupe/artiste</Label>
            <Input
              id="artistName"
              value={values.artistName}
              onChange={(e) => handleInputChange('artistName', e.target.value)}
              placeholder="Nom de l'artiste"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referent">Référent·e</Label>
            <Input
              id="referent"
              value={values.referent}
              onChange={(e) => handleInputChange('referent', e.target.value)}
              placeholder="Nom du référent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="06 XX XX XX XX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="contact@artiste.com"
            />
          </div>
        </div>

        <Separator />

        {/* Configuration technique */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nbArtists">Nb Artistes</Label>
            <Input
              id="nbArtists"
              type="number"
              min="1"
              value={values.nbArtists}
              onChange={(e) => handleInputChange('nbArtists', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nbTech">Nb Techniciens</Label>
            <Input
              id="nbTech"
              type="number"
              min="0"
              value={values.nbTech}
              onChange={(e) => handleInputChange('nbTech', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sonoReady">Sono Ready</Label>
            <Select 
              value={values.sonoReady ? 'oui' : 'non'} 
              onValueChange={(value) => handleInputChange('sonoReady', value === 'oui')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Véhicule</Label>
            <Select 
              value={values.vehicle} 
              onValueChange={(value) => handleInputChange('vehicle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perso">PERSO</SelectItem>
                <SelectItem value="meca">MECA</SelectItem>
                <SelectItem value="loc">LOC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trailer">Remorque</Label>
            <Select 
              value={values.trailer ? 'oui' : 'non'} 
              onValueChange={(value) => handleInputChange('trailer', value === 'oui')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oui">Oui</SelectItem>
                <SelectItem value="non">Non</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feesWithoutHighway">Frais si pas d'autoroute (€/km)</Label>
            <Input
              id="feesWithoutHighway"
              type="number"
              step="0.01"
              value={values.feesWithoutHighway}
              onChange={(e) => handleInputChange('feesWithoutHighway', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <Separator />

        {/* Coûts détaillés */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transport">Transport (€ HT)</Label>
            <Input
              id="transport"
              type="number"
              step="0.01"
              value={values.transport}
              onChange={(e) => handleInputChange('transport', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accommodation">Hébergement (€ HT)</Label>
            <Input
              id="accommodation"
              type="number"
              step="0.01"
              value={values.accommodation}
              onChange={(e) => handleInputChange('accommodation', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="production">Production (€ HT)</Label>
            <Input
              id="production"
              type="number"
              step="0.01"
              value={values.production}
              onChange={(e) => handleInputChange('production', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherCosts">Autres coûts (€ HT)</Label>
            <Input
              id="otherCosts"
              type="number"
              step="0.01"
              value={values.otherCosts}
              onChange={(e) => handleInputChange('otherCosts', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyMargin">Part Compagnie (€ HT)</Label>
            <Input
              id="companyMargin"
              type="number"
              step="0.01"
              value={values.companyMargin}
              onChange={(e) => handleInputChange('companyMargin', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vatRate">TVA (%)</Label>
            <Input
              id="vatRate"
              type="number"
              step="0.01"
              value={values.vatRate}
              onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value) || 20)}
            />
          </div>
        </div>

        <Separator />

        {/* Résultats calculés */}
        <div className="bg-muted/50 p-6 rounded-lg space-y-4">
          <h4 className="font-semibold text-lg">Résumé du devis</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Cachets artistiques:</span>
                <span className="font-medium">{formatCurrency(values.artisticFees)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport:</span>
                <span className="font-medium">{formatCurrency(values.transport)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hébergement:</span>
                <span className="font-medium">{formatCurrency(values.accommodation)}</span>
              </div>
              <div className="flex justify-between">
                <span>Technique:</span>
                <span className="font-medium">{formatCurrency(values.technical)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Production:</span>
                <span className="font-medium">{formatCurrency(values.production)}</span>
              </div>
              <div className="flex justify-between">
                <span>Autres coûts:</span>
                <span className="font-medium">{formatCurrency(values.otherCosts)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total HT:</span>
                <span>{formatCurrency(values.totalHT)}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>TVA ({values.vatRate}%):</span>
              <span className="font-medium">{formatCurrency(values.vatAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total TTC:</span>
              <span className="font-semibold">{formatCurrency(values.totalTTC)}</span>
            </div>
            <div className="flex justify-between">
              <span>Part Compagnie:</span>
              <span className="font-medium">{formatCurrency(values.companyMargin)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
              <span>Prix Final:</span>
              <span>{formatCurrency(values.finalPrice)}</span>
            </div>
          </div>
        </div>

        {onSave && (
          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder ce modèle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};