
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Edit, Eye, Trash2 } from 'lucide-react';

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

interface ContractCardProps {
  contract: Contract;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDownload: (contract: Contract) => void;
  onDelete: (contractId: string) => void;
}

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

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onView,
  onEdit,
  onDownload,
  onDelete
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
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
            <Button variant="outline" size="sm" onClick={() => onView(contract)}>
              <Eye className="h-3 w-3 mr-1" />
              Voir
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(contract)}>
              <Edit className="h-3 w-3 mr-1" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownload(contract)}>
              <Download className="h-3 w-3 mr-1" />
              Télécharger
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(contract.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
