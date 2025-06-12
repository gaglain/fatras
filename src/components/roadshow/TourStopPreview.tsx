
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TourStop } from '@/types/roadshow.types';
import { MapPin, Calendar, Clock, Users, Download, Printer } from 'lucide-react';

interface TourStopPreviewProps {
  stop: TourStop | null;
  isOpen: boolean;
  onClose: () => void;
  getUserById: (userId: string) => { name: string } | undefined;
}

export const TourStopPreview: React.FC<TourStopPreviewProps> = ({
  stop,
  isOpen,
  onClose,
  getUserById
}) => {
  if (!stop) return null;

  const handleDownloadPDF = () => {
    const content = `
FEUILLE DE ROUTE - ${stop.city.toUpperCase()}

═══════════════════════════════════════════════════════════

📍 LIEU ET HORAIRES
${stop.venue}
${stop.address}

📅 Date: ${new Date(stop.date).toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
🕐 Spectacle: ${stop.time}
🚪 Arrivée équipe: ${stop.checkInTime || 'Non défini'}
🚌 Départ: ${stop.departureTime || 'Non défini'}

═══════════════════════════════════════════════════════════

🎭 CASTING
${stop.artistLineup.length > 0 
  ? stop.artistLineup.map(artist => {
      const user = getUserById(artist.userId);
      return `• ${user?.name || 'Artiste inconnu'} ${artist.confirmed ? '✓ Confirmé' : '⏳ En attente'}`;
    }).join('\n')
  : '• Aucun artiste assigné'
}

═══════════════════════════════════════════════════════════

👥 CAPACITÉ ET BILLETS
• Capacité totale: ${stop.capacity} personnes
• Billets disponibles: ${stop.ticketsAvailable || 'Non défini'}

═══════════════════════════════════════════════════════════

📞 CONTACT LOCAL
${stop.localContact ? `• ${stop.localContact}` : '• Non défini'}
${stop.localContactPhone ? `• Tél: ${stop.localContactPhone}` : ''}

═══════════════════════════════════════════════════════════

🏨 HÉBERGEMENT
${stop.accommodation ? `• ${stop.accommodation}` : '• Non défini'}
${stop.accommodationAddress ? `• ${stop.accommodationAddress}` : ''}

═══════════════════════════════════════════════════════════

🚐 TRANSPORT
${stop.transport || 'Non défini'}

═══════════════════════════════════════════════════════════

🎵 ÉQUIPE TECHNIQUE
${stop.crew && stop.crew.length > 0 
  ? stop.crew.map(crewId => {
      const user = getUserById(crewId);
      return `• ${user?.name || 'Équipe inconnue'}`;
    }).join('\n')
  : '• Aucune équipe assignée'
}

═══════════════════════════════════════════════════════════

📝 NOTES IMPORTANTES
${stop.notes || 'Aucune note spécifique'}

═══════════════════════════════════════════════════════════

📊 STATUT: ${stop.status === 'confirmed' ? '✅ CONFIRMÉ' : 
             stop.status === 'pending' ? '⏳ EN ATTENTE' : 
             '❌ ANNULÉ'}

Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
    `;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `feuille-route-${stop.city}-${stop.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Feuille de Route - ${stop.city}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; color: #8B5CF6; margin-bottom: 10px; }
              .info-line { margin: 5px 0; }
              .status { font-size: 18px; font-weight: bold; text-align: center; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>FEUILLE DE ROUTE</h1>
              <h2>${stop.city} - ${stop.venue}</h2>
            </div>
            
            <div class="section">
              <div class="section-title">📍 LIEU ET HORAIRES</div>
              <div class="info-line"><strong>Lieu:</strong> ${stop.venue}</div>
              <div class="info-line"><strong>Adresse:</strong> ${stop.address}</div>
              <div class="info-line"><strong>Date:</strong> ${new Date(stop.date).toLocaleDateString('fr-FR')}</div>
              <div class="info-line"><strong>Heure spectacle:</strong> ${stop.time}</div>
              <div class="info-line"><strong>Arrivée équipe:</strong> ${stop.checkInTime || 'Non défini'}</div>
              <div class="info-line"><strong>Départ:</strong> ${stop.departureTime || 'Non défini'}</div>
            </div>

            <div class="section">
              <div class="section-title">🎭 CASTING</div>
              ${stop.artistLineup.length > 0 
                ? stop.artistLineup.map(artist => {
                    const user = getUserById(artist.userId);
                    return `<div class="info-line">• ${user?.name || 'Artiste inconnu'} ${artist.confirmed ? '✓ Confirmé' : '⏳ En attente'}</div>`;
                  }).join('')
                : '<div class="info-line">• Aucun artiste assigné</div>'
              }
            </div>

            <div class="section">
              <div class="section-title">👥 CAPACITÉ</div>
              <div class="info-line"><strong>Capacité totale:</strong> ${stop.capacity} personnes</div>
              <div class="info-line"><strong>Billets disponibles:</strong> ${stop.ticketsAvailable || 'Non défini'}</div>
            </div>

            <div class="status">
              STATUT: ${stop.status === 'confirmed' ? '✅ CONFIRMÉ' : 
                       stop.status === 'pending' ? '⏳ EN ATTENTE' : 
                       '❌ ANNULÉ'}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Aperçu - {stop.city}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4 bg-white rounded-lg">
          {/* En-tête */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">FEUILLE DE ROUTE</h1>
            <h2 className="text-xl text-gray-700 mt-2">{stop.city} - {stop.venue}</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(stop.status)}`}>
              {stop.status === 'confirmed' ? 'CONFIRMÉ' : 
               stop.status === 'pending' ? 'EN ATTENTE' : 
               'ANNULÉ'}
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                  Lieu et Adresse
                </h3>
                <p className="text-gray-700">{stop.venue}</p>
                <p className="text-gray-600 text-sm">{stop.address}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  Date et Horaires
                </h3>
                <p className="text-gray-700">{new Date(stop.date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p className="text-gray-600 text-sm">Spectacle: {stop.time}</p>
                {stop.checkInTime && <p className="text-gray-600 text-sm">Arrivée équipe: {stop.checkInTime}</p>}
                {stop.departureTime && <p className="text-gray-600 text-sm">Départ: {stop.departureTime}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  Capacité
                </h3>
                <p className="text-gray-700">Capacité totale: {stop.capacity} personnes</p>
                {stop.ticketsAvailable && <p className="text-gray-600 text-sm">Billets disponibles: {stop.ticketsAvailable}</p>}
              </div>

              {stop.localContact && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Local</h3>
                  <p className="text-gray-700">{stop.localContact}</p>
                  {stop.localContactPhone && <p className="text-gray-600 text-sm">{stop.localContactPhone}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Casting */}
          {stop.artistLineup.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">🎭 Casting</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {stop.artistLineup.map((artist, index) => {
                  const user = getUserById(artist.userId);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{user?.name || 'Artiste inconnu'}</span>
                      <span className={`text-xs px-2 py-1 rounded ${artist.confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {artist.confirmed ? 'Confirmé' : 'En attente'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hébergement et Transport */}
          {(stop.accommodation || stop.transport) && (
            <div className="grid md:grid-cols-2 gap-6">
              {stop.accommodation && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🏨 Hébergement</h3>
                  <p className="text-gray-700">{stop.accommodation}</p>
                  {stop.accommodationAddress && <p className="text-gray-600 text-sm">{stop.accommodationAddress}</p>}
                </div>
              )}
              
              {stop.transport && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🚐 Transport</h3>
                  <p className="text-gray-700">{stop.transport}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {stop.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📝 Notes Importantes</h3>
              <p className="text-gray-700 bg-yellow-50 p-3 rounded">{stop.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
