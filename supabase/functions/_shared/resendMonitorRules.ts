export const EVENTS_WEBHOOK_ID = '669fa4ab-fff5-4c0d-ad12-1da99175778b';

export function canReplayResendEvent(status: string): boolean {
  return status === 'failed';
}

export function canManageResendWebhooks(roles: string[]): boolean {
  return roles.some(role => role === 'admin' || role === 'super_admin');
}

export function eventTimestamp(createdAt: unknown): string {
  if (typeof createdAt !== 'string' || !Number.isFinite(Date.parse(createdAt))) {
    throw new Error('Invalid event timestamp');
  }
  return new Date(createdAt).toISOString();
}