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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setErrors([]);
      setSuccess(0);
    } else {
      toast.error('Veuillez sélectionner un fichier CSV valide');
    }
  };

  const importTasks = async () => {
    if (!file || !user) return;

    setImporting(true);
    setProgress(0);
    setErrors([]);
    setSuccess(0);

    try {
      const text = await file.text();
      const csvTasks = parseCSV(text);

      if (csvTasks.length === 0) {
        throw new Error('Aucune tâche valide trouvée dans le fichier CSV');
      }

      let successCount = 0;
      const errorList: string[] = [];

      for (let i = 0; i < csvTasks.length; i++) {
        try {
          const csvTask = csvTasks[i];
          
          const taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
            user_id: user.id,
            title: csvTask.title,
            description: csvTask.description || '',
            priority: csvTask.priority || 'medium',
            status: csvTask.status || 'todo',
            task_type: csvTask.task_type || 'Autre',
            due_date: csvTask.due_date || undefined,
            assigned_to: csvTask.assigned_to || undefined,
            contact_id: csvTask.contact_id || undefined,
            event_id: csvTask.event_id || undefined,
            artist_id: csvTask.artist_id || undefined,
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
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Fichier sélectionné: {file.name}
            </p>
            <Button 
              onClick={importTasks}
              disabled={importing}
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