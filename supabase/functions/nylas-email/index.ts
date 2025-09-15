import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NylasRequest {
  action: 'connect' | 'sync' | 'send' | 'test' | 'test_imap' | 'test_smtp' | 'list_accounts' | 'send_test_email';
  accountId?: string;
  email?: {
    to: string;
    subject: string;
    content: string;
    html?: string;
  };
  testEmail?: string;
  provider?: 'gmail' | 'outlook' | 'imap';
  config?: {
    email: string;
    password?: string;
    host?: string;
    port?: number;
    ssl?: boolean;
    imap_host?: string;
    imap_port?: number;
    smtp_host?: string;
    smtp_port?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const nylasApiKey = Deno.env.get('NYLAS_API_KEY');
    const nylasClientId = Deno.env.get('NYLAS_CLIENT_ID');

    if (!supabaseUrl || !supabaseServiceKey || !nylasApiKey || !nylasClientId) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, accountId, email, testEmail, provider, config }: NylasRequest = await req.json();

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log(`🔄 Nylas action: ${action} for user: ${user.id}`);

    const nylasBaseUrl = 'https://api.us.nylas.com/v3';

    switch (action) {
      case 'list_accounts':
        return await listEmailAccounts(nylasBaseUrl, nylasApiKey, supabase, user.id);
      case 'connect':
        return await connectEmailAccount(nylasBaseUrl, nylasApiKey, nylasClientId, supabase, user.id, provider!, config!);
      case 'sync':
        return await syncEmails(nylasBaseUrl, nylasApiKey, supabase, user.id, accountId!);
      case 'send':
        return await sendEmail(nylasBaseUrl, nylasApiKey, supabase, user.id, accountId!, email!);
      case 'test':
        return await testConnection(nylasBaseUrl, nylasApiKey, accountId!);
      case 'test_imap':
        return await testImapConnectivity(config!);
      case 'test_smtp':
        return await testSmtpConnectivity(config!);
      case 'send_test_email':
        return await sendTestEmail(nylasBaseUrl, nylasApiKey, supabase, user.id, accountId!, testEmail!);
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

  } catch (error: any) {
    console.error('❌ Nylas error:', error);
    // Renvoyer 200 pour éviter FunctionsHttpError côté client, tout en exposant l'erreur
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || String(error)
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

async function listEmailAccounts(baseUrl: string, apiKey: string, supabase: any, userId: string) {
  try {
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        accounts: accounts || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    throw new Error(`Failed to list accounts: ${error.message}`);
  }
}

async function connectEmailAccount(baseUrl: string, apiKey: string, clientId: string, supabase: any, userId: string, provider: string, config: any) {
  try {
    console.log(`🔗 Connecting ${provider} account for ${config.email}`);

        if (provider === 'imap') {
          // Derive robust IMAP/SMTP settings (optimized for OVH and common providers)
          let imap_host = (config as any).imap_host ?? config.host;
          let imap_port = (config as any).imap_port ?? config.port ?? 993;
          let smtp_host = (config as any).smtp_host ?? config.host;
          let smtp_port = (config as any).smtp_port ?? 587;

          // Build Nylas IMAP grant payload (no security flags — Nylas infers from ports)
          const grantBody = () => JSON.stringify({
            provider: 'imap',
            settings: {
              imap_host,
              imap_port,
              imap_username: config.email,
              imap_password: config.password,
              smtp_host,
              smtp_port,
              smtp_username: config.email,
              smtp_password: config.password,
            }
          });

          // IMAP-only (no SMTP) payload for fallback when SMTP fails or is not required
          const grantBodyImapOnly = () => JSON.stringify({
            provider: 'imap',
            settings: {
              imap_host,
              imap_port,
              imap_username: config.email,
              imap_password: config.password,
            }
          });

          // Log exact params used (host/ports preserved, no auto-override)
          console.log('🔍 IMAP connect attempt', { imap_host, imap_port, smtp_host, smtp_port });
          console.log('📨 IMAP: trying direct grant creation');
      let grantResponse = await fetch(`${baseUrl}/connect/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: grantBody(),
      });

      if (!grantResponse.ok) {
        const firstText = await grantResponse.clone().text();
        let firstJson: any = null;
        try { firstJson = JSON.parse(firstText); } catch {}
        console.log('⚠️ IMAP grant creation failed:', firstText);

        const providerErr: string = firstJson?.error?.provider_error?.error || '';
        const nylasErrType: string = firstJson?.error?.type || '';

        // 1.a) Retry with SMTPS 465 if STARTTLS/auth fails (common with some providers)
        if ((/Unrecognized authentication type|AUTH|authentication failed/i.test(providerErr)) && smtp_port !== 465) {
          console.log('🔁 Retrying grant with SMTPS 465/ssl');
          smtp_port = 465;
          grantResponse = await fetch(`${baseUrl}/connect/custom`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: grantBody(),
          });
        }

        // OVH fallback to ssl0.ovh.net if provider not responding
        if (!grantResponse.ok) {
          const midText = await grantResponse.clone().text();
          if (/provider_not_responding|Failed to connect|timeout/i.test(midText) && /ovh/i.test(String(smtp_host)) && smtp_host !== 'ssl0.ovh.net' && !/pro1\.mail\.ovh\.net/i.test(String(smtp_host))) {
            console.log('🔁 Retrying grant with OVH fallback host ssl0.ovh.net:465');
            smtp_host = 'ssl0.ovh.net';
            if (/ovh/i.test(String(imap_host))) imap_host = 'ssl0.ovh.net';
            smtp_port = 465;
            grantResponse = await fetch(`${baseUrl}/connect/custom`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: grantBody(),
            });
          }
        }

        if (!grantResponse.ok) {
          // 1.b) If connector is missing, create it then retry grant
          const errText = firstJson ? firstText : await grantResponse.clone().text();
          let errJson: any = firstJson;
          if (!errJson) { try { errJson = JSON.parse(errText); } catch {} }
          const errType: string = errJson?.error?.type || '';

          if (/connector\.not_found|connector\.missing/i.test(errType) || /connector\.not_found|connector\.missing/i.test(errText)) {
            console.log('🧩 IMAP connector missing: creating connector or reusing existing...');
            const connectorResponse = await fetch(`${baseUrl}/connectors`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: 'imap',
                settings: {
                  imap_host,
                  imap_port,
                  smtp_host,
                  smtp_port,
                }
              }),
            });

            if (!connectorResponse.ok) {
              const connText = await connectorResponse.text();
              let connJson: any = null;
              try { connJson = JSON.parse(connText); } catch {}
              const connType: string = connJson?.error?.type || '';
              // Ignore if connector already exists or conflict
              if (!/connector\.already_exists/i.test(connType) && !/connector\.already_exists/i.test(connText) && connectorResponse.status !== 409) {
                throw new Error(`Connector creation failed: ${connText}`);
              }
              console.log('ℹ️ IMAP connector already exists, proceeding.');
            } else {
              console.log('✅ IMAP connector created');
            }

            // Retry grant after connector ensured
            grantResponse = await fetch(`${baseUrl}/connect/custom`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: grantBody(),
            });

            if (!grantResponse.ok) {
              const retryErr = await grantResponse.text();
              throw new Error(`Grant creation failed after ensuring connector: ${retryErr}`);
            }
          } else {
            // Some other error (not missing connector) → try IMAP-only fallback if SMTP is the culprit
            const providerErrorText = errJson?.error?.provider_error?.error || errText;
            if (/SMTP|authentication|Unrecognized authentication type|STARTTLS/i.test(providerErrorText)) {
              console.log('🔁 Retrying with IMAP-only (no SMTP)');
              grantResponse = await fetch(`${baseUrl}/connect/custom`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json',
                },
                body: grantBodyImapOnly(),
              });

              if (!grantResponse.ok) {
                const imapOnlyErr = await grantResponse.text();
                throw new Error(`Grant creation failed (IMAP-only): ${imapOnlyErr}`);
              }
            } else {
              throw new Error(`Grant creation failed: ${errText}`);
            }
          }
        }
      }

      const grantData = await grantResponse.json();
      console.log('✅ IMAP Grant created:', grantData);

      // Store account in database
      const { data: account, error } = await supabase
        .from('email_accounts')
        .upsert({
          user_id: userId,
          provider: provider,
          email: config.email,
          access_token: grantData.data?.id || grantData.data?.grant_id || grantData.grant_id, // grant id
          imap_config: { ...config, imap_port, smtp_host, smtp_port },
          is_active: true,
          last_sync_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,email'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          account: account,
          grant_id: account?.access_token,
          message: 'IMAP account connected successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      // For OAuth (Gmail/Outlook) use Nylas Hosted Auth (not direct Google/Microsoft OAuth)
      const callbackUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nylas-email-callback`;

      // Map provider names to Nylas providers
      const nylasProvider = provider === 'gmail' ? 'google' : provider === 'outlook' ? 'microsoft' : provider;

      const params = new URLSearchParams({
        client_id: clientId,
        provider: String(nylasProvider),
        redirect_uri: callbackUri,
        response_type: 'code',
        login_hint: config.email,
        state: `${userId}:${provider}:${config.email}`,
      });

      // Request both Mail and Calendar permissions for Google
      if (provider === 'gmail') {
        params.set('provider_scopes', [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/calendar'
        ].join(' '));
        params.set('access_type', 'offline');
        params.set('prompt', 'consent');
      }

      const authUrl = `${nylasBaseUrl}/connect/auth?${params.toString()}`;
      console.log('✅ Nylas Hosted Auth URL generated:', authUrl);

      return new Response(
        JSON.stringify({
          success: true,
          authorization_url: authUrl,
          message: 'Complete OAuth flow using the Nylas Hosted Auth URL'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    throw new Error(`Failed to connect account: ${error.message}`);
  }
}

async function syncEmails(baseUrl: string, apiKey: string, supabase: any, userId: string, accountId: string) {
  try {
    console.log(`📧 Syncing emails for account: ${accountId}`);

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // Fetch emails from Nylas
    const emailsResponse = await fetch(`${baseUrl}/grants/${account.access_token}/messages?limit=50`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!emailsResponse.ok) {
      throw new Error(`Failed to fetch emails: ${await emailsResponse.text()}`);
    }

    const emailsData = await emailsResponse.json();
    const emails = emailsData.data || [];

    console.log(`📨 Found ${emails.length} emails`);

    let syncedCount = 0;

    for (const email of emails) {
      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('inbound_emails')
        .select('id')
        .eq('message_id', email.id)
        .single();

      if (!existingEmail) {
        // Insert new email in both inbound_emails and unified emails table
        const { error: inboundError } = await supabase
          .from('inbound_emails')
          .insert({
            user_id: userId,
            message_id: email.id,
            from_email: email.from?.[0]?.email || '',
            from_name: email.from?.[0]?.name || '',
            to_email: email.to?.[0]?.email || account.email,
            subject: email.subject || '',
            content: email.body || email.snippet || '',
            html_content: email.body,
            provider: 'nylas',
            received_at: new Date(email.date * 1000).toISOString(),
            thread_id: email.thread_id,
            labels: email.folders || [],
            direction: 'received'
          });

        // Also insert into unified emails table
        const { error: unifiedError } = await supabase
          .from('emails')
          .insert({
            user_id: userId,
            message_id: email.id,
            direction: 'received',
            from_email: email.from?.[0]?.email || '',
            from_name: email.from?.[0]?.name || '',
            to_email: email.to?.[0]?.email || account.email,
            subject: email.subject || '',
            content: email.body || email.snippet || '',
            html_content: email.body,
            provider: 'nylas',
            received_at: new Date(email.date * 1000).toISOString(),
            thread_id: email.thread_id,
            labels: email.folders || [],
            status: 'delivered'
          });

        if (!inboundError && !unifiedError) {
          syncedCount++;
        } else {
          console.error('Error inserting email:', { inboundError, unifiedError });
        }
      }
    }

    // Update last sync time
    await supabase
      .from('email_accounts')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', accountId);

    return new Response(
      JSON.stringify({
        success: true,
        syncedCount,
        message: `Synchronized ${syncedCount} new emails`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    throw new Error(`Failed to sync emails: ${error.message}`);
  }
}

async function sendEmail(baseUrl: string, apiKey: string, supabase: any, userId: string, accountId: string, email: any) {
  try {
    console.log(`📤 Sending email from account: ${accountId}`);

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // Send email via Nylas
    const sendResponse = await fetch(`${baseUrl}/grants/${account.access_token}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [{ email: email.to }],
        subject: email.subject,
        body: email.html || email.content,
        from: [{ email: account.email, name: account.email.split('@')[0] }],
        reply_to: [{ email: account.email }],
      }),
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.text();
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const sendData = await sendResponse.json();

    // Save sent email to database in unified emails table
    await supabase
      .from('emails')
      .insert({
        user_id: userId,
        message_id: sendData.data?.id,
        direction: 'sent',
        from_email: account.email,
        from_name: account.email.split('@')[0], // Use email prefix as name for now
        to_email: email.to,
        subject: email.subject,
        content: email.content,
        html_content: email.html,
        status: 'delivered',
        provider: 'nylas',
        sent_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: sendData.data?.id,
        message: 'Email sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

async function testConnection(baseUrl: string, apiKey: string, accountId: string) {
  try {
    console.log(`🔧 Testing connection for account: ${accountId}`);

    const testResponse = await fetch(`${baseUrl}/grants/${accountId}/messages?limit=1`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return new Response(
      JSON.stringify({
        success: testResponse.ok,
        message: testResponse.ok ? 'Connection successful' : 'Connection failed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Connection test failed: ${error.message}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function testImapConnectivity(config: any): Promise<Response> {
  const host = config?.imap_host ?? config?.host;
  const port = Number(config?.imap_port ?? config?.port ?? 993);
  if (!host || !port) {
    return new Response(JSON.stringify({ success: false, message: 'Missing host/port for IMAP test' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const useTls = port === 993;
  try {
    console.log('🧪 Testing IMAP connectivity', { host, port, useTls });
    const conn = useTls
      ? await Deno.connectTls({ hostname: host, port, tlsHostname: host })
      : await Deno.connect({ hostname: host, port });
    const buf = new Uint8Array(512);
    let n = 0;
    try { n = (await conn.read(buf)) ?? 0; } catch {}
    try { conn.close(); } catch {}
    const banner = new TextDecoder().decode(buf.subarray(0, n));
    return new Response(JSON.stringify({ success: true, message: 'IMAP reachable', host, port, banner }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('❌ IMAP test error:', error);
    return new Response(JSON.stringify({ success: false, message: `IMAP not reachable: ${error.message}`, host, port }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

async function testSmtpConnectivity(config: any): Promise<Response> {
  const host = config?.smtp_host ?? config?.host;
  
  if (!host) {
    return new Response(JSON.stringify({ success: false, message: 'Missing host for SMTP test' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Try port 587 first (STARTTLS), then 465 (SSL) for better compatibility
  const portsToTry = [
    { port: Number(config?.smtp_port ?? 587), description: 'STARTTLS' },
    { port: 465, description: 'SSL' }
  ];

  let lastError: any = null;
  
  for (const { port, description } of portsToTry) {
    const useTls = port === 465;
    try {
      console.log(`🧪 Testing SMTP connectivity ${description}`, { host, port, useTls });
      
      // Set a reasonable timeout for the connection test
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout (15s)')), 15000)
      );
      
      const connectPromise = useTls
        ? Deno.connectTls({ hostname: host, port, tlsHostname: host })
        : Deno.connect({ hostname: host, port });
      
      const conn = await Promise.race([connectPromise, timeoutPromise]);
      
      const buf = new Uint8Array(512);
      let n = 0;
      try { n = (await conn.read(buf)) ?? 0; } catch {}
      try { conn.close(); } catch {}
      const banner = new TextDecoder().decode(buf.subarray(0, n));
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `SMTP reachable via ${description}`, 
        host, 
        port, 
        banner,
        connection_type: description
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      
    } catch (error: any) {
      console.error(`❌ SMTP test error (${description}):`, error);
      lastError = error;
      
      // If this was the user's specified port, don't try others
      if (config?.smtp_port && Number(config.smtp_port) === port) {
        break;
      }
    }
  }

  return new Response(JSON.stringify({ 
    success: false, 
    message: `SMTP not reachable: ${lastError?.message || 'Connection failed'}. Note: Cette erreur peut être due aux restrictions réseau des edge functions. L'envoi via Nylas peut toujours fonctionner.`, 
    host, 
    ports_tested: portsToTry.map(p => p.port),
    warning: 'Les timeouts réseau n\'indiquent pas forcément un problème avec votre configuration email. Testez l\'envoi via Nylas pour vérifier.'
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function sendTestEmail(baseUrl: string, apiKey: string, supabase: any, userId: string, accountId: string, testEmail: string) {
  try {
    console.log(`🧪 Sending test email from account: ${accountId} to: ${testEmail}`);

    // Get account details
    const { data: account, error: accountError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // Send test email via Nylas
    const testEmailContent = {
      to: testEmail,
      subject: 'Test de configuration email - Fatras Booking',
      content: `Bonjour,

Ceci est un email de test automatique envoyé depuis votre configuration Nylas.

Si vous recevez ce message, cela signifie que:
✅ Votre compte email ${account.email} est correctement configuré
✅ L'envoi d'emails via Nylas fonctionne parfaitement
✅ Vous pouvez maintenant utiliser cette configuration pour vos campagnes email

Détails techniques:
- Compte: ${account.email}
- Provider: ${account.provider}
- Grant ID: ${account.access_token}
- Date/heure: ${new Date().toLocaleString('fr-FR')}

Cordialement,
L'équipe Fatras Booking`,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test de configuration email - Fatras Booking</h2>
        <p>Bonjour,</p>
        <p>Ceci est un email de test automatique envoyé depuis votre configuration Nylas.</p>
        <p>Si vous recevez ce message, cela signifie que:</p>
        <ul style="color: #28a745;">
          <li>✅ Votre compte email <strong>${account.email}</strong> est correctement configuré</li>
          <li>✅ L'envoi d'emails via Nylas fonctionne parfaitement</li>
          <li>✅ Vous pouvez maintenant utiliser cette configuration pour vos campagnes email</li>
        </ul>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Détails techniques:</h4>
          <ul style="margin: 0;">
            <li><strong>Compte:</strong> ${account.email}</li>
            <li><strong>Provider:</strong> ${account.provider}</li>
            <li><strong>Grant ID:</strong> ${account.access_token}</li>
            <li><strong>Date/heure:</strong> ${new Date().toLocaleString('fr-FR')}</li>
          </ul>
        </div>
        <p>Cordialement,<br><strong>L'équipe Fatras Booking</strong></p>
      </div>`
    };

    // Send email via Nylas
    const sendResponse = await fetch(`${baseUrl}/grants/${account.access_token}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [{ email: testEmail }],
        subject: testEmailContent.subject,
        body: testEmailContent.html,
        reply_to: [{ email: account.email }],
      }),
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.text();
      throw new Error(`Failed to send test email: ${errorData}`);
    }

    const sendData = await sendResponse.json();

    // Save sent test email to database
    await supabase
      .from('emails')
      .insert({
        user_id: userId,
        from_email: account.email,
        to_email: testEmail,
        subject: testEmailContent.subject,
        content: testEmailContent.content,
        html_content: testEmailContent.html,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { 
          nylas_message_id: sendData.data?.id,
          test_email: true,
          account_id: accountId
        }
      });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: sendData.data?.id,
        message: `Email de test envoyé avec succès à ${testEmail}`,
        details: {
          from: account.email,
          to: testEmail,
          provider: account.provider,
          grant_id: account.access_token
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Test email error:', error);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
}

serve(handler);