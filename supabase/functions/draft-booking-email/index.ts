import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { createResponsesCall } from '../_shared/ai/responses.ts';
import { getLovableAiGatewayResponseHeaders } from '../_shared/ai/run-id.ts';
import { canDraftBookingEmail, bookingDraftHtml, BOOKING_EMAIL_INSTRUCTIONS } from '../_shared/bookingEmailRules.ts';

const schema = z.object({
  programmer: z.object({ name: z.string().trim().min(1).max(200), email: z.string().email().max(254), organization: z.string().max(300), city: z.string().max(150), context: z.string().max(3000) }),
  showId: z.string().uuid(),
  period: z.string().max(300),
  templateId: z.string().uuid().nullable(),
});
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!url || !anon || !key) return json({ error: 'Lovable AI non configuré' }, 503);
    const auth = req.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) return json({ error: 'Connexion requise' }, 401);
    const client = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: { user }, error } = await client.auth.getUser(auth.slice(7));
    if (error || !user) return json({ error: 'Session invalide' }, 401);
    const { data: roles, error: roleError } = await client.from('user_roles').select('role').eq('user_id', user.id);
    if (roleError || !canDraftBookingEmail((roles ?? []).map(r => r.role))) return json({ error: 'Accès réservé à l’équipe de gestion' }, 403);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: 'Informations invalides', details: parsed.error.flatten() }, 400);
    const input = parsed.data;
    const { data: show, error: showError } = await client.from('centralized_artists')
      .select('name,genre,short_description,presentation_text,bio,website').eq('id', input.showId).single();
    if (showError || !show) return json({ error: 'Spectacle introuvable ou inaccessible' }, 404);
    let template = null;
    if (input.templateId) {
      const { data, error: templateError } = await client.from('email_templates').select('subject,content').eq('id', input.templateId).single();
      if (templateError || !data) return json({ error: 'Modèle introuvable ou inaccessible' }, 404);
      template = { subject: data.subject, content: data.content?.slice(0, 10000) };
    }
    const messages = [{ role: 'user' as const, content: JSON.stringify({ programmer: input.programmer, show: { ...show, presentation_text: show.presentation_text?.slice(0, 8000), bio: show.bio?.slice(0, 4000) }, requestedPeriod: input.period, writingTemplate: template }) }];
    const { result, gateway } = createResponsesCall(req, { baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey: key, model: 'openai/gpt-6-astra' }, messages, BOOKING_EMAIL_INSTRUCTIONS);
    // Wait only for the upstream HTTP headers, not generation, to preserve access denials before streaming.
    await gateway.waitForRunId();
    const reader = result.fullStream[Symbol.asyncIterator]();
    const first = await reader.next();
    const errorMessage = (err: unknown) => {
      const e = err as { statusCode?: number; responseBody?: string; message?: string };
      let message = e.message || 'La rédaction a échoué';
      if (e.responseBody) { try { const body = JSON.parse(e.responseBody); message = body.message || body.error?.message || message; } catch { /* plain provider message */ } }
      return { error: message, status: e.statusCode || 500 };
    };
    if (first.value?.type === 'error') {
      const failure = errorMessage(first.value.error);
      return json(failure, failure.status);
    }
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      async start(controller) {
        const send = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        try {
          send({ type: 'progress' });
          if (first.value?.type === 'error') throw first.value.error;
          for (;;) {
            const next = await reader.next();
            if (next.done) break;
            if (next.value.type === 'error') throw next.value.error;
            if (next.value.type === 'text-delta' || next.value.type === 'reasoning-delta') send({ type: 'progress' });
          }
          const output = await result.output;
          if (!output?.subject?.trim() || !output.paragraphs?.length) throw new Error('Aucun brouillon exploitable n’a été produit');
          send({ type: 'draft', subject: output.subject, html: bookingDraftHtml(output.paragraphs), to: input.programmer.email });
        } catch (err) {
          if (req.signal.aborted) send({ type: 'error', error: 'Rédaction annulée', status: 499 });
          else send({ type: 'error', ...errorMessage(err) });
        } finally { controller.close(); }
      },
      cancel() { return reader.return?.(); },
    });
    const headers = getLovableAiGatewayResponseHeaders(gateway.getRunId() ? { 'X-Lovable-AIG-Run-ID': gateway.getRunId() ?? '' } : undefined, { ...corsHeaders, 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' });
    return new Response(body, { headers });
  } catch (error) {
    if (req.signal.aborted) return json({ error: 'Rédaction annulée' }, 499);
    return json({ error: error instanceof Error ? error.message : 'Erreur de rédaction' }, 500);
  }
});