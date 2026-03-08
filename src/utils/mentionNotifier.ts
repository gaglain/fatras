import { notifyMentionedUsersUniversal } from './mentionUtils';

/**
 * Helper to trigger mention notifications after saving any entity.
 * Call this after a successful save that includes text with potential @mentions.
 */
export const notifyMentionsIfNeeded = async ({
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
  contextType: string;
  contextName: string;
  contextId?: string;
}) => {
  if (!text || !text.includes('@[')) return;
  
  await notifyMentionedUsersUniversal({
    text,
    senderUserId,
    senderName,
    contextType,
    contextName,
    contextId,
  });
};
