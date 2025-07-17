
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  attendees: number;
  type: 'concert' | 'meeting' | 'other';
  status: 'confirmed' | 'pending' | 'cancelled';
  userId: string;
  userName: string;
}

interface AgendaCSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (events: AgendaEvent[]) => void;
}

export const AgendaCSVImporter: React.FC<AgendaCSVImporterProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Veuillez sélectionner un fichier CSV');
      return;
    }

    setIsProcessing(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const events: AgendaEvent[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        if (values.length < 2) continue; // Skip empty or invalid lines

        const event: AgendaEvent = {
          id: Date.now().toString() + i,
          title: values[0] || `Événement ${i}`,
          description: values[1] || '',
          startDate: values[2] || new Date().toISOString(),
          endDate: values[3] || values[2] || new Date().toISOString(),
          location: values[4] || '',
          attendees: parseInt(values[5]) || 0,
          type: (values[6] === 'concert' || values[6] === 'meeting') ? values[6] : 'other',
          status: (values[7] === 'confirmed' || values[7] === 'pending' || values[7] === 'cancelled') ? values[7] : 'confirmed',
          userId: '1', // Current user
          userName: 'Utilisateur actuel'
        };

        events.push(event);
      }

      if (events.length === 0) {
        toast.error('Aucun événement valide trouvé dans le fichier');
        return;
      }

      onImportComplete(events);
      toast.success(`${events.length} événements importés avec succès`);
      onClose();

    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error('Erreur lors de l\'import du fichier CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const downloadTemplate = () => {
    const template = [
      'Titre,Description,Date de début,Date de fin,Lieu,Participants,Type,Statut',
      'Réunion équipe,Discussion hebdomadaire,2024-01-15T09:00:00,2024-01-15T10:00:00,Salle de conférence,8,meeting,confirmed',
      'Concert Jazz,Soirée jazz,2024-01-20T20:00:00,2024-01-20T23:00:00,Club de jazz,50,concert,pending'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_agenda.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Modèle CSV téléchargé');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importer des événements</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Importez vos événements depuis un fichier CSV. Le fichier doit contenir les colonnes : 
              Titre, Description, Date de début, Date de fin, Lieu, Participants, Type, Statut.
            </p>
            
            <Button
              onClick={downloadTemplate}
              variant="outline"
              size="sm"
              className="mb-4"
            >
              <FileText className="h-4 w-4 mr-2" />
              Télécharger le modèle
            </Button>
          </div>

          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </div>

          {isProcessing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Traitement en cours...</p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
