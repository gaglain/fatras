import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MediaUpload } from '@/components/MediaUpload';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface PublicationFormData {
  title: string;
  content: string;
  scheduled_date: string;
  platforms: string[];
  assigned_to: string;
  media_url: string;
  media_type: 'image' | 'video';
  external_link: string;
}

interface PublicationFormMultiPlatformProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PublicationFormData) => void;
  initialData?: Partial<PublicationFormData>;
  userProfiles: any[];
  isEditing?: boolean;
}

const platforms = [
  { value: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
  { value: 'instagram', label: 'Instagram', color: 'bg-pink-600' },
  { value: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700' },
  { value: 'youtube', label: 'YouTube', color: 'bg-red-600' },
  { value: 'tiktok', label: 'TikTok', color: 'bg-black' }
];

export const PublicationFormMultiPlatform: React.FC<PublicationFormMultiPlatformProps> = ({
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
    platforms: [],
    assigned_to: '',
    media_url: '',
    media_type: 'image',
    external_link: ''
  });

  const [errors, setErrors] = useState<Partial<PublicationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        scheduled_date: initialData.scheduled_date || '',
        platforms: initialData.platforms || [],
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
    const newErrors: any = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Le contenu est obligatoire';
    }
    
    if (!formData.scheduled_date) {
      newErrors.scheduled_date = 'La date est obligatoire';
    }
    
    if (formData.platforms.length === 0) {
      newErrors.platforms = 'Sélectionnez au moins une plateforme';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      setFormData({
        title: '',
        content: '',
        scheduled_date: '',
        platforms: [],
        assigned_to: '',
        media_url: '',
        media_type: 'image',
        external_link: ''
      });
      
      toast.success(isEditing ? 'Publication modifiée avec succès' : 'Publication créée avec succès');
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      toast.error('Erreur lors de la sauvegarde de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlatformToggle = (platformValue: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformValue)
        ? prev.platforms.filter(p => p !== platformValue)
        : [...prev.platforms, platformValue]
    }));
    
    if (errors.platforms) {
      setErrors(prev => ({ ...prev, platforms: undefined }));
    }
  };

  const removePlatform = (platformValue: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.filter(p => p !== platformValue)
    }));
  };

  const handleMediaUploaded = (url: string, type: 'image' | 'video') => {
    setFormData(prev => ({ ...prev, media_url: url, media_type: type }));
  };

  const handleMediaRemoved = () => {
    setFormData(prev => ({ ...prev, media_url: '', media_type: 'image' }));
  };

  const handleInputChange = (field: keyof PublicationFormData, value: string) => {
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

          {/* Sélection multiple des plateformes */}
          <div className="space-y-3">
            <Label>Plateformes * {formData.platforms.length > 0 && `(${formData.platforms.length} sélectionnées)`}</Label>
            
            {/* Plateformes sélectionnées */}
            {formData.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                {formData.platforms.map(platformValue => {
                  const platform = platforms.find(p => p.value === platformValue);
                  return platform ? (
                    <Badge key={platformValue} variant="secondary" className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${platform.color}`}></div>
                      {platform.label}
                      <button
                        type="button"
                        onClick={() => removePlatform(platformValue)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Grille de sélection */}
            <div className={`grid grid-cols-2 gap-3 p-3 border rounded-lg ${errors.platforms ? 'border-red-500' : ''}`}>
              {platforms.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.value}
                    checked={formData.platforms.includes(platform.value)}
                    onCheckedChange={() => handlePlatformToggle(platform.value)}
                  />
                  <label 
                    htmlFor={platform.value} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                  >
                    <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                    {platform.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.platforms && <p className="text-red-500 text-sm mt-1">{errors.platforms}</p>}
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
                <SelectItem value="">Non assigné</SelectItem>
                {userProfiles.length === 0 ? (
                  <SelectItem value="no-users" disabled>
                    Aucun utilisateur disponible
                  </SelectItem>
                ) : (
                  userProfiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profile.username || `${profile.first_name} ${profile.last_name}`.trim()}
                    </SelectItem>
                  ))
                )}
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