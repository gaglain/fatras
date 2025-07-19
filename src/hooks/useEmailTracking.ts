import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailTrackingEvent {
  campaignId: string;
  contactId: string;
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  eventData?: any;
}

export const useEmailTracking = () => {
  const trackEmailEvent = async (event: EmailTrackingEvent) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Insert analytics event
      const { error: analyticsError } = await supabase
        .from('email_analytics')
        .insert({
          user_id: user.user.id,
          campaign_id: event.campaignId,
          contact_id: event.contactId,
          event_type: event.eventType,
          event_data: event.eventData,
        });

      if (analyticsError) throw analyticsError;

      // Update campaign counters
      const { error: updateError } = await supabase.rpc('update_campaign_stats', {
        campaign_id: event.campaignId,
        event_type: event.eventType,
      } as any);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Error tracking email event:', error);
    }
  };

  const generateTrackingPixel = (campaignId: string, contactId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/track-email-open?campaign=${campaignId}&contact=${contactId}`;
  };

  const generateClickTrackingUrl = (campaignId: string, contactId: string, originalUrl: string) => {
    const baseUrl = window.location.origin;
    const encoded = encodeURIComponent(originalUrl);
    return `${baseUrl}/api/track-email-click?campaign=${campaignId}&contact=${contactId}&url=${encoded}`;
  };

  return {
    trackEmailEvent,
    generateTrackingPixel,
    generateClickTrackingUrl,
  };
};