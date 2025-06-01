
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, Download, CheckCircle } from 'lucide-react';

interface CSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

interface FieldMapping {
  csvColumn: string;
  targetField: string;
}

const availableFields = [
  { key: 'name', label: 'Nom complet', required: true },
  { key: 'firstName', label: 'Prénom', required: false },
  { key: 'lastName', label: 'Nom', required: false },
  { key: 'email', label: 'Email', required: true },
  { key: 'phone', label: 'Téléphone', required: true },
  { key: 'company', label: 'Entreprise', required: false },
  { key: 'role', label: 'Rôle', required: false },
  { key: 'eventName', label: 'Nom événement', required: false },
  { key: 'eventType', label: 'Type événement', required: false },
  { key: 'message', label: 'Message', required: false }
];

export const CSVImporter: React.FC<CSVImporterProps> = ({ isOpen, onClose, onImport }) => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], data: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, data };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const { headers, data } = parseCSV(csvText);
      setCsvHeaders(headers);
      setCsvData(data);
      
      // Auto-map common fields
      const autoMappings: FieldMapping[] = [];
      headers.forEach(header => {
        const lowerHeader = header.toLowerCase();
        let targetField = '';
        
        if (lowerHeader.includes('nom') && lowerHeader.includes('prenom')) targetField = 'name';
        else if (lowerHeader.includes('prénom') || lowerHeader.includes('prenom')) targetField = 'firstName';
        else if (lowerHeader.includes('nom')) targetField = 'lastName';
        else if (lowerHeader.includes('email') || lowerHeader.includes('mail')) targetField = 'email';
        else if (lowerHeader.includes('téléphone') || lowerHeader.includes('telephone') || lowerHeader.includes('phone')) targetField = 'phone';
        else if (lowerHeader.includes('entreprise') || lowerHeader.includes('company')) targetField = 'company';
        else if (lowerHeader.includes('rôle') || lowerHeader.includes('role') || lowerHeader.includes('titre')) targetField = 'role';
        else if (lowerHeader.includes('événement') || lowerHeader.includes('event')) targetField = 'eventName';
        else if (lowerHeader.includes('type')) targetField = 'eventType';
        else if (lowerHeader.includes('message')) targetField = 'message';

        if (targetField) {
          autoMappings.push({ csvColumn: header, targetField });
        }
      });
      
      setFieldMappings(autoMappings);
      setStep('mapping');
    };
    reader.readAsText(file);
  };

  const updateMapping = (csvColumn: string, targetField: string) => {
    setFieldMappings(prev => {
      const filtered = prev.filter(m => m.csvColumn !== csvColumn);
      if (targetField) {
        return [...filtered, { csvColumn, targetField }];
      }
      return filtered;
    });
  };

  const getMappedData = () => {
    return csvData.map(row => {
      const mappedRow: any = { source: 'csv' };
      fieldMappings.forEach(mapping => {
        mappedRow[mapping.targetField] = row[mapping.csvColumn];
      });
      
      // Generate full name if first/last names are provided
      if (mappedRow.firstName && mappedRow.lastName) {
        mappedRow.name = `${mappedRow.firstName} ${mappedRow.lastName}`;
      }
      
      return mappedRow;
    });
  };

  const handleImport = () => {
    const mappedData = getMappedData();
    onImport(mappedData);
    onClose();
    resetState();
  };

  const resetState = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMappings([]);
    setStep('upload');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const headers = availableFields.map(field => field.label).join(',');
    const sampleData = [
      'John Doe,john.doe@example.com,+33123456789,ABC Company,Manager,Festival Summer 2024,Festival,Nous aimerions réserver vos artistes',
      'Jane Smith,jane.smith@venue.com,+33987654321,Madison Garden,Venue Manager,Corporate Event,Événement d\'entreprise,Besoin d\'un spectacle pour notre événement'
    ];
    
    const csvContent = [headers, ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Import CSV - Contacts</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Importer un fichier CSV</p>
                  <p className="text-gray-500 mb-4">Sélectionnez un fichier CSV contenant vos contacts</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir un fichier
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger un modèle CSV
                </Button>
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Mappage des champs</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {csvData.length} contacts trouvés
                </Badge>
              </div>
              
              <p className="text-gray-600">
                Associez les colonnes de votre CSV aux champs appropriés:
              </p>
              
              <div className="space-y-3">
                {csvHeaders.map(header => (
                  <div key={header} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{header}</span>
                      <div className="text-sm text-gray-500">
                        Exemple: {csvData[0]?.[header] || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <Select
                        value={fieldMappings.find(m => m.csvColumn === header)?.targetField || ''}
                        onValueChange={(value) => updateMapping(header, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un champ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Ignorer cette colonne</SelectItem>
                          {availableFields.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label} {field.required && '*'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Retour
                </Button>
                <Button 
                  onClick={() => setStep('preview')}
                  disabled={!fieldMappings.some(m => m.targetField === 'email')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Aperçu
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Aperçu des données</h3>
                <Badge className="bg-green-100 text-green-800">
                  Prêt à importer {csvData.length} contacts
                </Badge>
              </div>
              
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {fieldMappings.map(mapping => (
                        <th key={mapping.targetField} className="p-3 text-left font-medium">
                          {availableFields.find(f => f.key === mapping.targetField)?.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getMappedData().slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-t">
                        {fieldMappings.map(mapping => (
                          <td key={mapping.targetField} className="p-3">
                            {row[mapping.targetField] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {csvData.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... et {csvData.length - 5} autres contacts
                </p>
              )}
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Retour
                </Button>
                <Button 
                  onClick={handleImport}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Importer les contacts
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
