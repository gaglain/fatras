
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Calendar, MapPin, DollarSign, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
  createdAt: string;
}

export const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    venue: '',
    location: '',
    date: '',
    budget: 0,
    status: 'open' as const,
    deadline: '',
    requirements: '',
    contact: ''
  });

  const filteredOpportunities = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddOpportunity = () => {
    if (!newOpportunity.title || !newOpportunity.venue) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const opportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      ...newOpportunity,
      createdAt: new Date().toISOString()
    };

    setOpportunities(prev => [...prev, opportunity]);
    setNewOpportunity({
      title: '',
      description: '',
      venue: '',
      location: '',
      date: '',
      budget: 0,
      status: 'open',
      deadline: '',
      requirements: '',
      contact: ''
    });
    setShowAddForm(false);
    toast.success('Opportunité créée');
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
      contact: opportunity.contact
    });
  };

  const handleUpdateOpportunity = () => {
    if (!editingOpportunity) return;

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
      status: 'open',
      deadline: '',
      requirements: '',
      contact: ''
    });
    toast.success('Opportunité mise à jour');
  };

  const handleDeleteOpportunity = (id: string) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== id));
    toast.success('Opportunité supprimée');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Opportunités</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos opportunités de concerts et événements
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Opportunité
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des opportunités..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{opportunity.title}</CardTitle>
                  <Badge className={getStatusColor(opportunity.status)}>
                    {getStatusLabel(opportunity.status)}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditOpportunity(opportunity)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 text-red-500" />
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
              status: 'open',
              deadline: '',
              requirements: '',
              contact: ''
            });
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingOpportunity ? 'Modifier l\'opportunité' : 'Créer une nouvelle opportunité'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
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
                  onValueChange={(value: any) => setNewOpportunity({ ...newOpportunity, status: value })}
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

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newOpportunity.description}
                  onChange={(e) => setNewOpportunity({ ...newOpportunity, description: e.target.value })}
                  placeholder="Description de l'opportunité"
                  rows={3}
                />
              </div>

              <div className="col-span-2">
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
            </div>

            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingOpportunity(null);
                }} 
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={editingOpportunity ? handleUpdateOpportunity : handleAddOpportunity} 
                className="flex-1"
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
