/**
 * Génère et télécharge un fichier .ics (iCalendar) à partir des données d'un événement
 */

interface ICSEventData {
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  venue?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

function formatICSDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateICSContent(event: ICSEventData): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@fatras-booking`;
  const start = formatICSDate(event.startDate);
  const end = event.endDate
    ? formatICSDate(event.endDate)
    : formatICSDate(new Date(new Date(event.startDate).getTime() + 3 * 3600000).toISOString());

  const location = [event.venue, event.address, event.city, event.country]
    .filter(Boolean)
    .join(', ');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fatras Booking//Event Export//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }
  if (location) {
    lines.push(`LOCATION:${escapeICS(location)}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICSFile(event: ICSEventData): void {
  const content = generateICSContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9àâéèêëïîôùûüç\s-]/gi, '').trim()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
