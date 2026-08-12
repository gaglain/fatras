import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Radio, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Event } from '@/types/event.types';

interface BandsintownExporterProps {
  events: Event[];
}

/**
 * Export des dates confirmées au format d'import CSV de Bandsintown for Artists.
 * Le fichier est à téléverser dans Bandsintown for Artists > Add Events > Import from CSV.
 */
export const BandsintownExporter: React.FC<BandsintownExporterProps> = ({ events }) => {
  const [open, setOpen] = useState(false);
  const [artistName, setArtistName] = useState('Fatras');

  const confirmedEvents = useMemo(
    () =>
      events
        .filter(
          (e) =>
            (e.status || '').toLowerCase() === 'confirmed' &&
            !!e.start_date &&
            new Date(e.start_date).getTime() > Date.now()
        )
        .sort((a, b) => new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime()),
    [events]
  );


  const escapeField = (value: string) =>
    /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const handleExport = () => {
    if (!artistName.trim()) {
      toast.error("Le nom d'artiste est requis par Bandsintown");
      return;
    }
    if (confirmedEvents.length === 0) {
      toast.error('Aucune date confirmée à exporter');
      return;
    }

    // Ordre et intitulés exacts du modèle officiel Bandsintown (Bulk Upload Artists Template)
    const headers = [
      'Artist Name',
      'Venue*',
      'Country*',
      'Address',
      'City*',
      'Region*',
      'Postal Code',
      'Timezone*',
      'Start Date* (yyyy-mm-dd)',
      'Start Time* (HH:MM)',
      'End Date',
      'End Time',
      'Streaming Link',
      'Ticket Link',
      'Ticket Type',
      'Ticket Link 2',
      'Ticket Type 2',
      'On-Sale Date',
      'On-Sale Time',
      'Lineup',
      'Event Name',
      'Event Display Format',
      'Description',
      'Schedule Date',
      'Schedule Time',
      'Do Not Announce',
      'Setlist',
      'Event Image',
    ];

    const rows = confirmedEvents.map((event) => {
      const start = new Date(event.start_date!);
      return [
        artistName.trim(),
        event.venue || event.title || '',
        event.country || 'France',
        event.address || '',
        event.city || '',
        '',
        event.postal_code || '',
        'Europe/Paris',
        format(start, 'yyyy-MM-dd'),
        format(start, 'HH:mm'),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        event.title || '',
        '',
        (event.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(),
        '',
        '',
        '',
        '',
        '',

    });

    // Bandsintown limite à 25 événements par fichier
    const CHUNK = 25;
    const chunks: string[][][] = [];
    for (let i = 0; i < rows.length; i += CHUNK) chunks.push(rows.slice(i, i + CHUNK));

    chunks.forEach((chunk, index) => {
      const csvContent =
        '\uFEFF' + [headers.join(','), ...chunk.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        chunks.length > 1
          ? `bandsintown_${format(new Date(), 'yyyy-MM-dd')}_${index + 1}.csv`
          : `bandsintown_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    toast.success(
      `${confirmedEvents.length} date(s) exportée(s)${chunks.length > 1 ? ` en ${chunks.length} fichiers de 25 max` : ''}`
    );
    setOpen(false);
  };


  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-xs sm:text-sm">
        <Radio className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Bandsintown</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Bandsintown</DialogTitle>
            <DialogDescription>
              Génère un CSV au format d'import de Bandsintown for Artists, à téléverser dans
              « Add Events → Import events ». Seules les dates confirmées sont exportées.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bit-artist">Nom d'artiste Bandsintown</Label>
              <Input
                id="bit-artist"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Fatras"
              />
              <p className="text-xs text-muted-foreground">
                Doit correspondre exactement au nom de la page Bandsintown.
              </p>
            </div>

            <div className="rounded-md border p-3 text-sm">
              <p className="font-medium">{confirmedEvents.length} date(s) confirmée(s) prête(s)</p>
              {confirmedEvents.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground max-h-40 overflow-y-auto">
                  {confirmedEvents.slice(0, 12).map((e) => (
                    <li key={e.id}>
                      {format(new Date(e.start_date!), 'dd/MM/yyyy')} — {e.venue || e.title}
                      {e.city ? `, ${e.city}` : ''}
                    </li>
                  ))}
                  {confirmedEvents.length > 12 && <li>… et {confirmedEvents.length - 12} autre(s)</li>}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleExport} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
