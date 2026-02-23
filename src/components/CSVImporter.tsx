import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, X, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface CSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: any[]) => void;
  contactLists?: any[];
  onCreateList?: (listName: string, contactIds: string[]) => void;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ isOpen, onClose, onImport, contactLists = [], onCreateList }) => {
  logger.log('🔄 CSVImporter component loaded');
  
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'assign-list'>('upload');
  const [importing, setImporting] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [newListName, setNewListName] = useState<string>('');
  const [importedContacts, setImportedContacts] = useState<any[]>([]);
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
    { key: 'notes', label: 'Notes', required: false },
    { key: 'company', label: 'Entreprise', required: false }
  ];

  const generateTemplate = () => {
    logger.log('📥 Generating CSV template');
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
      logger.log('📁 File dropped:', e.dataTransfer.files[0].name);
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      logger.log('📁 File selected:', e.target.files[0].name);
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    logger.log('📄 Processing file:', file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCSV = (text: string) => {
    logger.log('🔍 Parsing CSV data');
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

    logger.log('📊 Parsed CSV:', { headers, rowCount: rows.length });
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
    logger.log('🔧 Auto-mapping applied:', autoMapping);
  };

  const handleImport = async () => {
    if (importing) return;
    
    logger.log('💾 Starting import process');
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
          // Valeurs par défaut pour les champs requis
          if (!mappedRow.first_name) mappedRow.first_name = 'Prénom';
          if (!mappedRow.last_name) mappedRow.last_name = 'Nom';
          if (!mappedRow.status) mappedRow.status = 'prospect';
          if (!mappedRow.role) mappedRow.role = 'contact';
          if (mappedRow.accepts_marketing_emails === undefined) mappedRow.accepts_marketing_emails = true;
        
        return mappedRow;
      });

      logger.log('📤 Mapped data ready for import:', mappedData.length, 'contacts');
      
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
          logger.error('Error inserting batch:', error);
          toast.error(`Erreur lors de l'import du lot (${totalImported}/${mappedData.length})`);
          break;
        }
        
        totalImported += batch.length;
        logger.log(`✅ Batch imported: ${totalImported}/${mappedData.length}`);
      }

      if (totalImported === mappedData.length) {
        toast.success(`${mappedData.length} contacts importés avec succès !`);
        onImport(mappedData);
        setImportedContacts(mappedData);
        setStep('assign-list');
      }
    } catch (error) {
      logger.error('Import error:', error);
      toast.error('Erreur lors de l\'import');
    } finally {
      setImporting(false);
    }
  };

  const resetImporter = () => {
    logger.log('🔄 Resetting importer');
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setStep('upload');
    setImporting(false);
    setSelectedListId('');
    setNewListName('');
    setImportedContacts([]);
  };

  const handleAssignToList = async () => {
    try {
      if (newListName.trim() && onCreateList) {
        // Récupérer les IDs des contacts importés depuis la base de données
        const { data: insertedContacts, error } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .order('created_at', { ascending: false })
          .limit(importedContacts.length);

        if (error || !insertedContacts) {
          throw new Error('Erreur lors de la récupération des contacts importés');
        }

        const contactIds = insertedContacts.map(contact => contact.id);
        await onCreateList(newListName.trim(), contactIds);
        toast.success(`Liste "${newListName}" créée avec ${contactIds.length} contacts`);
      } else if (selectedListId) {
        // Ajouter les contacts à une liste existante
        const { data: insertedContacts, error } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .order('created_at', { ascending: false })
          .limit(importedContacts.length);

        if (!error && insertedContacts) {
          const members = insertedContacts.map(contact => ({
            contact_list_id: selectedListId,
            contact_id: contact.id
          }));

          const { error: memberError } = await supabase
            .from('contact_list_members')
            .insert(members);

          if (!memberError) {
            toast.success(`${insertedContacts.length} contacts ajoutés à la liste`);
          } else {
            throw memberError;
          }
        }
      }
      
      resetImporter();
      onClose();
    } catch (error) {
      logger.error('Erreur lors de l\'assignation à la liste:', error);
      toast.error('Erreur lors de l\'assignation à la liste');
    }
  };

  const isValid = () => {
    const requiredFields = expectedFields.filter(f => f.required);
    const isValidMapping = requiredFields.every(field => mapping[field.key]);
    logger.log('✅ Validation check:', { isValidMapping, mapping });
    return isValidMapping;
  };

  if (!isOpen) return null;

  logger.log('🎨 Rendering CSVImporter - Step:', step);

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

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={resetImporter}>
                Annuler
              </Button>
              <Button onClick={() => setStep('preview')} disabled={!isValid()}>
                Continuer vers l'aperçu
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Aperçu de l'import</h3>
              <p className="text-sm text-gray-600">
                Vérifiez les données avant l'import ({csvData.length} contacts)
              </p>
            </div>

            <div className="max-h-80 overflow-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    {expectedFields.filter(f => mapping[f.key]).map(field => (
                      <th key={field.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {field.label.replace(' *', '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {expectedFields.filter(f => mapping[f.key]).map(field => (
                        <td key={field.key} className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">
                          {row[mapping[field.key]] || '-'}
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

            <div className="pt-4 border-t space-y-3">
              <Button onClick={handleImport} disabled={importing} className="w-full" size="lg">
                {importing ? 'Import en cours...' : `Importer ${csvData.length} contacts`}
              </Button>
              <Button variant="outline" onClick={() => setStep('mapping')} className="w-full">
                Retour
              </Button>
            </div>
          </div>
        )}

        {step === 'assign-list' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Assigner à une liste (optionnel)</h3>
              <p className="text-sm text-gray-600">
                Vous pouvez ajouter les contacts importés à une liste existante ou en créer une nouvelle
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ajouter à une liste existante
                </label>
                <select
                  value={selectedListId}
                  onChange={(e) => {
                    setSelectedListId(e.target.value);
                    if (e.target.value) setNewListName('');
                  }}
                  className="w-full p-2 border rounded-md"
                  disabled={!!newListName.trim()}
                >
                  <option value="">-- Sélectionner une liste --</option>
                  {contactLists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-3 text-sm text-gray-500">ou</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Créer une nouvelle liste
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => {
                    setNewListName(e.target.value);
                    if (e.target.value) setSelectedListId('');
                  }}
                  placeholder="Nom de la nouvelle liste..."
                  className="w-full p-2 border rounded-md"
                  disabled={!!selectedListId}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => { resetImporter(); onClose(); }}>
                Passer cette étape
              </Button>
              <Button 
                onClick={handleAssignToList} 
                disabled={!selectedListId && !newListName.trim()}
              >
                {newListName.trim() ? 'Créer la liste et assigner' : 'Assigner à la liste'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
