export interface CSVTask {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  task_type: 'Email' | 'Telephone' | 'RDV' | 'Autre';
  due_date?: string;
  assigned_to?: string;
  contact_id?: string;
  event_id?: string;
  artist_id?: string;
  tags?: string;
}

export type MappingField = { key: keyof CSVTask; label: string; required: boolean };

export const mappingFields: MappingField[] = [
  { key: 'title', label: 'Titre', required: true },
  { key: 'description', label: 'Description', required: false },
  { key: 'priority', label: 'Priorité', required: false },
  { key: 'status', label: 'Statut', required: false },
  { key: 'task_type', label: 'Type de tâche', required: false },
  { key: 'due_date', label: 'Échéance', required: false },
  { key: 'assigned_to', label: 'Assigné à', required: false },
  { key: 'contact_id', label: 'Contact ID', required: false },
  { key: 'event_id', label: 'Événement ID', required: false },
  { key: 'artist_id', label: 'Artiste ID', required: false },
  { key: 'tags', label: 'Tags', required: false },
];

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

export const detectMapping = (hdrs: string[]): Record<string, string> => {
  const normMap = new Map(hdrs.map(h => [normalize(h), h] as const));
  const pick = (...cands: string[]) => {
    for (const c of cands) {
      const found = normMap.get(normalize(c));
      if (found) return found;
    }
    return '';
  };
  return {
    title: pick('title', 'titre', 'nom', 'tache', 'tâche'),
    description: pick('description', 'desc', 'details', 'détails'),
    priority: pick('priority', 'priorite', 'priorité'),
    status: pick('status', 'statut'),
    task_type: pick('task_type', 'type', 'type tache', 'type tâche'),
    due_date: pick('due_date', 'echeance', 'échéance', 'deadline', 'date limite', 'due'),
    assigned_to: pick('assigned_to', 'assigne a', 'assigné à', 'responsable', 'owner', 'assignee', 'utilisateur'),
    contact_id: pick('contact_id', 'contact'),
    event_id: pick('event_id', 'evenement', 'événement'),
    artist_id: pick('artist_id', 'artiste'),
    tags: pick('tags', 'libelles', 'labels'),
  };
};

export const isUUID = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export const toISODateString = (v?: string) => {
  if (!v) return undefined;
  const s = v.includes('T') ? v : v.replace(' ', 'T');
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

export const norm = (s: string) => s.trim().toLowerCase();

export const parseCSVWithMapping = (csvText: string, mapping: Record<string, string>): CSVTask[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  const hdrs = lines[0].split(',').map(h => h.trim());
  const indexOfHeader = (field: string) => {
    const hdr = mapping[field];
    if (!hdr) return -1;
    return hdrs.indexOf(hdr);
  };
  const tasks: CSVTask[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^\"|\"$/g, ''));
    const get = (field: string) => {
      const idx = indexOfHeader(field);
      if (idx === -1) return '';
      return values[idx] ?? '';
    };
    const t: any = {};
    const title = get('title');
    if (!title) continue;
    t.title = title;
    const description = get('description'); if (description) t.description = description;
    const priority = get('priority').toLowerCase();
    t.priority = (['low','medium','high','urgent'] as const).includes(priority as any) ? priority : 'medium';
    const status = get('status').toLowerCase();
    t.status = (['todo','in_progress','completed','cancelled'] as const).includes(status as any) ? status : 'todo';
    const type = get('task_type');
    t.task_type = (['Email','Telephone','RDV','Autre'] as const).includes(type as any) ? type : 'Autre';
    const due = get('due_date');
    if (due && !isNaN(Date.parse(due))) t.due_date = due;
    const assigned = get('assigned_to'); if (assigned) t.assigned_to = assigned;
    const contact = get('contact_id'); if (contact) t.contact_id = contact;
    const eventId = get('event_id'); if (eventId) t.event_id = eventId;
    const artistId = get('artist_id'); if (artistId) t.artist_id = artistId;
    const tags = get('tags'); if (tags) t.tags = tags.split(',').map(x => x.trim()).filter(Boolean);
    tasks.push(t as CSVTask);
  }
  return tasks;
};

export const parseCSV = (csvText: string): CSVTask[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const tasks: CSVTask[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const task: any = {};
    headers.forEach((header, index) => {
      const value = values[index];
      if (value) {
        switch (header) {
          case 'title': task.title = value; break;
          case 'description': task.description = value; break;
          case 'priority':
            task.priority = ['low', 'medium', 'high', 'urgent'].includes(value) ? value : 'medium'; break;
          case 'status':
            task.status = ['todo', 'in_progress', 'completed', 'cancelled'].includes(value) ? value : 'todo'; break;
          case 'task_type':
            task.task_type = ['Email', 'Telephone', 'RDV', 'Autre'].includes(value) ? value : 'Autre'; break;
          case 'due_date':
            if (!isNaN(Date.parse(value))) task.due_date = value; break;
          case 'assigned_to': task.assigned_to = value; break;
          case 'contact_id': task.contact_id = value; break;
          case 'event_id': task.event_id = value; break;
          case 'artist_id': task.artist_id = value; break;
          case 'tags':
            task.tags = value.split(',').map(t => t.trim()).filter(t => t); break;
        }
      }
    });
    if (task.title) tasks.push(task as CSVTask);
  }
  return tasks;
};

export const downloadTemplate = () => {
  const template = [
    'title,description,priority,status,task_type,due_date,assigned_to,contact_id,event_id,artist_id,tags',
    'Exemple de tâche,Description de la tâche,medium,todo,Autre,2024-12-31T10:00,,,,,"tag1,tag2"',
    'Appeler client,Contacter le client pour follow-up,high,todo,Telephone,2024-12-25T14:30,,,,,"urgent,client"',
    'RDV planning,Planifier un rendez-vous,high,todo,RDV,2025-01-15T14:00,,contact-uuid-123,event-uuid-456,,"rdv,planning"'
  ].join('\n');
  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_taches.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
