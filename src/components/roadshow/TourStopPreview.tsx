import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TourStop } from '@/types/roadshow.types';
import { Download, Printer, FileText, Contact, CalendarDays, DollarSign, Music, Route } from 'lucide-react';
import { useRoadshowExpenses } from '@/hooks/useRoadshowExpenses';
import { useRoadshowEntityConnections, RoadshowEntityConnection } from '@/hooks/useRoadshowEntityConnections';
import { Badge } from '@/components/ui/badge';
import { ShowBibleSetlistEditor } from '@/components/ShowBibleSetlistEditor';
import { TourStopRouteMap } from './TourStopRouteMap';
import { TourStopRoadmapTab } from './TourStopRoadmapTab';

interface TourStopPreviewProps {
  stop: TourStop | null;
  isOpen: boolean;
  onClose: () => void;
  getUserById: (userId: string) => { name: string } | undefined;
}

export const TourStopPreview: React.FC<TourStopPreviewProps> = ({ stop, isOpen, onClose, getUserById }) => {
  const { expenses, createExpense, deleteExpense, loading: expenseLoading, fetchExpenses } = useRoadshowExpenses(stop?.id);
  const { getRoadshowConnections } = useRoadshowEntityConnections();
  const [connections, setConnections] = useState<{
    contacts: RoadshowEntityConnection[];
    events: RoadshowEntityConnection[];
    quotes: RoadshowEntityConnection[];
    contracts: RoadshowEntityConnection[];
  }>({ contacts: [], events: [], quotes: [], contracts: [] });

  useEffect(() => {
    if (stop && isOpen) {
      getRoadshowConnections(stop.id).then(setConnections);
    }
  }, [stop?.id, isOpen]);

  if (!stop) return null;

  const handleDownloadPDF = () => {
    const content = `FEUILLE DE ROUTE - ${stop.city.toUpperCase()}\n\n📍 ${stop.venue}\n${stop.address}\n📅 ${new Date(stop.date).toLocaleDateString('fr-FR')}\n🕐 ${stop.time}\n\n🎭 CASTING\n${stop.artistLineup.map(a => `• ${getUserById(a.userId)?.name || 'Inconnu'}`).join('\n')}\n\n📊 STATUT: ${stop.status}`;
    const element = document.createElement('a');
    element.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    element.download = `feuille-route-${stop.city}-${stop.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Feuille de Route - ${stop.city}</title><style>body{font-family:Arial,sans-serif;margin:20px;}.header{text-align:center;border-bottom:2px solid #333;padding-bottom:10px;}</style></head><body><div class="header"><h1>FEUILLE DE ROUTE</h1><h2>${stop.city} - ${stop.venue}</h2></div></body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl overflow-x-hidden">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex flex-col gap-3">
            <span className="text-base sm:text-xl font-semibold">Aperçu - {stop.city}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1 sm:flex-none h-9 text-xs sm:text-sm">
                <Printer className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Imprimer</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-1 sm:flex-none h-9 text-xs sm:text-sm">
                <Download className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Télécharger</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="roadmap" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="roadmap" className="text-xs sm:text-sm px-2"><FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />Route</TabsTrigger>
            <TabsTrigger value="trajet" className="text-xs sm:text-sm px-2"><Route className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />Trajet</TabsTrigger>
            <TabsTrigger value="setlist" className="text-xs sm:text-sm px-2"><Music className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />Setlist</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="mt-3 sm:mt-4">
            <TourStopRoadmapTab
              stop={stop}
              getUserById={getUserById}
              expenses={expenses}
              expenseLoading={expenseLoading}
              fetchExpenses={fetchExpenses}
              createExpense={createExpense}
              deleteExpense={deleteExpense}
            />

            {/* Linked entities */}
            {(connections.contacts.length > 0 || connections.events.length > 0 || connections.quotes.length > 0 || connections.contracts.length > 0) && (
              <div className="space-y-4 border-t pt-4 mt-4 px-2 sm:px-4">
                <h3 className="font-semibold text-gray-900 mb-3">🔗 Entités Liées</h3>
                {connections.contacts.length > 0 && (
                  <div><h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center"><Contact className="h-3 w-3 mr-1" />Contacts ({connections.contacts.length})</h4>
                    <div className="flex flex-wrap gap-2">{connections.contacts.map(c => <Badge key={c.id} variant="outline">{c.title}{c.role && <span className="ml-1 text-xs">({c.role})</span>}</Badge>)}</div>
                  </div>
                )}
                {connections.events.length > 0 && (
                  <div><h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center"><CalendarDays className="h-3 w-3 mr-1" />Événements ({connections.events.length})</h4>
                    <div className="flex flex-wrap gap-2">{connections.events.map(e => <Badge key={e.id} variant="outline">{e.title}</Badge>)}</div>
                  </div>
                )}
                {connections.quotes.length > 0 && (
                  <div><h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center"><DollarSign className="h-3 w-3 mr-1" />Devis ({connections.quotes.length})</h4>
                    <div className="flex flex-wrap gap-2">{connections.quotes.map(q => <Badge key={q.id} variant="outline">{q.title}</Badge>)}</div>
                  </div>
                )}
                {connections.contracts.length > 0 && (
                  <div><h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center"><FileText className="h-3 w-3 mr-1" />Contrats ({connections.contracts.length})</h4>
                    <div className="flex flex-wrap gap-2">{connections.contracts.map(c => <Badge key={c.id} variant="outline">{c.title}</Badge>)}</div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trajet" className="mt-3 sm:mt-4">
            <div className="space-y-4 p-2 sm:p-4 bg-white rounded-lg">
              <TourStopRouteMap stopId={stop.id} stopAddress={stop.address} stopCity={stop.city} height="400px" />
            </div>
          </TabsContent>

          <TabsContent value="setlist" className="mt-4">
            <ShowBibleSetlistEditor />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
