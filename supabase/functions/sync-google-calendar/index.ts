import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

interface EventData {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  venue?: string;
  city?: string;
  address?: string;
  status: string;
  attendee_emails?: string[];
}

// Generate JWT for Google API authentication
async function generateGoogleJWT(serviceAccount: GoogleServiceAccount): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  // Import the private key
  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${signatureInput}.${encodedSignature}`;
}

// Get Google access token
async function getGoogleAccessToken(serviceAccount: GoogleServiceAccount): Promise<string> {
  const jwt = await generateGoogleJWT(serviceAccount);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

// Get color ID based on status
function getColorId(status: string): string {
  switch (status?.toLowerCase()) {
    case 'option':
      return '5'; // Yellow/Banana
    case 'confirmé':
    case 'confirmed':
      return '10'; // Green/Basil
    default:
      return '7'; // Cyan/Peacock
  }
}

// Create or update Google Calendar event
async function syncEventToGoogleCalendar(
  accessToken: string,
  calendarId: string,
  eventData: EventData,
  existingGoogleEventId?: string
): Promise<{ googleEventId: string; success: boolean }> {
  
  const startDate = new Date(eventData.start_date);
  const endDate = eventData.end_date ? new Date(eventData.end_date) : new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
  
  const googleEvent = {
    summary: `${eventData.status === 'option' ? '[OPTION] ' : ''}${eventData.title}`,
    description: eventData.description || '',
    location: [eventData.venue, eventData.address, eventData.city].filter(Boolean).join(', '),
    start: {
      dateTime: startDate.toISOString(),
      timeZone: 'Europe/Paris'
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: 'Europe/Paris'
    },
    colorId: getColorId(eventData.status),
    attendees: eventData.attendee_emails?.map(email => ({ email })) || [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 }
      ]
    }
  };

  const method = existingGoogleEventId ? 'PATCH' : 'POST';
  const url = existingGoogleEventId 
    ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${existingGoogleEventId}?sendUpdates=all`
    : `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`;

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(googleEvent)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google Calendar API error:', error);
    throw new Error(`Failed to sync event: ${error}`);
  }

  const result = await response.json();
  return { googleEventId: result.id, success: true };
}

// Delete Google Calendar event
async function deleteGoogleCalendarEvent(
  accessToken: string,
  calendarId: string,
  googleEventId: string
): Promise<boolean> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  await response.text(); // Consume response body
  return response.ok || response.status === 404;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
    if (!serviceAccountKey) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not configured');
    }

    const serviceAccount: GoogleServiceAccount = JSON.parse(serviceAccountKey);
    const accessToken = await getGoogleAccessToken(serviceAccount);

    const { action, event_id, event_data, calendar_id, attendee_emails } = await req.json();
    
    // Use the shared calendar email as default
    const targetCalendarId = calendar_id || 'fatrasplanning@gmail.com';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (action) {
      case 'sync_event': {
        // Fetch event from database if not provided
        let eventToSync = event_data;
        if (!eventToSync && event_id) {
          const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', event_id)
            .single();
          
          if (error) throw error;
          eventToSync = event;
        }

        if (!eventToSync) {
          throw new Error('No event data provided');
        }

        // Check if event already has a Google Calendar ID
        const { data: existingSync } = await supabase
          .from('events')
          .select('google_calendar_event_id')
          .eq('id', eventToSync.id)
          .single();

        // Add attendee emails if provided
        if (attendee_emails?.length) {
          eventToSync.attendee_emails = attendee_emails;
        }

        const result = await syncEventToGoogleCalendar(
          accessToken,
          targetCalendarId,
          eventToSync,
          existingSync?.google_calendar_event_id
        );

        // Update event with Google Calendar ID
        await supabase
          .from('events')
          .update({ google_calendar_event_id: result.googleEventId })
          .eq('id', eventToSync.id);

        return new Response(JSON.stringify({
          success: true,
          google_event_id: result.googleEventId,
          message: existingSync?.google_calendar_event_id ? 'Event updated in Google Calendar' : 'Event created in Google Calendar'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'delete_event': {
        if (!event_id) {
          throw new Error('event_id required for delete');
        }

        const { data: event } = await supabase
          .from('events')
          .select('google_calendar_event_id')
          .eq('id', event_id)
          .single();

        if (event?.google_calendar_event_id) {
          await deleteGoogleCalendarEvent(accessToken, targetCalendarId, event.google_calendar_event_id);
          
          await supabase
            .from('events')
            .update({ google_calendar_event_id: null })
            .eq('id', event_id);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Event removed from Google Calendar'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'list_calendars': {
        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/users/me/calendarList',
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to list calendars: ${error}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify({
          success: true,
          calendars: data.items
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in sync-google-calendar:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
