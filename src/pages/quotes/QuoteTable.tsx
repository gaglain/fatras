import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Trash2, Download } from 'lucide-react';
import { Quote } from '@/hooks/useQuotes';

interface QuoteTableProps {
  quotes: Quote[];
  contacts: any[];
  events: any[];
  artists: any[];
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const getStatusBadge = (status: Quote['status']) => {
  const variants = { draft: 'secondary', sent: 'default', accepted: 'default', rejected: 'destructive', expired: 'outline' } as const;
  const labels = { draft: 'Brouillon', sent: 'Envoyé', accepted: 'Accepté', rejected: 'Refusé', expired: 'Expiré' };
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
};

export const QuoteTable: React.FC<QuoteTableProps> = ({
  quotes, contacts, events, artists, onEdit, onDelete, formatCurrency,
}) => {
  if (quotes.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Aucun devis trouvé</div>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table className="min-w-[1000px]">
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Événement</TableHead>
            <TableHead>Spectacle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow key={quote.id}>
              <TableCell className="font-mono text-sm">{quote.quote_number}</TableCell>
              <TableCell className="font-medium">{quote.title}</TableCell>
              <TableCell>
                {quote.contact_id ? (() => { const c = contacts.find((c: any) => c.id === quote.contact_id); return c ? `${c.first_name} ${c.last_name}` : '-'; })() : '-'}
              </TableCell>
              <TableCell>{quote.event_id ? (events.find((e: any) => e.id === quote.event_id)?.title || '-') : '-'}</TableCell>
              <TableCell>
                {(() => { const artistId = quote.artist_id || events.find((e: any) => e.id === quote.event_id)?.artist_id; return artistId ? (artists.find((a: any) => a.id === artistId)?.name || '-') : '-'; })()}
              </TableCell>
              <TableCell>{getStatusBadge(quote.status)}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(quote.total_amount)}</TableCell>
              <TableCell>{new Date(quote.created_at).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(quote)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(quote.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
