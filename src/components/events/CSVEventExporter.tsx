
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Event } from '@/types/event.types';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CSVEventExporterProps {
  events: Event[];
}

export const CSVEventExporter: React.FC<CSVEventExporterProps> = ({ events }) => {
  const exportToCSV = () => {
    if (events.length === 0) {
      toast.error('Aucun événement à exporter');
      return;
    }

    // Définir les colonnes CSV
    const headers = [
      'Titre',
      'Description',
      'Type d\'événement',
      'Lieu',
      'Adresse',
      'Ville',
      'Code postal',
      'Pays',
      'Date de début',
      'Date de fin',
      'Statut',
      'Budget minimum',
      'Budget maximum',
      'Nombre de participants',
      'Exigences',
      'Notes'
    ];

    // Convertir les événements en lignes CSV
    const csvData = events.map(event => [
      event.title || '',
      event.description || '',
      event.event_type || '',
      event.venue || '',
      event.address || '',
      event.city || '',
      event.postal_code || '',
      event.country || '',
      event.start_date ? format(new Date(event.start_date), 'yyyy-MM-dd HH:mm') : '',
      event.end_date ? format(new Date(event.end_date), 'yyyy-MM-dd HH:mm') : '',
      event.status || '',
      event.budget_min || '',
      event.budget_max || '',
      event.attendees_count || '',
      event.requirements || '',
      event.notes || ''
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
    link.setAttribute('download', `evenements_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${events.length} événements exportés avec succès`);
  };

  return (
    <Button onClick={exportToCSV} variant="outline" size="sm" className="text-xs sm:text-sm">
      <Download className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Export</span>
    </Button>
  );
};
