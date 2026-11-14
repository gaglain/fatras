// The active endpoint has its own signing secret; the old name remains a fallback.
export function getResendEventsSecret(getEnv: (name: string) => string | undefined) {
  const secret = getEnv('RESEND_EVENTS_SIGNING_SECRET') || getEnv('RESEND_WEBHOOK_SECRET');
  if (!secret) throw new Error('Missing Resend webhook signing secret');
  return secret;
}