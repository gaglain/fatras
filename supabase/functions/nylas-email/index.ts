import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NylasRequest {
  action: 'connect' | 'sync' | 'send' | 'test' | 'list_accounts';
  accountId?: string;
  email?: {
    to: string;
    subject: string;
    content: string;
    html?: string;
  };
  provider?: 'gmail' | 'outlook' | 'imap';
  config?: {
    email: string;
    password?: string;
    host?: string;
    port?: number;
    ssl?: boolean;
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
    const { action, accountId, email, provider, config }: NylasRequest = await req.json();

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
      
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

  } catch (error: any) {
    console.error('❌ Nylas error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
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
            // Some other error (not missing connector)
            throw new Error(`Grant creation failed: ${errText}`);
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
      // For OAuth (Gmail/Outlook): Return authorization URL (provider login)
      const callbackUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/nylas-email-callback`;
      
      const authUrlParams = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        scope: provider === 'gmail' ? 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send' : 'https://graph.microsoft.com/mail.read https://graph.microsoft.com/mail.send',
        redirect_uri: callbackUri,
        access_type: 'offline',
        login_hint: config.email,
        state: `${userId}:${provider}:${config.email}`
      });

      const authUrl = provider === 'gmail' 
        ? `https://accounts.google.com/o/oauth2/v2/auth?${authUrlParams}`
        : `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${authUrlParams}`;

      console.log('✅ OAuth URL generated:', authUrl);

      return new Response(
        JSON.stringify({
          success: true,
          authorization_url: authUrl,
          message: 'Complete OAuth flow using the authorization URL'
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
        // Insert new email
        const { error: insertError } = await supabase
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
          });

        if (!insertError) {
          syncedCount++;
        } else {
          console.error('Error inserting email:', insertError);
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
        reply_to: [{ email: account.email }],
      }),
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.text();
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const sendData = await sendResponse.json();

    // Save sent email to database
    await supabase
      .from('emails')
      .insert({
        user_id: userId,
        from_email: account.email,
        to_email: email.to,
        subject: email.subject,
        content: email.content,
        html_content: email.html,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { nylas_message_id: sendData.data?.id }
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

serve(handler);