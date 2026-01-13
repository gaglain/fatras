
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

interface GlobalFileUploadProps {
  onFileUploaded?: (file: { url: string; name: string; type: string }) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  label?: string;
  multiple?: boolean;
}

export const GlobalFileUpload: React.FC<GlobalFileUploadProps> = ({
  onFileUploaded,
  acceptedTypes = "*/*",
  maxSize = 10,
  label = "Télécharger un fichier",
  multiple = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }>>([]);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Vérifier la taille
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max ${maxSize}MB)`);
        continue;
      }

      try {
        const result = await uploadFile(file, 'app-files', 'uploads');
        
        const uploadedFile = {
          url: result.url,
          name: result.name,
          type: file.type
        };

        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        if (onFileUploaded) {
          onFileUploaded(uploadedFile);
        }
      } catch {
        toast.error(`Erreur lors de l'upload de ${file.name}`);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{label}</Label>
      
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center cursor-pointer"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Glissez-déposez vos fichiers ici ou 
              </p>
              <div>
                <Input
                  type="file"
                  accept={acceptedTypes}
                  multiple={multiple}
                  onChange={handleChange}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload">
                  <Button 
                    variant="outline" 
                    disabled={isUploading}
                    className="cursor-pointer"
                    asChild
                  >
                    <span>
                      {isUploading ? `Upload... ${uploadProgress}%` : 'Choisir des fichiers'}
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Taille max: {maxSize}MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Fichiers uploadés:</Label>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                {getFileIcon(file.type)}
                <span className="text-sm truncate max-w-xs">{file.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(file.url, '_blank')}
                >
                  Voir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
