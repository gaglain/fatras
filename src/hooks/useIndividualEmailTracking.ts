import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export const useIndividualEmailTracking = () => {
  // Generate tracking pixel for individual emails
  const generateEmailTrackingPixel = (emailId: string) => {
    const fnBase = 'https://nhoemjarkxqwruupqgyd.functions.supabase.co';
    return `${fnBase}/track-individual-email-open?email_id=${emailId}`;
  };

  // Generate click tracking URL for individual emails
  const generateEmailClickTrackingUrl = (emailId: string, originalUrl: string) => {
    const fnBase = 'https://nhoemjarkxqwruupqgyd.functions.supabase.co';
    const encoded = encodeURIComponent(originalUrl);
    return `${fnBase}/track-individual-email-click?email_id=${emailId}&url=${encoded}`;
  };

  // Inject tracking into email HTML content
  const injectEmailTracking = (emailId: string, htmlContent: string): string => {
    if (!htmlContent) return htmlContent;

    // Add tracking pixel at the end of the body
    const trackingPixel = `<img src="${generateEmailTrackingPixel(emailId)}" width="1" height="1" alt="" style="display:none;" />`;
    
    // Replace all links with tracking links
    const trackedContent = htmlContent.replace(
      /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi,
      (match, quote, url) => {
        // Don't track mailto links or tracking pixels
        if (url.startsWith('mailto:') || url.includes('track-')) {
          return match;
        }
        const trackedUrl = generateEmailClickTrackingUrl(emailId, url);
        return `<a href=${quote}${trackedUrl}${quote}`;
      }
    );

    // Insert tracking pixel before closing body tag
    if (trackedContent.includes('</body>')) {
      return trackedContent.replace('</body>', `${trackingPixel}</body>`);
    } else {
      return trackedContent + trackingPixel;
    }
  };

  // Update email open status
  const markEmailAsOpened = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ 
          opened_at: new Date().toISOString(),
          is_read: true 
        })
        .eq('id', emailId)
        .is('opened_at', null);

      if (error) throw error;
    } catch (error) {
      logger.error('Error marking email as opened:', error);
    }
  };

  // Track email click
  const trackEmailClick = async (emailId: string, url: string) => {
    try {
      logger.debug(`Email ${emailId} link clicked: ${url}`);
    } catch (error) {
      logger.error('Error tracking email click:', error);
    }
  };

  return {
    generateEmailTrackingPixel,
    generateEmailClickTrackingUrl,
    injectEmailTracking,
    markEmailAsOpened,
    trackEmailClick,
  };
};
