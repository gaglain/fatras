import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Upload } from 'lucide-react';
import { FilePreview } from '@/components/FilePreview';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface UploadFormData {
  name: string;
  type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
  category: string;
  description: string;
  file: File | null;
  tags: string;
  version: string;
  artists: string[];
}

interface ShowBibleUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploadForm: UploadFormData;
  setUploadForm: React.Dispatch<React.SetStateAction<UploadFormData>>;
  categories: Category[];
  spectacles: Array<{ id: string; name: string; genre: string }>;
  isUploading: boolean;
  uploadProgress: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
}

export const ShowBibleUploadDialog: React.FC<ShowBibleUploadDialogProps> = ({
  open,
  onOpenChange,
  uploadForm,
  setUploadForm,
  categories,
  spectacles,
  isUploading,
  uploadProgress,
  onFileUpload,
  onUpload,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full lg:w-auto" style={{
          backgroundColor: 'var(--app-button-bg, #1632f4)',
          color: 'var(--app-button-text, #ffffff)'
        }}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Ajouter Document</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fichier</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{
                borderColor: 'var(--notification-border, #e5e7eb)'
              }}>
                <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--app-text, #666666)' }} />
                <p className="text-sm mb-2" style={{ color: 'var(--app-text, #666666)' }}>
                  Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  onChange={onFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept="*/*"
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Sélectionner un fichier
                </Button>
                {uploadForm.file && (
                  <p className="text-sm text-green-600 mt-2">
                    Fichier sélectionné: {uploadForm.file.name}
                  </p>
                )}
              </div>
            </div>
            
            {uploadForm.file && (
              <FilePreview file={uploadForm.file} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom du document</label>
              <Input
                value={uploadForm.name}
                onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom d'affichage du document"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Version</label>
              <Input
                value={uploadForm.version}
                onChange={(e) => setUploadForm(prev => ({ ...prev, version: e.target.value }))}
                placeholder="ex: 1.0, 2.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags (séparés par des virgules)</label>
            <Input
              value={uploadForm.tags}
              onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="ex: urgent, technique, final"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Spectacles associés</label>
            <Select 
              value={uploadForm.artists[0] || 'none'} 
              onValueChange={(value) => setUploadForm(prev => ({ 
                ...prev, 
                artists: value === 'none' ? [] : [value] 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un spectacle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun spectacle</SelectItem>
                {spectacles.map((spectacle) => (
                  <SelectItem key={spectacle.id} value={spectacle.id}>
                    {spectacle.name} - {spectacle.genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image de couverture</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadForm(prev => ({ ...prev, file }));
                  }
                }}
                className="hidden"
                id="cover-image-upload"
              />
              <Button 
                type="button"
                variant="outline" 
                onClick={() => document.getElementById('cover-image-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choisir une image
              </Button>
              {uploadForm.file && (
                <p className="text-sm text-green-600 mt-2">
                  Image sélectionnée: {uploadForm.file.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du document..."
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={onUpload} 
              className="flex-1"
              disabled={isUploading || !uploadForm.file}
            >
              {isUploading ? `Upload... ${uploadProgress}%` : 'Ajouter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
