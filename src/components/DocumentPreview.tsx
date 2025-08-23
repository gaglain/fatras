import React from 'react';
import { FileText, Film, Music, Image as ImageIcon, FileType, Eye } from 'lucide-react';
import { ShowBibleDocument } from '@/hooks/useShowBible';

interface DocumentPreviewProps {
  document: ShowBibleDocument;
  className?: string;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, className = "" }) => {
  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="h-4 w-4" />;
    if (type === 'video') return <Film className="h-4 w-4" />;
    if (type === 'audio') return <Music className="h-4 w-4" />;
    if (type === 'pdf') return <FileText className="h-4 w-4" />;
    return <FileType className="h-4 w-4" />;
  };

  const getPreviewContent = () => {
    // Pour les images, afficher l'aperçu
    if (document.type === 'image') {
      return (
        <div className="relative group">
          <img 
            src={document.url} 
            alt={document.name}
            className="w-full h-24 object-cover rounded cursor-pointer transition-opacity group-hover:opacity-75"
            onClick={() => window.open(document.url, '_blank')}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-6 w-6 text-white bg-black bg-opacity-50 rounded-full p-1" />
          </div>
        </div>
      );
    }

    // Pour les PDF, afficher un aperçu avec icône
    if (document.type === 'pdf') {
      return (
        <div 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 rounded bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => window.open(document.url, '_blank')}
        >
          <FileText className="h-8 w-8 text-red-600 mb-1" />
          <span className="text-xs text-red-700 font-medium">PDF</span>
          <Eye className="h-3 w-3 text-red-500 mt-1" />
        </div>
      );
    }

    // Pour les vidéos
    if (document.type === 'video') {
      return (
        <div 
          className="flex flex-col items-center justify-center h-24 border border-gray-200 rounded bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => window.open(document.url, '_blank')}
        >
          <Film className="h-8 w-8 text-blue-600 mb-1" />
          <span className="text-xs text-blue-700 font-medium">VIDÉO</span>
          <Eye className="h-3 w-3 text-blue-500 mt-1" />
        </div>
      );
    }

    // Pour les autres types de fichiers
    return (
      <div 
        className="flex flex-col items-center justify-center h-24 border border-gray-200 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => window.open(document.url, '_blank')}
      >
        {getFileIcon(document.type)}
        <span className="text-xs text-gray-700 font-medium mt-1">{document.type.toUpperCase()}</span>
        <Eye className="h-3 w-3 text-gray-500 mt-1" />
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {getPreviewContent()}
    </div>
  );
};