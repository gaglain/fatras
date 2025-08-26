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
  // Frais artistiques
  showFee: number;
  artisticAgency: number;
  managementFees: number;
  
  // Transport
  transport: number;
  tolls: number;
  parking: number;
  
  // Hébergement et restauration
  accommodation: number;
  catering: number;
  drinks: number;
  
  // Technique
  soundRental: number;
  lightRental: number;
  backlineRental: number;
  technicalStaff: number;
  
  // Production
  productionCosts: number;
  communicationCosts: number;
  merchandising: number;
  
  // Autres
  insurance: number;
  otherCosts: number;
  
  // Calculs
  totalHT: number;
  tvaRate: number;
  tva: number;
  totalTTC: number;
  marginRate: number;
  margin: number;
  finalPrice: number;
  
  // Commission organisateur
  organizerCommissionRate: number;
  organizerCommission: number;
  finalPriceWithCommission: number;
}

export const ContractCalculator: React.FC<ContractCalculatorProps> = ({
  onCalculationChange,
  initialValues = {}
}) => {
  const [values, setValues] = useState<CalculationValues>({
    // Frais artistiques
    showFee: 0,
    artisticAgency: 0,
    managementFees: 0,
    
    // Transport
    transport: 0,
    tolls: 0,
    parking: 0,
    
    // Hébergement et restauration
    accommodation: 0,
    catering: 0,
    drinks: 0,
    
    // Technique
    soundRental: 0,
    lightRental: 0,
    backlineRental: 0,
    technicalStaff: 0,
    
    // Production
    productionCosts: 0,
    communicationCosts: 0,
    merchandising: 0,
    
    // Autres
    insurance: 0,
    otherCosts: 0,
    
    // Calculs
    totalHT: 0,
    tvaRate: 20,
    tva: 0,
    totalTTC: 0,
    marginRate: 15,
    margin: 0,
    finalPrice: 0,
    
    // Commission organisateur
    organizerCommissionRate: 10,
    organizerCommission: 0,
    finalPriceWithCommission: 0,
    ...initialValues
  });

  useEffect(() => {
    // Calcul du total HT
    const totalHT = values.showFee + values.artisticAgency + values.managementFees +
                    values.transport + values.tolls + values.parking +
                    values.accommodation + values.catering + values.drinks +
                    values.soundRental + values.lightRental + values.backlineRental + values.technicalStaff +
                    values.productionCosts + values.communicationCosts + values.merchandising +
                    values.insurance + values.otherCosts;
    
    // Calcul de la TVA
    const tvaRate = values.tvaRate / 100;
    const tva = totalHT * tvaRate;
    
    // Calcul du total TTC
    const totalTTC = totalHT + tva;
    
    // Calcul de la marge
    const marginRate = values.marginRate / 100;
    const margin = totalHT * marginRate;
    
    // Prix final avec marge
    const finalPrice = totalTTC + margin;
    
    // Commission organisateur
    const organizerCommissionRate = values.organizerCommissionRate / 100;
    const organizerCommission = finalPrice * organizerCommissionRate;
    const finalPriceWithCommission = finalPrice + organizerCommission;

    const newValues = {
      ...values,
      totalHT,
      tva,
      totalTTC,
      margin,
      finalPrice,
      organizerCommission,
      finalPriceWithCommission
    };

    setValues(newValues);
    onCalculationChange?.(newValues);
  }, [
    values.showFee, values.artisticAgency, values.managementFees,
    values.transport, values.tolls, values.parking,
    values.accommodation, values.catering, values.drinks,
    values.soundRental, values.lightRental, values.backlineRental, values.technicalStaff,
    values.productionCosts, values.communicationCosts, values.merchandising,
    values.insurance, values.otherCosts,
    values.tvaRate, values.marginRate, values.organizerCommissionRate
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
        {/* Frais artistiques */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Frais artistiques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="artisticAgency">Commission agence artistique</Label>
              <Input
                id="artisticAgency"
                type="number"
                placeholder="0"
                value={values.artisticAgency || ''}
                onChange={(e) => handleInputChange('artisticAgency', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managementFees">Frais de management</Label>
              <Input
                id="managementFees"
                type="number"
                placeholder="0"
                value={values.managementFees || ''}
                onChange={(e) => handleInputChange('managementFees', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Transport */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Transport
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="parking">Parking</Label>
              <Input
                id="parking"
                type="number"
                placeholder="0"
                value={values.parking || ''}
                onChange={(e) => handleInputChange('parking', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Hébergement et restauration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Hébergement et restauration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="drinks">Boissons</Label>
              <Input
                id="drinks"
                type="number"
                placeholder="0"
                value={values.drinks || ''}
                onChange={(e) => handleInputChange('drinks', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Technique */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Technique
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="lightRental">Location éclairage</Label>
              <Input
                id="lightRental"
                type="number"
                placeholder="0"
                value={values.lightRental || ''}
                onChange={(e) => handleInputChange('lightRental', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlineRental">Location backline</Label>
              <Input
                id="backlineRental"
                type="number"
                placeholder="0"
                value={values.backlineRental || ''}
                onChange={(e) => handleInputChange('backlineRental', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technicalStaff">Personnel technique</Label>
              <Input
                id="technicalStaff"
                type="number"
                placeholder="0"
                value={values.technicalStaff || ''}
                onChange={(e) => handleInputChange('technicalStaff', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Production */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Production
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productionCosts">Coûts de production</Label>
              <Input
                id="productionCosts"
                type="number"
                placeholder="0"
                value={values.productionCosts || ''}
                onChange={(e) => handleInputChange('productionCosts', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="communicationCosts">Frais de communication</Label>
              <Input
                id="communicationCosts"
                type="number"
                placeholder="0"
                value={values.communicationCosts || ''}
                onChange={(e) => handleInputChange('communicationCosts', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchandising">Merchandising</Label>
              <Input
                id="merchandising"
                type="number"
                placeholder="0"
                value={values.merchandising || ''}
                onChange={(e) => handleInputChange('merchandising', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Autres frais */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Autres frais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insurance">Assurance</Label>
              <Input
                id="insurance"
                type="number"
                placeholder="0"
                value={values.insurance || ''}
                onChange={(e) => handleInputChange('insurance', e.target.value)}
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

        {/* Paramètres de calcul */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Paramètres de calcul
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tvaRate">Taux TVA (%)</Label>
              <Input
                id="tvaRate"
                type="number"
                placeholder="20"
                value={values.tvaRate || ''}
                onChange={(e) => handleInputChange('tvaRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marginRate">Marge (%)</Label>
              <Input
                id="marginRate"
                type="number"
                placeholder="15"
                value={values.marginRate || ''}
                onChange={(e) => handleInputChange('marginRate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizerCommissionRate">Commission organisateur (%)</Label>
              <Input
                id="organizerCommissionRate"
                type="number"
                placeholder="10"
                value={values.organizerCommissionRate || ''}
                onChange={(e) => handleInputChange('organizerCommissionRate', e.target.value)}
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
              <span className="text-sm font-medium">TVA ({values.tvaRate}%)</span>
              <span className="font-semibold">{formatCurrency(values.tva)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Total TTC</span>
              <span className="font-semibold">{formatCurrency(values.totalTTC)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Marge ({values.marginRate}%)</span>
              <span className="font-semibold">{formatCurrency(values.margin)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Prix final</span>
              <span className="font-semibold">{formatCurrency(values.finalPrice)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Commission organisateur ({values.organizerCommissionRate}%)</span>
              <span className="font-semibold">{formatCurrency(values.organizerCommission)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 px-4 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-base font-semibold text-primary">Prix final avec commission</span>
              <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                {formatCurrency(values.finalPriceWithCommission)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};