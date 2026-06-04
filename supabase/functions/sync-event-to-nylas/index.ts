import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
  meal_time?: string
  meal_location?: string
  departure_address?: string
  local_contact?: string
  local_contact_phone?: string
  technical_contact_name?: string
  technical_contact_email?: string
  technical_contact_phone?: string
  accommodation?: string
  accommodation_address?: string
  has_dressing_room?: boolean
  dressing_room_address?: string
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
  if (routeSheet.meal_time) timings.push(`  🍽️ Repas : ${routeSheet.meal_time}${routeSheet.meal_location ? ' - ' + routeSheet.meal_location : ''}`)
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

  // 🛠️ Contact technique sur place
  if (routeSheet.technical_contact_name || routeSheet.technical_contact_email || routeSheet.technical_contact_phone) {
    lines.push('🛠️ CONTACT TECHNIQUE SUR PLACE')
    if (routeSheet.technical_contact_name) lines.push(`  Nom : ${routeSheet.technical_contact_name}`)
    if (routeSheet.technical_contact_email) lines.push(`  Email : ${routeSheet.technical_contact_email}`)
    if (routeSheet.technical_contact_phone) lines.push(`  Tél : ${routeSheet.technical_contact_phone}`)
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

  // 🚪 Loge
  if (routeSheet.has_dressing_room === true || routeSheet.has_dressing_room === false) {
    lines.push('🚪 LOGE')
    lines.push(`  ${routeSheet.has_dressing_room ? 'Oui' : 'Non'}`)
    if (routeSheet.has_dressing_room && routeSheet.dressing_room_address) {
      lines.push(`  Adresse : ${routeSheet.dressing_room_address}`)
    }
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

// IMAP grants are email-only in Nylas and cannot access calendars.
const CALENDAR_CAPABLE_PROVIDERS = ['gmail', 'google', 'outlook', 'microsoft']

async function getCalendarCapableGrantId(supabase: any, userId: string, currentGrantId?: string | null): Promise<string | null> {
  const { data: accounts, error } = await supabase
    .from('email_accounts')
    .select('grant_id, provider, email, is_active, updated_at')
    .eq('user_id', userId)
    .not('grant_id', 'is', null)
    .order('is_active', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Could not load Nylas accounts:', error)
    return currentGrantId || null
  }

  const currentAccount = accounts?.find((account: any) => account.grant_id === currentGrantId)
  if (currentAccount && CALENDAR_CAPABLE_PROVIDERS.includes(String(currentAccount.provider || '').toLowerCase())) {
    return currentGrantId || null
  }

  const calendarAccount = accounts?.find((account: any) =>
    CALENDAR_CAPABLE_PROVIDERS.includes(String(account.provider || '').toLowerCase())
  )

  if (calendarAccount?.grant_id) {
    if (currentGrantId !== calendarAccount.grant_id) {
      console.log(`📅 Switching calendar sync grant from ${currentAccount?.provider || 'unknown'} to ${calendarAccount.provider} (${calendarAccount.email})`)
    }
    return calendarAccount.grant_id
  }

  return currentGrantId || null
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
    let grantId = await getCalendarCapableGrantId(supabase, event.user_id, grant_id_override || event.nylas_grant_id)

    // If no grant_id configured, try to find one from email_accounts
    if (!grantId) {
      const { data: account } = await supabase
        .from('email_accounts')
        .select('grant_id, provider')
        .eq('user_id', event.user_id)
        .eq('is_active', true)
        .in('provider', CALENDAR_CAPABLE_PROVIDERS)
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
    let endDateStr = event.end_date ? event.end_date.substring(0, 10) : startDateStr
    // Guard: if end is before start (data error), fall back to start to avoid Nylas "timeRangeEmpty" error
    if (endDateStr < startDateStr) {
      console.warn(`⚠️ end_date (${endDateStr}) is before start_date (${startDateStr}), using start_date for both`)
      endDateStr = startDateStr
    }

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

    // Load route sheet — ALWAYS prefer the stop that belongs to this event (by event_id),
    // never trust events.route_sheet_id alone because it can become stale or shared between
    // events after deduplication, which causes one event's roadmap to leak onto another.
    let description: string
    let routeSheet: any = null

    // 1) Look up by roadshow_stops.event_id (most reliable, scoped to this event)
    const { data: stopsByEvent, error: rsByEventError } = await supabase
      .from('roadshow_stops')
      .select('*')
      .eq('event_id', event_id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (rsByEventError) {
      console.error('Route sheet lookup by event_id error:', rsByEventError)
    }

    if (stopsByEvent && stopsByEvent.length > 0) {
      routeSheet = stopsByEvent[0]
      console.log(`📋 Route sheet found via event_id: ${routeSheet.id} (${routeSheet.venue || routeSheet.city || 'no venue/city'})`)

      // Self-heal: if events.route_sheet_id is stale or shared with another event, fix it.
      if (event.route_sheet_id !== routeSheet.id) {
        console.log(`🔧 Repairing stale route_sheet_id: ${event.route_sheet_id} → ${routeSheet.id}`)
        await supabase.from('events').update({ route_sheet_id: routeSheet.id }).eq('id', event_id)
      }
    } else if (event.route_sheet_id) {
      // 2) Fallback to events.route_sheet_id ONLY if no stop is linked by event_id,
      // and validate that the stop is not bound to a different event.
      const { data: rsById } = await supabase
        .from('roadshow_stops')
        .select('*')
        .eq('id', event.route_sheet_id)
        .single()

      if (rsById && (!rsById.event_id || rsById.event_id === event_id)) {
        routeSheet = rsById
        console.log(`📋 Route sheet found via route_sheet_id: ${rsById.id}`)
      } else if (rsById) {
        console.warn(`⚠️ route_sheet_id ${event.route_sheet_id} belongs to event ${rsById.event_id}, ignoring to prevent data leak`)
        await supabase.from('events').update({ route_sheet_id: null }).eq('id', event_id)
      }
    }

    if (routeSheet) {
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
      console.log(`📋 No route sheet found for event ${event_id}`)
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

        // If the remote event no longer exists (deleted on Google/Nylas), recreate it.
        if (response.status === 404 || response.status === 410) {
          console.log(`⚠️ Nylas event ${nylas_event_id} missing remotely — recreating.`)
          const createUrl = `${NYLAS_API_BASE}/grants/${grantId}/events?calendar_id=${encodeURIComponent(calendarId)}`
          const createResp = await fetch(createUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${nylasApiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(nylasEventBody),
          })
          if (!createResp.ok) {
            const recreateErr = await createResp.text()
            console.error('Nylas recreate error:', createResp.status, recreateErr)
            return new Response(
              JSON.stringify({ success: false, error: `Nylas recreate failed: ${createResp.status}`, details: recreateErr }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
          }
          const created = await createResp.json()
          const newId = created?.data?.id || created?.id
          if (newId) {
            await supabase.from('events').update({ nylas_event_id: newId }).eq('id', event_id)
            console.log(`✅ Nylas event recreated: ${newId} for "${event.title}"`)
            return new Response(
              JSON.stringify({ success: true, action: 'recreated', nylas_event_id: newId }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
          }
        }

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
