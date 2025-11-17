import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Link as LinkIcon, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface ContractFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  artist_id?: string;
  description?: string;
  category: string;
  created_at: string;
}

interface ContractFileManagerProps {
  artists: any[];
}

export const ContractFileManager: React.FC<ContractFileManagerProps> = ({ artists }) => {
  const { user } = useAuthContext();
  const [files, setFiles] = useState<ContractFile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<string>('none');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('contract');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const fetchFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('artist_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      toast.error('Erreur lors du chargement des fichiers');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('artist-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artist-documents')
        .getPublicUrl(filePath);

      // Save file info to database
      const { error: insertError } = await supabase
        .from('artist_files')
        .insert({
          user_id: user.id,
          artist_id: selectedArtist === 'none' ? null : selectedArtist,
          file_name: file.name,
          file_path: publicUrl,
          file_type: file.type,
          file_size: file.size,
          bucket_name: 'artist-documents',
          description: description || null,
          category
        });

      if (insertError) throw insertError;

      toast.success('Fichier uploadé avec succès');
      await fetchFiles();
      
      // Reset form
      setSelectedArtist('none');
      setDescription('');
      setCategory('contract');
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Supprimer ce fichier ?')) return;

    try {
      const { error } = await supabase
        .from('artist_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast.success('Fichier supprimé');
      await fetchFiles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getArtistName = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    return artist ? `${artist.first_name} ${artist.last_name}` : 'Artiste inconnu';
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'contract': return 'Contrat';
      case 'rider': return 'Rider';
      case 'invoice': return 'Facture';
      case 'photo': return 'Photo';
      case 'press': return 'Dossier de presse';
      default: return 'Général';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestion des Documents</h3>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Ajouter un document</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un document</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="artist">Associer à un artiste (optionnel)</Label>
                <Select value={selectedArtist} onValueChange={setSelectedArtist}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un artiste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun artiste</SelectItem>
                    {artists.map(artist => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.first_name} {artist.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contrat</SelectItem>
                    <SelectItem value="rider">Rider</SelectItem>
                    <SelectItem value="invoice">Facture</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="press">Dossier de presse</SelectItem>
                    <SelectItem value="general">Général</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du document"
                />
              </div>

              <div>
                <Label htmlFor="file">Fichier</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formats acceptés: PDF, DOC, DOCX, JPG, PNG, ZIP
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des fichiers */}
      <div className="grid gap-4">
        {files.map(file => (
          <Card key={file.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{file.file_name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{getCategoryLabel(file.category)}</span>
                      {file.artist_id && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{getArtistName(file.artist_id)}</span>
                        </div>
                      )}
                      <span>{new Date(file.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {file.description && (
                      <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(file.file_path, '_blank')}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Ouvrir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {files.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Aucun document</h3>
              <p className="text-muted-foreground">Commencez par ajouter vos premiers documents</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};