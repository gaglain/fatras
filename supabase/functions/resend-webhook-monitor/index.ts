import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { EVENTS_WEBHOOK_ID, canReplayResendEvent, canManageResendWebhooks } from '../_shared/resendMonitorRules.ts';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('list'), after: z.string().regex(/^msg_[a-zA-Z0-9]+$/).optional() }),
  z.object({ action: z.literal('details'), eventId: z.string().regex(/^msg_[a-zA-Z0-9]+$/) }),
  z.object({ action: z.literal('replay'), eventId: z.string().regex(/^msg_[a-zA-Z0-9]+$/) }),
]);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});

class ProviderError extends Error {
  constructor(public status: number, public details: string) { super('Resend request failed'); }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !anon) return json({ error: 'Missing Supabase configuration' }, 500);
    const authorization = req.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) return json({ error: 'Connexion requise' }, 401);
    const client = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await client.auth.getUser(authorization.slice(7));
    if (authError || !user) return json({ error: 'Session invalide' }, 401);
    const { data: roles, error: roleError } = await client.from('user_roles').select('role').eq('user_id', user.id);
    if (roleError || !canManageResendWebhooks((roles ?? []).map(r => r.role))) {
      return json({ error: 'Accès réservé aux administrateurs' }, 403);
    }
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey || !lovableKey) return json({ error: 'Connexion Resend non configurée' }, 503);
    const call = async (path: string, method = 'GET') => {
      const response = await fetch(`https://connector-gateway.lovable.dev/resend${path}`, {
        method,
        headers: { Authorization: `Bearer ${lovableKey}`, 'X-Connection-Api-Key': apiKey },
      });
      if (!response.ok) {
        const details = await response.text();
        console.error(`Resend [${response.status}]: ${details}`);
        throw new ProviderError(response.status, details);
      }
      return response.json();
    };
    const base = `/webhooks/${EVENTS_WEBHOOK_ID}`;
    const input = parsed.data;
    if (input.action === 'list') {
      // Never return the webhook signing_secret supplied by the provider.
      const webhook = await call(base);
      const events = await call(`${base}/events?limit=20${input.after ? `&after=${encodeURIComponent(input.after)}` : ''}`);
      return json({ webhook: { id: webhook.id, status: webhook.status, endpoint: webhook.endpoint }, ...events });
    }
    if (input.action === 'details') {
      const event = await call(`${base}/events/${input.eventId}`);
      const attempts = await call(`${base}/events/${input.eventId}/attempts?limit=100`);
      return json({ event, attempts });
    }
    const event = await call(`${base}/events/${input.eventId}`);
    if (!canReplayResendEvent(event.status)) return json({ error: 'Seuls les événements en échec peuvent être relancés' }, 409);
    const webhook = await call(base);
    if (webhook.status !== 'enabled') return json({ error: 'Réactivez le webhook dans Resend avant de relancer cet événement' }, 409);
    const result = await call(`${base}/events/${input.eventId}/replay`, 'POST');
    return json({ queued: true, id: result.id });
  } catch (error) {
    if (error instanceof ProviderError) return json({ error: error.message, status: error.status, details: error.details }, error.status);
    console.error('Resend monitor failed:', error);
    return json({ error: error instanceof Error ? error.message : 'Erreur du suivi Resend' }, 500);
  }
});