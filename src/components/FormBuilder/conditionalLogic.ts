import { ConditionalRule, FormField } from './types';

/**
 * Evaluates whether a field should be visible based on its conditional rules
 */
export const evaluateFieldVisibility = (
  field: FormField,
  formData: Record<string, any>,
  allFields: FormField[]
): boolean => {
  if (!field.conditionalRules || field.conditionalRules.length === 0) {
    return true; // No rules = always visible
  }

  const action = field.conditionalAction || 'show';
  
  // All rules must match (AND logic)
  const allRulesMatch = field.conditionalRules.every(rule => {
    const sourceField = allFields.find(f => f.id === rule.fieldId);
    if (!sourceField) return false;

    const fieldValue = formData[rule.fieldId];

    switch (rule.operator) {
      case 'equals':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(rule.value);
        }
        return String(fieldValue || '') === String(rule.value || '');
      
      case 'not_equals':
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(rule.value);
        }
        return String(fieldValue || '') !== String(rule.value || '');
      
      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.some((v: string) => v.includes(rule.value || ''));
        }
        return String(fieldValue || '').includes(rule.value || '');
      
      case 'not_empty':
        if (Array.isArray(fieldValue)) return fieldValue.length > 0;
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
      
      case 'is_empty':
        if (Array.isArray(fieldValue)) return fieldValue.length === 0;
        return fieldValue === undefined || fieldValue === null || fieldValue === '';
      
      default:
        return false;
    }
  });

  return action === 'show' ? allRulesMatch : !allRulesMatch;
};
