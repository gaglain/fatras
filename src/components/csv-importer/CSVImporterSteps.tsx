import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';

interface ExpectedField {
  key: string;
  label: string;
  required: boolean;
}

interface UploadStepProps {
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileClick: () => void;
  onGenerateTemplate: () => void;
  expectedFields: ExpectedField[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  dragActive, onDrag, onDrop, onFileClick, onGenerateTemplate, expectedFields, fileInputRef, onFileInput
}) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
      <div>
        <h3 className="text-lg font-medium">Télécharger le template CSV</h3>
        <p className="text-sm text-gray-600">Téléchargez notre template pour vous assurer que vos données sont dans le bon format</p>
      </div>
      <Button onClick={onGenerateTemplate} variant="outline" className="flex items-center space-x-2 w-full md:w-auto">
        <Download className="h-4 w-4" />
        <span>Télécharger le template</span>
      </Button>
    </div>
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Importer votre fichier CSV</h3>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
      >
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">Glissez-déposez votre fichier CSV ici</p>
          <p className="text-gray-500">ou</p>
          <Button onClick={onFileClick} variant="outline">Choisir un fichier</Button>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={onFileInput} className="hidden" />
        </div>
        <p className="text-sm text-gray-500 mt-4">Formats acceptés: CSV (UTF-8)</p>
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
              {expectedFields.filter(f => f.required).map(field => (<li key={field.key}>{field.label}</li>))}
            </ul>
            <p className="mt-2">Colonnes optionnelles disponibles :</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {expectedFields.filter(f => !f.required).map(field => (<li key={field.key}>{field.label}</li>))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface MappingStepProps {
  expectedFields: ExpectedField[];
  headers: string[];
  mapping: Record<string, string>;
  setMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onReset: () => void;
  onContinue: () => void;
  isValid: boolean;
}

export const MappingStep: React.FC<MappingStepProps> = ({
  expectedFields, headers, mapping, setMapping, onReset, onContinue, isValid
}) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium">Correspondance des champs</h3>
      <p className="text-sm text-gray-600">Associez les colonnes de votre fichier aux champs de contact</p>
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
            {headers.map(header => (<option key={header} value={header}>{header}</option>))}
          </select>
        </div>
      ))}
    </div>
    <div className="flex justify-between pt-4 border-t">
      <Button variant="outline" onClick={onReset}>Annuler</Button>
      <Button onClick={onContinue} disabled={!isValid}>Continuer vers l'aperçu</Button>
    </div>
  </div>
);

interface PreviewStepProps {
  expectedFields: ExpectedField[];
  mapping: Record<string, string>;
  csvData: any[];
  importing: boolean;
  onImport: () => void;
  onBack: () => void;
}

export const PreviewStep: React.FC<PreviewStepProps> = ({
  expectedFields, mapping, csvData, importing, onImport, onBack
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-medium">Aperçu de l'import</h3>
      <p className="text-sm text-muted-foreground">Vérifiez les données avant l'import ({csvData.length} contacts)</p>
    </div>
    <div className="hidden sm:block max-h-80 overflow-auto border rounded-lg">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted sticky top-0">
          <tr>
            {expectedFields.filter(f => mapping[f.key]).map(field => (
              <th key={field.key} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">{field.label.replace(' *', '')}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {csvData.slice(0, 5).map((row, index) => (
            <tr key={index}>
              {expectedFields.filter(f => mapping[f.key]).map(field => (
                <td key={field.key} className="px-3 py-2 text-sm whitespace-nowrap">{row[mapping[field.key]] || '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="sm:hidden max-h-72 overflow-auto space-y-2">
      {csvData.slice(0, 5).map((row, index) => (
        <div key={index} className="border rounded-lg p-3 space-y-1 text-sm">
          {expectedFields.filter(f => mapping[f.key]).map(field => (
            <div key={field.key} className="flex justify-between gap-2">
              <span className="text-muted-foreground text-xs shrink-0">{field.label.replace(' *', '')}</span>
              <span className="text-right truncate">{row[mapping[field.key]] || '-'}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
    {csvData.length > 5 && (
      <p className="text-sm text-muted-foreground text-center">... et {csvData.length - 5} autres contacts</p>
    )}
    <div className="pt-4 border-t space-y-3">
      <Button onClick={onImport} disabled={importing} className="w-full" size="lg">
        {importing ? 'Import en cours...' : `Importer ${csvData.length} contacts`}
      </Button>
      <Button variant="outline" onClick={onBack} className="w-full">Retour</Button>
    </div>
  </div>
);

interface AssignListStepProps {
  importedContacts: any[];
  contactLists: any[];
  selectedListId: string;
  setSelectedListId: (id: string) => void;
  newListName: string;
  setNewListName: (name: string) => void;
  onAssign: () => void;
  onSkip: () => void;
}

export const AssignListStep: React.FC<AssignListStepProps> = ({
  importedContacts, contactLists, selectedListId, setSelectedListId, newListName, setNewListName, onAssign, onSkip
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-3">
        <Upload className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">Import réussi ! 🎉</h3>
      <p className="text-sm text-muted-foreground mt-1">{importedContacts.length} contacts ont été importés. Souhaitez-vous les organiser dans une liste ?</p>
    </div>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Ajouter à une liste existante</label>
        <select
          value={selectedListId}
          onChange={(e) => { setSelectedListId(e.target.value); if (e.target.value) setNewListName(''); }}
          className="w-full p-2 border rounded-md bg-background text-foreground"
          disabled={!!newListName.trim()}
        >
          <option value="">-- Sélectionner une liste --</option>
          {contactLists.map(list => (<option key={list.id} value={list.id}>{list.name}</option>))}
        </select>
      </div>
      <div className="flex items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="px-3 text-sm text-muted-foreground">ou</span>
        <div className="flex-grow border-t border-border"></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Créer une nouvelle liste</label>
        <input
          type="text" value={newListName}
          onChange={(e) => { setNewListName(e.target.value); if (e.target.value) setSelectedListId(''); }}
          placeholder="Nom de la nouvelle liste..."
          className="w-full p-2 border rounded-md bg-background text-foreground"
          disabled={!!selectedListId}
        />
      </div>
    </div>
    <div className="flex justify-between pt-4 border-t">
      <Button variant="outline" onClick={onSkip}>Passer cette étape</Button>
      <Button onClick={onAssign} disabled={!selectedListId && !newListName.trim()}>
        {newListName.trim() ? 'Créer la liste et assigner' : 'Assigner à la liste'}
      </Button>
    </div>
  </div>
);
