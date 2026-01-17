import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface MentionNotificationParams {
  mentionedUserIds: string[];
  senderUserId: string;
  senderName: string;
  channelId: string;
  channelName: string;
  messageContent: string;
}

/**
 * Notify users when they are mentioned in a message
 */
export const notifyMentionedUsers = async ({
  mentionedUserIds,
  senderUserId,
  senderName,
  channelId,
  channelName,
  messageContent
}: MentionNotificationParams) => {
  if (mentionedUserIds.length === 0) return;

  const truncatedMessage = messageContent.length > 100 
    ? messageContent.substring(0, 100) + '...' 
    : messageContent;

  try {
    // Create notifications for all mentioned users (except the sender)
    const notifications = mentionedUserIds
      .filter(userId => userId !== senderUserId)
      .map(userId => ({
        user_id: userId,
        type: 'mention',
        title: `${senderName} vous a mentionné`,
        message: `Dans ${channelName}: "${truncatedMessage}"`,
        read: false,
        data: {
          channel_id: channelId,
          channel_name: channelName,
          sender_id: senderUserId,
          sender_name: senderName
        }
      }));

    if (notifications.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      logger.error('Error creating mention notifications:', error);
    } else {
      logger.debug(`Created ${notifications.length} mention notification(s)`);
    }
  } catch (error) {
    logger.error('Error in notifyMentionedUsers:', error);
  }
};
