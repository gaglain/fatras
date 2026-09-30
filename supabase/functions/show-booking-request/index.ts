import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface Payload {
  artist_id?: string;
  artist_name?: string;
  organization?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  desired_date?: string;
  period?: string;
  city?: string;
  postal_code?: string;
  capacity?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: Payload = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const firstName = (body.first_name || '').trim();
    const lastName = (body.last_name || '').trim();
    const organization = (body.organization || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !lastName || !organization) {
      return new Response(JSON.stringify({ success: false, error: 'Merci de renseigner votre nom, votre structure et un email valide.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve the show
    let artist: any = null;
    if (body.artist_id) {
      const { data } = await supabase
        .from('centralized_artists')
        .select('id, name, user_id, booking_contact_id')
        .eq('id', body.artist_id)
        .maybeSingle();
      artist = data;
    }
    const artistName = artist?.name || body.artist_name || 'Spectacle Fatras';

    // Owner: the show's owner, otherwise the first admin
    let ownerId: string | null = artist?.user_id ?? null;
    if (!ownerId) {
      const { data: admin } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['super_admin', 'admin'])
        .limit(1)
        .maybeSingle();
      ownerId = admin?.user_id ?? null;
    }
    if (!ownerId) {
      return new Response(JSON.stringify({ success: false, error: 'Configuration incomplète, merci de nous écrire directement.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Contact: reuse existing one when the address is already known
    const { data: existing } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, phone, company, city, postal_code, notes')
      .ilike('email', email)
      .limit(1)
      .maybeSingle();

    let contactId: string;
    if (existing?.id) {
      contactId = existing.id;
      await supabase.from('contacts').update({
        first_name: existing.first_name || firstName,
        last_name: existing.last_name || lastName,
        phone: existing.phone || body.phone || null,
        company: existing.company || organization,
        city: existing.city || body.city || null,
        postal_code: existing.postal_code || body.postal_code || null,
      }).eq('id', contactId);
    } else {
      const { data: created, error: contactError } = await supabase
        .from('contacts')
        .insert({
          user_id: ownerId,
          owner_id: ownerId,
          first_name: firstName,
          last_name: lastName,
          email,
          phone: body.phone || null,
          company: organization,
          city: body.city || null,
          postal_code: body.postal_code || null,
          country: 'France',
          status: 'prospect',
          source: 'website',
          role: 'contact',
          tags: ['Demande de date', artistName],
          notes: `Demande de disponibilité envoyée depuis le site pour « ${artistName} ».`,
        })
        .select('id')
        .single();
      if (contactError || !created) throw contactError || new Error('Contact creation failed');
      contactId = created.id;
    }

    const whenLabel = body.desired_date || body.period || 'à préciser';
    const requirements = [
      `Spectacle : ${artistName}`,
      `Structure : ${organization}`,
      `Période souhaitée : ${whenLabel}`,
      body.city ? `Lieu : ${body.city}${body.postal_code ? ` (${body.postal_code})` : ''}` : null,
      body.capacity ? `Jauge : ${body.capacity}` : null,
      body.phone ? `Téléphone : ${body.phone}` : null,
      body.message ? `\nMessage :\n${body.message}` : null,
    ].filter(Boolean).join('\n');

    // Opportunity for the requested date
    const { data: opportunity } = await supabase
      .from('opportunities')
      .insert({
        user_id: ownerId,
        owner_id: ownerId,
        contact_id: contactId,
        artist_id: artist?.id ?? null,
        title: `${artistName} — ${organization}`,
        description: `Demande de disponibilité reçue via le site web.`,
        location: body.city || null,
        venue: organization,
        date: body.desired_date && /^\d{4}-\d{2}-\d{2}$/.test(body.desired_date) ? body.desired_date : null,
        status: 'open',
        type: 'booking',
        requirements,
        contact: `${firstName} ${lastName} — ${email}`,
        probability_percentage: 20,
      })
      .select('id')
      .single();

    // Reminder task for the booking team
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    await supabase.from('tasks').insert({
      user_id: ownerId,
      assigned_to: ownerId,
      contact_id: contactId,
      artist_id: artist?.id ?? null,
      title: `Répondre à la demande de date — ${organization} (${artistName})`,
      description: requirements,
      priority: 'high',
      status: 'pending',
      due_date: dueDate.toISOString(),
      task_type: 'booking',
      tags: ['Demande de date'],
    });

    // In-app notification
    await supabase.from('notifications').insert({
      user_id: ownerId,
      type: 'contact',
      title: '🎪 Nouvelle demande de date',
      message: `${organization} demande une disponibilité pour « ${artistName} » (${whenLabel}).`,
      data: { contact_id: contactId, opportunity_id: opportunity?.id ?? null, artist_id: artist?.id ?? null },
    });

    // Notify the booking mailbox
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        let recipient = 'booking@fatras.net';
        const { data: settings } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .eq('setting_key', 'contact_email')
          .maybeSingle();
        if (settings?.setting_value) recipient = String(settings.setting_value).replace(/^"|"$/g, '');

        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'Fatras <booking@fatras.net>',
          to: [recipient],
          reply_to: email,
          subject: `Demande de date — ${organization} — ${artistName}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px">
            <h2 style="color:#c4654a">Nouvelle demande de disponibilité</h2>
            <p><strong>Spectacle :</strong> ${escapeHtml(artistName)}</p>
            <p><strong>Structure :</strong> ${escapeHtml(organization)}</p>
            <p><strong>Contact :</strong> ${escapeHtml(`${firstName} ${lastName}`)} — <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>${body.phone ? ` — ${escapeHtml(body.phone)}` : ''}</p>
            <p><strong>Période :</strong> ${escapeHtml(whenLabel)}</p>
            ${body.city ? `<p><strong>Lieu :</strong> ${escapeHtml(body.city)} ${escapeHtml(body.postal_code || '')}</p>` : ''}
            ${body.capacity ? `<p><strong>Jauge :</strong> ${escapeHtml(body.capacity)}</p>` : ''}
            ${body.message ? `<div style="background:#f5f3ee;padding:16px;border-radius:8px;white-space:pre-wrap">${escapeHtml(body.message)}</div>` : ''}
            <p style="color:#777;font-size:12px">Contact, opportunité et tâche de relance ont été créés automatiquement.</p>
          </div>`,
        });
      }
    } catch (mailError) {
      console.error('Booking request email failed:', mailError);
    }

    return new Response(JSON.stringify({ success: true, contact_id: contactId, opportunity_id: opportunity?.id ?? null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('show-booking-request error:', error);
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Erreur interne' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
