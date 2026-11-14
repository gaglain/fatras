import { describe, expect, it } from 'vitest';
import { getResendEventsSecret } from '../../supabase/functions/_shared/resendWebhookConfig';

describe('Resend event endpoint signing configuration', () => {
  it('uses the active endpoint secret rather than the legacy endpoint secret', () => {
    const env: Record<string, string> = {
      RESEND_EVENTS_SIGNING_SECRET: 'active-endpoint-test-secret',
      RESEND_WEBHOOK_SECRET: 'legacy-endpoint-test-secret',
    };
    expect(getResendEventsSecret((name) => env[name])).toBe('active-endpoint-test-secret');
  });
  it('supports the legacy secret when no dedicated secret exists', () => {
    expect(getResendEventsSecret((name) => name === 'RESEND_WEBHOOK_SECRET' ? 'legacy-test-secret' : undefined))
      .toBe('legacy-test-secret');
  });
  it('rejects event processing without a configured signing secret', () => {
    expect(() => getResendEventsSecret(() => undefined)).toThrow('Missing Resend webhook signing secret');
  });
});