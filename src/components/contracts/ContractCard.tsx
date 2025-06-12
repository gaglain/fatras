
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Download, Calendar, DollarSign, User, FileText, Trash2 } from 'lucide-react';

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
  onDelete?: (contractId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'signed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'sent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case 'executed':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'signed':
      return 'Signé';
    case 'sent':
      return 'Envoyé';
    case 'draft':
      return 'Brouillon';
    case 'executed':
      return 'Exécuté';
    default:
      return status;
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
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg font-semibold truncate">{contract.title}</CardTitle>
          <Badge className={getStatusColor(contract.status)}>
            {getStatusLabel(contract.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{contract.artist}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium">{contract.totalTTC?.toLocaleString()} €</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{contract.venue}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{new Date(contract.eventDate).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground">
            Jauge: {contract.expectedAttendance} personnes • Créé le {new Date(contract.createdDate).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => onView(contract)} className="flex-1 min-w-0">
            <Eye className="h-3 w-3 mr-1" />
            Voir
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(contract)} className="flex-1 min-w-0">
            <Edit className="h-3 w-3 mr-1" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload(contract)} className="flex-1 min-w-0">
            <Download className="h-3 w-3 mr-1" />
            PDF
          </Button>
          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(contract.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
