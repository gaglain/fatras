import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export interface QuoteCalculation {
  // Cachets artistiques
  artisticFees: number;
  
  // Transport
  transport: number;
  
  // Hébergement
  accommodation: number;
  
  // Technique
  technical: number;
  
  // Production
  production: number;
  
  // Autres coûts
  otherCosts: number;
  
  // TVA (%)
  vatRate: number;
  
  // Part Compagnie en € HT
  companyMargin: number;
  
  // Calculés automatiquement
  totalHT: number;
  vatAmount: number;
  totalTTC: number;
  finalPrice: number;
}

interface QuoteCalculatorProps {
  onCalculationChange?: (values: QuoteCalculation) => void;
  initialValues?: Partial<QuoteCalculation>;
}

export const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({
  onCalculationChange,
  initialValues = {}
}) => {
  const [values, setValues] = useState<QuoteCalculation>({
    artisticFees: 0,
    transport: 0,
    accommodation: 0,
    technical: 0,
    production: 0,
    otherCosts: 0,
    vatRate: 20,
    companyMargin: 0,
    totalHT: 0,
    vatAmount: 0,
    totalTTC: 0,
    finalPrice: 0,
    ...initialValues
  });

  // Calculs automatiques basés sur le Google Sheets
  useEffect(() => {
    const totalHT = values.artisticFees + values.transport + values.accommodation + 
                   values.technical + values.production + values.otherCosts;
    
    const vatAmount = (totalHT * values.vatRate) / 100;
    const totalTTC = totalHT + vatAmount;
    const finalPrice = totalTTC + values.companyMargin;

    const newValues = {
      ...values,
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
    values.artisticFees,
    values.transport,
    values.accommodation,
    values.technical,
    values.production,
    values.otherCosts,
    values.vatRate,
    values.companyMargin
  ]);

  const handleInputChange = (field: keyof QuoteCalculation, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setValues(prev => ({ ...prev, [field]: numericValue }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculateur de Devis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coûts détaillés */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="artisticFees">Cachets artistiques (€ HT)</Label>
            <Input
              id="artisticFees"
              type="number"
              step="0.01"
              value={values.artisticFees}
              onChange={(e) => handleInputChange('artisticFees', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transport">Transport (€ HT)</Label>
            <Input
              id="transport"
              type="number"
              step="0.01"
              value={values.transport}
              onChange={(e) => handleInputChange('transport', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accommodation">Hébergement (€ HT)</Label>
            <Input
              id="accommodation"
              type="number"
              step="0.01"
              value={values.accommodation}
              onChange={(e) => handleInputChange('accommodation', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technical">Technique (€ HT)</Label>
            <Input
              id="technical"
              type="number"
              step="0.01"
              value={values.technical}
              onChange={(e) => handleInputChange('technical', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="production">Production (€ HT)</Label>
            <Input
              id="production"
              type="number"
              step="0.01"
              value={values.production}
              onChange={(e) => handleInputChange('production', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherCosts">Autres coûts (€ HT)</Label>
            <Input
              id="otherCosts"
              type="number"
              step="0.01"
              value={values.otherCosts}
              onChange={(e) => handleInputChange('otherCosts', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* TVA et marge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vatRate">Taux de TVA</Label>
            <Select 
              value={values.vatRate.toString()} 
              onValueChange={(value) => handleInputChange('vatRate', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% - Exonération</SelectItem>
                <SelectItem value="5.5">5,5% - Taux réduit</SelectItem>
                <SelectItem value="10">10% - Taux intermédiaire</SelectItem>
                <SelectItem value="20">20% - Taux normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyMargin">Part Compagnie (€ HT)</Label>
            <Input
              id="companyMargin"
              type="number"
              step="0.01"
              value={values.companyMargin}
              onChange={(e) => handleInputChange('companyMargin', e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Résultats calculés */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total HT:</span>
            <span className="text-lg font-semibold">{formatCurrency(values.totalHT)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">TVA ({values.vatRate}%):</span>
            <span className="text-lg">{formatCurrency(values.vatAmount)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Total TTC:</span>
            <span className="text-lg font-semibold">{formatCurrency(values.totalTTC)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">Prix Final:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(values.finalPrice)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};