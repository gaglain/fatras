/**
 * Utility functions for classifying email direction (sent/received)
 * Extracted from useUnifiedEmails to reduce hook complexity.
 */

export const normalizeAddress = (value: string): string => {
  if (!value) return '';
  const match = value.match(/<([^>]+)>/);
  const email = match ? match[1] : value;
  return email.replace(/(^"|"$)/g, '').trim().toLowerCase();
};

export const isSentLabel = (label: string): boolean => {
  if (!label) return false;
  const lowerLabel = label.toLowerCase();
  return (
    lowerLabel.includes('sent') ||
    lowerLabel.includes('envoyé') ||
    lowerLabel.includes('outbox') ||
    lowerLabel === 'inbox.sent' ||
    lowerLabel === 'sent items' ||
    lowerLabel === '[gmail]/sent mail' ||
    lowerLabel === '[gmail]/messages envoyés'
  );
};

const HARD_SENT_EMAILS = new Set(['booking@fatras.net', 'fatrasplanning@gmail.com']);

export const classifyDirection = (
  from: string,
  to: string,
  labels: string[],
  myEmailsSet: Set<string>,
  myDomainsSet?: Set<string>
): 'sent' | 'received' => {
  const normalizedFrom = normalizeAddress(from);
  const normalizedTo = normalizeAddress(to);
  const hasSent = (labels || []).some(isSentLabel);

  if (HARD_SENT_EMAILS.has(normalizedFrom)) return 'sent';
  if (myEmailsSet.has(normalizedFrom)) return 'sent';
  if (hasSent && !myEmailsSet.has(normalizedTo)) return 'sent';

  if (myDomainsSet) {
    const fromDomain = (normalizedFrom.split('@')[1] || '').toLowerCase();
    const isFromMyDomain = fromDomain && myDomainsSet.has(fromDomain);
    const isToMe = myEmailsSet.has(normalizedTo);
    if (isFromMyDomain && !isToMe) return 'sent';
  }

  return 'received';
};

export const buildMyEmailsSet = (
  accountEmails: string[],
  userEmail: string
): Set<string> => {
  return new Set(
    [
      ...accountEmails,
      userEmail || '',
      'booking@fatras.net',
      'fatrasplanning@gmail.com'
    ]
      .filter(Boolean)
      .map(normalizeAddress)
  );
};

export const buildMyDomainsSet = (myEmailsSet: Set<string>): Set<string> => {
  return new Set(
    Array.from(myEmailsSet)
      .map((e: string) => e.split('@')[1])
      .filter(Boolean)
  );
};
