
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Search, Euro, Calendar, Edit, Trash2, Eye, Download } from 'lucide-react';
import { GlobalFileUpload } from '@/components/GlobalFileUpload';
import { toast } from 'sonner';

interface Contract {
  id: string;
  quoteNumber: string;
  title: string;
  description?: string;
  clientName: string;
  clientEmail: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount?: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  terms?: string;
  notes?: string;
  createdAt: string;
}

export const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log('📋 Contracts - Page loaded with', contracts.length, 'contracts');

  // Simulation de données
  useEffect(() => {
    const mockContracts: Contract[] = [
      {
        id: '1',
        quoteNumber: 'DEV-2024-001',
        title: 'Prestation DJ Mariage Sarah & Pierre',
        description: 'Animation musicale complète pour mariage',
        clientName: 'Sarah Dubois',
        clientEmail: 'sarah.dubois@example.com',
        totalAmount: 1800,
        taxAmount: 360,
        discountAmount: 100,
        validUntil: '2024-07-31',
        status: 'sent',
        items: [
          {
            name: 'Prestation DJ (8h)',
            description: 'Animation musicale avec matériel professionnel',
            quantity: 1,
            unitPrice: 1200,
            totalPrice: 1200
          },
          {
            name: 'Éclairage LED',
            description: 'Éclairage d\'ambiance coloré',
            quantity: 1,
            unitPrice: 400,
            totalPrice: 400
          },
          {
            name: 'Fumée lourde',
            description: 'Machine à fumée lourde pour première danse',
            quantity: 1,
            unitPrice: 200,
            totalPrice: 200
          }
        ],
        terms: 'Acompte de 30% à la signature, solde le jour J',
        notes: 'Prévoir accès électrique 220V à proximité',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        quoteNumber: 'DEV-2024-002',
        title: 'Concert Jazz Festival',
        description: 'Sonorisation concert jazz en plein air',
        clientName: 'Festival Jazz Paris',
        clientEmail: 'contact@jazzparis.com',
        totalAmount: 3500,
        taxAmount: 700,
        validUntil: '2024-06-15',
        status: 'accepted',
        items: [
          {
            name: 'Sonorisation complète ligne 100',
            description: 'Système de sonorisation professionnel',
            quantity: 1,
            unitPrice: 2500,
            totalPrice: 2500
          },
          {
            name: 'Technicien son',
            description: 'Technicien dédié pendant l\'événement',
            quantity: 1,
            unitPrice: 800,
            totalPrice: 800
          },
          {
            name: 'Transport et montage',
            description: 'Transport du matériel et installation',
            quantity: 1,
            unitPrice: 200,
            totalPrice: 200
          }
        ],
        terms: '50% à la signature, 50% à J-7',
        notes: 'Matériel garanti étanche (événement en extérieur)',
        createdAt: '2024-01-10'
      }
    ];

    setTimeout(() => {
      setContracts(mockContracts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredContracts = contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateContract = () => {
    console.log('➕ Creating new contract');
    setShowCreateForm(true);
    toast.info('Formulaire de création de devis (à implémenter)');
  };

  const handleEditContract = (contractId: string) => {
    console.log('✏️ Editing contract:', contractId);
    toast.info('Édition de devis (à implémenter)');
  };

  const handleDeleteContract = (contractId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
      console.log('🗑️ Deleting contract:', contractId);
      setContracts(prev => prev.filter(c => c.id !== contractId));
      toast.success('Devis supprimé');
    }
  };

  const handleDownloadContract = (contractId: string) => {
    console.log('📥 Downloading contract:', contractId);
    toast.success('Téléchargement du devis PDF (à implémenter)');
  };

  const handleFileUploaded = (file: { url: string; name: string; type: string }) => {
    console.log('📎 File uploaded for contracts:', file);
    toast.success(`Document "${file.name}" ajouté aux devis`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des devis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="h-8 w-8 mr-3 text-green-600" />
            Devis & Contrats
          </h1>
          <p className="mt-2 text-gray-600">
            {contracts.length} devis • Total: {formatPrice(contracts.reduce((sum, c) => sum + c.totalAmount, 0))}
          </p>
        </div>
        <Button onClick={handleCreateContract} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Devis
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par numéro, titre ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload de documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents Contractuels</CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalFileUpload
            onFileUploaded={handleFileUploaded}
            acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            label="Télécharger des documents (contrats signés, annexes...)"
            maxSize={10}
            multiple={true}
          />
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid gap-6">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{contract.title}</h3>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>N° {contract.quoteNumber}</span>
                    <span>•</span>
                    <span>{contract.clientName}</span>
                    <span>•</span>
                    <span>Valide jusqu'au {formatDate(contract.validUntil)}</span>
                  </div>
                  {contract.description && (
                    <p className="text-gray-600 mb-3">{contract.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadContract(contract.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditContract(contract.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteContract(contract.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Items summary */}
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h4 className="font-medium mb-2">Prestations:</h4>
                <div className="space-y-1">
                  {contract.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatPrice(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="text-right space-y-1">
                  <div className="flex justify-between items-center space-x-8">
                    <span className="text-sm">Sous-total:</span>
                    <span>{formatPrice(contract.totalAmount - contract.taxAmount)}</span>
                  </div>
                  {contract.discountAmount && (
                    <div className="flex justify-between items-center space-x-8 text-green-600">
                      <span className="text-sm">Remise:</span>
                      <span>-{formatPrice(contract.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center space-x-8">
                    <span className="text-sm">TVA:</span>
                    <span>{formatPrice(contract.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center space-x-8 font-semibold text-lg border-t pt-1">
                    <span>Total TTC:</span>
                    <span>{formatPrice(contract.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and notes */}
              {(contract.terms || contract.notes) && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  {contract.terms && (
                    <div className="text-sm">
                      <strong>Conditions:</strong> {contract.terms}
                    </div>
                  )}
                  {contract.notes && (
                    <div className="text-sm">
                      <strong>Notes:</strong> {contract.notes}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun devis trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Aucun devis ne correspond à votre recherche.' : 'Commencez par créer votre premier devis.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateContract}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un devis
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
