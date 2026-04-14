import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calculator, Euro } from 'lucide-react';
import { ContractCalculatorInputs } from './ContractCalculatorInputs';

interface ContractCalculatorProps {
  onCalculationChange?: (values: CalculationValues) => void;
  initialValues?: Partial<CalculationValues>;
}

export interface CalculationValues {
  showFee: number; artisticAgency: number; managementFees: number;
  transport: number; tolls: number; parking: number;
  accommodation: number; catering: number; drinks: number;
  soundRental: number; lightRental: number; backlineRental: number; technicalStaff: number;
  productionCosts: number; communicationCosts: number; merchandising: number;
  insurance: number; otherCosts: number;
  totalHT: number; tvaRate: number; tva: number; totalTTC: number;
  marginRate: number; margin: number; finalPrice: number;
  organizerCommissionRate: number; organizerCommission: number; finalPriceWithCommission: number;
}

const defaultValues: CalculationValues = {
  showFee: 0, artisticAgency: 0, managementFees: 0,
  transport: 0, tolls: 0, parking: 0,
  accommodation: 0, catering: 0, drinks: 0,
  soundRental: 0, lightRental: 0, backlineRental: 0, technicalStaff: 0,
  productionCosts: 0, communicationCosts: 0, merchandising: 0,
  insurance: 0, otherCosts: 0,
  totalHT: 0, tvaRate: 20, tva: 0, totalTTC: 0,
  marginRate: 15, margin: 0, finalPrice: 0,
  organizerCommissionRate: 10, organizerCommission: 0, finalPriceWithCommission: 0,
};

export const ContractCalculator: React.FC<ContractCalculatorProps> = ({ onCalculationChange, initialValues = {} }) => {
  const [values, setValues] = useState<CalculationValues>({ ...defaultValues, ...initialValues });

  useEffect(() => {
    const totalHT = values.showFee + values.artisticAgency + values.managementFees +
      values.transport + values.tolls + values.parking +
      values.accommodation + values.catering + values.drinks +
      values.soundRental + values.lightRental + values.backlineRental + values.technicalStaff +
      values.productionCosts + values.communicationCosts + values.merchandising +
      values.insurance + values.otherCosts;
    const tva = totalHT * (values.tvaRate / 100);
    const totalTTC = totalHT + tva;
    const margin = totalHT * (values.marginRate / 100);
    const finalPrice = totalTTC + margin;
    const organizerCommission = finalPrice * (values.organizerCommissionRate / 100);
    const finalPriceWithCommission = finalPrice + organizerCommission;
    const newValues = { ...values, totalHT, tva, totalTTC, margin, finalPrice, organizerCommission, finalPriceWithCommission };
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
    setValues(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const fmt = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  const summaryRows = [
    { label: 'Total HT', value: values.totalHT },
    { label: `TVA (${values.tvaRate}%)`, value: values.tva },
    { label: 'Total TTC', value: values.totalTTC },
    { label: `Marge (${values.marginRate}%)`, value: values.margin },
    { label: 'Prix final', value: values.finalPrice },
    { label: `Commission organisateur (${values.organizerCommissionRate}%)`, value: values.organizerCommission },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Calculateur de Devis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ContractCalculatorInputs values={values} onInputChange={handleInputChange} />
        <Separator />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Euro className="h-4 w-4" />Résumé financier
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {summaryRows.map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">{row.label}</span>
                <span className="font-semibold">{fmt(row.value)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-3 px-4 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-base font-semibold text-primary">Prix final avec commission</span>
              <Badge variant="secondary" className="text-lg font-bold px-3 py-1">{fmt(values.finalPriceWithCommission)}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
