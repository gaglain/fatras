import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncTask {
  id: string;
  user_id: string;
  sync_type: 'email' | 'calendar';
  sync_interval_minutes: number;
  last_sync_at: string | null;
  next_sync_at: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - this endpoint should only be called by cron jobs with service role key
    // or by authenticated admin users
    const authHeader = req.headers.get('Authorization');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const expectedServiceAuth = `Bearer ${serviceRoleKey}`;
    
    // Check if called with service role key (cron job)
    const isServiceRoleAuth = authHeader === expectedServiceAuth;
    
    // If not service role, verify it's an authenticated admin user
    if (!isServiceRoleAuth) {
      if (!authHeader) {
        console.error('❌ Missing Authorization header');
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized - authentication required' }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // Verify user is an admin
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      
      const userSupabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user }, error: authError } = await userSupabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Invalid authentication:', authError?.message);
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized - invalid authentication' }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      // Check if user is admin using service role
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey ?? "");
      const { data: userProfile } = await adminSupabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
        console.error('❌ User is not an admin');
        return new Response(
          JSON.stringify({ success: false, error: 'Forbidden - admin access required' }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      console.log('✅ Admin user authenticated:', user.id);
    } else {
      console.log('✅ Service role authentication verified (cron job)');
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("🚀 Auto-sync scheduler starting...");

    // Get all enabled sync tasks that are due for sync
    const now = new Date().toISOString();
    const { data: dueTasks, error: tasksError } = await supabase
      .from('sync_tasks')
      .select('*')
      .eq('is_enabled', true)
      .lte('next_sync_at', now);

    if (tasksError) {
      console.error("❌ Error fetching sync tasks:", tasksError);
      throw tasksError;
    }

    console.log(`📋 Found ${dueTasks?.length || 0} tasks due for sync`);

    for (const task of dueTasks || []) {
      try {
        console.log(`🔄 Processing ${task.sync_type} sync for user ${task.user_id}`);
        
        let syncResult;
        
        if (task.sync_type === 'email') {
          // Trigger email sync
          syncResult = await supabase.functions.invoke('sync-imap-emails', {
            body: {
              userId: task.user_id,
              action: 'sync'
            }
          });
        } else if (task.sync_type === 'calendar') {
          // Trigger calendar sync
          syncResult = await supabase.functions.invoke('nylas-calendar-sync', {
            body: {
              userId: task.user_id,
              action: 'sync'
            }
          });
        }

        const nextSyncTime = new Date();
        nextSyncTime.setMinutes(nextSyncTime.getMinutes() + task.sync_interval_minutes);

        // Update task with last sync time and next sync time
        await supabase
          .from('sync_tasks')
          .update({
            last_sync_at: now,
            next_sync_at: nextSyncTime.toISOString()
          })
          .eq('id', task.id);

        // Create notification based on sync result
        let notificationType = 'success';
        let title = `Synchronisation ${task.sync_type} réussie`;
        let message = '';
        let details = {};

        if (syncResult?.data?.success) {
          if (task.sync_type === 'email') {
            const syncedCount = syncResult.data.syncedCount || 0;
            message = `${syncedCount} nouveaux emails synchronisés`;
            details = { syncedCount, timestamp: now };
          } else {
            message = 'Calendrier synchronisé avec succès';
            details = { timestamp: now };
          }
        } else {
          notificationType = 'error';
          title = `Erreur de synchronisation ${task.sync_type}`;
          message = syncResult?.data?.error || 'Erreur inconnue';
          details = { error: syncResult?.data?.error, timestamp: now };
        }

        // Only create notification if there's meaningful activity
        if (task.sync_type !== 'email' || (syncResult?.data?.syncedCount || 0) > 0) {
          await supabase
            .from('sync_notifications')
            .insert({
              user_id: task.user_id,
              sync_type: task.sync_type,
              notification_type: notificationType,
              title,
              message,
              details
            });
        }

        console.log(`✅ ${task.sync_type} sync completed for user ${task.user_id}`);
        
      } catch (syncError: unknown) {
        const errorMessage = syncError instanceof Error ? syncError.message : 'Erreur inconnue lors de la synchronisation';
        console.error(`❌ Error syncing ${task.sync_type} for user ${task.user_id}:`, syncError);
        
        // Create error notification
        await supabase
          .from('sync_notifications')
          .insert({
            user_id: task.user_id,
            sync_type: task.sync_type,
            notification_type: 'error',
            title: `Erreur de synchronisation ${task.sync_type}`,
            message: errorMessage,
            details: { error: errorMessage, timestamp: now }
          });

        // Still update next sync time to avoid repeated failures
        const nextSyncTime = new Date();
        nextSyncTime.setMinutes(nextSyncTime.getMinutes() + task.sync_interval_minutes);
        
        await supabase
          .from('sync_tasks')
          .update({
            next_sync_at: nextSyncTime.toISOString()
          })
          .eq('id', task.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedTasks: dueTasks?.length || 0,
        message: "Auto-sync completed successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("❌ Auto-sync scheduler error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        message: "Auto-sync scheduler failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);