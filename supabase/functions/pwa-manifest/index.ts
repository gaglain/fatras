import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AppSettings {
  setting_key: string;
  setting_value: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Récupérer les paramètres PWA depuis la base de données
    const { data: settings, error } = await supabaseClient
      .from('app_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'company_name',
        'pwa_icon_192',
        'pwa_icon_512',
        'pwa_apple_icon',
        'theme_color',
        'background_color'
      ]);

    if (error) {
      console.error('Error fetching settings:', error);
    }

    // Créer un objet de configuration à partir des paramètres
    const config: Record<string, string> = {};
    (settings as AppSettings[] || []).forEach((setting) => {
      config[setting.setting_key] = setting.setting_value;
    });

    // Construire le manifest avec les valeurs de la DB ou des valeurs par défaut
    const manifest = {
      name: config.company_name || 'Fatras Booking',
      short_name: (config.company_name || 'Fatras').substring(0, 12),
      description: `${config.company_name || 'Fatras Booking'} - Application de gestion professionnelle`,
      start_url: '/dashboard',
      display: 'standalone',
      background_color: config.background_color || '#ffffff',
      theme_color: config.theme_color || '#8b5cf6',
      icons: [
        {
          src: config.pwa_icon_192 || '/favicon.ico',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: config.pwa_icon_512 || '/favicon.ico',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      categories: ['business', 'productivity'],
      orientation: 'any',
      scope: '/'
    };

    return new Response(
      JSON.stringify(manifest, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache 1 heure
        }
      }
    );
  } catch (error) {
    console.error('Error generating manifest:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
