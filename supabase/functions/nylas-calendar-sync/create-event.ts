interface NylasEvent {
  title: string;
  description?: string;
  when: {
    start_time: string;
    end_time: string;
  };
  location?: string;
  participants?: Array<{ email: string; name?: string }>;
}

export async function createNylasEvent(
  grantId: string,
  event: NylasEvent,
  nylasApiKey: string
): Promise<any> {
  const response = await fetch(`https://api.us.nylas.com/v3/grants/${grantId}/events`, {
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
      conferencing: {
        provider: 'Google Meet',
        autocreate: {},
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Nylas API error:', errorText);
    throw new Error(`Failed to create event in Nylas: ${response.status} ${errorText}`);
  }

  return await response.json();
}
