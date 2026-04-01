import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Eye } from 'lucide-react';

interface ContractQuoteCardProps {
  quote: any;
  contacts: any[];
  events: any[];
  artists: any[];
  onView: (quote: any) => void;
  onEdit: (quote: any) => void;
  onDelete: (id: string) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export const ContractQuoteCard: React.FC<ContractQuoteCardProps> = ({
  quote, contacts, events, artists, onView, onEdit, onDelete, getStatusColor, getStatusLabel,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold leading-tight break-words">{quote.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">N° {quote.quote_number}</p>
          </div>
          <Badge className={getStatusColor(quote.status)}>{getStatusLabel(quote.status)}</Badge>
        </div>

        {quote.description && <p className="text-gray-600 text-sm mb-4 break-words">{quote.description}</p>}

        <div className="space-y-2 mb-4">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{Number(quote.total_amount ?? 0).toFixed(2)} € TTC</div>
          {quote.valid_until && <div className="text-sm text-gray-600">Valide jusqu'au {new Date(quote.valid_until).toLocaleDateString('fr-FR')}</div>}
          <div className="text-xs text-gray-500">Créé le {new Date(quote.created_at).toLocaleDateString('fr-FR')}</div>
        </div>

        <div className="space-y-1 text-sm text-muted-foreground mb-4">
          <div><span className="font-medium">Contact: </span>{quote.contact_id ? (contacts.find(c => c.id === quote.contact_id)?.first_name || '') + ' ' + (contacts.find(c => c.id === quote.contact_id)?.last_name || '') : '-'}</div>
          <div><span className="font-medium">Événement: </span>{quote.event_id ? events.find(e => e.id === quote.event_id)?.title || '-' : '-'}</div>
          <div><span className="font-medium">Spectacle: </span>{quote.artist_id ? artists.find(a => a.id === quote.artist_id)?.name || '-' : '-'}</div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(quote)} className="flex-1"><Eye className="h-3 w-3 mr-1" />Voir</Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(quote)} className="flex-1"><Edit className="h-3 w-3 mr-1" />Modifier</Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(quote.id)} className="text-red-600 hover:text-red-800 hover:bg-red-50"><Trash2 className="h-3 w-3" /></Button>
        </div>
      </CardContent>
    </Card>
  );
};
