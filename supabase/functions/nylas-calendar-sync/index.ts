import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  calendar_id: string
  provider: string
  external_id: string
  attendees?: string[]
}

// Normalize Nylas "when" into ISO datetimes
function normalizeNylasWhen(when: any): { startIso: string; endIso: string } {
  const toMs = (v: any): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') {
      // seconds vs milliseconds
      return v > 1e12 ? v : v * 1000;
    }
    // if it's a date string (e.g., "2025-09-15" or ISO)
    const d = new Date(v);
    const ms = d.getTime();
    return isNaN(ms) ? null : ms;
  };

  let startMs: number | null = null;
  let endMs: number | null = null;

  if (when) {
    startMs = toMs(when.start_time) ?? toMs(when.start_date) ?? toMs(when.time);
    endMs = toMs(when.end_time) ?? toMs(when.end_date) ?? (startMs ? startMs + 60 * 60 * 1000 : null);
  }

  if (!startMs) startMs = Date.now();
  if (!endMs) endMs = startMs + 60 * 60 * 1000; // default 1h

  return { startIso: new Date(startMs).toISOString(), endIso: new Date(endMs).toISOString() };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const nylasApiKey = Deno.env.get('NYLAS_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { action, user_id, grant_id, event } = await req.json()

    console.log(`🗓️ Nylas Calendar action: ${action} for user: ${user_id}`)

    // Action: create_event
    if (action === 'create_event' && grant_id && event) {
      console.log('Creating event in Nylas:', event)

      const response = await fetch(`https://api.us.nylas.com/v3/grants/${grant_id}/events`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${nylasApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: event.title,
          description: event.description || '',
          when: {
            start_time: Math.floor(new Date(event.when.start_time).getTime() / 1000),
            end_time: Math.floor(new Date(event.when.end_time).getTime() / 1000),
          },
          location: event.location || '',
          participants: event.participants || [],
          busy: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nylas API error:', errorText)
        throw new Error(`Failed to create event: ${response.status}`)
      }

      const createdEvent = await response.json()

      return new Response(
        JSON.stringify({ success: true, event: createdEvent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (action === 'sync_calendars' && grant_id) {
      // Récupérer les calendriers depuis Nylas
      const calendarsResponse = await fetch(`https://api.us.nylas.com/v3/grants/${grant_id}/calendars`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Accept': 'application/json',
        },
      })

      if (!calendarsResponse.ok) {
        throw new Error(`Erreur calendriers Nylas: ${calendarsResponse.statusText}`)
      }

      const calendarsData = await calendarsResponse.json()
      console.log(`📅 Found ${calendarsData.data?.length || 0} calendars`)

      // Pour chaque calendrier, récupérer les événements
      for (const calendar of calendarsData.data || []) {
        console.log(`📅 Syncing calendar: ${calendar.name}`)
        
        // Récupérer les événements des 30 derniers jours et 90 prochains jours
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 90)

        const eventsResponse = await fetch(
          `https://api.us.nylas.com/v3/grants/${grant_id}/events?calendar_id=${calendar.id}&start=${Math.floor(startDate.getTime() / 1000)}&end=${Math.floor(endDate.getTime() / 1000)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${nylasApiKey}`,
              'Accept': 'application/json',
            },
          }
        )

        if (!eventsResponse.ok) {
          console.error(`Erreur événements pour calendrier ${calendar.id}: ${eventsResponse.statusText}`)
          continue
        }

        const eventsData = await eventsResponse.json()
        console.log(`📅 Found ${eventsData.data?.length || 0} events in calendar ${calendar.name}`)

        // Insérer/mettre à jour les événements dans Supabase
        for (const event of eventsData.data || []) {
          const { startIso, endIso } = normalizeNylasWhen(event.when);
          const calendarEvent: Partial<CalendarEvent> = {
            title: event.title || 'Sans titre',
            description: event.description,
            start_time: startIso,
            end_time: endIso,
            location: event.location,
            calendar_id: calendar.id,
            provider: 'nylas',
            external_id: event.id,
            attendees: event.participants?.map((p: any) => p.email) || [],
          }

          // Vérifier si l'événement existe déjà
          const { data: existingEvent } = await supabase
            .from('calendar_events')
            .select('id')
            .eq('external_id', event.id)
            .eq('user_id', user_id)
            .single()

          if (existingEvent) {
            // Mettre à jour
            await supabase
              .from('calendar_events')
              .update(calendarEvent)
              .eq('id', existingEvent.id)
          } else {
            // Créer
            await supabase
              .from('calendar_events')
              .insert({
                ...calendarEvent,
                user_id,
              })
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Synchronisation terminée pour ${calendarsData.data?.length || 0} calendriers` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (action === 'list_calendars' && grant_id) {
      const calendarsResponse = await fetch(`https://api.us.nylas.com/v3/grants/${grant_id}/calendars`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Accept': 'application/json',
        },
      })

      if (!calendarsResponse.ok) {
        throw new Error(`Erreur calendriers Nylas: ${calendarsResponse.statusText}`)
      }

      const calendarsData = await calendarsResponse.json()

      return new Response(
        JSON.stringify({ 
          success: true, 
          calendars: calendarsData.data || [] 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Action non supportée' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )

  } catch (error) {
    console.error('Erreur Nylas Calendar:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})