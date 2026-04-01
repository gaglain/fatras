import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileDown, Edit } from 'lucide-react';
import { generateQuotePDF } from '@/utils/quotePdfGenerator';
import { toast } from 'sonner';

interface ContractViewDialogProps {
  viewingQuote: any;
  viewingQuoteItems: any[];
  onClose: () => void;
  onEdit: (quote: any) => void;
  contacts: any[];
  events: any[];
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export const ContractViewDialog: React.FC<ContractViewDialogProps> = ({
  viewingQuote,
  viewingQuoteItems,
  onClose,
  onEdit,
  contacts,
  events,
  getStatusColor,
  getStatusLabel,
}) => {
  const handleDownloadPDF = () => {
    if (!viewingQuote) return;
    const doc = generateQuotePDF(viewingQuote, viewingQuoteItems);
    doc.save(`devis-${viewingQuote.quote_number}.pdf`);
    toast.success('PDF téléchargé');
  };

  return (
    <Dialog open={!!viewingQuote} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Devis N° {viewingQuote?.quote_number}</DialogTitle>
        </DialogHeader>
        {viewingQuote && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Titre:</span>
                <p className="font-medium">{viewingQuote.title}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Statut:</span>
                <div className="mt-1">
                  <Badge className={getStatusColor(viewingQuote.status)}>{getStatusLabel(viewingQuote.status)}</Badge>
                </div>
              </div>
              {viewingQuote.description && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Description:</span>
                  <p>{viewingQuote.description}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Créé le:</span>
                <p>{new Date(viewingQuote.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              {viewingQuote.valid_until && (
                <div>
                  <span className="text-muted-foreground">Valide jusqu'au:</span>
                  <p>{new Date(viewingQuote.valid_until).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Contact:</span>
                <p>{viewingQuote.contact_id ? ((contacts.find(c => c.id === viewingQuote.contact_id)?.first_name || '') + ' ' + (contacts.find(c => c.id === viewingQuote.contact_id)?.last_name || '')).trim() || '-' : '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Événement:</span>
                <p>{viewingQuote.event_id ? events.find(e => e.id === viewingQuote.event_id)?.title || '-' : '-'}</p>
              </div>
            </div>

            {viewingQuoteItems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Lignes du devis</h4>
                <div className="space-y-2">
                  {viewingQuoteItems.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.name}</p>
                        {item.description && <p className="text-muted-foreground text-xs">{item.description}</p>}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p>{item.quantity} × {Number(item.unit_price).toFixed(2)} €</p>
                        <p className="font-semibold">{Number(item.total_price).toFixed(2)} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Card className="p-4 bg-muted/50">
              <div className="space-y-1.5 text-sm">
                {(() => {
                  const subtotal = viewingQuoteItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
                  const vatRate = viewingQuote.vat_rate ?? 0;
                  const tax = viewingQuote.tax_amount ?? (subtotal * vatRate / 100);
                  const total = viewingQuote.total_amount ?? (subtotal + tax);
                  return (
                    <>
                      <div className="flex justify-between"><span className="text-muted-foreground">Sous-total HT</span><span>{subtotal.toFixed(2)} €</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">TVA ({vatRate}%)</span><span>{tax.toFixed(2)} €</span></div>
                      <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2"><span>Total TTC</span><span>{total.toFixed(2)} €</span></div>
                    </>
                  );
                })()}
              </div>
            </Card>

            {viewingQuote.terms && (
              <div><h4 className="font-semibold mb-1">Conditions</h4><p className="text-sm text-muted-foreground">{viewingQuote.terms}</p></div>
            )}
            {viewingQuote.notes && (
              <div><h4 className="font-semibold mb-1">Notes</h4><p className="text-sm text-muted-foreground">{viewingQuote.notes}</p></div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleDownloadPDF} className="flex-1"><FileDown className="h-4 w-4 mr-2" />Télécharger PDF</Button>
              <Button variant="outline" onClick={() => { onClose(); onEdit(viewingQuote); }}><Edit className="h-4 w-4 mr-2" />Modifier</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
