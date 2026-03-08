import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConditionalRule, FormField } from './types';
import { Plus, Trash2, GitBranch } from 'lucide-react';

interface ConditionalLogicEditorProps {
  field: FormField;
  allFields: FormField[];
  onChange: (rules: ConditionalRule[], action: 'show' | 'hide') => void;
}

export const ConditionalLogicEditor: React.FC<ConditionalLogicEditorProps> = ({
  field,
  allFields,
  onChange,
}) => {
  const rules = field.conditionalRules || [];
  const action = field.conditionalAction || 'show';

  // Fields that can be used as conditions (exclude self and non-input types)
  const availableFields = allFields.filter(
    f => f.id !== field.id && !['heading', 'paragraph'].includes(f.type)
  );

  const addRule = () => {
    const firstField = availableFields[0];
    if (!firstField) return;
    const newRule: ConditionalRule = {
      fieldId: firstField.id,
      operator: 'not_empty',
    };
    onChange([...rules, newRule], action);
  };

  const updateRule = (index: number, updates: Partial<ConditionalRule>) => {
    const newRules = rules.map((r, i) => (i === index ? { ...r, ...updates } : r));
    onChange(newRules, action);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index), action);
  };

  if (availableFields.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Ajoutez d'autres champs pour créer des conditions.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <GitBranch className="h-4 w-4" />
        Logique conditionnelle
      </div>

      {rules.length > 0 && (
        <>
          <div>
            <Label className="text-xs">Action</Label>
            <Select
              value={action}
              onValueChange={(value: 'show' | 'hide') => onChange(rules, value)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="show">Afficher ce champ si...</SelectItem>
                <SelectItem value="hide">Masquer ce champ si...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rules.map((rule, index) => {
            const sourceField = allFields.find(f => f.id === rule.fieldId);
            const hasOptions = sourceField && ['select', 'radio', 'checkbox'].includes(sourceField.type);
            const needsValue = !['not_empty', 'is_empty'].includes(rule.operator);

            return (
              <div key={index} className="p-2 bg-muted/50 rounded-lg space-y-2">
                {index > 0 && (
                  <div className="text-xs text-center text-muted-foreground font-medium">ET</div>
                )}

                {/* Source field */}
                <Select
                  value={rule.fieldId}
                  onValueChange={(value) => updateRule(index, { fieldId: value, value: '' })}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(f => (
                      <SelectItem key={f.id} value={f.id} className="text-xs">
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Operator */}
                <Select
                  value={rule.operator}
                  onValueChange={(value: ConditionalRule['operator']) => updateRule(index, { operator: value })}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals" className="text-xs">est égal à</SelectItem>
                    <SelectItem value="not_equals" className="text-xs">n'est pas égal à</SelectItem>
                    <SelectItem value="contains" className="text-xs">contient</SelectItem>
                    <SelectItem value="not_empty" className="text-xs">n'est pas vide</SelectItem>
                    <SelectItem value="is_empty" className="text-xs">est vide</SelectItem>
                  </SelectContent>
                </Select>

                {/* Value */}
                {needsValue && (
                  hasOptions && sourceField?.options ? (
                    <Select
                      value={rule.value || ''}
                      onValueChange={(value) => updateRule(index, { value })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Choisir une valeur" />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceField.options.map((opt, i) => (
                          <SelectItem key={i} value={opt} className="text-xs">
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={rule.value || ''}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      placeholder="Valeur..."
                      className="h-7 text-xs"
                    />
                  )
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-destructive w-full"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Supprimer
                </Button>
              </div>
            );
          })}
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={addRule}
      >
        <Plus className="h-3 w-3 mr-1" />
        Ajouter une condition
      </Button>
    </div>
  );
};
