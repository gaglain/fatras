
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CSVExporterProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: any[];
}

export const CSVExporter: React.FC<CSVExporterProps> = ({ isOpen, onClose, contacts }) => {
  console.log('📤 CSVExporter component loaded with', contacts.length, 'contacts');
  
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'first_name', 'last_name', 'email', 'phone', 'status'
  ]);
  const [includeFiltered, setIncludeFiltered] = useState(true);

  const availableFields = [
    { key: 'first_name', label: 'Prénom' },
    { key: 'last_name', label: 'Nom' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Téléphone' },
    { key: 'position', label: 'Poste' },
    { key: 'address', label: 'Adresse' },
    { key: 'city', label: 'Ville' },
    { key: 'postal_code', label: 'Code postal' },
    { key: 'country', label: 'Pays' },
    { key: 'status', label: 'Statut' },
    { key: 'source', label: 'Source' },
    { key: 'notes', label: 'Notes' },
    { key: 'tags', label: 'Tags' },
    { key: 'created_at', label: 'Date de création' }
  ];

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const exportToCSV = async () => {
    console.log('📥 Starting CSV export');
    
    try {
      let dataToExport = contacts;
      
      // Si on veut tous les contacts (pas seulement les filtrés)
      if (!includeFiltered) {
        const { data: allContacts, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching all contacts:', error);
          toast.error('Erreur lors de la récupération des contacts');
          return;
        }

        dataToExport = allContacts || [];
      }

      // Créer les en-têtes CSV
      const headers = selectedFields.map(fieldKey => {
        const field = availableFields.find(f => f.key === fieldKey);
        return field ? field.label : fieldKey;
      });

      // Créer les lignes de données
      const csvRows = dataToExport.map(contact => {
        return selectedFields.map(fieldKey => {
          let value = contact[fieldKey] || '';
          
          // Traitement spécial pour certains champs
          if (fieldKey === 'tags' && Array.isArray(value)) {
            value = value.join(', ');
          } else if (fieldKey === 'created_at') {
            value = new Date(value).toLocaleDateString('fr-FR');
          }
          
          // Échapper les guillemets et entourer de guillemets si nécessaire
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        });
      });

      // Construire le contenu CSV
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().slice(0, 10);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts_export_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ CSV export completed:', dataToExport.length, 'contacts exported');
      toast.success(`${dataToExport.length} contacts exportés avec succès !`);
      onClose();
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    }
  };

  if (!isOpen) return null;

  console.log('🎨 Rendering CSVExporter');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Exporter les contacts en CSV</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Champs à exporter</h3>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {availableFields.map(field => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => handleFieldToggle(field.key)}
                  />
                  <label 
                    htmlFor={field.key} 
                    className="text-sm font-medium cursor-pointer"
                  >
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFiltered"
                checked={includeFiltered}
                onCheckedChange={setIncludeFiltered}
              />
              <label htmlFor="includeFiltered" className="text-sm font-medium cursor-pointer">
                Exporter seulement les contacts actuellement affichés ({contacts.length} contacts)
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {includeFiltered 
                ? `Exporte ${contacts.length} contacts filtrés` 
                : 'Exporte tous les contacts de la base de données'
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={exportToCSV} 
              disabled={selectedFields.length === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
