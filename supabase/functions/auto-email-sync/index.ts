import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MIN_AUTO_SYNC_INTERVAL_MS = 4 * 60 * 1000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting automatic email synchronization...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer tous les comptes email actifs
    const { data: emailAccounts, error: accountsError } = await supabaseClient
      .from('email_accounts')
      .select('*')
      .eq('is_active', true);

    if (accountsError) {
      console.error('❌ Error fetching email accounts:', accountsError);
      throw accountsError;
    }

    console.log(`📧 Found ${emailAccounts?.length || 0} active email accounts`);

    const results = {
      total: emailAccounts?.length || 0,
      synced: 0,
      failed: 0,
      skipped: 0,
      errors: [] as any[]
    };

    // Synchroniser chaque compte
    for (const account of emailAccounts || []) {
      try {
        console.log(`🔄 Syncing account: ${account.email} (${account.provider})`);

        const syncStartedAt = new Date();
        const staleBefore = new Date(syncStartedAt.getTime() - MIN_AUTO_SYNC_INTERVAL_MS).toISOString();
        let { data: claimedAccount, error: claimError } = await supabaseClient
          .from('email_accounts')
          .update({ last_sync_at: syncStartedAt.toISOString() })
          .eq('id', account.id)
          .lt('last_sync_at', staleBefore)
          .select('id')
          .maybeSingle();

        if (!claimedAccount && !account.last_sync_at && !claimError) {
          const nullClaim = await supabaseClient
            .from('email_accounts')
            .update({ last_sync_at: syncStartedAt.toISOString() })
            .eq('id', account.id)
            .is('last_sync_at', null)
            .select('id')
            .maybeSingle();
          claimedAccount = nullClaim.data;
          claimError = nullClaim.error;
        }

        if (claimError) throw claimError;

        if (!claimedAccount) {
          console.log(`⏭️ Skipping ${account.email}: sync already running or completed recently`);
          results.skipped++;
          continue;
        }

        let syncResult;
        
        if (account.provider === 'imap') {
          // Synchronisation IMAP
          const { data, error } = await supabaseClient.functions.invoke('sync-imap-emails', {
            body: {
              userId: account.user_id,
              action: 'sync'
            }
          });

          if (error) throw error;
          syncResult = data;
        } else {
          // Synchronisation Nylas (Gmail, Outlook, etc.)
          const { data, error } = await supabaseClient.functions.invoke('nylas-email', {
            body: {
              action: 'sync',
              accountId: account.id
            }
          });

          if (error) throw error;
          syncResult = data;
        }

        console.log(`✅ Synced ${account.email}:`, syncResult);
        results.synced++;

        // Mettre à jour last_sync_at
        await supabaseClient
          .from('email_accounts')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', account.id);

      } catch (error) {
        console.error(`❌ Error syncing ${account.email}:`, error);
        results.failed++;
        results.errors.push({
          email: account.email,
          error: error.message
        });
      }
    }

    console.log('✅ Synchronization complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email synchronization completed',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Auto-sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
