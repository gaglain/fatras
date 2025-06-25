
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'artiste' | 'utilisateur';

interface ExtendedUserProfile {
  id?: string;
  user_id?: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  birth_date?: string;
  birth_place?: string;
  social_security_number?: string;
  guso_id?: string;
  function_title?: string;
  nationality?: string;
  show_name?: string;
  associated_artists?: string[];
}

interface ExtendedUserProfileFormProps {
  profile?: ExtendedUserProfile;
  onSave: (profile: ExtendedUserProfile) => void;
  onCancel: () => void;
}

interface Artist {
  id: string;
  name: string;
}

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager / Booker',
  artiste: 'Artiste',
  utilisateur: 'Utilisateur'
};

export const ExtendedUserProfileForm: React.FC<ExtendedUserProfileFormProps> = ({
  profile,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<ExtendedUserProfile>({
    role: 'utilisateur',
    associated_artists: [],
    ...profile
  });
  const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);

  // Sample artists data - in a real app, this would come from your artists database
  useEffect(() => {
    // For now, using sample data. In the future, this should fetch from your artists table
    const sampleArtists: Artist[] = [
      { id: '1', name: 'The Midnight Express' },
      { id: '2', name: 'Sarah Mitchell' },
      { id: '3', name: 'Thunder Road' },
      { id: '4', name: 'Jazz Collective' },
      { id: '5', name: 'Folk Harmony' }
    ];
    setAvailableArtists(sampleArtists);
  }, []);

  const handleInputChange = (field: keyof ExtendedUserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArtistSelection = (artistId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      associated_artists: checked
        ? [...(prev.associated_artists || []), artistId]
        : (prev.associated_artists || []).filter(id => id !== artistId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (profile?.id) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            ...formData,
            associated_artists: formData.associated_artists || []
          })
          .eq('id', profile.id);
        
        if (error) throw error;
        toast.success('Profil mis à jour avec succès');
      } else {
        // Create new profile (this would be handled during user registration)
        toast.success('Profil créé avec succès');
      }
      
      onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Erreur lors de la sauvegarde du profil');
    }
  };

  const shouldShowExtendedFields = formData.role !== 'utilisateur';
  const shouldShowArtistSelection = formData.role === 'artiste';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="role">Catégorie *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: UserRole) => handleInputChange('role', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {shouldShowExtendedFields && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required={shouldShowExtendedFields}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required={shouldShowExtendedFields}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postal_code">Code Postal</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">N° de téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birth_date">Date de naissance</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="birth_place">Lieu de naissance</Label>
                  <Input
                    id="birth_place"
                    value={formData.birth_place || ''}
                    onChange={(e) => handleInputChange('birth_place', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={formData.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations administratives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="social_security_number">N° de sécurité sociale</Label>
                <Input
                  id="social_security_number"
                  value={formData.social_security_number || ''}
                  onChange={(e) => handleInputChange('social_security_number', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="guso_id">N° identifiant GUSO</Label>
                <Input
                  id="guso_id"
                  value={formData.guso_id || ''}
                  onChange={(e) => handleInputChange('guso_id', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="function_title">Fonction</Label>
                <Input
                  id="function_title"
                  value={formData.function_title || ''}
                  onChange={(e) => handleInputChange('function_title', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="show_name">Spectacle</Label>
                <Input
                  id="show_name"
                  value={formData.show_name || ''}
                  onChange={(e) => handleInputChange('show_name', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {shouldShowArtistSelection && (
            <Card>
              <CardHeader>
                <CardTitle>Spectacles associés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label>Sélectionnez les spectacles/groupes auxquels cet artiste participe :</Label>
                  <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                    {availableArtists.map((artist) => (
                      <div key={artist.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`artist-${artist.id}`}
                          checked={formData.associated_artists?.includes(artist.id) || false}
                          onCheckedChange={(checked) => 
                            handleArtistSelection(artist.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`artist-${artist.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {artist.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.associated_artists && formData.associated_artists.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <Label className="text-sm font-medium">Spectacles sélectionnés :</Label>
                      <div className="mt-1 text-sm text-gray-600">
                        {formData.associated_artists
                          .map(id => availableArtists.find(a => a.id === id)?.name)
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {profile ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};
