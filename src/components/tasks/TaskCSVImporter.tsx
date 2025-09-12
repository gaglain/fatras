import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, AlertCircle, Check } from 'lucide-react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { useContacts } from '@/hooks/useContacts';

interface CSVTask {
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

export const TaskCSVImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<number>(0);
  const { addTask } = useTasks();
  const { user } = useAuth();
  const { users } = useUser();
  const { contacts } = useContacts();

  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [fileText, setFileText] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);

  type MappingField = { key: keyof CSVTask; label: string; required: boolean };
  const mappingFields: MappingField[] = [
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



  const downloadTemplate = () => {
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
  
  // Helpers pour la correspondance des colonnes
  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  
  const detectMapping = (hdrs: string[]): Record<string, string> => {
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

  // Helpers d'identification
  const isUUID = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const isEmail = (v?: string) => !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const toISODateString = (v?: string) => {
    if (!v) return undefined;
    const s = v.includes('T') ? v : v.replace(' ', 'T');
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };
  const norm = (s: string) => s.trim().toLowerCase();

  const resolveUserId = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (isUUID(value)) return value;
    const v = norm(value);
    const match = users.find(u =>
      u.id === value ||
      norm(u.email || '') === v ||
      norm(u.username || '') === v ||
      norm(`${u.name} ${u.lastName}`.trim()) === v ||
      norm(u.name || '') === v ||
      norm(u.lastName || '') === v
    );
    return match?.id;
  };

  const resolveContactId = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (isUUID(value)) return value;
    const v = norm(value);
    const match = contacts.find(c =>
      c.id === value ||
      (c.email && norm(c.email) === v) ||
      norm(`${c.first_name} ${c.last_name}`.trim()) === v
    );
    return match?.id;
  };

  const parseCSVWithMapping = (csvText: string, mapping: Record<string, string>): CSVTask[] => {
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
  
  const parseCSV = (csvText: string): CSVTask[] => {
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
            case 'title':
              task.title = value;
              break;
            case 'description':
              task.description = value;
              break;
            case 'priority':
              if (['low', 'medium', 'high', 'urgent'].includes(value)) {
                task.priority = value;
              } else {
                task.priority = 'medium';
              }
              break;
            case 'status':
              if (['todo', 'in_progress', 'completed', 'cancelled'].includes(value)) {
                task.status = value;
              } else {
                task.status = 'todo';
              }
              break;
            case 'task_type':
              if (['Email', 'Telephone', 'RDV', 'Autre'].includes(value)) {
                task.task_type = value;
              } else {
                task.task_type = 'Autre';
              }
              break;
            case 'due_date':
              if (value && !isNaN(Date.parse(value))) {
                task.due_date = value;
              }
              break;
            case 'assigned_to':
              task.assigned_to = value;
              break;
            case 'contact_id':
              task.contact_id = value;
              break;
            case 'event_id':
              task.event_id = value;
              break;
            case 'artist_id':
              task.artist_id = value;
              break;
            case 'tags':
              if (value) {
                task.tags = value.split(',').map(t => t.trim()).filter(t => t);
              } else {
                task.tags = [];
              }
              break;
          }
        }
      });

      if (task.title) {
        tasks.push(task as CSVTask);
      }
    }

    return tasks;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile && selectedFile.type !== 'text/csv') {
      toast.error('Veuillez sélectionner un fichier CSV valide');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setSuccess(0);

    const text = await selectedFile.text();
    setFileText(text);
    const lines = text.split('\n').filter(l => l.trim());
    const hdrs = lines[0]?.split(',').map(h => h.trim()) || [];
    setHeaders(hdrs);
    setColumnMapping(detectMapping(hdrs));

    const rows = lines
      .slice(1, Math.min(lines.length, 6))
      .map(l => l.split(',').map(v => v.trim().replace(/^"|"$/g, '')));
    setPreviewRows(rows);
  };
  const importTasks = async () => {
    if (!file || !user) return;

    setImporting(true);
    setProgress(0);
    setErrors([]);
    setSuccess(0);

    try {
      const text = fileText || await file.text();
      const csvTasks = Object.keys(columnMapping).length
        ? parseCSVWithMapping(text, columnMapping)
        : parseCSV(text);

      if (csvTasks.length === 0) {
        throw new Error('Aucune tâche valide trouvée dans le fichier CSV');
      }

      let successCount = 0;
      const errorList: string[] = [];

      for (let i = 0; i < csvTasks.length; i++) {
        try {
          const csvTask = csvTasks[i];
          
          const resolvedAssigned = resolveUserId(csvTask.assigned_to);
          const resolvedContact = resolveContactId(csvTask.contact_id);
          const resolvedDue = csvTask.due_date ? (toISODateString(csvTask.due_date) ?? csvTask.due_date) : undefined;
          const resolvedEvent = isUUID(csvTask.event_id || '') ? csvTask.event_id : undefined;
          const resolvedArtist = isUUID(csvTask.artist_id || '') ? csvTask.artist_id : undefined;
          
          const taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id,
            title: csvTask.title,
            description: csvTask.description || '',
            priority: csvTask.priority || 'medium',
            status: csvTask.status || 'todo',
            task_type: csvTask.task_type || 'Autre',
            due_date: resolvedDue,
            assigned_to: resolvedAssigned,
            contact_id: resolvedContact,
            event_id: resolvedEvent,
            artist_id: resolvedArtist,
            tags: Array.isArray(csvTask.tags) ? csvTask.tags : []
          };
          await addTask(taskData);
          successCount++;
        } catch (error) {
          errorList.push(`Ligne ${i + 2}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }

        setProgress(((i + 1) / csvTasks.length) * 100);
      }

      setSuccess(successCount);
      setErrors(errorList);

      if (successCount > 0) {
        toast.success(`${successCount} tâche(s) importée(s) avec succès`);
      }

      if (errorList.length > 0) {
        toast.error(`${errorList.length} erreur(s) lors de l'import`);
      }

    } catch (error) {
      toast.error(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      setErrors([error instanceof Error ? error.message : 'Erreur inconnue']);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import CSV de tâches
        </CardTitle>
        <CardDescription>
          Importez plusieurs tâches en une fois depuis un fichier CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Télécharger le modèle CSV</Label>
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger le modèle CSV
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">Fichier CSV</Label>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {file && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Fichier sélectionné: {file.name}
            </p>

            {headers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Correspondance des colonnes</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setColumnMapping(detectMapping(headers))}
                  >
                    Détecter automatiquement
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mappingFields.map((f) => (
                    <div key={f.key as string} className="space-y-1">
                      <Label>
                        {f.label}
                        {f.required ? ' *' : ''}
                      </Label>
                      <Select
                        value={columnMapping[f.key as unknown as string] || ''}
                        onValueChange={(v) => setColumnMapping((prev) => ({ ...prev, [f.key as unknown as string]: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="(Ignorer)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ignore__">(Ignorer)</SelectItem>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                {!(columnMapping.title && columnMapping.title !== '__ignore__') && (
                  <p className="text-xs text-red-600">Le champ Titre est requis.</p>
                )}
                {previewRows.length > 0 && (
                  <p className="text-xs text-muted-foreground">Aperçu: {previewRows.length} ligne(s) détectée(s)</p>
                )}
              </div>
            )}

            <Button 
              onClick={importTasks}
              disabled={importing || !(columnMapping.title && columnMapping.title !== '__ignore__')}
              className="w-full"
            >
              {importing ? 'Import en cours...' : 'Importer les tâches'}
            </Button>
          </div>
        )}

        {importing && (
          <div className="space-y-2">
            <Label>Progression de l'import</Label>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">{Math.round(progress)}% terminé</p>
          </div>
        )}

        {success > 0 && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              {success} tâche(s) importée(s) avec succès
            </AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>Erreurs d'import:</p>
                <ul className="list-disc list-inside text-sm">
                  {errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li>... et {errors.length - 5} autre(s) erreur(s)</li>
                  )}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Format attendu:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>title:</strong> Titre de la tâche (obligatoire)</li>
            <li><strong>description:</strong> Description détaillée</li>
            <li><strong>priority:</strong> low, medium, high, urgent</li>
            <li><strong>status:</strong> todo, in_progress, completed, cancelled</li>
            <li><strong>task_type:</strong> Email, Telephone, RDV, Autre</li>
            <li><strong>due_date:</strong> Format ISO (YYYY-MM-DDTHH:mm)</li>
            <li><strong>assigned_to:</strong> ID de l'utilisateur assigné</li>
            <li><strong>contact_id:</strong> ID du contact lié (optionnel)</li>
            <li><strong>event_id:</strong> ID de l'événement lié (optionnel)</li>
            <li><strong>artist_id:</strong> ID de l'artiste lié (optionnel)</li>
            <li><strong>tags:</strong> Tags séparés par des virgules</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};