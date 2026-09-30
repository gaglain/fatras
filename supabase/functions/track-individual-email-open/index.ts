import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const PIXEL = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));

async function notifyEngagement(emailId: string, kind: 'opened' | 'clicked') {
  const { data: email } = await supabase
    .from('emails')
    .select('id, user_id, subject, to_email, to_name, contact_id, direction')
    .eq('id', emailId)
    .maybeSingle();

  if (!email?.user_id) return;

  let displayName = email.to_name || email.to_email || 'Un contact';
  let contactId = email.contact_id as string | null;

  if (!contactId && email.to_email) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, company')
      .ilike('email', email.to_email)
      .limit(1)
      .maybeSingle();
    if (contact) {
      contactId = contact.id;
      displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.company || displayName;
    }
  } else if (contactId) {
    const { data: contact } = await supabase
      .from('contacts')
      .select('first_name, last_name, company')
      .eq('id', contactId)
      .maybeSingle();
    if (contact) {
      displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.company || displayName;
    }
  }

  const title = kind === 'opened' ? '🔥 Prospect chaud : email ouvert' : '🎯 Prospect chaud : lien cliqué';
  const message = kind === 'opened'
    ? `${displayName} vient d'ouvrir votre email « ${email.subject || 'sans objet'} »`
    : `${displayName} a cliqué sur un lien de votre email « ${email.subject || 'sans objet'} »`;

  await supabase.from('notifications').insert({
    user_id: email.user_id,
    type: kind === 'opened' ? 'email_opened' : 'email_clicked',
    title,
    message,
    data: { email_id: email.id, contact_id: contactId, engagement: kind },
  });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get('email_id');

    if (!emailId) {
      return new Response('Missing email_id parameter', { status: 400, headers: corsHeaders });
    }

    console.log(`Individual email opened - Email ID: ${emailId}`);

    // Only the first open triggers an alert
    const { data: updated } = await supabase
      .from('emails')
      .update({
        opened_at: new Date().toISOString(),
        is_read: true,
        status: 'opened'
      })
      .eq('id', emailId)
      .is('opened_at', null)
      .select('id');

    if (updated && updated.length > 0) {
      try {
        await notifyEngagement(emailId, 'opened');
      } catch (notifyError) {
        console.error('Failed to create open notification:', notifyError);
      }
    }

    return new Response(PIXEL, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      },
    });
  } catch (error: any) {
    console.error('Error tracking individual email open:', error);
    return new Response(PIXEL, { headers: { ...corsHeaders, 'Content-Type': 'image/gif' } });
  }
};

serve(handler);
