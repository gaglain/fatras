import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Trash2, FileText, Download, File } from 'lucide-react';
import { useRoadshowDocuments, RoadshowDocument } from '@/hooks/useRoadshowDocuments';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface RoadshowDocumentsProps {
  roadshowStopId?: string;
}

const CATEGORIES = [
  { value: 'tech_sheet', label: 'Fiche technique' },
  { value: 'rider', label: 'Rider' },
  { value: 'stage_plan', label: 'Plan de scène' },
  { value: 'contract', label: 'Contrat' },
  { value: 'other', label: 'Autre' },
];

export const RoadshowDocuments: React.FC<RoadshowDocumentsProps> = ({ roadshowStopId }) => {
  const { getDocuments, uploadDocument, deleteDocument, getDocumentUrl, loading } = useRoadshowDocuments();
  const [documents, setDocuments] = useState<RoadshowDocument[]>([]);
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (roadshowStopId) loadDocs();
  }, [roadshowStopId]);

  const loadDocs = async () => {
    if (!roadshowStopId) return;
    const docs = await getDocuments(roadshowStopId);
    setDocuments(docs);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roadshowStopId) return;

    const success = await uploadDocument(roadshowStopId, file, category, description || undefined);
    if (success) {
      setDescription('');
      await loadDocs();
    }
    e.target.value = '';
  };

  const confirmAction = useConfirm();
  const handleDelete = async (doc: RoadshowDocument) => {
    const ok = await confirmAction({ title: 'Supprimer', description: `Supprimer "${doc.file_name}" ?`, variant: 'destructive' });
    if (!ok) return;
    const success = await deleteDocument(doc.id, doc.file_path);
    if (success) await loadDocs();
  };

  if (!roadshowStopId) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>Documents disponibles après la création de l'étape.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1"
        />
        <label className="cursor-pointer">
          <Button variant="outline" size="sm" asChild disabled={loading}>
            <span>
              <Upload className="h-4 w-4 mr-1" />
              {loading ? 'Upload...' : 'Ajouter'}
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
            </span>
          </Button>
        </label>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun document. Ajoutez des fiches techniques, riders, plans de scène...
        </p>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg border bg-card">
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.file_name}</p>
                {doc.description && <p className="text-xs text-muted-foreground truncate">{doc.description}</p>}
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {CATEGORIES.find(c => c.value === doc.category)?.label || doc.category}
              </Badge>
              <a href={getDocumentUrl(doc.file_path)} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Download className="h-3 w-3" />
                </Button>
              </a>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(doc)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
