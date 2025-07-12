import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, X, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: any[]) => void;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ isOpen, onClose, onImport }) => {
  console.log('🔄 CSVImporter component loaded');
  
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedFields = [
    { key: 'first_name', label: 'Prénom *', required: true },
    { key: 'last_name', label: 'Nom *', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Téléphone', required: false },
    { key: 'position', label: 'Poste/Titre', required: false },
    { key: 'address', label: 'Adresse', required: false },
    { key: 'city', label: 'Ville', required: false },
    { key: 'postal_code', label: 'Code postal', required: false },
    { key: 'country', label: 'Pays', required: false },
    { key: 'status', label: 'Statut (prospect/client/inactive)', required: false },
    { key: 'source', label: 'Source', required: false },
    { key: 'notes', label: 'Notes', required: false }
  ];

  const generateTemplate = () => {
    console.log('📥 Generating CSV template');
    const csvContent = [
      expectedFields.map(field => field.label.replace(' *', '')).join(','),
      'Jean,Dupont,jean.dupont@example.com,06 12 34 56 78,Directeur,"123 rue Example",Paris,75001,France,prospect,Site web,"Notes sur ce contact"',
      'Marie,Martin,marie.martin@example.com,06 23 45 67 89,Manager,"456 avenue Test",Lyon,69000,France,client,Recommandation,"Autre note importante"'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Template CSV téléchargé');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log('📁 File dropped:', e.dataTransfer.files[0].name);
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log('📁 File selected:', e.target.files[0].name);
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    console.log('📄 Processing file:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCSV = (text: string) => {
    console.log('🔍 Parsing CSV data');
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast.error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
      return;
    }

    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
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

    const headers = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    console.log('📊 Parsed CSV:', { headers, rowCount: rows.length });
    setHeaders(headers);
    setCsvData(rows);
    setStep('mapping');

    // Auto-mapping intelligent amélioré
    const autoMapping: Record<string, string> = {};
    expectedFields.forEach(field => {
      const matchingHeader = headers.find(h => {
        const headerLower = h.toLowerCase().replace(/[^a-z]/g, '');
        const fieldLower = field.key.toLowerCase().replace('_', '');
        const labelLower = field.label.toLowerCase().replace(/[^a-z]/g, '');
        
        return headerLower.includes(fieldLower) ||
               fieldLower.includes(headerLower) ||
               labelLower.includes(headerLower) ||
               headerLower.includes(labelLower.split(' ')[0]) ||
               (field.key === 'first_name' && (headerLower.includes('prenom') || headerLower.includes('firstname'))) ||
               (field.key === 'last_name' && (headerLower.includes('nom') || headerLower.includes('lastname'))) ||
               (field.key === 'position' && (headerLower.includes('poste') || headerLower.includes('titre') || headerLower.includes('role')));
      });
      if (matchingHeader) {
        autoMapping[field.key] = matchingHeader;
      }
    });
    setMapping(autoMapping);
    console.log('🔧 Auto-mapping applied:', autoMapping);
  };

  const handleImport = async () => {
    if (importing) return;
    
    console.log('💾 Starting import process');
    setImporting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour importer des contacts');
        return;
      }

      const mappedData = csvData.map(row => {
        const mappedRow: any = {
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        Object.entries(mapping).forEach(([fieldKey, headerName]) => {
          if (headerName && row[headerName] !== undefined) {
            let value = row[headerName]?.toString().trim();
            
            if (fieldKey === 'status') {
              const statusValue = value?.toLowerCase();
              if (['prospect', 'client', 'inactive'].includes(statusValue)) {
                mappedRow[fieldKey] = statusValue;
              } else {
                mappedRow[fieldKey] = 'prospect';
              }
            } else if (fieldKey === 'tags' && value) {
              mappedRow[fieldKey] = value.split(',').map((tag: string) => tag.trim()).filter(Boolean);
            } else if (fieldKey === 'accepts_marketing_emails') {
              mappedRow[fieldKey] = value?.toLowerCase() === 'true' || value === '1';
            } else {
              mappedRow[fieldKey] = value || '';
            }
          }
        });
        
        // Valeurs par défaut pour les champs requis
        if (!mappedRow.first_name) mappedRow.first_name = 'Prénom';
        if (!mappedRow.last_name) mappedRow.last_name = 'Nom';
        if (!mappedRow.status) mappedRow.status = 'prospect';
        if (mappedRow.accepts_marketing_emails === undefined) mappedRow.accepts_marketing_emails = true;
        
        return mappedRow;
      });

      console.log('📤 Mapped data ready for import:', mappedData.length, 'contacts');
      
      // Import par lots pour éviter les timeouts
      const batchSize = 50;
      const batches = [];
      for (let i = 0; i < mappedData.length; i += batchSize) {
        batches.push(mappedData.slice(i, i + batchSize));
      }

      let totalImported = 0;
      for (const batch of batches) {
        const { error } = await supabase
          .from('contacts')
          .insert(batch);

        if (error) {
          console.error('Error inserting batch:', error);
          toast.error(`Erreur lors de l'import du lot (${totalImported}/${mappedData.length})`);
          break;
        }
        
        totalImported += batch.length;
        console.log(`✅ Batch imported: ${totalImported}/${mappedData.length}`);
      }

      if (totalImported === mappedData.length) {
        toast.success(`${mappedData.length} contacts importés avec succès !`);
        onImport(mappedData);
        resetImporter();
        onClose();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erreur lors de l\'import');
    } finally {
      setImporting(false);
    }
  };

  const resetImporter = () => {
    console.log('🔄 Resetting importer');
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setStep('upload');
    setImporting(false);
  };

  const isValid = () => {
    const requiredFields = expectedFields.filter(f => f.required);
    const isValidMapping = requiredFields.every(field => mapping[field.key]);
    console.log('✅ Validation check:', { isValidMapping, mapping });
    return isValidMapping;
  };

  if (!isOpen) return null;

  console.log('🎨 Rendering CSVImporter - Step:', step);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Importer des contacts depuis un fichier CSV</span>
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div>
                <h3 className="text-lg font-medium">Télécharger le template CSV</h3>
                <p className="text-sm text-gray-600">
                  Téléchargez notre template pour vous assurer que vos données sont dans le bon format
                </p>
              </div>
              <Button onClick={generateTemplate} variant="outline" className="flex items-center space-x-2 w-full md:w-auto">
                <Download className="h-4 w-4" />
                <span>Télécharger le template</span>
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Importer votre fichier CSV</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Glissez-déposez votre fichier CSV ici
                  </p>
                  <p className="text-gray-500">ou</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Choisir un fichier
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Formats acceptés: CSV (UTF-8)
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">Format attendu</h4>
                  <div className="text-sm text-yellow-700 mt-1">
                    <p>Votre fichier CSV doit contenir au minimum les colonnes :</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {expectedFields.filter(f => f.required).map(field => (
                        <li key={field.key}>{field.label}</li>
                      ))}
                    </ul>
                    <p className="mt-2">Colonnes optionnelles disponibles :</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {expectedFields.filter(f => !f.required).map(field => (
                        <li key={field.key}>{field.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Correspondance des champs</h3>
              <p className="text-sm text-gray-600">
                Associez les colonnes de votre fichier aux champs de contact
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {expectedFields.map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">-- Sélectionner une colonne --</option>
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button onClick={() => setStep('upload')} variant="outline" className="flex-1">
                Retour
              </Button>
              <Button 
                onClick={() => setStep('preview')} 
                disabled={!isValid()}
                className="flex-1"
              >
                Aperçu
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Aperçu des données</h3>
              <p className="text-sm text-gray-600">
                Vérifiez que les données sont correctement importées ({csvData.length} contacts)
              </p>
            </div>

            <div className="max-h-96 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {expectedFields.filter(f => mapping[f.key]).map(field => (
                      <th key={field.key} className="px-4 py-2 text-left font-medium border-r">
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-t">
                      {expectedFields.filter(f => mapping[f.key]).map(field => (
                        <td key={field.key} className="px-4 py-2 border-r">
                          {row[mapping[field.key]] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {csvData.length > 5 && (
              <p className="text-sm text-gray-500">
                ... et {csvData.length - 5} contacts supplémentaires
              </p>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button onClick={() => setStep('mapping')} variant="outline" className="flex-1">
                Retour
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {importing ? 'Import en cours...' : `Importer ${csvData.length} contacts`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
