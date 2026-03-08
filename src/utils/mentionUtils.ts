// Universal mention utilities
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

/**
 * Extract user_ids from text containing @mentions
 * Matches pattern: @[DisplayName](user_id)
 */
export const extractMentionedUserIds = (text: string): string[] => {
  const regex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[2] && !ids.includes(match[2])) {
      ids.push(match[2]);
    }
  }
  return ids;
};

/**
 * Convert mention markup to display text for rendering
 * @[DisplayName](user_id) -> @DisplayName
 */
export const renderMentionText = (text: string): string => {
  return text.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
};

/**
 * Create notifications for all mentioned users
 */
export const notifyMentionedUsersUniversal = async ({
  text,
  senderUserId,
  senderName,
  contextType,
  contextName,
  contextId,
}: {
  text: string;
  senderUserId: string;
  senderName: string;
  contextType: string; // 'channel', 'contact', 'event', 'quote', 'task', 'opportunity', etc.
  contextName: string;
  contextId?: string;
}) => {
  const mentionedIds = extractMentionedUserIds(text);
  if (mentionedIds.length === 0) return;

  const truncated = renderMentionText(text).slice(0, 100);

  const contextLabels: Record<string, string> = {
    channel: 'le canal',
    contact: 'un contact',
    event: 'un événement',
    quote: 'un devis',
    task: 'une tâche',
    opportunity: 'une opportunité',
    contract: 'un contrat',
    roadshow: 'une feuille de route',
    note: 'une note',
  };

  const label = contextLabels[contextType] || contextType;

  const notifications = mentionedIds
    .filter(id => id !== senderUserId)
    .map(userId => ({
      user_id: userId,
      type: 'mention',
      title: `${senderName} vous a mentionné`,
      message: `Dans ${label} "${contextName}": "${truncated}"`,
      read: false,
      data: {
        context_type: contextType,
        context_id: contextId,
        context_name: contextName,
        sender_id: senderUserId,
        sender_name: senderName,
      },
    }));

  if (notifications.length === 0) return;

  try {
    const { error } = await supabase.from('notifications').insert(notifications);
    if (error) {
      logger.error('Error creating mention notifications:', error);
    } else {
      logger.debug(`Created ${notifications.length} mention notification(s)`);
    }
  } catch (err) {
    logger.error('Error in notifyMentionedUsersUniversal:', err);
  }
};
