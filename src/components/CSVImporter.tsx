import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, X, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: any[]) => void;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ isOpen, onClose, onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expectedFields = [
    { key: 'firstName', label: 'Prénom *', required: true },
    { key: 'lastName', label: 'Nom *', required: true },
    { key: 'email', label: 'Email *', required: true },
    { key: 'phone', label: 'Téléphone', required: false },
    { key: 'eventId', label: 'ID Événement', required: false },
    { key: 'eventName', label: 'Nom de l\'événement', required: false },
    { key: 'eventTypeId', label: 'ID Type d\'événement', required: false },
    { key: 'eventTypeName', label: 'Type d\'événement', required: false },
    { key: 'role', label: 'Rôle/Titre', required: false },
    { key: 'address', label: 'Adresse', required: false },
    { key: 'acceptsMarketingEmails', label: 'Marketing (true/false)', required: false }
  ];

  const generateTemplate = () => {
    const csvContent = [
      expectedFields.map(field => field.label).join(','),
      'Jean,Dupont,jean.dupont@example.com,06 12 34 56 78,,Festival d\'été,,Festival,Directeur,"123 rue Example Paris",true',
      'Marie,Martin,marie.martin@example.com,06 23 45 67 89,,Concert privé,,Concert,Manager,"456 avenue Test Lyon",false'
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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    setHeaders(headers);
    setCsvData(rows);
    setStep('mapping');

    // Auto-mapping simple
    const autoMapping: Record<string, string> = {};
    expectedFields.forEach(field => {
      const matchingHeader = headers.find(h => 
        h.toLowerCase().includes(field.key.toLowerCase()) ||
        field.label.toLowerCase().includes(h.toLowerCase())
      );
      if (matchingHeader) {
        autoMapping[field.key] = matchingHeader;
      }
    });
    setMapping(autoMapping);
  };

  const handleImport = () => {
    const mappedData = csvData.map(row => {
      const mappedRow: any = {};
      Object.entries(mapping).forEach(([fieldKey, headerName]) => {
        if (headerName && row[headerName] !== undefined) {
          if (fieldKey === 'acceptsMarketingEmails') {
            mappedRow[fieldKey] = row[headerName]?.toLowerCase() === 'true';
          } else {
            mappedRow[fieldKey] = row[headerName];
          }
        }
      });
      return mappedRow;
    });

    onImport(mappedData);
    resetImporter();
    onClose();
  };

  const resetImporter = () => {
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setStep('upload');
  };

  const isValid = () => {
    const requiredFields = expectedFields.filter(f => f.required);
    return requiredFields.every(field => mapping[field.key]);
  };

  if (!isOpen) return null;

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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Télécharger le template CSV</h3>
                <p className="text-sm text-gray-600">
                  Téléchargez notre template pour vous assurer que vos données sont dans le bon format
                </p>
              </div>
              <Button onClick={generateTemplate} variant="outline" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Télécharger le template</span>
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Importer votre fichier CSV</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
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
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Format attendu</h4>
                  <div className="text-sm text-yellow-700 mt-1">
                    <p>Votre fichier CSV doit contenir au minimum les colonnes :</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {expectedFields.filter(f => f.required).map(field => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expectedFields.map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <select
                    value={mapping[field.key] || ''}
                    onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">-- Sélectionner une colonne --</option>
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
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
                <thead className="bg-gray-50">
                  <tr>
                    {expectedFields.filter(f => mapping[f.key]).map(field => (
                      <th key={field.key} className="px-4 py-2 text-left font-medium">
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-t">
                      {expectedFields.filter(f => mapping[f.key]).map(field => (
                        <td key={field.key} className="px-4 py-2">
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

            <div className="flex space-x-3">
              <Button onClick={() => setStep('mapping')} variant="outline" className="flex-1">
                Retour
              </Button>
              <Button onClick={handleImport} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Importer {csvData.length} contacts
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
