import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calculator, Euro } from 'lucide-react';

interface ContractCalculatorProps {
  onCalculationChange?: (values: CalculationValues) => void;
  initialValues?: Partial<CalculationValues>;
}

export interface CalculationValues {
  showFee: number;
  transport: number;
  tolls: number;
  soundRental: number;
  accommodation: number;
  catering: number;
  technicalCosts: number;
  otherCosts: number;
  totalHT: number;
  tva: number;
  totalTTC: number;
  margin: number;
  finalPrice: number;
}

export const ContractCalculator: React.FC<ContractCalculatorProps> = ({
  onCalculationChange,
  initialValues = {}
}) => {
  const [values, setValues] = useState<CalculationValues>({
    showFee: 0,
    transport: 0,
    tolls: 0,
    soundRental: 0,
    accommodation: 0,
    catering: 0,
    technicalCosts: 0,
    otherCosts: 0,
    totalHT: 0,
    tva: 0,
    totalTTC: 0,
    margin: 0,
    finalPrice: 0,
    ...initialValues
  });

  const TVA_RATE = 0.20; // 20% TVA
  const DEFAULT_MARGIN = 0.15; // 15% marge par défaut

  useEffect(() => {
    // Calcul du total HT
    const totalHT = values.showFee + values.transport + values.tolls + 
                    values.soundRental + values.accommodation + values.catering + 
                    values.technicalCosts + values.otherCosts;
    
    // Calcul de la TVA
    const tva = totalHT * TVA_RATE;
    
    // Calcul du total TTC
    const totalTTC = totalHT + tva;
    
    // Calcul de la marge
    const margin = totalHT * DEFAULT_MARGIN;
    
    // Prix final avec marge
    const finalPrice = totalTTC + margin;

    const newValues = {
      ...values,
      totalHT,
      tva,
      totalTTC,
      margin,
      finalPrice
    };

    setValues(newValues);
    onCalculationChange?.(newValues);
  }, [
    values.showFee, 
    values.transport, 
    values.tolls, 
    values.soundRental,
    values.accommodation,
    values.catering,
    values.technicalCosts,
    values.otherCosts
  ]);

  const handleInputChange = (field: keyof CalculationValues, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setValues(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Calculateur de Devis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coûts de base */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Coûts de base
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="showFee">Cachet artistique</Label>
              <Input
                id="showFee"
                type="number"
                placeholder="0"
                value={values.showFee || ''}
                onChange={(e) => handleInputChange('showFee', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport">Transport</Label>
              <Input
                id="transport"
                type="number"
                placeholder="0"
                value={values.transport || ''}
                onChange={(e) => handleInputChange('transport', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tolls">Péages</Label>
              <Input
                id="tolls"
                type="number"
                placeholder="0"
                value={values.tolls || ''}
                onChange={(e) => handleInputChange('tolls', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="soundRental">Location son</Label>
              <Input
                id="soundRental"
                type="number"
                placeholder="0"
                value={values.soundRental || ''}
                onChange={(e) => handleInputChange('soundRental', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Coûts additionnels */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Coûts additionnels
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accommodation">Hébergement</Label>
              <Input
                id="accommodation"
                type="number"
                placeholder="0"
                value={values.accommodation || ''}
                onChange={(e) => handleInputChange('accommodation', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catering">Restauration</Label>
              <Input
                id="catering"
                type="number"
                placeholder="0"
                value={values.catering || ''}
                onChange={(e) => handleInputChange('catering', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalCosts">Frais techniques</Label>
              <Input
                id="technicalCosts"
                type="number"
                placeholder="0"
                value={values.technicalCosts || ''}
                onChange={(e) => handleInputChange('technicalCosts', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherCosts">Autres frais</Label>
              <Input
                id="otherCosts"
                type="number"
                placeholder="0"
                value={values.otherCosts || ''}
                onChange={(e) => handleInputChange('otherCosts', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Résumé des calculs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Résumé financier
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total HT</span>
              <span className="font-semibold">{formatCurrency(values.totalHT)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">TVA (20%)</span>
              <span className="font-semibold">{formatCurrency(values.tva)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total TTC</span>
              <span className="font-semibold">{formatCurrency(values.totalTTC)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Marge (15%)</span>
              <span className="font-semibold">{formatCurrency(values.margin)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 px-4 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-base font-semibold text-primary">Prix final</span>
              <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                {formatCurrency(values.finalPrice)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};