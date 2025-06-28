
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaUpload } from '@/components/MediaUpload';
import { toast } from 'sonner';

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
    title: '',
    content: '',
    scheduled_date: '',
    platform: '',
    assigned_to: '',
    media_url: '',
    media_type: 'image',
    external_link: ''
  });

  const [errors, setErrors] = useState<Partial<PublicationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('📝 Form opened with initial data:', initialData);
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        scheduled_date: initialData.scheduled_date || '',
        platform: initialData.platform || '',
        assigned_to: initialData.assigned_to || '',
        media_url: initialData.media_url || '',
        media_type: initialData.media_type || 'image',
        external_link: initialData.external_link || ''
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PublicationFormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire';
    }
    
    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'La date est obligatoire';
    }
    
    if (!formData.platform) {
      newErrors.platform = 'La plateforme est obligatoire';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form submit triggered with data:', formData);
    
    if (isSubmitting) {
      console.log('⏸️ Already submitting, ignoring');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors);
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('✅ Calling onSubmit with validated data:', formData);
      await onSubmit(formData);
      
      // Reset form après succès
      setFormData({
        title: '',
        content: '',
        scheduled_date: '',
        platform: '',
        assigned_to: '',
        media_url: '',
        media_type: 'image',
        external_link: ''
      });
      
      toast.success(isEditing ? 'Publication modifiée avec succès' : 'Publication créée avec succès');
      console.log('✅ Form submitted successfully');
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      toast.error('Erreur lors de la sauvegarde de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUploaded = (url: string, type: 'image' | 'video') => {
    setFormData(prev => ({ ...prev, media_url: url, media_type: type }));
  };

  const handleMediaRemoved = () => {
    setFormData(prev => ({ ...prev, media_url: '', media_type: 'image' }));
  };

  const handleInputChange = (field: keyof PublicationFormData, value: string) => {
    console.log(`🔧 Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

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
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Titre de la publication"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
              placeholder="Contenu de la publication"
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_date">Date et heure *</Label>
              <Input
                id="scheduled_date"
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                className={errors.scheduled_date ? 'border-red-500' : ''}
              />
              {errors.scheduled_date && <p className="text-red-500 text-sm mt-1">{errors.scheduled_date}</p>}
            </div>

            <div>
              <Label htmlFor="platform">Plateforme *</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => handleInputChange('platform', value)}
              >
                <SelectTrigger className={errors.platform ? 'border-red-500' : ''}>
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
              {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="assigned_to">Assigner à</Label>
            <Select 
              value={formData.assigned_to} 
              onValueChange={(value) => handleInputChange('assigned_to', value)}
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
              onChange={(e) => handleInputChange('external_link', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Traitement...' : (isEditing ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
