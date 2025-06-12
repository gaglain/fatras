import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Contract {
  id: string;
  title: string;
  artist: string;
  venue: string;
  eventDate: string;
  showFee: number;
  transport: number;
  tolls: number;
  soundRental: number;
  totalHT: number;
  totalTTC: number;
  expectedAttendance: number;
  status: 'draft' | 'sent' | 'signed' | 'executed';
  createdDate: string;
  signedDate?: string;
}

const sampleContracts: Contract[] = [
  {
    id: '1',
    title: 'Summer Festival 2024 - The Midnight Express',
    artist: 'The Midnight Express',
    venue: 'Central Park',
    eventDate: '2024-07-15',
    showFee: 50000,
    transport: 2000,
    tolls: 150,
    soundRental: 8000,
    totalHT: 60150,
    totalTTC: 72180,
    expectedAttendance: 5000,
    status: 'signed',
    createdDate: '2024-05-20',
    signedDate: '2024-05-25'
  },
  {
    id: '2',
    title: 'Acoustic Night - Sarah Mitchell',
    artist: 'Sarah Mitchell',
    venue: 'Blue Note Jazz Club',
    eventDate: '2024-06-20',
    showFee: 8500,
    transport: 500,
    tolls: 50,
    soundRental: 1500,
    totalHT: 10550,
    totalTTC: 12660,
    expectedAttendance: 300,
    status: 'sent',
    createdDate: '2024-06-01'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'signed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'sent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'executed':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

export const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(sampleContracts);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    venue: '',
    eventDate: '',
    showFee: 0,
    transport: 0,
    tolls: 0,
    soundRental: 0,
    expectedAttendance: 0,
    showTime: '',
    soundCheckTime: '',
    requirements: '',
    merchandiseSplit: '',
    hospitality: ''
  });

  const calculateTotals = () => {
    const totalHT = formData.showFee + formData.transport + formData.tolls + formData.soundRental;
    const totalTTC = totalHT * 1.20; // 20% TVA
    return { totalHT, totalTTC };
  };

  const { totalHT, totalTTC } = calculateTotals();

  const resetForm = () => {
    setFormData({
      title: '',
      artist: '',
      venue: '',
      eventDate: '',
      showFee: 0,
      transport: 0,
      tolls: 0,
      soundRental: 0,
      expectedAttendance: 0,
      showTime: '',
      soundCheckTime: '',
      requirements: '',
      merchandiseSplit: '',
      hospitality: ''
    });
  };

  const handleCreateContract = () => {
    const newContract: Contract = {
      id: Date.now().toString(),
      title: formData.title,
      artist: formData.artist,
      venue: formData.venue,
      eventDate: formData.eventDate,
      showFee: formData.showFee,
      transport: formData.transport,
      tolls: formData.tolls,
      soundRental: formData.soundRental,
      totalHT,
      totalTTC,
      expectedAttendance: formData.expectedAttendance,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setContracts([...contracts, newContract]);
    setShowCreateForm(false);
    resetForm();
    toast.success('Contrat créé avec succès');
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      title: contract.title,
      artist: contract.artist,
      venue: contract.venue,
      eventDate: contract.eventDate,
      showFee: contract.showFee,
      transport: contract.transport,
      tolls: contract.tolls,
      soundRental: contract.soundRental,
      expectedAttendance: contract.expectedAttendance,
      showTime: '',
      soundCheckTime: '',
      requirements: '',
      merchandiseSplit: '',
      hospitality: ''
    });
    setShowEditForm(true);
  };

  const handleUpdateContract = () => {
    if (!editingContract) return;
    
    const updatedContracts = contracts.map(contract => 
      contract.id === editingContract.id 
        ? { 
            ...contract, 
            title: formData.title,
            artist: formData.artist,
            venue: formData.venue,
            eventDate: formData.eventDate,
            showFee: formData.showFee,
            transport: formData.transport,
            tolls: formData.tolls,
            soundRental: formData.soundRental,
            totalHT,
            totalTTC,
            expectedAttendance: formData.expectedAttendance
          }
        : contract
    );
    
    setContracts(updatedContracts);
    setShowEditForm(false);
    setEditingContract(null);
    resetForm();
    toast.success('Contrat modifié avec succès');
  };

  const handleDeleteContract = (contractId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      setContracts(contracts.filter(contract => contract.id !== contractId));
      toast.success('Contrat supprimé avec succès');
    }
  };

  const handleViewContract = (contract: Contract) => {
    toast.info(`Affichage du contrat: ${contract.title}`);
  };

  const handleDownloadContract = (contract: Contract) => {
    toast.info(`Téléchargement du contrat: ${contract.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Contrats</h1>
          <p className="text-muted-foreground mt-2">Créez, gérez et suivez les contrats de performance</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Créer un Contrat
        </Button>
      </div>

      {/* Contract Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold">
              {contracts.filter(c => c.status === 'draft').length}
            </div>
            <div className="text-sm text-muted-foreground">Brouillons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => c.status === 'sent').length}
            </div>
            <div className="text-sm text-muted-foreground">Envoyés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'signed').length}
            </div>
            <div className="text-sm text-muted-foreground">Signés</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {contracts.filter(c => c.status === 'executed').length}
            </div>
            <div className="text-sm text-muted-foreground">Exécutés</div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">{contract.title}</h3>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Artiste</p>
                      <p className="font-medium">{contract.artist}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Lieu</p>
                      <p className="font-medium">{contract.venue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date d'événement</p>
                      <p className="font-medium">{new Date(contract.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total TTC</p>
                      <p className="font-medium text-green-600">{contract.totalTTC.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jauge attendue</p>
                      <p className="font-medium">{contract.expectedAttendance.toLocaleString()} personnes</p>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Cachet</p>
                      <p className="text-sm font-medium">{contract.showFee.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Transport</p>
                      <p className="text-sm font-medium">{contract.transport.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Péages</p>
                      <p className="text-sm font-medium">{contract.tolls.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location son</p>
                      <p className="text-sm font-medium">{contract.soundRental.toLocaleString()} €</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                    <span>Créé: {new Date(contract.createdDate).toLocaleDateString()}</span>
                    {contract.signedDate && (
                      <span>Signé: {new Date(contract.signedDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewContract(contract)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditContract(contract)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadContract(contract)}>
                    <Download className="h-3 w-3 mr-1" />
                    Télécharger
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteContract(contract.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Contract Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Créer un Nouveau Contrat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Titre du contrat" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Nom de l'artiste" 
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                />
                <Input 
                  placeholder="Lieu" 
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="date" 
                  placeholder="Date d'événement" 
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                />
                <Input 
                  type="number"
                  placeholder="Jauge attendue (personnes)" 
                  value={formData.expectedAttendance}
                  onChange={(e) => setFormData({...formData, expectedAttendance: Number(e.target.value)})}
                />
              </div>

              {/* Cost Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Détail des coûts</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="number"
                    placeholder="Cachet de performance (€)" 
                    value={formData.showFee}
                    onChange={(e) => setFormData({...formData, showFee: Number(e.target.value)})}
                  />
                  <Input 
                    type="number"
                    placeholder="Transport (€)" 
                    value={formData.transport}
                    onChange={(e) => setFormData({...formData, transport: Number(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input 
                    type="number"
                    placeholder="Péages (€)" 
                    value={formData.tolls}
                    onChange={(e) => setFormData({...formData, tolls: Number(e.target.value)})}
                  />
                  <Input 
                    type="number"
                    placeholder="Location sonorisation (€)" 
                    value={formData.soundRental}
                    onChange={(e) => setFormData({...formData, soundRental: Number(e.target.value)})}
                  />
                </div>

                {/* Totals Display */}
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total HT</p>
                      <p className="text-xl font-bold">{totalHT.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total TTC (TVA 20%)</p>
                      <p className="text-xl font-bold text-green-600">{totalTTC.toLocaleString()} €</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Heure du spectacle" 
                  value={formData.showTime}
                  onChange={(e) => setFormData({...formData, showTime: e.target.value})}
                />
                <Input 
                  placeholder="Heure de balance" 
                  value={formData.soundCheckTime}
                  onChange={(e) => setFormData({...formData, soundCheckTime: e.target.value})}
                />
              </div>
              <textarea 
                placeholder="Exigences spéciales / Notes"
                className="w-full p-3 border border-input rounded-md bg-background"
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Partage merchandising %" 
                  value={formData.merchandiseSplit}
                  onChange={(e) => setFormData({...formData, merchandiseSplit: e.target.value})}
                />
                <Input 
                  placeholder="Exigences d'hospitalité" 
                  value={formData.hospitality}
                  onChange={(e) => setFormData({...formData, hospitality: e.target.value})}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button variant="outline" className="flex-1">
                  Sauvegarder comme brouillon
                </Button>
                <Button onClick={handleCreateContract} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Créer le Contrat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Contract Form Modal */}
      {showEditForm && editingContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Modifier le Contrat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Same form structure as create form but with update handler */}
              <Input 
                placeholder="Titre du contrat" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Nom de l'artiste" 
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                />
                <Input 
                  placeholder="Lieu" 
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="date" 
                  placeholder="Date d'événement" 
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                />
                <Input 
                  type="number"
                  placeholder="Jauge attendue (personnes)" 
                  value={formData.expectedAttendance}
                  onChange={(e) => setFormData({...formData, expectedAttendance: Number(e.target.value)})}
                />
              </div>

              {/* Cost Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Détail des coûts</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    type="number"
                    placeholder="Cachet de performance (€)" 
                    value={formData.showFee}
                    onChange={(e) => setFormData({...formData, showFee: Number(e.target.value)})}
                  />
                  <Input 
                    type="number"
                    placeholder="Transport (€)" 
                    value={formData.transport}
                    onChange={(e) => setFormData({...formData, transport: Number(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Input 
                    type="number"
                    placeholder="Péages (€)" 
                    value={formData.tolls}
                    onChange={(e) => setFormData({...formData, tolls: Number(e.target.value)})}
                  />
                  <Input 
                    type="number"
                    placeholder="Location sonorisation (€)" 
                    value={formData.soundRental}
                    onChange={(e) => setFormData({...formData, soundRental: Number(e.target.value)})}
                  />
                </div>

                {/* Totals Display */}
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total HT</p>
                      <p className="text-xl font-bold">{totalHT.toLocaleString()} €</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total TTC (TVA 20%)</p>
                      <p className="text-xl font-bold text-green-600">{totalTTC.toLocaleString()} €</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Heure du spectacle" 
                  value={formData.showTime}
                  onChange={(e) => setFormData({...formData, showTime: e.target.value})}
                />
                <Input 
                  placeholder="Heure de balance" 
                  value={formData.soundCheckTime}
                  onChange={(e) => setFormData({...formData, soundCheckTime: e.target.value})}
                />
              </div>
              <textarea 
                placeholder="Exigences spéciales / Notes"
                className="w-full p-3 border border-input rounded-md bg-background"
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Partage merchandising %" 
                  value={formData.merchandiseSplit}
                  onChange={(e) => setFormData({...formData, merchandiseSplit: e.target.value})}
                />
                <Input 
                  placeholder="Exigences d'hospitalité" 
                  value={formData.hospitality}
                  onChange={(e) => setFormData({...formData, hospitality: e.target.value})}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowEditForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleUpdateContract} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Sauvegarder les Modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
