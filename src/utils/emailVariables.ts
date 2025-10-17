import { Contact } from '@/types/contact.types';
import { Event } from '@/types/event.types';

export interface EmailVariable {
  key: string;
  label: string;
  placeholder: string;
}

export const EMAIL_VARIABLES: EmailVariable[] = [
  { key: 'contact.firstName', label: 'Prénom', placeholder: '{{contact.firstName}}' },
  { key: 'contact.lastName', label: 'Nom', placeholder: '{{contact.lastName}}' },
  { key: 'contact.company', label: 'Entreprise', placeholder: '{{contact.company}}' },
  { key: 'contact.address', label: 'Adresse', placeholder: '{{contact.address}}' },
  { key: 'event.title', label: 'Événement associé', placeholder: '{{event.title}}' },
  { key: 'quote.reference', label: 'Devis associé', placeholder: '{{quote.reference}}' },
];

export function replaceEmailVariables(
  content: string,
  data: {
    contact?: Contact;
    event?: Event;
    quote?: { reference?: string; id?: string };
  }
): string {
  let result = content;

  // Remplacer les variables du contact
  if (data.contact) {
    result = result
      .replace(/\{\{contact\.firstName\}\}/g, data.contact.first_name || '')
      .replace(/\{\{contact\.lastName\}\}/g, data.contact.last_name || '')
      .replace(/\{\{contact\.company\}\}/g, data.contact.company || '')
      .replace(/\{\{contact\.address\}\}/g, data.contact.address || '');
  }

  // Remplacer les variables de l'événement
  if (data.event) {
    result = result.replace(/\{\{event\.title\}\}/g, data.event.title || '');
  }

  // Remplacer les variables du devis
  if (data.quote) {
    result = result.replace(/\{\{quote\.reference\}\}/g, data.quote.reference || data.quote.id || '');
  }

  return result;
}
