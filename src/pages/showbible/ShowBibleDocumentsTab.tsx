import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Trash2, Loader2, User, Filter, X } from 'lucide-react';
import { ImprovedDocumentPreview } from '@/components/ImprovedDocumentPreview';

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface ShowBibleDocumentsTabProps {
  documents: any[];
  filteredDocuments: any[];
  loading: boolean;
  categories: Category[];
  spectacles: Array<{ id: string; name: string; genre: string }>;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  filterArtist: string;
  setFilterArtist: (value: string) => void;
  onDeleteDocument: (doc: any) => void;
  uploadDialogTrigger: React.ReactNode;
}

export const ShowBibleDocumentsTab: React.FC<ShowBibleDocumentsTabProps> = ({
  documents,
  filteredDocuments,
  loading,
  categories,
  spectacles,
  filterCategory,
  setFilterCategory,
  filterArtist,
  setFilterArtist,
  onDeleteDocument,
  uploadDialogTrigger,
}) => {
  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-end">
        {uploadDialogTrigger}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filtrer par catégorie</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Filtrer par spectacle</label>
          <Select value={filterArtist} onValueChange={setFilterArtist}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les spectacles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les spectacles</SelectItem>
              {spectacles.map((spectacle) => (
                <SelectItem key={spectacle.id} value={spectacle.id}>
                  {spectacle.name} - {spectacle.genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(filterCategory !== 'all' || filterArtist !== 'all') && (
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterCategory('all');
                setFilterArtist('all');
              }}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Effacer filtres
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="text-center py-12">
            <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Chargement...
            </h3>
            <p style={{ color: 'var(--app-text, #666666)' }}>
              Chargement des documents de la bible
            </p>
          </CardContent>
        </Card>
      ) : filteredDocuments.length === 0 ? (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="text-center py-12">
            <Filter className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Aucun document trouvé
            </h3>
            <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
              {(filterCategory !== 'all' || filterArtist !== 'all') 
                ? 'Aucun document ne correspond aux filtres sélectionnés'
                : 'Commencez par ajouter votre premier document à la bible'
              }
            </p>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Aucun document
            </h3>
            <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
              Commencez par ajouter votre premier document à la bible
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} style={{
              backgroundColor: 'var(--app-card-bg, #ffffff)',
              color: 'var(--app-card-text, #18181b)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate text-sm">{doc.name}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteDocument(doc)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ImprovedDocumentPreview document={doc} />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{doc.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taille:</span>
                    <span>{doc.file_size_display}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span>{doc.version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Catégorie:</span>
                    <span className="font-medium">
                      {categories.find(cat => cat.id === doc.category)?.name || doc.category}
                    </span>
                  </div>
                </div>

                {doc.artists && doc.artists.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">
                        Spectacles associés
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doc.artists.map((artistId: string) => {
                        const spectacle = spectacles.find(s => s.id === artistId);
                        return spectacle ? (
                          <span key={artistId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {spectacle.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {doc.description && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                )}

                {doc.tags.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag: string, index: number) => (
                        <span key={index} className="text-xs bg-secondary px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
