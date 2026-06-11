import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { toast } from 'sonner';
import { Contact } from '@/types/contact.types';
import { ContactRelatedEntities } from './ContactRelatedEntities';
import { ContactCreationSuite } from './ContactCreationSuite';
import { ContactDialogForm } from './ContactDialogForm';
import { notifyMentionsIfNeeded } from '@/utils/mentionNotifier';

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
  const [contactTypes, setContactTypes] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [formData, setFormData] = useState<Contact>({
    first_name: '', last_name: '', email: '', phone: '', position: '', company: '',
    address: '', city: '', postal_code: '', country: 'France', status: 'prospect',
    source: '', notes: '', tags: [], role: 'contact'
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ id: string; name: string } | null>(null);
  const emailCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showCreationSuite, setShowCreationSuite] = useState(false);
  const [createdContactId, setCreatedContactId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(true);

  const prevIsOpenRef = useRef(false);
  const draftKey = contact?.id ? `contact-dialog-edit-${contact.id}` : 'contact-dialog-create-draft';

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
    } catch { /* silent */ }
  };

  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (!justOpened) return;

    let restored = false;
    if (!contact) {
      try {
        const rawDraft = sessionStorage.getItem(draftKey);
        if (rawDraft) {
          const draft = JSON.parse(rawDraft);
          setFormData(draft.formData);
          setSelectedArtistId(draft.selectedArtistId || '');
          setSelectedOwnerId(draft.selectedOwnerId || '');
          setNewTag(draft.newTag || '');
          setShowCreationSuite(Boolean(draft.showCreationSuite));
          setCreatedContactId(draft.createdContactId || null);
          restored = true;
        }
      } catch { sessionStorage.removeItem(draftKey); }
    }

    if (!restored) {
      setShowCreationSuite(false);
      setCreatedContactId(null);
      if (contact) {
        setFormData(contact);
        if (contact.id) loadContactArtist(contact.id);
        setSelectedOwnerId((contact as any).owner_id || '');
      } else {
        setFormData({
          first_name: '', last_name: '', email: '', phone: '', position: '', company: '',
          address: '', city: '', postal_code: '', country: 'France', status: 'prospect',
          source: '', notes: '', tags: [], role: 'contact'
        });
        setSelectedArtistId('');
        setSelectedOwnerId('');
        setNewTag('');
      }
    }

    fetchContactTypes();
  }, [isOpen, contact, draftKey]);

  const loadContactArtist = async (contactId: string) => {
    try {
      const { data } = await supabase
        .from('contact_artists').select('artist_id').eq('contact_id', contactId).single();
      if (data) setSelectedArtistId(data.artist_id);
    } catch { /* no artist linked */ }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData(prev => ({ ...prev, email: newEmail }));
    setDuplicateWarning(null);
    if (emailCheckTimerRef.current) clearTimeout(emailCheckTimerRef.current);
    if (newEmail.trim() && newEmail.includes('@')) {
      emailCheckTimerRef.current = setTimeout(async () => {
        try {
          let query = supabase.from('contacts').select('id, first_name, last_name').ilike('email', newEmail.trim());
          if (contact?.id) query = query.neq('id', contact.id);
          const { data } = await query.maybeSingle();
          if (data) setDuplicateWarning({ id: data.id, name: `${data.first_name} ${data.last_name}` });
        } catch { /* silent */ }
      }, 500);
    }
  };

  const updateContactArtistLink = async (contactId: string) => {
    try {
      await supabase.from('contact_artists').delete().eq('contact_id', contactId);
      if (selectedArtistId && selectedArtistId !== 'none') {
        await supabase.from('contact_artists').insert([{ contact_id: contactId, artist_id: selectedArtistId }]);
      }
    } catch { /* silent */ }
  };

  const clearDraft = () => { try { sessionStorage.removeItem(draftKey); } catch { /* ignore */ } };

  const handleCloseDialog = () => { clearDraft(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const contactData = {
        user_id: user.id, first_name: formData.first_name, last_name: formData.last_name,
        email: formData.email || '', phone: formData.phone || '', position: formData.position || '',
        company: formData.company || '', address: formData.address || '', city: formData.city || '',
        postal_code: formData.postal_code || '', country: formData.country || 'France',
        status: formData.status || 'prospect', source: formData.source || '', notes: formData.notes || '',
        tags: formData.tags || [], role: formData.role || 'contact',
        contact_type_id: formData.contact_type_id && formData.contact_type_id !== 'none' ? formData.contact_type_id : null,
        accepts_marketing_emails: true,
        owner_id: selectedOwnerId && selectedOwnerId !== 'none' ? selectedOwnerId : null
      };

      if (contact?.id) {
        const { error } = await supabase.from('contacts').update(contactData).eq('id', contact.id).select();
        if (error) throw error;
        toast.success('Contact mis à jour avec succès');
        if (formData.notes) {
          notifyMentionsIfNeeded({
            text: formData.notes, senderUserId: user.id,
            senderName: user.email || 'Utilisateur', contextType: 'contact',
            contextName: `${formData.first_name} ${formData.last_name}`, contextId: contact.id,
          });
        }
        if (contact.id) await updateContactArtistLink(contact.id);
      } else {
        const { data, error } = await supabase.from('contacts').insert([contactData]).select();
        if (error) throw error;
        toast.success('Contact créé avec succès');
        if (data && data[0] && selectedArtistId) await updateContactArtistLink(data[0].id);
        if (data && data[0]) {
          const newId = data[0].id;
          setCreatedContactId(newId);
          clearDraft();
          onSave();
          setLoading(false);
          // Close the form dialog first, then mount the creation suite after
          // Radix has finished its unmount/portal cleanup. Avoids React
          // `removeChild` crash from two overlapping portals.
          setFormDialogOpen(false);
          setTimeout(() => setShowCreationSuite(true), 300);
          return;
        }


      }
      if (!contact) clearDraft();
      onSave();
      handleCloseDialog();
    } catch {
      toast.error('Erreur lors de la sauvegarde du contact');
    } finally {
      setLoading(false);
    }
  };

  // Persist draft
  useEffect(() => {
    if (!isOpen || contact || showCreationSuite) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({
        formData, selectedArtistId, selectedOwnerId, newTag, showCreationSuite, createdContactId,
      }));
    } catch { /* ignore */ }
  }, [isOpen, contact, draftKey, formData, selectedArtistId, selectedOwnerId, newTag, showCreationSuite, createdContactId]);

  return (
    <>
      <Dialog
        open={isOpen && !showCreationSuite}
        onOpenChange={(open) => { if (!open && !showCreationSuite) handleCloseDialog(); }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{contact?.id ? 'Modifier le contact' : 'Nouveau contact'}</DialogTitle>
          </DialogHeader>

          <ContactDialogForm
            formData={formData}
            setFormData={setFormData}
            selectedArtistId={selectedArtistId}
            setSelectedArtistId={setSelectedArtistId}
            selectedOwnerId={selectedOwnerId}
            setSelectedOwnerId={setSelectedOwnerId}
            newTag={newTag}
            setNewTag={setNewTag}
            contactTypes={contactTypes}
            activeUsers={activeUsers}
            duplicateWarning={duplicateWarning}
            onEmailChange={handleEmailChange}
            loading={loading}
            isEditing={!!contact}
            onSubmit={handleSubmit}
            onCancel={handleCloseDialog}
          />

          {formData.id && (
            <div className="mt-6">
              <ContactRelatedEntities contact={formData as Contact} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showCreationSuite && createdContactId && (
        <ContactCreationSuite
          isOpen={true}
          onClose={() => {
            setShowCreationSuite(false);
            setCreatedContactId(null);
            handleCloseDialog();
          }}
          contactId={createdContactId}
          contactName={`${formData.first_name} ${formData.last_name}`}
        />
      )}
    </>
  );
};

