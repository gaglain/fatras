import React from 'react';
import { FileText, Film, Music, Image, FileType } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, className = "" }) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (type.startsWith('video/')) return <Film className="h-8 w-8" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8" />;
    if (type === 'application/pdf') return <FileText className="h-8 w-8" />;
    return <FileType className="h-8 w-8" />;
  };

  const getPreviewContent = () => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      return (
        <div className="relative">
          <img 
            src={url} 
            alt="Aperçu"
            className="w-full h-32 object-cover rounded"
            onLoad={() => URL.revokeObjectURL(url)}
          />
        </div>
      );
    }

    if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      return (
        <div className="relative">
          <video 
            src={url} 
            className="w-full h-32 object-cover rounded"
            controls={false}
            muted
            onLoadedData={() => URL.revokeObjectURL(url)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
            <Film className="h-8 w-8 text-white" />
          </div>
        </div>
      );
    }

    // Pour les autres types de fichiers, afficher l'icône et les détails
    return (
      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded bg-gray-50">
        {getFileIcon(file.type)}
        <p className="text-sm text-gray-600 mt-2">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium mb-2">Aperçu du fichier</label>
      {getPreviewContent()}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Nom:</strong> {file.name}</p>
        <p><strong>Type:</strong> {file.type || 'Non défini'}</p>
        <p><strong>Taille:</strong> {formatFileSize(file.size)}</p>
      </div>
    </div>
  );
};