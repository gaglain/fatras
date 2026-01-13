import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { Json } from '@/integrations/supabase/types';

interface EmailTrackingEvent {
  campaignId: string;
  contactId: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  eventData?: Json;
}

export const useEmailTracking = () => {
  const trackEmailEvent = async (event: EmailTrackingEvent) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Insert analytics event
      const { error: analyticsError } = await supabase
        .from('email_analytics')
        .insert([{
          user_id: user.user.id,
          campaign_id: event.campaignId,
          contact_id: event.contactId,
          event_type: event.eventType,
          event_data: event.eventData,
        }]);

      if (analyticsError) throw analyticsError;

      // Update campaign counters - call the edge function instead
      const fnBase = 'https://nhoemjarkxqwruupqgyd.functions.supabase.co';
      const updateResponse = await fetch(
        `${fnBase}/update-campaign-stats?campaign=${event.campaignId}&event_type=${event.eventType}`
      );

      if (!updateResponse.ok) throw new Error('Failed to update campaign stats');

    } catch (error: unknown) {
      logger.error('Error tracking email event:', error);
    }
  };

  const generateTrackingPixel = (campaignId: string, contactId: string) => {
    const fnBase = 'https://nhoemjarkxqwruupqgyd.functions.supabase.co';
    return `${fnBase}/track-email-open?campaign=${campaignId}&contact=${contactId}`;
  };

  const generateClickTrackingUrl = (campaignId: string, contactId: string, originalUrl: string) => {
    const fnBase = 'https://nhoemjarkxqwruupqgyd.functions.supabase.co';
    const encoded = encodeURIComponent(originalUrl);
    return `${fnBase}/track-email-click?campaign=${campaignId}&contact=${contactId}&url=${encoded}`;
  };

  return {
    trackEmailEvent,
    generateTrackingPixel,
    generateClickTrackingUrl,
  };
};