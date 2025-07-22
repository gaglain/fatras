import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ArtistDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  description?: string;
  artist_id?: string;
  artist_name?: string;
  created_at: string;
}

interface Artist {
  id: string;
  name: string;
}

export const ArtistDocumentFilter: React.FC = () => {
  const [documents, setDocuments] = useState<ArtistDocument[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ArtistDocument[]>([]);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArtists();
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, selectedArtist, selectedCategory, searchTerm]);

  const fetchArtists = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les artistes depuis les contacts
      const { data: artistContacts, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .eq('role', 'artiste');

      if (error) throw error;

      const artistList = artistContacts?.map(contact => ({
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name}`
      })) || [];

      setArtists(artistList);
    } catch (error) {
      console.error('Erreur lors de la récupération des artistes:', error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: filesData, error } = await supabase
        .from('artist_files')
        .select('*, contacts(first_name, last_name)')
        .eq('user_id', user.id);

      if (error) throw error;

      const documentsWithArtistNames = filesData?.map(file => ({
        id: file.id,
        file_name: file.file_name,
        file_type: file.file_type,
        file_size: file.file_size,
        category: file.category,
        description: file.description,
        artist_id: file.artist_id,
        artist_name: file.artist_id && (file as any).contacts 
          ? `${(file as any).contacts.first_name} ${(file as any).contacts.last_name}`
          : 'Non assigné',
        created_at: file.created_at
      })) || [];

      setDocuments(documentsWithArtistNames);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      toast.error('Erreur lors de la récupération des documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (selectedArtist) {
      filtered = filtered.filter(doc => doc.artist_id === selectedArtist);
    }

    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'photo': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'audio': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      case 'rider': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadDocument = async (document: ArtistDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('artist-documents')
        .download(document.file_name);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Document téléchargé');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  const clearFilters = () => {
    setSelectedArtist('');
    setSelectedCategory('');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtrer les documents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nom du fichier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Artiste</Label>
              <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les artistes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les artistes</SelectItem>
                  {artists.map(artist => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Catégorie</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les catégories</SelectItem>
                  <SelectItem value="photo">Photos</SelectItem>
                  <SelectItem value="video">Vidéos</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="contract">Contrats</SelectItem>
                  <SelectItem value="rider">Riders</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Effacer les filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents ({filteredDocuments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Chargement...</p>
          ) : filteredDocuments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucun document trouvé
            </p>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map(document => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-400">
                      {getFileIcon(document.file_type)}
                    </div>
                    <div>
                      <h4 className="font-medium">{document.file_name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{document.artist_name}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.file_size)}</span>
                        <span>•</span>
                        <Badge className={getCategoryColor(document.category)}>
                          {document.category}
                        </Badge>
                      </div>
                      {document.description && (
                        <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(document)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};