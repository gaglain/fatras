import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Grid, List } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { logger } from '@/lib/logger';
import { OpportunityFormDialog, defaultOpportunityForm, OpportunityFormData } from '@/pages/opportunities/OpportunityFormDialog';
import { OpportunityCard } from '@/pages/opportunities/OpportunityCard';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  venue: string;
  location: string;
  date: string;
  budget: number;
  probability_percentage?: number;
  status: 'open' | 'applied' | 'won' | 'lost';
  deadline: string;
  requirements: string;
  contact: string;
  artist_id?: string;
  contact_id?: string;
  event_id?: string;
  task_id?: string;
  owner_id?: string;
  createdAt: string;
}

export const Opportunities: React.FC = () => {
  const { user } = useAuthContext();
  const { contacts } = useContacts();
  const { events } = useEvents();
  const { tasks } = useTasks();
  const { artists } = useCentralizedData();
  const { users, getUserDisplayName } = useActiveUsers();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'compact' | 'list'>('compact');
  const [newOpportunity, setNewOpportunity] = useState<OpportunityFormData>({ ...defaultOpportunityForm });

  // Création de feuille de route + canal déléguée aux triggers DB (anti-doublon centralisé)

  useEffect(() => {
    if (!user) return;
    const fetchOpportunities = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
      if (error) { logger.error('Erreur chargement opportunités:', error); toast.error('Erreur lors du chargement'); }
      else {
        setOpportunities(data.map(opp => ({
          id: opp.id, title: opp.title, description: opp.description || '', venue: opp.venue || '',
          location: opp.location || '', date: opp.date || '', budget: opp.budget || 0,
          probability_percentage: opp.probability_percentage || 50, status: opp.status as any,
          deadline: opp.deadline || '', requirements: opp.requirements || '', contact: opp.contact || '',
          artist_id: opp.artist_id || '', contact_id: opp.contact_id || '', event_id: opp.event_id || '',
          task_id: opp.task_id || '', owner_id: opp.owner_id || '', createdAt: opp.created_at
        })));
      }
      setLoading(false);
    };
    fetchOpportunities();
  }, [user]);

  const resetForm = () => { setNewOpportunity({ ...defaultOpportunityForm }); setShowAddForm(false); setEditingOpportunity(null); };

  const handleAddOpportunity = async () => {
    if (!newOpportunity.title || !newOpportunity.venue || !user) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    try {
      const { data, error } = await supabase.from('opportunities').insert({
        user_id: user.id, title: newOpportunity.title, description: newOpportunity.description,
        venue: newOpportunity.venue, location: newOpportunity.location, date: newOpportunity.date || null,
        budget: newOpportunity.budget, probability_percentage: newOpportunity.probability_percentage,
        status: newOpportunity.status, deadline: newOpportunity.deadline || null, requirements: newOpportunity.requirements,
        contact: newOpportunity.contact, artist_id: newOpportunity.artist_id || null, contact_id: newOpportunity.contact_id || null,
        event_id: newOpportunity.event_id || null, task_id: newOpportunity.task_id || null, owner_id: newOpportunity.owner_id || null
      }).select().single();
      if (error) throw error;
      setOpportunities(prev => [{ id: data.id, title: data.title, description: data.description || '', venue: data.venue || '', location: data.location || '', date: data.date || '', budget: data.budget || 0, probability_percentage: data.probability_percentage || 50, status: data.status as any, deadline: data.deadline || '', requirements: data.requirements || '', contact: data.contact || '', artist_id: data.artist_id || '', contact_id: data.contact_id || '', event_id: data.event_id || '', task_id: data.task_id || '', owner_id: data.owner_id || '', createdAt: data.created_at }, ...prev]);
      resetForm(); toast.success('Opportunité créée avec succès');
    } catch (error: unknown) { logger.error('Erreur création:', error); toast.error("Erreur lors de la création de l'opportunité"); }
  };

  const handleEditOpportunity = (opp: Opportunity) => {
    setEditingOpportunity(opp);
    setNewOpportunity({ title: opp.title, description: opp.description, venue: opp.venue, location: opp.location, date: opp.date, budget: opp.budget, probability_percentage: opp.probability_percentage || 50, status: opp.status, deadline: opp.deadline, requirements: opp.requirements, contact: opp.contact, artist_id: opp.artist_id || '', contact_id: opp.contact_id || '', event_id: opp.event_id || '', task_id: opp.task_id || '', owner_id: opp.owner_id || '' });
  };

  const handleUpdateOpportunity = async () => {
    if (!editingOpportunity || !user) return;
    try {
      const previousStatus = editingOpportunity.status;
      const { error } = await supabase.from('opportunities').update({
        title: newOpportunity.title, description: newOpportunity.description, venue: newOpportunity.venue,
        location: newOpportunity.location, date: newOpportunity.date || null, budget: newOpportunity.budget,
        probability_percentage: newOpportunity.probability_percentage, status: newOpportunity.status,
        deadline: newOpportunity.deadline || null, requirements: newOpportunity.requirements, contact: newOpportunity.contact,
        artist_id: newOpportunity.artist_id || null, contact_id: newOpportunity.contact_id || null,
        event_id: newOpportunity.event_id || null, task_id: newOpportunity.task_id || null, owner_id: newOpportunity.owner_id || null
      }).eq('id', editingOpportunity.id).eq('user_id', user.id);
      if (error) throw error;
      // Feuille de route + canal créés automatiquement par trigger DB (anti-doublon centralisé)
      if (newOpportunity.status === 'won' && previousStatus !== 'won') toast.success('Feuille de route et canal générés automatiquement');
      setOpportunities(prev => prev.map(o => o.id === editingOpportunity.id ? { ...o, ...newOpportunity } : o));
      resetForm(); toast.success('Opportunité mise à jour');
    } catch (error: unknown) { logger.error('Erreur mise à jour:', error); toast.error("Erreur lors de la mise à jour"); }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('opportunities').delete().eq('id', id);
      if (error) throw error;
      setOpportunities(prev => prev.filter(o => o.id !== id));
      toast.success('Opportunité supprimée');
    } catch (error: unknown) { logger.error('Erreur suppression:', error); toast.error("Erreur lors de la suppression"); }
  };

  const getStatusColor = (status: string) => {
    switch (status) { case 'open': return 'bg-green-100 text-green-800'; case 'applied': return 'bg-blue-100 text-blue-800'; case 'won': return 'bg-purple-100 text-purple-800'; case 'lost': return 'bg-gray-100 text-gray-800'; default: return 'bg-gray-100 text-gray-800'; }
  };
  const getStatusLabel = (status: string) => {
    switch (status) { case 'open': return 'Ouverte'; case 'applied': return 'Candidaturé'; case 'won': return 'Remportée'; case 'lost': return 'Perdue'; default: return status; }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) || opp.venue.toLowerCase().includes(searchTerm.toLowerCase()) || opp.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === 'all' || opp.status === statusFilter);
  });

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Opportunités</h1>
          <p className="text-muted-foreground mt-2">Gérez vos opportunités de concerts et événements</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="w-full lg:w-auto"><Plus className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Nouvelle Opportunité</span><span className="sm:hidden">Nouvelle</span></Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Rechercher des opportunités..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="open">Ouvertes</SelectItem>
            <SelectItem value="applied">Candidature</SelectItem>
            <SelectItem value="won">Gagnées</SelectItem>
            <SelectItem value="lost">Perdues</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-1 border border-border rounded-md p-1">
          <Button variant={viewMode === 'compact' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('compact')} className="h-8 px-3"><Grid className="h-4 w-4" /></Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 px-3"><List className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className={viewMode === 'compact' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredOpportunities.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} viewMode={viewMode} onEdit={handleEditOpportunity}
            onDelete={handleDeleteOpportunity} getStatusColor={getStatusColor} getStatusLabel={getStatusLabel} getUserDisplayName={getUserDisplayName} />
        ))}
      </div>

      <OpportunityFormDialog open={showAddForm || !!editingOpportunity} onClose={resetForm}
        formData={newOpportunity} setFormData={setNewOpportunity} isEditing={!!editingOpportunity}
        onSave={editingOpportunity ? handleUpdateOpportunity : handleAddOpportunity}
        contacts={contacts} events={events} artists={artists} tasks={tasks} users={users} />
    </div>
  );
};
