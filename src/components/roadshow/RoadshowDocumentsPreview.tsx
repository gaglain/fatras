import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye, File as FileIcon } from 'lucide-react';
import { useRoadshowDocuments, RoadshowDocument } from '@/hooks/useRoadshowDocuments';

interface Props {
  roadshowStopId: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  tech_sheet: 'Fiche technique',
  rider: 'Rider',
  stage_plan: 'Plan de scène',
  contract: 'Contrat',
  other: 'Autre',
};

const isImage = (type: string) => type?.startsWith('image/');
const isPdf = (type: string) => type === 'application/pdf';

export const RoadshowDocumentsPreview: React.FC<Props> = ({ roadshowStopId }) => {
  const { getDocuments, getDocumentUrl } = useRoadshowDocuments();
  const [docs, setDocs] = useState<RoadshowDocument[]>([]);
  const [preview, setPreview] = useState<RoadshowDocument | null>(null);

  useEffect(() => {
    if (roadshowStopId) getDocuments(roadshowStopId).then(setDocs);
  }, [roadshowStopId]);

  if (!docs.length) return null;

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base flex items-center">
        <FileText className="h-4 w-4 mr-2 text-blue-600" />
        📎 Documents ({docs.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        {docs.map((doc) => {
          const url = getDocumentUrl(doc.file_path);
          return (
            <div key={doc.id} className="bg-gray-50 border rounded-lg overflow-hidden flex flex-col">
              <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {isImage(doc.file_type) ? (
                  <img src={url} alt={doc.file_name} className="w-full h-full object-cover" />
                ) : isPdf(doc.file_type) ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <FileText className="h-10 w-10" />
                    <span className="text-[10px] mt-1 font-semibold text-red-600">PDF</span>
                  </div>
                ) : (
                  <FileIcon className="h-10 w-10 text-gray-400" />
                )}
                <div className="absolute top-1 right-1 flex gap-1">
                  <button
                    onClick={() => setPreview(doc)}
                    className="p-1 bg-white/90 rounded-full hover:bg-white"
                    title="Aperçu"
                  >
                    <Eye className="h-3 w-3 text-gray-700" />
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 bg-white/90 rounded-full hover:bg-white"
                    title="Télécharger"
                  >
                    <Download className="h-3 w-3 text-gray-700" />
                  </a>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <p className="text-xs font-medium truncate" title={doc.file_name}>{doc.file_name}</p>
                <Badge variant="outline" className="text-[10px]">
                  {CATEGORY_LABEL[doc.category] || doc.category}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {preview && createPortal((
        <div
          className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-2 sm:p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b">
              <p className="font-medium truncate">{preview.file_name}</p>
              <div className="flex gap-2">
                <a href={getDocumentUrl(preview.file_path)} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Télécharger</Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => setPreview(null)}>Fermer</Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100">
              {isImage(preview.file_type) ? (
                <img
                  src={getDocumentUrl(preview.file_path)}
                  alt={preview.file_name}
                  className="w-full h-auto"
                />
              ) : isPdf(preview.file_type) ? (
                <iframe
                  src={getDocumentUrl(preview.file_path)}
                  className="w-full h-[75vh]"
                  title={preview.file_name}
                />
              ) : (
                <div className="p-8 text-center text-gray-600">
                  Aperçu non disponible pour ce type de fichier.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
