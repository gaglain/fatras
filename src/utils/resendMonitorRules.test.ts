import { describe, it, expect } from 'vitest';
import { canReplayResendEvent, canManageResendWebhooks, eventTimestamp } from '../../supabase/functions/_shared/resendMonitorRules';

describe('Resend webhook recovery', () => {
  it('allows replay of failed deliveries only', () => {
    expect(canReplayResendEvent('failed')).toBe(true);
    for (const status of ['success', 'pending', 'attempting']) expect(canReplayResendEvent(status)).toBe(false);
  });
  it('restricts management to administrators', () => {
    expect(canManageResendWebhooks(['admin'])).toBe(true);
    expect(canManageResendWebhooks(['super_admin'])).toBe(true);
    for (const role of ['manager', 'collaborator', 'artiste', 'user']) expect(canManageResendWebhooks([role])).toBe(false);
  });
  it('preserves the original event time during replay', () => {
    expect(eventTimestamp('2026-11-08T23:20:00Z')).toBe('2026-11-08T23:20:00.000Z');
    expect(() => eventTimestamp('invalid')).toThrow();
  });
});