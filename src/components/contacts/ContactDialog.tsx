import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { toast } from 'sonner';
import { Contact } from '@/types/contact.types';
import { ContactRelatedEntities } from './ContactRelatedEntities';
import { ContactCreationSuite } from './ContactCreationSuite';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';
import { notifyMentionsIfNeeded } from '@/utils/mentionNotifier';

interface Spectacle {
  id: string;
  name: string;
  genre: string;
}

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  onSave: () => void;
}

export const ContactDialog: React.FC<ContactDialogProps> = ({
  isOpen,
  onClose,
  contact,
  onSave
}) => {
  const { user } = useAuth();
  const { users: activeUsers } = useActiveUsers();
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [contactTypes, setContactTypes] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [formData, setFormData] = useState<Contact>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    company: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    status: 'prospect',
    source: '',
    notes: '',
    tags: [],
    role: 'contact'
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreationSuite, setShowCreationSuite] = useState(false);
  const [createdContactId, setCreatedContactId] = useState<string | null>(null);
  const prevIsOpenRef = useRef(false);
  const draftKey = contact?.id ? `contact-dialog-edit-${contact.id}` : 'contact-dialog-create-draft';

  const fetchSpectacles = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('id, name, genre')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setSpectacles(data || []);
    } catch {
      // Silent - spectacles loading failed
    }
  };

  const fetchContactTypes = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('contact_types')
        .select('id, name, color')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setContactTypes(data || []);
    } catch {
      // Silent - contact types loading failed
    }
  };

  // Only reset form when dialog transitions from closed to open
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!justOpened) return;

    // Reset creation suite state on every open
    setShowCreationSuite(false);
    setCreatedContactId(null);

    if (contact) {
      setFormData(contact);
      if (contact.id) {
        loadContactArtist(contact.id);
      }
      setSelectedOwnerId((contact as any).owner_id || '');
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        company: '',
        address: '',
        city: '',
        postal_code: '',
        country: 'France',
        status: 'prospect',
        source: '',
        notes: '',
        tags: [],
        role: 'contact'
      });
      setSelectedArtistId('');
      setSelectedOwnerId('');
    }
    fetchSpectacles();
    fetchContactTypes();
  }, [isOpen, contact]);

  const loadContactArtist = async (contactId: string) => {
    try {
      const { data } = await supabase
        .from('contact_artists')
        .select('artist_id')
        .eq('contact_id', contactId)
        .single();
      if (data) setSelectedArtistId(data.artist_id);
    } catch {
      // No artist linked to this contact - expected case
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const contactData = {
        user_id: user.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || '',
        phone: formData.phone || '',
        position: formData.position || '',
        company: formData.company || '',
        address: formData.address || '',
        city: formData.city || '',
        postal_code: formData.postal_code || '',
        country: formData.country || 'France',
        status: formData.status || 'prospect',
        source: formData.source || '',
        notes: formData.notes || '',
        tags: formData.tags || [],
        role: formData.role || 'contact',
        contact_type_id: formData.contact_type_id && formData.contact_type_id !== 'none' ? formData.contact_type_id : null,
        accepts_marketing_emails: true,
        owner_id: selectedOwnerId && selectedOwnerId !== 'none' ? selectedOwnerId : null
      };

      if (contact?.id) {
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id)
          .select();
        
        if (error) {
          throw error;
        }
        toast.success('Contact mis à jour avec succès');

        // Notify mentions in notes
        if (formData.notes) {
          notifyMentionsIfNeeded({
            text: formData.notes,
            senderUserId: user.id,
            senderName: user.email || 'Utilisateur',
            contextType: 'contact',
            contextName: `${formData.first_name} ${formData.last_name}`,
            contextId: contact.id,
          });
        }
        
        // Mettre à jour le lien avec l'artiste
        if (contact.id) {
          await updateContactArtistLink(contact.id);
        }
      } else {
        const { data, error } = await supabase
          .from('contacts')
          .insert([contactData])
          .select();
        
        if (error) {
          throw error;
        }
        toast.success('Contact créé avec succès');
        
        // Lier au spectacle si sélectionné
        if (data && data[0] && selectedArtistId) {
          await updateContactArtistLink(data[0].id);
        }
        
        // Proposer la suite de création - NE PAS fermer le dialog principal
        if (data && data[0]) {
          setCreatedContactId(data[0].id);
          onSave(); // Rafraîchir la liste
          setShowCreationSuite(true);
          setLoading(false);
          return; // Ne pas fermer, laisser ContactCreationSuite s'afficher
        }
      }

      onSave();
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde du contact');
    } finally {
      setLoading(false);
    }
  };

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

  const updateContactArtistLink = async (contactId: string) => {
    try {
      // Supprimer les liens existants
      await supabase
        .from('contact_artists')
        .delete()
        .eq('contact_id', contactId);

      // Ajouter le nouveau lien si un artiste est sélectionné
      if (selectedArtistId && selectedArtistId !== 'none') {
        await supabase
          .from('contact_artists')
          .insert([{ contact_id: contactId, artist_id: selectedArtistId }]);
      }
    } catch {
      // Silent - artist link update failed
    }
  };

  return (
    <>
    <Dialog open={isOpen && !showCreationSuite} onOpenChange={(open) => { if (!open && !showCreationSuite) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Modifier le contact' : 'Nouveau contact'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
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
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
        
        {formData.id && (
          <div className="mt-6">
            <ContactRelatedEntities contact={formData as Contact} />
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Suite de création */}
    {createdContactId && (
      <ContactCreationSuite
        isOpen={showCreationSuite}
        onClose={() => {
          setShowCreationSuite(false);
          setCreatedContactId(null);
          onClose();
        }}
        contactId={createdContactId}
        contactName={`${formData.first_name} ${formData.last_name}`}
      />
    )}
    </>
  );
};