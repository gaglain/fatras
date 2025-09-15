import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nylas OAuth callback to finalize account connection (Gmail/Outlook)
serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const nylasApiKey = Deno.env.get('NYLAS_API_KEY');
    const nylasClientId = Deno.env.get('NYLAS_CLIENT_ID');
    const nylasClientSecret = Deno.env.get('NYLAS_CLIENT_SECRET');

    if (!supabaseUrl || !supabaseServiceKey || !nylasApiKey || !nylasClientId) {
      return html(`⚠️ Configuration manquante`, `Des variables d'environnement requises sont absentes. Veuillez configurer SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NYLAS_API_KEY, NYLAS_CLIENT_ID.`);
    }

    if (error) {
      console.error('OAuth error from provider:', error);
      return html('Connexion annulée', `Le fournisseur a renvoyé une erreur: ${error}`);
    }

    if (!code || !state) {
      return html('Paramètres invalides', `Le callback n'a pas reçu les paramètres nécessaires (code/state).`);
    }

    // state format: userId:provider:email
    const [userId, provider, email] = state.split(':');
    if (!userId || !provider || !email) {
      return html('State invalide', `Impossible de lire les informations utilisateur depuis le paramètre state.`);
    }

    console.log('🔐 Finalizing OAuth for', { userId, provider, email });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Exchange code for a Nylas grant
    const nylasBaseUrl = 'https://api.us.nylas.com/v3';
    const redirectUri = `${supabaseUrl}/functions/v1/nylas-email-callback`;

    if (!nylasClientSecret) {
      console.warn('NYLAS_CLIENT_SECRET missing, cannot exchange OAuth code.');
      return html(
        'Action requise',
        `Le secret NYLAS_CLIENT_SECRET n'est pas configuré. Ajoutez-le dans Supabase > Settings > Functions, puis réessayez.`
      );
    }

    const tokenRes = await fetch(`${nylasBaseUrl}/connect/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: nylasClientId,
        client_secret: nylasClientSecret,
        code,
        redirect_uri: redirectUri,
        provider,
      }),
    });

    if (!tokenRes.ok) {
      const bodyTxt = await tokenRes.text();
      console.error('Nylas token exchange failed:', bodyTxt);
      return html('Échec de la connexion', `Impossible d'échanger le code OAuth. Détails: ${bodyTxt}`);
    }

    const tokenData = await tokenRes.json();
    // tokenData likely contains: data: { id / grant_id }
    const grantId = tokenData?.data?.id || tokenData?.data?.grant_id || tokenData?.grant_id;
    if (!grantId) {
      console.warn('No grant id returned by Nylas:', tokenData);
    }

    // Persist account
    const { data: account, error: upsertErr } = await supabase
      .from('email_accounts')
      .upsert({
        user_id: userId,
        provider,
        email,
        access_token: grantId,
        is_active: true,
        last_sync_at: null,
      }, { onConflict: 'user_id,email' })
      .select()
      .single();

    if (upsertErr) {
      console.error('Upsert error:', upsertErr);
      return html('Sauvegarde échouée', `Le compte a été autorisé mais n'a pas pu être enregistré: ${upsertErr.message}`);
    }

    console.log('✅ Account saved:', account);

    return html(
      'Compte connecté',
      `Votre compte ${email} est maintenant connecté. Vous pouvez fermer cette fenêtre et revenir à l'application.`
    );
  } catch (e: any) {
    console.error('Callback error:', e);
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function html(title: string, message: string): Response {
  const page = `<!doctype html>
  <html lang="fr"><head><meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto;max-width:640px;margin:40px auto;padding:0 16px;line-height:1.5} .card{border:1px solid #e5e7eb;border-radius:12px;padding:24px} h1{font-size:20px;margin:0 0 8px} p{margin:0}</style>
  </head><body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </div>
  <script>setTimeout(() => window.close(), 2000)</script>
  </body></html>`;
  return new Response(page, { headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders } });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]+/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as any)[c]);
}
