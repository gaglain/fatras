import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Edit, Eye, ArrowRight, DollarSign, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
}

interface Opportunity {
  id: string;
  title: string;
  artist: string;
  venue: string;
  eventDate: string;
  estimatedAmount: string;
  stage: 'interested' | 'quotation-sent' | 'negotiation' | 'validated' | 'rejected' | 'contract-created';
  createdDate: string;
  lastUpdated: string;
  priority: 'low' | 'medium' | 'high';
  probability: number;
  ownerId: string;
  ownerName: string;
  contactId?: string;
  eventId?: string;
  quotationData?: {
    showName: string;
    price: number;
    castingArtists: number;
    rentalCosts: number;
    roadCosts: number;
    tollCosts: number;
    parkingCosts: number;
    trainCosts: number;
    soundRentalCosts: number;
    playingConditions: string;
    approximateShowTime: string;
    totalHT?: number;
    totalTTC?: number;
  };
}

const sampleContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '0612345678'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '0687654321'
  }
];

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Festival d\'Été 2024',
    date: '2024-07-15',
    venue: 'Central Park'
  },
  {
    id: '2',
    title: 'Soirée Acoustique',
    date: '2024-06-20',
    venue: 'Blue Note Jazz Club'
  }
];

const sampleOpportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Festival d\'Été 2024 - The Midnight Express',
    artist: 'The Midnight Express',
    venue: 'Central Park',
    eventDate: '2024-07-15',
    estimatedAmount: '50000€',
    stage: 'validated',
    createdDate: '2024-05-20',
    lastUpdated: '2024-05-25',
    priority: 'high',
    probability: 90,
    ownerId: '1',
    ownerName: 'John Doe',
    contactId: '1',
    eventId: '1',
    quotationData: {
      showName: 'Festival d\'Été 2024',
      price: 50000,
      castingArtists: 4,
      rentalCosts: 5000,
      roadCosts: 800,
      tollCosts: 150,
      parkingCosts: 100,
      trainCosts: 0,
      soundRentalCosts: 8000,
      playingConditions: 'Scène couverte, éclairage professionnel',
      approximateShowTime: '21h00',
      totalHT: 64050,
      totalTTC: 76860
    }
  },
  {
    id: '2',
    title: 'Soirée Acoustique - Sarah Mitchell',
    artist: 'Sarah Mitchell',
    venue: 'Blue Note Jazz Club',
    eventDate: '2024-06-20',
    estimatedAmount: '8500€',
    stage: 'quotation-sent',
    createdDate: '2024-06-01',
    lastUpdated: '2024-06-05',
    priority: 'medium',
    probability: 65,
    ownerId: '2',
    ownerName: 'Jane Smith',
    contactId: '2',
    eventId: '2',
    quotationData: {
      showName: 'Soirée Acoustique',
      price: 8500,
      castingArtists: 2,
      rentalCosts: 1000,
      roadCosts: 200,
      tollCosts: 50,
      parkingCosts: 20,
      trainCosts: 0,
      soundRentalCosts: 1500,
      playingConditions: 'Petite scène intérieure',
      approximateShowTime: '20h30',
      totalHT: 11270,
      totalTTC: 13524
    }
  },
  {
    id: '3',
    title: 'Rock Legends Tour - Thunder Road',
    artist: 'Thunder Road',
    venue: 'Madison Square Garden',
    eventDate: '2024-08-10',
    estimatedAmount: '75000€',
    stage: 'interested',
    createdDate: '2024-06-10',
    lastUpdated: '2024-06-10',
    priority: 'high',
    probability: 40,
    ownerId: '1',
    ownerName: 'John Doe'
  }
];

