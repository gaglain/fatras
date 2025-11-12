import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}

/**
 * Crée une notification pour un utilisateur
 */
export const createNotification = async (notification: NotificationData) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: false
      });

    if (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }

    console.log('✅ Notification créée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création de notification:', error);
  }
};

/**
 * Notifie un utilisateur lors d'une assignation de tâche
 */
export const notifyTaskAssignment = async (params: {
  assignedToUserId: string;
  taskTitle: string;
  assignedByUserEmail: string;
  taskId: string;
}) => {
  await createNotification({
    user_id: params.assignedToUserId,
    type: 'task',
    title: 'Nouvelle tâche assignée',
    message: `${params.assignedByUserEmail} vous a assigné la tâche : ${params.taskTitle}`,
    data: {
      task_id: params.taskId,
      assigned_by: params.assignedByUserEmail
    }
  });
};

/**
 * Notifie un utilisateur lors d'une assignation de contact
 */
export const notifyContactAssignment = async (params: {
  assignedToUserId: string;
  contactName: string;
  assignedByUserEmail: string;
  contactId: string;
}) => {
  await createNotification({
    user_id: params.assignedToUserId,
    type: 'contact',
    title: 'Nouveau contact assigné',
    message: `${params.assignedByUserEmail} vous a assigné le contact : ${params.contactName}`,
    data: {
      contact_id: params.contactId,
      assigned_by: params.assignedByUserEmail
    }
  });
};

/**
 * Notifie un utilisateur lors d'une assignation d'opportunité
 */
export const notifyOpportunityAssignment = async (params: {
  assignedToUserId: string;
  opportunityTitle: string;
  assignedByUserEmail: string;
  opportunityId: string;
}) => {
  await createNotification({
    user_id: params.assignedToUserId,
    type: 'opportunity',
    title: 'Nouvelle opportunité assignée',
    message: `${params.assignedByUserEmail} vous a assigné l'opportunité : ${params.opportunityTitle}`,
    data: {
      opportunity_id: params.opportunityId,
      assigned_by: params.assignedByUserEmail
    }
  });
};

/**
 * Notifie un utilisateur lors d'une assignation de devis
 */
export const notifyQuoteAssignment = async (params: {
  assignedToUserId: string;
  quoteReference: string;
  assignedByUserEmail: string;
  quoteId: string;
}) => {
  await createNotification({
    user_id: params.assignedToUserId,
    type: 'quote',
    title: 'Nouveau devis assigné',
    message: `${params.assignedByUserEmail} vous a assigné le devis : ${params.quoteReference}`,
    data: {
      quote_id: params.quoteId,
      assigned_by: params.assignedByUserEmail
    }
  });
};
