import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, User, AlertTriangle } from 'lucide-react';
import { Contact } from '@/types/contact.types';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';

interface ContactDialogFormProps {
  formData: Contact;
  setFormData: React.Dispatch<React.SetStateAction<Contact>>;
  selectedArtistId: string;
  setSelectedArtistId: (id: string) => void;
  selectedOwnerId: string;
  setSelectedOwnerId: (id: string) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  contactTypes: Array<{ id: string; name: string; color: string }>;
  activeUsers: Array<{ user_id: string; first_name?: string; last_name?: string; username?: string; email?: string }>;
  duplicateWarning: { id: string; name: string } | null;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ContactDialogForm: React.FC<ContactDialogFormProps> = ({
  formData,
  setFormData,
  selectedArtistId,
  setSelectedArtistId,
  selectedOwnerId,
  setSelectedOwnerId,
  newTag,
  setNewTag,
  contactTypes,
  activeUsers,
  duplicateWarning,
  onEmailChange,
  loading,
  isEditing,
  onSubmit,
  onCancel,
}) => {
  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Prénom *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="last_name">Nom *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={onEmailChange}
          />
          {duplicateWarning && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Doublon : <strong>{duplicateWarning.name}</strong> a déjà cet email</span>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">Poste/Fonction</Label>
          <Input
            id="position"
            value={formData.position || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="company">Entreprise</Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Nom de l'entreprise"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Statut</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="partenaire">Partenaire</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="contact_type">Type de contact</Label>
          <Select 
            value={formData.contact_type_id ?? 'none'} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, contact_type_id: value === 'none' ? null : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun type</SelectItem>
              {contactTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    {type.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="artist_id">Spectacle associé</Label>
          <UniversalSearch
            filterTypes={['artist']}
            selectedId={selectedArtistId}
            onSelect={(item: SearchItem) => setSelectedArtistId(item.id)}
            triggerText="Rechercher un spectacle"
            placeholder="Rechercher spectacle par nom, genre..."
          />
        </div>
        <div>
          <Label htmlFor="source">Source</Label>
          <Input
            id="source"
            value={formData.source || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
            placeholder="Référence, réseau social..."
          />
        </div>
      </div>

      <div>
        <Label htmlFor="owner_id">Propriétaire</Label>
        <Select 
          value={selectedOwnerId || 'none'} 
          onValueChange={(value) => setSelectedOwnerId(value === 'none' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un propriétaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Aucun propriétaire
              </div>
            </SelectItem>
            {activeUsers.map(u => (
              <SelectItem key={u.user_id} value={u.user_id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {u.first_name || u.last_name 
                    ? `${u.first_name || ''} ${u.last_name || ''}`.trim() 
                    : u.username || u.email}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={formData.address || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            value={formData.city || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="postal_code">Code postal</Label>
          <Input
            id="postal_code"
            value={formData.postal_code || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            value={formData.country || 'France'}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Ajouter un tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <MentionableTextarea
          value={formData.notes || ''}
          onChange={(val) => setFormData(prev => ({ ...prev, notes: val }))}
          rows={3}
          placeholder="Ajoutez des notes... Tapez @ pour mentionner"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  );
};
