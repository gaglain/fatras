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

async function notifyEngagement(emailId: string, kind: 'opened' | 'clicked') {
  const { data: email } = await supabase
    .from('emails')
    .select('id, user_id, subject, to_email, to_name, contact_id')
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

  await supabase.from('notifications').insert({
    user_id: email.user_id,
    type: kind === 'opened' ? 'email_opened' : 'email_clicked',
    title: kind === 'opened' ? '🔥 Prospect chaud : email ouvert' : '🎯 Prospect chaud : lien cliqué',
    message: kind === 'opened'
      ? `${displayName} vient d'ouvrir votre email « ${email.subject || 'sans objet'} »`
      : `${displayName} a cliqué sur un lien de votre email « ${email.subject || 'sans objet'} »`,
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
    const originalUrl = url.searchParams.get('url');

    if (!emailId || !originalUrl) {
      return new Response('Missing parameters', { status: 400, headers: corsHeaders });
    }

    console.log(`Individual email link clicked - Email ID: ${emailId}, URL: ${originalUrl}`);

    const { data: current } = await supabase
      .from('emails')
      .select('status')
      .eq('id', emailId)
      .maybeSingle();

    await supabase.from('emails').update({ status: 'clicked' }).eq('id', emailId);
    // Mark as opened if it wasn't already
    await supabase
      .from('emails')
      .update({
        is_read: true,
        opened_at: new Date().toISOString()
      })
      .eq('id', emailId)
      .is('opened_at', null);

    if (current?.status !== 'clicked') {
      try {
        await notifyEngagement(emailId, 'clicked');
      } catch (notifyError) {
        console.error('Failed to create click notification:', notifyError);
      }
    }

    // Redirect to original URL
    return Response.redirect(decodeURIComponent(originalUrl), 302);
  } catch (error: any) {
    console.error('Error tracking individual email click:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
};

serve(handler);
