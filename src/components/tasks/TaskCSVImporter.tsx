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
import { useEvents } from '@/hooks/useEvents';
import {
  CSVTask, mappingFields, detectMapping, isUUID, toISODateString, norm,
  parseCSVWithMapping, parseCSV, downloadTemplate
} from './TaskCSVParserUtils';

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
  const { events } = useEvents();
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [fileText, setFileText] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);

  const resolveUserId = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (isUUID(value)) return value;
    const v = norm(value);
    return users.find(u => u.id === value || norm(u.email || '') === v || norm(u.username || '') === v || norm(`${u.name} ${u.lastName}`.trim()) === v || norm(u.name || '') === v || norm(u.lastName || '') === v)?.id;
  };

  const resolveContactId = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (isUUID(value)) return value;
    const v = norm(value);
    return contacts.find(c => c.id === value || (c.email && norm(c.email) === v) || (c.external_id && norm(c.external_id) === v) || norm(`${c.first_name} ${c.last_name}`.trim()) === v)?.id;
  };

  const resolveEventId = (value?: string): string | undefined => {
    if (!value) return undefined;
    if (isUUID(value)) return value;
    const v = norm(value);
    return events.find(e => e.id === value || (e.external_id && norm(e.external_id) === v) || norm(e.title) === v)?.id;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'text/csv') { toast.error('Veuillez sélectionner un fichier CSV valide'); return; }
    setFile(selectedFile); setErrors([]); setSuccess(0);
    const text = await selectedFile.text();
    setFileText(text);
    const lines = text.split('\n').filter(l => l.trim());
    const hdrs = lines[0]?.split(',').map(h => h.trim()) || [];
    setHeaders(hdrs);
    setColumnMapping(detectMapping(hdrs));
    setPreviewRows(lines.slice(1, Math.min(lines.length, 6)).map(l => l.split(',').map(v => v.trim().replace(/^"|"$/g, ''))));
  };

  const importTasks = async () => {
    if (!file || !user) return;
    setImporting(true); setProgress(0); setErrors([]); setSuccess(0);
    try {
      const text = fileText || await file.text();
      const csvTasks = Object.keys(columnMapping).length ? parseCSVWithMapping(text, columnMapping) : parseCSV(text);
      if (csvTasks.length === 0) throw new Error('Aucune tâche valide trouvée dans le fichier CSV');
      let successCount = 0;
      const errorList: string[] = [];
      for (let i = 0; i < csvTasks.length; i++) {
        try {
          const ct = csvTasks[i];
          const taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id, title: ct.title, description: ct.description || '',
            priority: ct.priority || 'medium', status: ct.status || 'todo', task_type: ct.task_type || 'Autre',
            due_date: ct.due_date ? (toISODateString(ct.due_date) ?? ct.due_date) : undefined,
            assigned_to: resolveUserId(ct.assigned_to), contact_id: resolveContactId(ct.contact_id),
            event_id: resolveEventId(ct.event_id), artist_id: isUUID(ct.artist_id || '') ? ct.artist_id : undefined,
            tags: Array.isArray(ct.tags) ? ct.tags : []
          };
          await addTask(taskData);
          successCount++;
        } catch (error) {
          errorList.push(`Ligne ${i + 2}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
        setProgress(((i + 1) / csvTasks.length) * 100);
      }
      setSuccess(successCount); setErrors(errorList);
      if (successCount > 0) toast.success(`${successCount} tâche(s) importée(s) avec succès`);
      if (errorList.length > 0) toast.error(`${errorList.length} erreur(s) lors de l'import`);
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
        <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Import CSV de tâches</CardTitle>
        <CardDescription>Importez plusieurs tâches en une fois depuis un fichier CSV</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Télécharger le modèle CSV</Label>
          <Button variant="outline" onClick={downloadTemplate} className="w-full"><Download className="h-4 w-4 mr-2" />Télécharger le modèle CSV</Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="csv-file">Fichier CSV</Label>
          <input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
        </div>
        {file && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Fichier sélectionné: {file.name}</p>
            {headers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Correspondance des colonnes</Label>
                  <Button variant="outline" size="sm" onClick={() => setColumnMapping(detectMapping(headers))}>Détecter automatiquement</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mappingFields.map((f) => (
                    <div key={f.key as string} className="space-y-1">
                      <Label>{f.label}{f.required ? ' *' : ''}</Label>
                      <Select value={columnMapping[f.key as string] || ''} onValueChange={(v) => setColumnMapping(prev => ({ ...prev, [f.key as string]: v }))}>
                        <SelectTrigger><SelectValue placeholder="(Ignorer)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ignore__">(Ignorer)</SelectItem>
                          {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                {!(columnMapping.title && columnMapping.title !== '__ignore__') && <p className="text-xs text-red-600">Le champ Titre est requis.</p>}
                {previewRows.length > 0 && <p className="text-xs text-muted-foreground">Aperçu: {previewRows.length} ligne(s) détectée(s)</p>}
              </div>
            )}
            <Button onClick={importTasks} disabled={importing || !(columnMapping.title && columnMapping.title !== '__ignore__')} className="w-full">
              {importing ? 'Import en cours...' : 'Importer les tâches'}
            </Button>
          </div>
        )}
        {importing && (<div className="space-y-2"><Label>Progression de l'import</Label><Progress value={progress} className="w-full" /><p className="text-sm text-gray-600">{Math.round(progress)}% terminé</p></div>)}
        {success > 0 && (<Alert><Check className="h-4 w-4" /><AlertDescription>{success} tâche(s) importée(s) avec succès</AlertDescription></Alert>)}
        {errors.length > 0 && (
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>
            <div className="space-y-1"><p>Erreurs d'import:</p><ul className="list-disc list-inside text-sm">
              {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
              {errors.length > 5 && <li>... et {errors.length - 5} autre(s) erreur(s)</li>}
            </ul></div>
          </AlertDescription></Alert>
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
