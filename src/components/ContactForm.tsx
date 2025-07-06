
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  contact?: any;
  events: any[];
  eventTypes: any[];
}

export const ContactForm: React.FC<ContactFormProps> = ({
  isOpen,
  onClose,
  onSave,
  contact,
  events,
  eventTypes
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    event_id: '',
    event_type_id: '',
    accepts_marketing_emails: true,
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        role: contact.role || '',
        address: contact.address || '',
        city: contact.city || '',
        postal_code: contact.postal_code || '',
        country: contact.country || '',
        event_id: contact.event_id || '',
        event_type_id: contact.event_type_id || '',
        accepts_marketing_emails: contact.accepts_marketing_emails ?? true,
        notes: contact.notes || ''
      });
    } else {
      // Reset form for new contact
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        event_id: '',
        event_type_id: '',
        accepts_marketing_emails: true,
        notes: ''
      });
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name) {
      toast.error('Le prénom et le nom sont obligatoires');
      return;
    }

    setLoading(true);

    try {
      const contactData = {
        ...formData,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        event_id: formData.event_id || null,
        event_type_id: formData.event_type_id || null
      };

      if (contact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id);

        if (error) {
          console.error('Error updating contact:', error);
          toast.error('Erreur lors de la mise à jour du contact');
          return;
        }
        toast.success('Contact mis à jour avec succès');
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert(contactData);

        if (error) {
          console.error('Error creating contact:', error);
          toast.error('Erreur lors de la création du contact');
          return;
        }
        toast.success('Contact créé avec succès');
      }

      onSave();
    } catch (error) {
      console.error('Exception in handleSubmit:', error);
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Modifier le contact' : 'Nouveau contact'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <Label htmlFor="role">Rôle/Titre</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            />
          </div>

          {/* Adresse */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Événements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_id">Événement</Label>
              <Select value={formData.event_id} onValueChange={(value) => handleInputChange('event_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un événement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun événement</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event_type_id">Type d'événement</Label>
              <Select value={formData.event_type_id} onValueChange={(value) => handleInputChange('event_type_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun type</SelectItem>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Marketing */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accepts_marketing_emails"
              checked={formData.accepts_marketing_emails}
              onCheckedChange={(checked) => handleInputChange('accepts_marketing_emails', checked as boolean)}
            />
            <Label htmlFor="accepts_marketing_emails">
              Accepte les emails marketing
            </Label>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Enregistrement...' : (contact ? 'Mettre à jour' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
