import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Calendar, MapPin, DollarSign, Edit, Trash2, User, CalendarDays, CheckSquare, Grid, List } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { useCentralizedData } from '@/hooks/useCentralizedData';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  venue: string;
  location: string;
  date: string;
  budget: number;
  status: 'open' | 'applied' | 'won' | 'lost';
  deadline: string;
  requirements: string;
  contact: string;
  artist_id?: string;
  contact_id?: string;
  event_id?: string;
  task_id?: string;
  createdAt: string;
}

export const Opportunities: React.FC = () => {
  const { user } = useAuth();
  const { contacts } = useContacts();
  const { events } = useEvents();
  const { tasks } = useTasks();
  const { artists } = useCentralizedData();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    date: '',
    budget: 0,
    status: 'open' as 'open' | 'applied' | 'won' | 'lost',
    deadline: '',
    requirements: '',
    contact: '',
    artist_id: '',
    contact_id: '',
    event_id: '',
    task_id: ''
  });

  // Charger les opportunités depuis Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchOpportunities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des opportunités:', error);
        toast.error('Erreur lors du chargement des opportunités');
      } else {
        const formattedOpportunities = data.map(opp => ({
          id: opp.id,
          title: opp.title,
          description: opp.description || '',
          venue: opp.venue || '',
          location: opp.location || '',
          date: opp.date || '',
          budget: opp.budget || 0,
          status: opp.status as 'open' | 'applied' | 'won' | 'lost',
          deadline: opp.deadline || '',
          requirements: opp.requirements || '',
          contact: opp.contact || '',
          artist_id: opp.artist_id || '',
          contact_id: opp.contact_id || '',
          event_id: opp.event_id || '',
          task_id: opp.task_id || '',
          createdAt: opp.created_at
        }));
        setOpportunities(formattedOpportunities);
      }
      setLoading(false);
    };

    fetchOpportunities();
  }, [user]);

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOpportunity = async () => {
    if (!newOpportunity.title || !newOpportunity.venue || !user) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          user_id: user.id,
          title: newOpportunity.title,
          description: newOpportunity.description,
          venue: newOpportunity.venue,
          location: newOpportunity.location,
          date: newOpportunity.date || null,
          budget: newOpportunity.budget,
          status: newOpportunity.status,
          deadline: newOpportunity.deadline || null,
          requirements: newOpportunity.requirements,
          contact: newOpportunity.contact,
          artist_id: newOpportunity.artist_id || null,
          contact_id: newOpportunity.contact_id || null,
          event_id: newOpportunity.event_id || null,
          task_id: newOpportunity.task_id || null
        })
        .select()
        .single();

      if (error) throw error;

      const opportunity: Opportunity = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        venue: data.venue || '',
        location: data.location || '',
        date: data.date || '',
        budget: data.budget || 0,
        status: data.status as 'open' | 'applied' | 'won' | 'lost',
        deadline: data.deadline || '',
        requirements: data.requirements || '',
        contact: data.contact || '',
        artist_id: data.artist_id || '',
        contact_id: data.contact_id || '',
        event_id: data.event_id || '',
        task_id: data.task_id || '',
        createdAt: data.created_at
      };

      setOpportunities(prev => [opportunity, ...prev]);
      setNewOpportunity({
        title: '',
        description: '',
        venue: '',
        location: '',
        date: '',
        budget: 0,
        status: 'open' as 'open' | 'applied' | 'won' | 'lost',
        deadline: '',
        requirements: '',
        contact: '',
        artist_id: '',
        contact_id: '',
        event_id: '',
        task_id: ''
      });
      setShowAddForm(false);
      toast.success('Opportunité créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'opportunité');
    }
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setNewOpportunity({
      title: opportunity.title,
      description: opportunity.description,
      venue: opportunity.venue,
      location: opportunity.location,
      date: opportunity.date,
      budget: opportunity.budget,
      status: opportunity.status,
      deadline: opportunity.deadline,
      requirements: opportunity.requirements,
      contact: opportunity.contact,
      artist_id: opportunity.artist_id || '',
      contact_id: opportunity.contact_id || '',
      event_id: opportunity.event_id || '',
      task_id: opportunity.task_id || ''
    });
  };

  const handleUpdateOpportunity = async () => {
    if (!editingOpportunity || !user) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .update({
          title: newOpportunity.title,
          description: newOpportunity.description,
          venue: newOpportunity.venue,
          location: newOpportunity.location,
          date: newOpportunity.date || null,
          budget: newOpportunity.budget,
          status: newOpportunity.status,
          deadline: newOpportunity.deadline || null,
          requirements: newOpportunity.requirements,
          contact: newOpportunity.contact,
          artist_id: newOpportunity.artist_id || null,
          contact_id: newOpportunity.contact_id || null,
          event_id: newOpportunity.event_id || null,
          task_id: newOpportunity.task_id || null
        })
        .eq('id', editingOpportunity.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setOpportunities(prev => prev.map(opp => 
        opp.id === editingOpportunity.id 
          ? { ...opp, ...newOpportunity }
          : opp
      ));
      
      setEditingOpportunity(null);
      setNewOpportunity({
        title: '',
        description: '',
        venue: '',
        location: '',
        date: '',
        budget: 0,
        status: 'open' as 'open' | 'applied' | 'won' | 'lost',
        deadline: '',
        requirements: '',
        contact: '',
        artist_id: '',
        contact_id: '',
        event_id: '',
        task_id: ''
      });
      toast.success('Opportunité mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'opportunité');
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setOpportunities(prev => prev.filter(opp => opp.id !== id));
      toast.success('Opportunité supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'opportunité');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-gray-100 text-gray-800';
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

  const [viewMode, setViewMode] = useState<'compact' | 'list'>('compact');

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Opportunités</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos opportunités de concerts et événements
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="w-full lg:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouvelle Opportunité</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des opportunités..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-1 border border-border rounded-md p-1">
          <Button
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="h-8 px-3"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={viewMode === 'compact' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredOpportunities.map((opportunity) => (
          viewMode === 'compact' ? (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{opportunity.title}</CardTitle>
                    <Badge className={getStatusColor(opportunity.status)}>
                      {getStatusLabel(opportunity.status)}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditOpportunity(opportunity)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto">
                          <Trash2 className="h-4 w-4 text-red-500 sm:mr-1" />
                          <span className="hidden sm:inline text-red-500">Supprimer</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'opportunité</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action ne peut pas être annulée.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteOpportunity(opportunity.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{opportunity.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {opportunity.venue} - {opportunity.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(opportunity.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {opportunity.budget}€
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={opportunity.id} className="hover:shadow-md transition-shadow p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                    <Badge className={getStatusColor(opportunity.status)}>
                      {getStatusLabel(opportunity.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {opportunity.venue} - {opportunity.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(opportunity.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {opportunity.budget}€
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditOpportunity(opportunity)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-red-500">Supprimer</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'opportunité</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer cette opportunité ? Cette action ne peut pas être annulée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteOpportunity(opportunity.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          )
        ))}
      </div>

      {(showAddForm || editingOpportunity) && (
        <Dialog open={showAddForm || !!editingOpportunity} onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingOpportunity(null);
                  setNewOpportunity({
                    title: '',
                    description: '',
                    venue: '',
                    location: '',
                    date: '',
                    budget: 0,
                    status: 'open' as 'open' | 'applied' | 'won' | 'lost',
                    deadline: '',
                    requirements: '',
                    contact: '',
                    artist_id: '',
                    contact_id: '',
                    event_id: '',
                    task_id: ''
                  });
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOpportunity ? 'Modifier l\'opportunité' : 'Créer une nouvelle opportunité'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <Input
                  value={newOpportunity.title}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                  placeholder="Titre de l'opportunité"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Venue *</label>
                <Input
                  value={newOpportunity.venue}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, venue: e.target.value })}
                  placeholder="Nom du lieu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Localisation</label>
                <Input
                  value={newOpportunity.location}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, location: e.target.value })}
                  placeholder="Ville, pays"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  value={newOpportunity.date}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Budget (€)</label>
                <Input
                  type="number"
                  value={newOpportunity.budget}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, budget: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Statut</label>
                <Select
                  value={newOpportunity.status}
                  onValueChange={(value: 'open' | 'applied' | 'won' | 'lost') => setNewOpportunity({ ...newOpportunity, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Ouverte</SelectItem>
                    <SelectItem value="applied">Candidaturé</SelectItem>
                    <SelectItem value="won">Remportée</SelectItem>
                    <SelectItem value="lost">Perdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
                  placeholder="Description de l'opportunité"
                  rows={3}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium mb-1">Exigences</label>
                <Textarea
                  value={newOpportunity.requirements}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, requirements: e.target.value })}
                  placeholder="Exigences techniques, artistiques..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date limite</label>
                <Input
                  type="date"
                  value={newOpportunity.deadline}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, deadline: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact</label>
                <Input
                  value={newOpportunity.contact}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, contact: e.target.value })}
                  placeholder="Email ou téléphone"
                />
              </div>

              {/* Relations */}
              <div className="col-span-1 md:col-span-2 border-t pt-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Liens avec d'autres éléments
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact associé</label>
                    <Select
                      value={newOpportunity.contact_id}
                      onValueChange={(value) => setNewOpportunity({ ...newOpportunity, contact_id: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un contact" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun contact</SelectItem>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Événement associé</label>
                    <Select
                      value={newOpportunity.event_id}
                      onValueChange={(value) => setNewOpportunity({ ...newOpportunity, event_id: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un événement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun événement</SelectItem>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                   <div>
                     <label className="block text-sm font-medium mb-1">Spectacle associé</label>
                     <Select
                       value={newOpportunity.artist_id || "none"}
                       onValueChange={(value) => {
                         setNewOpportunity(prev => ({ 
                           ...prev, 
                           artist_id: value === "none" ? "" : value 
                         }));
                         
                         // Auto-fill email if spectacle has contact email
                         if (value !== "none") {
                           const selectedSpectacle = artists.find(a => a.id === value);
                           if (selectedSpectacle?.contact_email) {
                             setNewOpportunity(prev => ({ 
                               ...prev, 
                               contact: selectedSpectacle.contact_email 
                             }));
                           }
                         }
                       }}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Sélectionner un spectacle" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="none">Aucun spectacle</SelectItem>
                          {artists.map((artist) => (
                            <SelectItem key={artist.id} value={artist.id}>
                              {artist.name} ({artist.genre})
                            </SelectItem>
                          ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div>
                     <label className="block text-sm font-medium mb-1">Tâche associée</label>
                     <Select
                       value={newOpportunity.task_id}
                       onValueChange={(value) => setNewOpportunity({ ...newOpportunity, task_id: value === "none" ? "" : value })}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Sélectionner une tâche" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="none">Aucune tâche</SelectItem>
                         {tasks.map((task) => (
                           <SelectItem key={task.id} value={task.id}>
                             {task.title}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingOpportunity(null);
                }} 
                className="flex-1 w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button 
                onClick={editingOpportunity ? handleUpdateOpportunity : handleAddOpportunity} 
                className="flex-1 w-full sm:w-auto"
              >
                {editingOpportunity ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
