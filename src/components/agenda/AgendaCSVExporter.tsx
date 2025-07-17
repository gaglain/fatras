
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
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

interface AgendaCSVExporterProps {
  events: AgendaEvent[];
}

export const AgendaCSVExporter: React.FC<AgendaCSVExporterProps> = ({ events }) => {
  const exportToCSV = () => {
    if (events.length === 0) {
      toast.error('Aucun événement à exporter');
      return;
    }

    // Définir les colonnes CSV
    const headers = [
      'Titre',
      'Description',
      'Date de début',
      'Date de fin',
      'Lieu',
      'Participants',
      'Type',
      'Statut',
      'Créé par'
    ];

    // Convertir les événements en lignes CSV
    const csvData = events.map(event => [
      event.title || '',
      event.description || '',
      event.startDate ? format(new Date(event.startDate), 'yyyy-MM-dd HH:mm') : '',
      event.endDate ? format(new Date(event.endDate), 'yyyy-MM-dd HH:mm') : '',
      event.location || '',
      event.attendees?.toString() || '0',
      event.type || 'other',
      event.status || 'confirmed',
      event.userName || ''
    ]);

    // Créer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => 
          // Échapper les virgules et guillemets dans les champs
          typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))
            ? `"${field.replace(/"/g, '""')}"`
            : field
        ).join(',')
      )
    ].join('\n');

    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `agenda_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${events.length} événements exportés avec succès`);
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exporter CSV
    </Button>
  );
};
