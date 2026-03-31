export interface LocalEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: string[];
}

export interface LocalEmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  content: string;
  variables: string[];
}

export interface ScheduledEmail {
  id: string;
  to: string;
  subject: string;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'failed';
}

export const sampleEmails: LocalEmail[] = [
  {
    id: '1', from: 'john.smith@venue.com', to: 'user@showmanager.com',
    subject: 'Confirmation de la réservation - Salle de Concert',
    content: 'Bonjour,\n\nNous confirmons votre réservation pour le 15 juillet 2024.\n\nVeuillez trouver les détails ci-dessous:\n- Date: 15 juillet 2024\n- Heure: 20h00\n- Lieu: Salle principale\n- Capacité: 500 personnes\n\nCordialement,\nJohn Smith\nGestionnaire de venue',
    date: '2024-06-13T10:30:00', isRead: false, isStarred: true,
    attachments: ['contract_final.pdf', 'technical_rider.pdf']
  },
  {
    id: '2', from: 'sarah@festivalprods.com', to: 'user@showmanager.com',
    subject: 'Demande de fiche technique - Thunder Road',
    content: 'Bonjour,\n\nPourriez-vous nous envoyer la fiche technique mise à jour pour Thunder Road?\n\nNous devons finaliser le setup pour le festival.\n\nMerci,\nSarah',
    date: '2024-06-12T14:15:00', isRead: true, isStarred: false
  },
  {
    id: '3', from: 'mike@production.com', to: 'user@showmanager.com',
    subject: 'Nouvelle date disponible - The Midnight Express',
    content: "Salut,\n\nNous avons une nouvelle date qui s'est libérée le 20 août.\n\nSeriez-vous intéressés pour The Midnight Express?\n\nFaites-moi savoir rapidement.\n\nMike",
    date: '2024-06-11T09:45:00', isRead: true, isStarred: false
  }
];

export const emailTemplates: LocalEmailTemplate[] = [
  { id: '1', name: 'Suivi de Contrat', subject: 'Suivi du contrat pour {{event_name}}', category: 'Contrat',
    content: "Bonjour {{contact_name}},\n\nJ'espère que ce email vous trouve en bonne santé. Je souhaitais faire le suivi du contrat que nous avons envoyé pour {{event_name}} le {{event_date}}.\n\nSi vous avez des questions, n'hésitez pas à me contacter.\n\nCordialement,\n{{user_name}}",
    variables: ['contact_name', 'event_name', 'event_date', 'user_name'] },
  { id: '2', name: 'Confirmation de Spectacle', subject: 'Confirmation de spectacle - {{artist_name}} à {{venue_name}}', category: 'Réservation',
    content: "Cher {{contact_name}},\n\nNous sommes heureux de confirmer la réservation pour {{artist_name}} à {{venue_name}} le {{event_date}}.\n\nDétails de l'événement :\n- Artiste : {{artist_name}}\n- Lieu : {{venue_name}}\n- Date : {{event_date}}\n- Heure : {{event_time}}\n- Montant : {{contract_amount}}\n\nNous vous enverrons la fiche technique sous peu.\n\nCordialement,\n{{user_name}}",
    variables: ['contact_name', 'artist_name', 'venue_name', 'event_date', 'event_time', 'contract_amount', 'user_name'] },
  { id: '3', name: 'Exigences Techniques', subject: "Fiche technique et exigences de scène - {{artist_name}}", category: 'Technique',
    content: "Bonjour {{contact_name}},\n\nVeuillez trouver en pièce jointe la fiche technique et les exigences de scène pour {{artist_name}}.\n\nCordialement,\n{{user_name}}",
    variables: ['contact_name', 'artist_name', 'user_name'] },
  { id: '4', name: 'Demande de Renseignements', subject: "Demande de renseignements - {{artist_name}}", category: 'Commercial',
    content: "Bonjour {{contact_name}},\n\nNous organisons un événement le {{event_date}} à {{venue_name}} et aimerions avoir des informations concernant {{artist_name}}.\n\nMerci d'avance,\n{{user_name}}\n{{company_name}}",
    variables: ['contact_name', 'event_date', 'venue_name', 'artist_name', 'user_name', 'company_name'] },
  { id: '5', name: 'Rappel de Paiement', subject: 'Rappel de paiement - {{event_name}}', category: 'Finance',
    content: "Bonjour {{contact_name}},\n\nNous vous contactons concernant le paiement de {{contract_amount}} pour l'événement {{event_name}} du {{event_date}}.\n\nCordialement,\n{{user_name}}",
    variables: ['contact_name', 'contract_amount', 'event_name', 'event_date', 'due_date', 'user_name'] },
];

export const scheduledEmails: ScheduledEmail[] = [
  { id: '1', to: 'john.smith@venue.com', subject: "Suivi de contrat pour Festival d'Été", scheduledFor: '2024-06-15T10:00:00', status: 'scheduled' },
  { id: '2', to: 'sarah@festivalprods.com', subject: 'Exigences techniques pour Thunder Road', scheduledFor: '2024-06-16T14:30:00', status: 'scheduled' },
];

export const templateCategories = ['all', 'Contrat', 'Réservation', 'Technique', 'Commercial', 'Finance'];
