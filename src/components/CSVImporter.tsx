import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { UploadStep, MappingStep, PreviewStep, AssignListStep } from './csv-importer/CSVImporterSteps';

interface CSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: any[]) => void;
  contactLists?: any[];
  onCreateList?: (listName: string, contactIds: string[]) => void;
}

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

export const CSVImporter: React.FC<CSVImporterProps> = ({ isOpen, onClose, onImport, contactLists = [], onCreateList }) => {
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'assign-list'>('upload');
  const [importing, setImporting] = useState(false);
  const [selectedListId, setSelectedListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [importedContacts, setImportedContacts] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateTemplate = () => {
    const csvContent = [
      expectedFields.map(field => field.label.replace(' *', '')).join(','),
      'Jean,Dupont,jean.dupont@example.com,06 12 34 56 78,Directeur,"123 rue Example",Paris,75001,France,prospect,Site web,"Notes sur ce contact"',
      'Marie,Martin,marie.martin@example.com,06 23 45 67 89,Manager,"456 avenue Test",Lyon,69000,France,client,Recommandation,"Autre note importante"'
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
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
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target?.result as string);
    reader.readAsText(file, 'UTF-8');
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast.error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
      return;
    }
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else current += char;
      }
      result.push(current.trim());
      return result;
    };
    const parsedHeaders = parseCSVLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const row: any = {};
      parsedHeaders.forEach((header, index) => { row[header] = values[index] || ''; });
      return row;
    });
    setHeaders(parsedHeaders);
    setCsvData(rows);
    setStep('mapping');

    const autoMapping: Record<string, string> = {};
    expectedFields.forEach(field => {
      const matchingHeader = parsedHeaders.find(h => {
        const headerLower = h.toLowerCase().replace(/[^a-z]/g, '');
        const fieldLower = field.key.toLowerCase().replace('_', '');
        const labelLower = field.label.toLowerCase().replace(/[^a-z]/g, '');
        return headerLower.includes(fieldLower) || fieldLower.includes(headerLower) ||
               labelLower.includes(headerLower) || headerLower.includes(labelLower.split(' ')[0]) ||
               (field.key === 'first_name' && (headerLower.includes('prenom') || headerLower.includes('firstname'))) ||
               (field.key === 'last_name' && (headerLower.includes('nom') || headerLower.includes('lastname'))) ||
               (field.key === 'position' && (headerLower.includes('poste') || headerLower.includes('titre') || headerLower.includes('role')));
      });
      if (matchingHeader) autoMapping[field.key] = matchingHeader;
    });
    setMapping(autoMapping);
  };

  const handleImport = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Vous devez être connecté pour importer des contacts'); return; }

      const mappedData = csvData.map(row => {
        const mappedRow: any = { user_id: user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        Object.entries(mapping).forEach(([fieldKey, headerName]) => {
          if (headerName && row[headerName] !== undefined) {
            let value = row[headerName]?.toString().trim();
            if (fieldKey === 'status') {
              const sv = value?.toLowerCase();
              mappedRow[fieldKey] = ['prospect', 'client', 'inactive'].includes(sv) ? sv : 'prospect';
            } else if (fieldKey === 'tags' && value) {
              mappedRow[fieldKey] = value.split(',').map((tag: string) => tag.trim()).filter(Boolean);
            } else if (fieldKey === 'accepts_marketing_emails') {
              mappedRow[fieldKey] = value?.toLowerCase() === 'true' || value === '1';
            } else {
              mappedRow[fieldKey] = value || '';
            }
          }
        });
        if (!mappedRow.first_name) mappedRow.first_name = 'Prénom';
        if (!mappedRow.last_name) mappedRow.last_name = 'Nom';
        if (!mappedRow.status) mappedRow.status = 'prospect';
        if (!mappedRow.role) mappedRow.role = 'contact';
        if (mappedRow.accepts_marketing_emails === undefined) mappedRow.accepts_marketing_emails = true;
        return mappedRow;
      });

      const batchSize = 50;
      const insertedAll: any[] = [];
      let hadError = false;
      for (let i = 0; i < mappedData.length; i += batchSize) {
        const batch = mappedData.slice(i, i + batchSize);
        const { data: inserted, error } = await supabase.from('contacts').insert(batch).select('id');
        if (error) {
          logger.error('Error inserting batch:', error);
          toast.error(`Erreur lors de l'import du lot (${insertedAll.length}/${mappedData.length})`);
          hadError = true;
          break;
        }
        if (inserted) insertedAll.push(...inserted);
      }

      if (insertedAll.length > 0) {
        if (!hadError) toast.success(`${insertedAll.length} contacts importés avec succès !`);
        onImport(mappedData);
        setImportedContacts(insertedAll);
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
    setCsvData([]); setHeaders([]); setMapping({}); setStep('upload');
    setImporting(false); setSelectedListId(''); setNewListName(''); setImportedContacts([]);
  };

  const handleAssignToList = async () => {
    try {
      const contactIds = importedContacts.map((c: any) => c.id).filter(Boolean);
      if (contactIds.length === 0) throw new Error('Aucun contact importé à assigner');

      if (newListName.trim() && onCreateList) {
        await onCreateList(newListName.trim(), contactIds);
        toast.success(`Liste "${newListName}" créée avec ${contactIds.length} contacts`);
      } else if (selectedListId) {
        const members = contactIds.map(contact_id => ({ contact_list_id: selectedListId, contact_id }));
        const { error: memberError } = await supabase.from('contact_list_members').insert(members);
        if (memberError) throw memberError;
        toast.success(`${contactIds.length} contacts ajoutés à la liste`);
      }
      resetImporter();
      onClose();
    } catch (error) {
      logger.error('Erreur lors de l\'assignation à la liste:', error);
      toast.error('Erreur lors de l\'assignation à la liste');
    }
  };


  const isValid = () => expectedFields.filter(f => f.required).every(field => mapping[field.key]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Importer des contacts depuis un fichier CSV</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
        {step === 'upload' && (
          <UploadStep
            dragActive={dragActive} onDrag={handleDrag} onDrop={handleDrop}
            onFileClick={() => fileInputRef.current?.click()} onGenerateTemplate={generateTemplate}
            expectedFields={expectedFields} fileInputRef={fileInputRef} onFileInput={handleFileInput}
          />
        )}
        {step === 'mapping' && (
          <MappingStep
            expectedFields={expectedFields} headers={headers} mapping={mapping}
            setMapping={setMapping} onReset={resetImporter}
            onContinue={() => setStep('preview')} isValid={isValid()}
          />
        )}
        {step === 'preview' && (
          <PreviewStep
            expectedFields={expectedFields} mapping={mapping} csvData={csvData}
            importing={importing} onImport={handleImport} onBack={() => setStep('mapping')}
          />
        )}
        {step === 'assign-list' && (
          <AssignListStep
            importedContacts={importedContacts} contactLists={contactLists}
            selectedListId={selectedListId} setSelectedListId={setSelectedListId}
            newListName={newListName} setNewListName={setNewListName}
            onAssign={handleAssignToList} onSkip={() => { resetImporter(); onClose(); }}
          />
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
