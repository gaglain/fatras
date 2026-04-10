import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notifyOpportunityAssignment, notifyQuoteAssignment } from '@/utils/notificationHelpers';
import { logger } from '@/lib/logger';

/**
 * Link a contact to an entity via junction tables, and send notifications if applicable.
 */
export const linkContactToEntityAction = async (
  contactId: string,
  entityType: string,
  entityId: string,
  role: string,
  userId: string
): Promise<boolean> => {
  try {
    if (entityType === 'task') {
      await supabase
        .from('task_entities')
        .insert({ task_id: entityId, entity_type: 'contact', entity_id: contactId });
      toast.success('Liaison créée avec succès');
      return true;
    }

    let error = null;

    if (entityType === 'event') {
      const res = await supabase.from('contact_events').insert({ contact_id: contactId, event_id: entityId });
      error = res.error;
    } else if (entityType === 'opportunity') {
      const res = await supabase.from('contact_opportunities').insert({ contact_id: contactId, opportunity_id: entityId, role });
      error = res.error;
    } else if (entityType === 'quote') {
      const res = await supabase.from('contact_quotes').insert({ contact_id: contactId, quote_id: entityId, role });
      error = res.error;
    } else if (entityType === 'roadshow_stop') {
      const res = await supabase.from('roadshow_contacts').insert({ contact_id: contactId, roadshow_stop_id: entityId, role });
      error = res.error;
    }

    if (error) throw error;

    // Send notifications for opportunity/quote assignments
    if (entityType === 'opportunity' || entityType === 'quote') {
      const { data: contactData } = await supabase
        .from('contacts').select('user_id, first_name, last_name').eq('id', contactId).single();
      const { data: assignerData } = await supabase
        .from('profiles').select('email').eq('id', userId).single();

      if (contactData?.user_id && assignerData?.email) {
        if (entityType === 'opportunity') {
          const { data: oppData } = await supabase.from('opportunities').select('title').eq('id', entityId).single();
          if (oppData) {
            await notifyOpportunityAssignment({
              assignedToUserId: contactData.user_id,
              opportunityTitle: oppData.title,
              assignedByUserEmail: assignerData.email,
              opportunityId: entityId
            });
          }
        } else if (entityType === 'quote') {
          const { data: quoteData } = await supabase.from('quotes').select('quote_number, title').eq('id', entityId).single();
          if (quoteData) {
            await notifyQuoteAssignment({
              assignedToUserId: contactData.user_id,
              quoteReference: quoteData.quote_number || quoteData.title,
              assignedByUserEmail: assignerData.email,
              quoteId: entityId
            });
          }
        }
      }
    }

    toast.success('Liaison créée avec succès');
    return true;
  } catch (error) {
    logger.error('Erreur lors de la création de la liaison:', error);
    toast.error('Erreur lors de la création de la liaison');
    return false;
  }
};

/**
 * Unlink a contact from an entity.
 */
export const unlinkContactFromEntityAction = async (
  contactId: string,
  entityType: string,
  entityId: string
): Promise<boolean> => {
  try {
    if (entityType === 'task') {
      await supabase
        .from('task_entities')
        .delete()
        .eq('task_id', entityId)
        .eq('entity_type', 'contact')
        .eq('entity_id', contactId);
      toast.success('Liaison supprimée avec succès');
      return true;
    }

    let error = null;

    if (entityType === 'event') {
      const res = await supabase.from('contact_events').delete().eq('contact_id', contactId).eq('event_id', entityId);
      error = res.error;
    } else if (entityType === 'opportunity') {
      const res = await supabase.from('contact_opportunities').delete().eq('contact_id', contactId).eq('opportunity_id', entityId);
      error = res.error;
    } else if (entityType === 'quote') {
      const res = await supabase.from('contact_quotes').delete().eq('contact_id', contactId).eq('quote_id', entityId);
      error = res.error;
    } else if (entityType === 'roadshow_stop') {
      const res = await supabase.from('roadshow_contacts').delete().eq('contact_id', contactId).eq('roadshow_stop_id', entityId);
      error = res.error;
    }

    if (error) throw error;
    toast.success('Liaison supprimée avec succès');
    return true;
  } catch (error) {
    logger.error('Erreur lors de la suppression de la liaison:', error);
    toast.error('Erreur lors de la suppression de la liaison');
    return false;
  }
};
