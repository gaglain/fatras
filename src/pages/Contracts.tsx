
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ContractForm } from '@/components/contracts/ContractForm';
import { ContractCard } from '@/components/contracts/ContractCard';
import { ContractStats } from '@/components/contracts/ContractStats';

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

export const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(sampleContracts);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const handleCreateContract = (formData: any) => {
    const totalHT = formData.showFee + formData.transport + formData.tolls + formData.soundRental;
    const totalTTC = totalHT * 1.20;

    const newContract: Contract = {
      id: Date.now().toString(),
      ...formData,
      totalHT,
      totalTTC,
      status: 'draft' as const,
      createdDate: new Date().toISOString().split('T')[0]
    };
    
    setContracts([...contracts, newContract]);
    setShowCreateForm(false);
    toast.success('Contrat créé avec succès');
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setShowEditForm(true);
  };

  const handleUpdateContract = (formData: any) => {
    if (!editingContract) return;
    
    const totalHT = formData.showFee + formData.transport + formData.tolls + formData.soundRental;
    const totalTTC = totalHT * 1.20;

    const updatedContracts = contracts.map(contract => 
      contract.id === editingContract.id 
        ? { ...contract, ...formData, totalHT, totalTTC }
        : contract
    );
    
    setContracts(updatedContracts);
    setShowEditForm(false);
    setEditingContract(null);
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

      <ContractStats contracts={contracts} />

      <div className="space-y-4">
        {contracts.map((contract) => (
          <ContractCard
            key={contract.id}
            contract={contract}
            onView={handleViewContract}
            onEdit={handleEditContract}
            onDownload={handleDownloadContract}
            onDelete={handleDeleteContract}
          />
        ))}
      </div>

      <ContractForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateContract}
        title="Créer un Nouveau Contrat"
        submitButtonText="Créer le Contrat"
      />

      <ContractForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleUpdateContract}
        initialData={editingContract || {}}
        title="Modifier le Contrat"
        submitButtonText="Sauvegarder les Modifications"
      />
    </div>
  );
};
