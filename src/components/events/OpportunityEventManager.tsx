import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Target, Calendar, Euro } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Opportunity {
  id: string;
  title: string;
  status: string;
  venue?: string | null;
  date?: string | null;
  budget?: number | null;
}

interface OpportunityEventManagerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  eventTitle?: string;
  onUpdate?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-800';
    case 'applied': return 'bg-blue-100 text-blue-800';
    case 'won': return 'bg-emerald-100 text-emerald-800';
    case 'lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Ouverte';
    case 'applied': return 'Candidaturé';
    case 'won': return 'Remportée';
    case 'lost': return 'Perdue';
    default: return status;
  }
};

export const OpportunityEventManager: React.FC<OpportunityEventManagerProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onUpdate
}) => {
  const { user } = useAuth();
  const [availableOpportunities, setAvailableOpportunities] = useState<Opportunity[]>([]);
  const [linkedOpportunities, setLinkedOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchOpportunities();
      fetchLinkedOpportunities();
    }
  }, [isOpen, eventId]);

  const fetchOpportunities = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('id, title, status, venue, date, budget')
        .eq('user_id', user.id)
        .order('title');

      if (error) throw error;
      setAvailableOpportunities(data || []);
    } catch {
      toast.error('Erreur lors du chargement des opportunités');
    }
  };

  const fetchLinkedOpportunities = async () => {
    if (!eventId) return;
    
    try {
      // Get opportunities linked via opportunity_events
      const { data: links, error: linksError } = await supabase
        .from('opportunity_events')
        .select('opportunity_id')
        .eq('event_id', eventId);

      if (linksError) throw linksError;

      // Also get opportunities directly linked via event_id
      const { data: direct, error: directError } = await supabase
        .from('opportunities')
        .select('id, title, status, venue, date, budget')
        .eq('event_id', eventId);

      if (directError) throw directError;

      const linkedIds = links?.map(l => l.opportunity_id) || [];
      
      if (linkedIds.length > 0) {
        const { data: linked, error: linkedError } = await supabase
          .from('opportunities')
          .select('id, title, status, venue, date, budget')
          .in('id', linkedIds);

        if (linkedError) throw linkedError;

        // Merge and dedupe
        const allLinked = [...(direct || [])];
        const existingIds = new Set(allLinked.map(o => o.id));
        (linked || []).forEach(o => {
          if (!existingIds.has(o.id)) {
            allLinked.push(o);
          }
        });
        
        setLinkedOpportunities(allLinked);
      } else {
        setLinkedOpportunities(direct || []);
      }
    } catch {
      console.error('Error fetching linked opportunities');
    }
  };

  const linkOpportunity = async () => {
    if (!selectedOpportunity || !eventId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('opportunity_events')
        .insert([{
          opportunity_id: selectedOpportunity,
          event_id: eventId
        }]);

      if (error) throw error;
      
      toast.success('Opportunité liée à l\'événement avec succès');
      setSelectedOpportunity('');
      fetchLinkedOpportunities();
      onUpdate?.();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Cette opportunité est déjà liée à cet événement');
      } else {
        toast.error('Erreur lors de la liaison de l\'opportunité');
      }
    } finally {
      setLoading(false);
    }
  };

  const unlinkOpportunity = async (opportunityId: string) => {
    if (!eventId) return;
    
    try {
      // Remove from junction table
      const { error } = await supabase
        .from('opportunity_events')
        .delete()
        .eq('opportunity_id', opportunityId)
        .eq('event_id', eventId);

      if (error) throw error;
      
      toast.success('Opportunité déliée de l\'événement');
      fetchLinkedOpportunities();
      onUpdate?.();
    } catch {
      toast.error('Erreur lors de la suppression de la liaison');
    }
  };

  const unlinkedOpportunities = availableOpportunities.filter(
    opp => !linkedOpportunities.some(linked => linked.id === opp.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Gérer les opportunités - {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ajouter une opportunité */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Lier une opportunité à cet événement</h3>
              <div className="flex gap-2">
                <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Sélectionner une opportunité" />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedOpportunities.map((opp) => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.title} - {getStatusLabel(opp.status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={linkOpportunity} 
                  disabled={!selectedOpportunity || loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Lier
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Opportunités liées */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Opportunités liées à cet événement ({linkedOpportunities.length})
              </h3>
              
              {linkedOpportunities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune opportunité liée à cet événement
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedOpportunities.map((opp) => (
                    <Card key={opp.id} className="relative">
                      <CardContent className="pt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                          onClick={() => unlinkOpportunity(opp.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2 pr-8">
                            <h4 className="font-medium">{opp.title}</h4>
                            <Badge className={getStatusColor(opp.status)}>
                              {getStatusLabel(opp.status)}
                            </Badge>
                          </div>
                          
                          {opp.venue && (
                            <div className="text-sm text-muted-foreground">
                              📍 {opp.venue}
                            </div>
                          )}
                          
                          {opp.date && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(opp.date), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                          )}
                          
                          {opp.budget && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Euro className="h-3 w-3" />
                              {opp.budget.toLocaleString()}€
                            </div>
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
