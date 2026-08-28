import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - missing authorization header' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { to, subject, html, from, replyTo }: EmailRequest = await req.json();

    console.log('Sending email to:', to);
    console.log('Subject:', subject);

    if (!to || !Array.isArray(to) || to.length === 0) {
      throw new Error('Recipients (to) field is required and must be a non-empty array');
    }

    if (!subject || !html) {
      throw new Error('Subject and HTML content are required');
    }

    const emailResponse = await resend.emails.send({
      from: from || "Fatras <booking@fatras.net>",
      to,
      subject,
      html,
      replyTo: replyTo || undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    // Persister chaque destinataire dans la table `emails` pour qu'ils
    // apparaissent dans l'historique du contact (parité avec SMTP/IMAP).
    try {
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (serviceKey) {
        const adminSb = createClient(supabaseUrl, serviceKey);
        const sentAt = new Date().toISOString();
        const messageId = emailResponse.data?.id;
        const plainContent = (html || '').replace(/<[^>]*>/g, '').trim();
        const fromHeader = from || 'Fatras <booking@fatras.net>';
        const fromMatch = fromHeader.match(/<([^>]+)>/);
        const fromEmailClean = (fromMatch ? fromMatch[1] : fromHeader).toLowerCase().trim();
        const fromNameMatch = fromHeader.match(/^(.*?)\s*</);
        const fromName = fromNameMatch ? fromNameMatch[1].trim() : undefined;

        const lowerRecipients = to.map((r) => r.toLowerCase().trim()).filter(Boolean);
        const contactsByEmail = new Map<string, string>();
        if (lowerRecipients.length > 0) {
          const { data: contactsData } = await adminSb
            .from('contacts')
            .select('id, email')
            .in('email', lowerRecipients);
          for (const c of contactsData || []) {
            if (c.email) contactsByEmail.set(c.email.toLowerCase().trim(), c.id);
          }
        }

        const rows = to.map((recipient: string) => ({
          user_id: user.id,
          message_id: messageId,
          from_email: fromEmailClean,
          from_name: fromName,
          to_email: recipient,
          subject,
          html_content: html,
          content: plainContent,
          status: 'sent',
          sent_at: sentAt,
          direction: 'outbound',
          provider: 'resend',
          contact_id: contactsByEmail.get(recipient.toLowerCase().trim()) || null,
        }));

        const { error: dbError } = await adminSb.from('emails').insert(rows);
        if (dbError) {
          console.error('⚠️ Erreur stockage email Resend:', dbError);
        } else {
          console.log(`✅ ${rows.length} email(s) Resend stocké(s) en base`);
        }
      }
    } catch (persistErr) {
      console.error('⚠️ Exception persistance email Resend:', persistErr);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      id: emailResponse.data?.id,
      message: 'Email sent successfully' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      {
        status: 400,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);