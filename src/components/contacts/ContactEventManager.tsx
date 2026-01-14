import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Users, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UniversalEntitySearch, EntityType } from '@/components/shared/UniversalEntitySearch';

interface ContactEventManagerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  eventTitle?: string;
}

export const ContactEventManager: React.FC<ContactEventManagerProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle
}) => {
  const { user } = useAuth();
  const [linkedContacts, setLinkedContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchLinkedContacts();
    }
  }, [isOpen, eventId]);

  const fetchLinkedContacts = async () => {
    if (!eventId) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_event_contacts', { event_id_param: eventId });

      if (error) throw error;
      setLinkedContacts(data || []);
    } catch {
      // Silent - linked contacts loading failed
    }
  };

  const handleSelectContact = async (entity: { id: string; type: EntityType }) => {
    if (!eventId || entity.type !== 'contact') return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contact_events')
        .insert([{
          contact_id: entity.id,
          event_id: eventId
        }]);

      if (error) throw error;
      
      toast.success('Contact lié à l\'événement avec succès');
      fetchLinkedContacts();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Ce contact est déjà lié à cet événement');
      } else {
        toast.error('Erreur lors de la liaison du contact');
      }
    } finally {
      setLoading(false);
    }
  };

  const unlinkContact = async (contactId: string) => {
    if (!eventId) return;
    
    try {
      const { error } = await supabase
        .from('contact_events')
        .delete()
        .eq('contact_id', contactId)
        .eq('event_id', eventId);

      if (error) throw error;
      
      toast.success('Contact délié de l\'événement');
      fetchLinkedContacts();
    } catch {
      toast.error('Erreur lors de la suppression de la liaison');
    }
  };

  const excludeIds = linkedContacts.map(c => c.contact_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gérer les contacts - {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recherche universelle */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Lier un contact</h3>
              <UniversalEntitySearch
                entityTypes={['contact']}
                excludeIds={excludeIds}
                onSelect={handleSelectContact}
                placeholder="Rechercher un contact..."
              />
            </CardContent>
          </Card>

          {/* Contacts liés */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Contacts liés ({linkedContacts.length})
              </h3>
              
              {linkedContacts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun contact lié à cet événement
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedContacts.map((contact) => (
                    <Card key={contact.contact_id} className="relative">
                      <CardContent className="pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                          onClick={() => unlinkContact(contact.contact_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">
                            {contact.first_name} {contact.last_name}
                          </h4>
                          
                          {contact.company && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {contact.company}
                            </div>
                          )}
                          
                          {contact.email && (
                            <div className="text-sm text-muted-foreground">
                              📧 {contact.email}
                            </div>
                          )}
                          
                          {contact.phone && (
                            <div className="text-sm text-muted-foreground">
                              📞 {contact.phone}
                            </div>
                          )}
                          
                          {contact.role && (
                            <Badge variant="secondary" className="text-xs">
                              {contact.role}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
