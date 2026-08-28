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

    // Update the email to mark it as read if not already
    await supabase
      .from('emails')
      .update({ 
        is_read: true,
        opened_at: new Date().toISOString()
      })
      .eq('id', emailId)
      .is('opened_at', null);

    // Redirect to original URL
    return Response.redirect(decodeURIComponent(originalUrl), 302);
  } catch (error: any) {
    console.error('Error tracking individual email click:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
};

serve(handler);
