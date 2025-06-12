
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Download, Calendar, DollarSign, User, FileText } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  client: string;
  amount: number;
  status: 'draft' | 'sent' | 'signed' | 'expired';
  date: string;
  dueDate: string;
  description: string;
}

interface ContractCardProps {
  contract: Contract;
  onView: (contract: Contract) => void;
  onEdit: (contract: Contract) => void;
  onDownload: (contract: Contract) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'signed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'sent':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    case 'expired':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
    case 'expired':
      return 'Expiré';
    default:
      return status;
  }
};

export const ContractCard: React.FC<ContractCardProps> = ({
  contract,
  onView,
  onEdit,
  onDownload
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">{contract.client}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium">{contract.amount.toLocaleString()} €</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">{new Date(contract.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm">Échéance: {new Date(contract.dueDate).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {contract.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => onView(contract)} className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            Voir
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(contract)} className="flex-1">
            <Edit className="h-3 w-3 mr-1" />
            Modifier
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDownload(contract)} className="flex-1">
            <Download className="h-3 w-3 mr-1" />
            Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
