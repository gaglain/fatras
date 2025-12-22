import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID keys for web push (should be stored in environment variables in production)
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDswCJD0UKJHjMJvp0HEYjVUjPZ3I1u5KGb8yqWEb7xg';
const VAPID_PRIVATE_KEY = 'your-private-key-here'; // Should be in environment variable

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { userId, notification } = await req.json() as {
      userId?: string;
      notification: PushPayload;
    };

    const targetUserId = userId || user.id;

    // Get user's push subscription from database
    const { data: settings, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('setting_value')
      .eq('user_id', targetUserId)
      .eq('setting_key', 'push_subscription')
      .single();

    if (settingsError || !settings) {
      throw new Error('No push subscription found for user');
    }

    const subscription = JSON.parse(settings.setting_value);

    // Send push notification using web-push
    const pushPayload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/favicon.png',
      badge: notification.badge || '/favicon.png',
      tag: notification.tag || 'notification',
      data: notification.data || {}
    });

    // Note: For production, you would use web-push library
    // This is a simplified version
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400'
      },
      body: pushPayload
    });

    if (!response.ok) {
      throw new Error(`Push notification failed: ${response.status}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Push notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
