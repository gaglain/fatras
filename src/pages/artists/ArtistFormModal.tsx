import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

interface ArtistFormData {
  name: string;
  genre: string;
  currentTour: string;
  bio: string;
  image: string;
}

interface ArtistFormModalProps {
  isEditing: boolean;
  formData: ArtistFormData;
  setFormData: React.Dispatch<React.SetStateAction<ArtistFormData>>;
  uploading: boolean;
  onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ArtistFormModal: React.FC<ArtistFormModalProps> = ({
  isEditing,
  formData,
  setFormData,
  uploading,
  onUploadImage,
  onSave,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl flex flex-col max-h-[90vh]">
        <CardHeader className="flex-shrink-0">
          <CardTitle>{isEditing ? 'Modifier le Spectacle' : 'Ajouter Nouveau Spectacle'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              placeholder="Nom du spectacle *" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input 
              placeholder="Genre/Type *" 
              value={formData.genre}
              onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
            />
          </div>
          
          <Input 
            placeholder="Tournée/Série actuelle (optionnel)" 
            value={formData.currentTour}
            onChange={(e) => setFormData(prev => ({ ...prev, currentTour: e.target.value }))}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2">Image du spectacle</label>
            <div className="space-y-3">
              {formData.image && (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={formData.image} 
                    alt="Aperçu" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  >
                    ×
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="relative overflow-hidden"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Upload en cours...' : 'Choisir une image'}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={onUploadImage}
                  className="hidden"
                />
                <span className="text-sm text-gray-500">JPG, PNG (max 5MB)</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description du spectacle</label>
            <textarea 
              className="w-full p-3 border rounded-md min-h-24"
              placeholder="Description du spectacle, synopsis, informations techniques..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>
          
          <div className="flex space-x-3 pt-4 sticky bottom-0 bg-background pb-2">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={onSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isEditing ? 'Modifier' : 'Sauvegarder'} Spectacle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