const stageLabels = {
  'interested': 'Intéressé',
  'quotation-sent': 'Devis envoyé',
  'negotiation': 'Négociation',
  'validated': 'Validé',
  'rejected': 'Rejeté',
  'contract-created': 'Contrat créé'
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'interested':
      return 'bg-blue-100 text-blue-800';
    case 'quotation-sent':
      return 'bg-yellow-100 text-yellow-800';
    case 'negotiation':
      return 'bg-orange-100 text-orange-800';
    case 'validated':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'contract-created':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const Opportunities: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(sampleOpportunities);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [quotationForm, setQuotationForm] = useState({
    showName: '',
    price: 0,
    castingArtists: 0,
    rentalCosts: 0,
    roadCosts: 0,
    tollCosts: 0,
    parkingCosts: 0,
    trainCosts: 0,
    soundRentalCosts: 0,
    playingConditions: '',
    approximateShowTime: ''
  });

  const calculateTotals = () => {
    const totalHT = quotationForm.price + quotationForm.rentalCosts + quotationForm.roadCosts + 
                   quotationForm.tollCosts + quotationForm.parkingCosts + quotationForm.trainCosts + 
                   quotationForm.soundRentalCosts;
    const totalTTC = totalHT * 1.20; // 20% TVA
    return { totalHT, totalTTC };
  };

  const { totalHT, totalTTC } = calculateTotals();

  const filteredOpportunities = filterStage === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.stage === filterStage);

  const moveToNextStage = (opportunityId: string) => {
    setOpportunities(prev => prev.map(opp => {
      if (opp.id === opportunityId) {
        let nextStage = opp.stage;
        switch (opp.stage) {
          case 'interested':
            nextStage = 'quotation-sent';
            break;
          case 'quotation-sent':
            nextStage = 'negotiation';
            break;
          case 'negotiation':
            nextStage = 'validated';
            break;
          case 'validated':
            nextStage = 'contract-created';
            break;
        }
        return { ...opp, stage: nextStage as any, lastUpdated: new Date().toISOString() };
      }
      return opp;
    }));
  };

  const createQuotation = () => {
    const { totalHT, totalTTC } = calculateTotals();
    const quotationData = {
      ...quotationForm,
      totalHT,
      totalTTC
    };
    console.log('Création du devis:', quotationData);
    setShowQuotationForm(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opportunités Commerciales</h1>
          <p className="text-gray-600 mt-2">Gérer votre pipeline commercial et créer des contrats</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Opportunité
        </Button>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {Object.entries(stageLabels).map(([stage, label]) => {
          const count = opportunities.filter(o => o.stage === stage).length;
          const value = opportunities
            .filter(o => o.stage === stage)
            .reduce((sum, o) => sum + parseInt(o.estimatedAmount.replace(/[€,]/g, '')), 0);
          
          return (
            <Card key={stage} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterStage(stage)}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{label}</div>
                <div className="text-xs text-green-600 font-medium mt-1">
                  {value.toLocaleString()}€
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      
      <div className="flex items-center space-x-4">
        <Button 
          variant={filterStage === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setFilterStage('all')}
        >
          Toutes
        </Button>
        {Object.entries(stageLabels).map(([stage, label]) => (
          <Button 
            key={stage}
            variant={filterStage === stage ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterStage(stage)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                    <Badge className={getStageColor(opportunity.stage)}>
                      {stageLabels[opportunity.stage]}
                    </Badge>
                    <Badge className={getPriorityColor(opportunity.priority)}>
                      {opportunity.priority}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {opportunity.probability}% de chance
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Artiste</p>
                      <p className="font-medium">{opportunity.artist}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lieu</p>
                      <p className="font-medium">{opportunity.venue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date événement</p>
                      <p className="font-medium">{new Date(opportunity.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Montant estimé</p>
                      <p className="font-medium text-green-600">{opportunity.estimatedAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Propriétaire</p>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{opportunity.ownerName}</p>
                      </div>
                    </div>
                  </div>
                  
                  {opportunity.contactId && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Contact: <span className="font-medium">{sampleContacts.find(c => c.id === opportunity.contactId)?.name}</span></p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                    <span>Créé: {new Date(opportunity.createdDate).toLocaleDateString()}</span>
                    <span>Mis à jour: {new Date(opportunity.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                  </div>
                  
                  {opportunity.stage === 'interested' && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedOpportunity(opportunity);
                        setShowQuotationForm(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Créer Devis
                    </Button>
                  )}
                  
                  {opportunity.stage !== 'contract-created' && opportunity.stage !== 'rejected' && (
                    <Button 
                      size="sm" 
                      onClick={() => moveToNextStage(opportunity.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Étape suivante
                    </Button>
                  )}
                  
                  {opportunity.stage === 'validated' && (
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Créer Contrat
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quotation Form Modal */}
      {showQuotationForm && selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Créer un Devis - {selectedOpportunity.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Nom du spectacle" 
                  value={quotationForm.showName}
                  onChange={(e) => setQuotationForm(prev => ({...prev, showName: e.target.value}))}
                />
                <Input 
                  placeholder="Prix du spectacle (€)" 
                  type="number"
                  value={quotationForm.price}
                  onChange={(e) => setQuotationForm(prev => ({...prev, price: Number(e.target.value)}))}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  placeholder="Nombre d'artistes casting" 
                  type="number"
                  value={quotationForm.castingArtists}
                  onChange={(e) => setQuotationForm(prev => ({...prev, castingArtists: Number(e.target.value)}))}
                />
                <Input 
                  placeholder="Coût location matériel (€)" 
                  type="number"
                  value={quotationForm.rentalCosts}
                  onChange={(e) => setQuotationForm(prev => ({...prev, rentalCosts: Number(e.target.value)}))}
                />
                <Input 
                  placeholder="Coût route (€)" 
                  type="number"
                  value={quotationForm.roadCosts}
                  onChange={(e) => setQuotationForm(prev => ({...prev, roadCosts: Number(e.target.value)}))}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  placeholder="Coût péage (€)" 
                  type="number"
                  value={quotationForm.tollCosts}
                  onChange={(e) => setQuotationForm(prev => ({...prev, tollCosts: Number(e.target.value)}))}
                />
                <Input 
                  placeholder="Coût parking (€)" 
                  type="number"
                  value={quotationForm.parkingCosts}
                  onChange={(e) => setQuotationForm(prev => ({...prev, parkingCosts: Number(e.target.value)}))}
                />
                <Input 
                  placeholder="Coût train (€)" 
                  type="number"
                  value={quotationForm.trainCosts}
                  onChange={(e) => setQuotationForm(prev => ({...prev, trainCosts: Number(e.target.value)}))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Coût location son (€)" 
                  type="number"
                  value={quotationForm.soundRentalCosts}
                  onChange={(e) => setQuotationForm(prev => ({...prev, soundRentalCosts: Number(e.target.value)}))}
                />
                <Input 
                  placeholder="Heure approximative du spectacle"
                  value={quotationForm.approximateShowTime}
                  onChange={(e) => setQuotationForm(prev => ({...prev, approximateShowTime: e.target.value}))}
                />
              </div>
              
              <textarea 
                placeholder="Conditions pour jouer"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
                value={quotationForm.playingConditions}
                onChange={(e) => setQuotationForm(prev => ({...prev, playingConditions: e.target.value}))}
              />

              {/* Totals Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Récapitulatif des coûts</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total HT</p>
                    <p className="text-xl font-bold text-gray-900">{totalHT.toLocaleString()} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total TTC (TVA 20%)</p>
                    <p className="text-xl font-bold text-green-600">{totalTTC.toLocaleString()} €</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowQuotationForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button variant="outline" className="flex-1">
                  Sauvegarder Brouillon
                </Button>
                <Button onClick={createQuotation} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Créer et Envoyer Devis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Opportunity Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nouvelle Opportunité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre de l'opportunité" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Artiste" />
                <Input placeholder="Lieu/Salle" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Date de l'événement" />
                <Input placeholder="Montant estimé (€)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="p-2 border border-gray-300 rounded-md">
                  <option value="">Priorité</option>
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Élevée</option>
                </select>
                <Input placeholder="Probabilité (%)" type="number" min="0" max="100" />
              </div>
              <Input placeholder="Personne de contact" />
              <textarea 
                placeholder="Notes"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => setShowCreateForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Créer Opportunité
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
