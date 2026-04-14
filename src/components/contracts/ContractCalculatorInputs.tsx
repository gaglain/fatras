import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculationValues } from './ContractCalculator';

interface ContractCalculatorInputsProps {
  values: CalculationValues;
  onInputChange: (field: keyof CalculationValues, value: string) => void;
}

interface FieldDef {
  id: keyof CalculationValues;
  label: string;
}

const Section: React.FC<{ title: string; fields: FieldDef[]; cols?: number; values: CalculationValues; onChange: (field: keyof CalculationValues, value: string) => void }> = ({ title, fields, cols = 3, values, onChange }) => (
  <div className="space-y-4">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {fields.map(f => (
        <div key={f.id} className="space-y-2">
          <Label htmlFor={f.id}>{f.label}</Label>
          <Input id={f.id} type="number" placeholder="0" value={values[f.id] || ''} onChange={(e) => onChange(f.id, e.target.value)} />
        </div>
      ))}
    </div>
  </div>
);

export const ContractCalculatorInputs: React.FC<ContractCalculatorInputsProps> = ({ values, onInputChange }) => {
  return (
    <>
      <Section title="Frais artistiques" values={values} onChange={onInputChange} fields={[
        { id: 'showFee', label: 'Cachet artistique' },
        { id: 'artisticAgency', label: 'Commission agence artistique' },
        { id: 'managementFees', label: 'Frais de management' },
      ]} />
      <Section title="Transport" values={values} onChange={onInputChange} fields={[
        { id: 'transport', label: 'Transport' },
        { id: 'tolls', label: 'Péages' },
        { id: 'parking', label: 'Parking' },
      ]} />
      <Section title="Hébergement et restauration" values={values} onChange={onInputChange} fields={[
        { id: 'accommodation', label: 'Hébergement' },
        { id: 'catering', label: 'Restauration' },
        { id: 'drinks', label: 'Boissons' },
      ]} />
      <Section title="Technique" cols={2} values={values} onChange={onInputChange} fields={[
        { id: 'soundRental', label: 'Location son' },
        { id: 'lightRental', label: 'Location éclairage' },
        { id: 'backlineRental', label: 'Location backline' },
        { id: 'technicalStaff', label: 'Personnel technique' },
      ]} />
      <Section title="Production" values={values} onChange={onInputChange} fields={[
        { id: 'productionCosts', label: 'Coûts de production' },
        { id: 'communicationCosts', label: 'Frais de communication' },
        { id: 'merchandising', label: 'Merchandising' },
      ]} />
      <Section title="Autres frais" cols={2} values={values} onChange={onInputChange} fields={[
        { id: 'insurance', label: 'Assurance' },
        { id: 'otherCosts', label: 'Autres frais' },
      ]} />
      <Section title="Paramètres de calcul" values={values} onChange={onInputChange} fields={[
        { id: 'tvaRate', label: 'Taux TVA (%)' },
        { id: 'marginRate', label: 'Marge (%)' },
        { id: 'organizerCommissionRate', label: 'Commission organisateur (%)' },
      ]} />
    </>
  );
};
