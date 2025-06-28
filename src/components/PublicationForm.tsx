
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaUpload } from '@/components/MediaUpload';

interface PublicationFormData {
  title: string;
  content: string;
  scheduled_date: string;
  platform: string;
  assigned_to: string;
  media_url: string;
  media_type: 'image' | 'video';
  external_link: string;
}

interface PublicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PublicationFormData) => void;
  initialData?: Partial<PublicationFormData>;
  userProfiles: any[];
  isEditing?: boolean;
}

const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' }
];

export const PublicationForm: React.FC<PublicationFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  userProfiles,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<PublicationFormData>({
    title: initialData.title || '',
    content: initialData.content || '',
    scheduled_date: initialData.scheduled_date || '',
    platform: initialData.platform || '',
    assigned_to: initialData.assigned_to || '',
    media_url: initialData.media_url || '',
    media_type: initialData.media_type || 'image',
    external_link: initialData.external_link || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    // Validation simple
    if (!formData.title.trim() || !formData.content.trim() || !formData.scheduled_date || !formData.platform) {
      console.error('Champs obligatoires manquants');
      return;
    }
    
    onSubmit(formData);
  };

  const handleMediaUploaded = (url: string, type: 'image' | 'video') => {
    setFormData({ ...formData, media_url: url, media_type: type });
  };

  const handleMediaRemoved = () => {
    setFormData({ ...formData, media_url: '', media_type: 'image' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la publication' : 'Nouvelle publication'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Titre de la publication"
            />
          </div>

          <div>
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              required
              placeholder="Contenu de la publication"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_date">Date et heure *</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="platform">Plateforme *</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une plateforme" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_to">Assigner à</Label>
            <Select 
              value={formData.assigned_to} 
              onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {userProfiles.map((profile) => (
                  <SelectItem key={profile.user_id} value={profile.user_id}>
                    @{profile.username} ({profile.first_name} {profile.last_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <MediaUpload
            onMediaUploaded={handleMediaUploaded}
            currentMedia={formData.media_url}
            onMediaRemoved={handleMediaRemoved}
          />

          <div>
            <Label htmlFor="external_link">Lien externe</Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
