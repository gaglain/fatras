import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NYLAS_API_BASE = 'https://api.us.nylas.com/v3'

interface RouteSheet {
  id: string
  city?: string
  venue?: string
  address?: string
  event_date?: string
  event_time?: string
  check_in_time?: string
  departure_time?: string
  soundcheck_time?: string
  doors_time?: string
  show_start_time?: string
  show_end_time?: string
  curfew_time?: string
  meeting_point_time?: string
  meeting_point_location?: string
  departure_to_show_time?: string
  departure_address?: string
  local_contact?: string
  local_contact_phone?: string
  accommodation?: string
  accommodation_address?: string
  transport?: string
  notes?: string
  crew?: string[]
  equipment?: string[]
  invitations?: string
}

function buildRouteSheetDescription(event: any, routeSheet: RouteSheet, quoteAmount?: number | null, crewNames?: string[]): string {
  const lines: string[] = []

  lines.push(`🎤 ${event.title}`)
  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push('📋 FEUILLE DE ROUTE')
  lines.push('')

  // 💰 Prix devis/contrat
  if (quoteAmount) {
    lines.push(`💰 CONTRAT : ${quoteAmount.toFixed(2)} €`)
    lines.push('')
  }

  // 📍 Lieu / Salle
  if (routeSheet.venue || routeSheet.address || routeSheet.city) {
    lines.push('📍 LIEU')
    if (routeSheet.venue) lines.push(`  Salle : ${routeSheet.venue}`)
    if (routeSheet.address) lines.push(`  Adresse : ${routeSheet.address}`)
    if (routeSheet.city) lines.push(`  Ville : ${routeSheet.city}`)
    lines.push('')
  }

  // 🕐 Horaires
  const timings: string[] = []
  if (routeSheet.meeting_point_time) timings.push(`  Point de RDV : ${routeSheet.meeting_point_time}${routeSheet.meeting_point_location ? ' - ' + routeSheet.meeting_point_location : ''}`)
  if (routeSheet.departure_to_show_time) timings.push(`  Départ vers le lieu : ${routeSheet.departure_to_show_time}`)
  if (routeSheet.check_in_time) timings.push(`  Arrivée / Check-in : ${routeSheet.check_in_time}`)
  if (routeSheet.soundcheck_time) timings.push(`  Balance : ${routeSheet.soundcheck_time}`)
  if (routeSheet.doors_time) timings.push(`  Ouverture portes : ${routeSheet.doors_time}`)
  if (routeSheet.show_start_time) timings.push(`  Début concert : ${routeSheet.show_start_time}`)
  if (routeSheet.show_end_time) timings.push(`  Fin concert : ${routeSheet.show_end_time}`)
  if (routeSheet.curfew_time) timings.push(`  Couvre-feu : ${routeSheet.curfew_time}`)
  if (routeSheet.departure_time) timings.push(`  Départ : ${routeSheet.departure_time}`)

  if (timings.length > 0) {
    lines.push('🕐 HORAIRES')
    lines.push(...timings)
    lines.push('')
  }

  // 👤 Contact local
  if (routeSheet.local_contact || routeSheet.local_contact_phone) {
    lines.push('👤 CONTACT LOCAL')
    if (routeSheet.local_contact) lines.push(`  Nom : ${routeSheet.local_contact}`)
    if (routeSheet.local_contact_phone) lines.push(`  Tél : ${routeSheet.local_contact_phone}`)
    lines.push('')
  }

  // 🚗 Transport
  if (routeSheet.transport || routeSheet.departure_address) {
    lines.push('🚗 TRANSPORT')
    if (routeSheet.transport) lines.push(`  Mode : ${routeSheet.transport}`)
    if (routeSheet.departure_address) lines.push(`  Départ depuis : ${routeSheet.departure_address}`)
    lines.push('')
  }

  // 🏨 Hébergement
  if (routeSheet.accommodation || routeSheet.accommodation_address) {
    lines.push('🏨 HÉBERGEMENT')
    if (routeSheet.accommodation) lines.push(`  ${routeSheet.accommodation}`)
    if (routeSheet.accommodation_address) lines.push(`  Adresse : ${routeSheet.accommodation_address}`)
    lines.push('')
  }

  // 🎫 Invitations
  if (routeSheet.invitations) {
    lines.push('🎫 INVITATIONS')
    // Split by newlines for multi-line invitations
    routeSheet.invitations.split('\n').forEach(line => {
      if (line.trim()) lines.push(`  ${line.trim()}`)
    })
    lines.push('')
  }

  // 👥 Équipe (resolved names)
  const resolvedCrew = crewNames && crewNames.length > 0 ? crewNames : routeSheet.crew
  if (resolvedCrew && resolvedCrew.length > 0) {
    lines.push('👥 ÉQUIPE')
    resolvedCrew.forEach(member => lines.push(`  • ${member}`))
    lines.push('')
  }

  // 📝 Notes
  if (routeSheet.notes) {
    lines.push('📝 NOTES')
    lines.push(`  ${routeSheet.notes}`)
    lines.push('')
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━')
  lines.push('Généré automatiquement par Fatras')

  return lines.join('\n')
}

function buildGenericDescription(event: any): string {
  const statusLabel = event.status === 'option' ? 'en option' : event.status
  return `Événement ${statusLabel} dans l'app.\nLa feuille de route détaillée sera ajoutée lorsqu'il sera confirmé.`
}

function toUnixTimestamp(dateStr: string): number {
  return Math.floor(new Date(dateStr).getTime() / 1000)
}

// Fetch the primary calendar ID for a grant
async function getPrimaryCalendarId(grantId: string, nylasApiKey: string): Promise<string | null> {
  try {
    const response = await fetch(`${NYLAS_API_BASE}/grants/${grantId}/calendars`, {
      headers: {
        'Authorization': `Bearer ${nylasApiKey}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to list calendars:', response.status, errorText)
      return null
    }

    const result = await response.json()
    const calendars = result.data || []
    
    // Find primary calendar
    const primary = calendars.find((c: any) => c.is_primary === true)
    if (primary) {
      console.log(`📅 Using primary calendar: ${primary.name} (${primary.id})`)
      return primary.id
    }
    
    // Fallback to first calendar
    if (calendars.length > 0) {
      console.log(`📅 Using first calendar: ${calendars[0].name} (${calendars[0].id})`)
      return calendars[0].id
    }

    console.error('No calendars found for this grant')
    return null
  } catch (err) {
    console.error('Error fetching calendars:', err)
    return null
  }
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
    const { event_id, trigger, grant_id_override } = await req.json()

    console.log(`🔄 sync-event-to-nylas: event_id=${event_id}, trigger=${trigger}`)

    // Load event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      console.error('Event not found:', eventError)
      return new Response(
        JSON.stringify({ success: false, error: 'Event not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const { status, nylas_event_id } = event
    let grantId = grant_id_override || event.nylas_grant_id

    // If no grant_id configured, try to find one from email_accounts
    if (!grantId) {
      const { data: account } = await supabase
        .from('email_accounts')
        .select('grant_id')
        .eq('user_id', event.user_id)
        .eq('is_active', true)
        .not('grant_id', 'is', null)
        .limit(1)
        .single()

      if (!account?.grant_id) {
        console.log('No Nylas grant_id available for this user, skipping sync')
        return new Response(
          JSON.stringify({ success: false, error: 'No Nylas grant configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      grantId = account.grant_id
      await supabase.from('events').update({ nylas_grant_id: grantId }).eq('id', event_id)
    }

    // Only sync if status is option or confirmed
    if (status !== 'option' && status !== 'confirmé' && status !== 'confirmed') {
      console.log(`Status "${status}" does not require Nylas sync, skipping`)
      return new Response(
        JSON.stringify({ success: true, message: 'No sync needed for this status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get primary calendar ID (required by Nylas v3)
    const calendarId = await getPrimaryCalendarId(grantId, nylasApiKey)
    if (!calendarId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not find a calendar for this grant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Fetch artist name if artist_id is set
    let artistName: string | null = null
    if (event.artist_id) {
      const { data: artist } = await supabase
        .from('centralized_artists')
        .select('name')
        .eq('id', event.artist_id)
        .single()
      if (artist) {
        artistName = artist.name
      }
    }

    // Build title: "Nom événement (statut) - Spectacle"
    const statusLabel = status === 'option' ? 'Option' : status === 'confirmé' || status === 'confirmed' ? 'Confirmé' : status
    let eventTitle = `${event.title} (${statusLabel})`
    if (artistName) {
      eventTitle += ` - ${artistName}`
    }

    // Build all-day date(s) — extract YYYY-MM-DD only
    const startDateStr = event.start_date ? event.start_date.substring(0, 10) : new Date().toISOString().substring(0, 10)
    const endDateStr = event.end_date ? event.end_date.substring(0, 10) : startDateStr

    // Load quote amount for this event
    let quoteAmount: number | null = null
    const { data: quote } = await supabase
      .from('quotes')
      .select('total_amount, status')
      .eq('event_id', event_id)
      .in('status', ['accepted', 'sent', 'signed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (quote?.total_amount) {
      quoteAmount = quote.total_amount
      console.log(`💰 Quote found: ${quoteAmount} € (${quote.status})`)
    }

    // Load route sheet if route_sheet_id exists (for any synced status)
    let description: string

    if (event.route_sheet_id) {
      console.log(`📋 Loading route sheet ${event.route_sheet_id} for event (status: ${status})`)
      const { data: routeSheet, error: rsError } = await supabase
        .from('roadshow_stops')
        .select('*')
        .eq('id', event.route_sheet_id)
        .single()

      if (rsError) {
        console.error('Route sheet fetch error:', rsError)
      }

      if (routeSheet) {
        console.log(`📋 Route sheet found: ${routeSheet.venue || routeSheet.city || 'no venue/city'}`)
        
        // Resolve crew UUIDs to names
        let crewNames: string[] = []
        const crewIds = routeSheet.crew as string[] | undefined
        if (crewIds && crewIds.length > 0) {
          const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          const areUuids = crewIds.every((id: string) => uuidPattern.test(id))
          
          if (areUuids) {
            const { data: profiles } = await supabase
              .from('user_profiles')
              .select('user_id, first_name, last_name, function_title')
              .in('user_id', crewIds)
            
            if (profiles && profiles.length > 0) {
              const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]))
              crewNames = crewIds.map((id: string) => {
                const p = profileMap.get(id)
                if (p) {
                  const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Membre'
                  return p.function_title ? `${name} (${p.function_title})` : name
                }
                return id
              })
              console.log(`👥 Resolved ${crewNames.length} crew members`)
            }
          }
        }
        
        description = buildRouteSheetDescription(event, routeSheet as RouteSheet, quoteAmount, crewNames)
      } else {
        console.log(`📋 No route sheet found for id ${event.route_sheet_id}`)
        description = buildGenericDescription(event)
      }
    } else {
      description = buildGenericDescription(event)
    }

    // Build full location string
    const locationParts: string[] = []
    if (event.venue) locationParts.push(event.venue)
    if (event.address) locationParts.push(event.address)
    if (event.postal_code) locationParts.push(event.postal_code)
    if (event.city) locationParts.push(event.city)
    if (event.country) locationParts.push(event.country)
    const fullLocation = locationParts.join(', ')

    const nylasWhen = startDateStr === endDateStr
      ? { date: startDateStr }
      : { start_date: startDateStr, end_date: endDateStr }

    const nylasEventBody = {
      title: eventTitle,
      description,
      when: nylasWhen,
      location: fullLocation,
    }

    // CREATE or UPDATE
    if (!nylas_event_id) {
      // Create new Nylas event
      console.log(`Creating Nylas event for "${event.title}" on calendar ${calendarId}...`)
      const url = `${NYLAS_API_BASE}/grants/${grantId}/events?calendar_id=${encodeURIComponent(calendarId)}`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...nylasEventBody,
          busy: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nylas create error:', response.status, errorText)
        return new Response(
          JSON.stringify({ success: false, error: `Nylas create failed: ${response.status}`, details: errorText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const created = await response.json()
      const createdId = created.data?.id || created.id

      // Save nylas_event_id back to event
      await supabase.from('events').update({ nylas_event_id: createdId }).eq('id', event_id)

      console.log(`✅ Nylas event created: ${createdId} for "${event.title}"`)
      return new Response(
        JSON.stringify({ success: true, action: 'created', nylas_event_id: createdId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      // Update existing Nylas event
      console.log(`Updating Nylas event ${nylas_event_id} for "${event.title}"...`)
      const url = `${NYLAS_API_BASE}/grants/${grantId}/events/${nylas_event_id}?calendar_id=${encodeURIComponent(calendarId)}`
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${nylasApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(nylasEventBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Nylas update error:', response.status, errorText)
        return new Response(
          JSON.stringify({ success: false, error: `Nylas update failed: ${response.status}`, details: errorText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const _body = await response.text() // consume response body

      console.log(`✅ Nylas event updated: ${nylas_event_id} for "${event.title}"`)
      return new Response(
        JSON.stringify({ success: true, action: 'updated', nylas_event_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
  } catch (error) {
    console.error('sync-event-to-nylas error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
