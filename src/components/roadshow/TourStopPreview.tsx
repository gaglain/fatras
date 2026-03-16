import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TourStop } from '@/types/roadshow.types';
import { MapPin, Calendar, Clock, Users, Download, Printer, FileText, DollarSign, Contact, CalendarDays, Plus, Trash2, Image as ImageIcon, Eye, X, Music, Route, CheckCircle } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { TourStopTravelInfo } from './TourStopTravelInfo';
import { TourStopRouteMap } from './TourStopRouteMap';
import { useRoadshowExpenses, RoadshowExpense } from '@/hooks/useRoadshowExpenses';
import { useRoadshowEntityConnections, RoadshowEntityConnection } from '@/hooks/useRoadshowEntityConnections';
import { useShowBibleSetlists } from '@/hooks/useShowBibleSetlists';
import { Badge } from '@/components/ui/badge';
import { ShowBibleSetlistEditor } from '@/components/ShowBibleSetlistEditor';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const { expenses, createExpense, deleteExpense, loading: expenseLoading, fetchExpenses } = useRoadshowExpenses(stop?.id);
  const [connections, setConnections] = useState<{
    contacts: RoadshowEntityConnection[];
    events: RoadshowEntityConnection[];
    quotes: RoadshowEntityConnection[];
    contracts: RoadshowEntityConnection[];
  }>({ contacts: [], events: [], quotes: [], contracts: [] });

  // Expense form state
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseFile, setExpenseFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (stop && isOpen) {
      loadData();
    }
    // Reset form when dialog closes
    if (!isOpen) {
      resetExpenseForm();
    }
  }, [stop?.id, isOpen]);

  const loadData = async () => {
    if (!stop) return;
    
    const expensesData = await getExpenses(stop.id);
    setExpenses(expensesData);
    
    const connectionsData = await getRoadshowConnections(stop.id);
    setConnections(connectionsData);
  };

  const resetExpenseForm = () => {
    setShowAddExpense(false);
    setExpenseTitle('');
    setExpenseDescription('');
    setExpenseAmount('');
    setExpenseFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (isImage || isPdf) {
        setExpenseFile(file);
        // Create preview for images
        if (isImage) {
          const reader = new FileReader();
          reader.onload = (e) => setPreviewUrl(e.target?.result as string);
          reader.readAsDataURL(file);
        } else {
          setPreviewUrl(null);
        }
      } else {
        alert('Seuls les images et PDF sont acceptés');
      }
    }
  };

  const handleAddExpense = async () => {
    if (!stop || !expenseFile || !expenseTitle) return;

    const success = await createExpense(
      stop.id,
      expenseTitle,
      expenseFile,
      expenseDescription,
      expenseAmount ? parseFloat(expenseAmount) : undefined
    );

    if (success) {
      resetExpenseForm();
      loadData();
    }
  };

  const confirmAction = useConfirm();
  const handleDeleteExpense = async (expense: RoadshowExpense) => {
    const ok = await confirmAction({ title: 'Supprimer', description: 'Supprimer cette note de frais ?', variant: 'destructive' });
    if (ok) {
      const success = await deleteExpense(expense.id, expense.file_url);
      if (success) {
        loadData();
      }
    }
  };

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

🎟️ INVITATIONS
${stop.invitations || 'Aucune invitation spécifique'}

═══════════════════════════════════════════════════════════

🔧 ÉQUIPEMENT
${stop.equipment && stop.equipment.length > 0 
  ? stop.equipment.map(eq => `• ${eq}`).join('\n')
  : '• Aucun équipement listé'
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
      <DialogContent className="sm:max-w-4xl overflow-x-hidden">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex flex-col gap-3">
            <span className="text-base sm:text-xl font-semibold">Aperçu - {stop.city}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint} className="flex-1 sm:flex-none h-9 text-xs sm:text-sm">
                <Printer className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Imprimer</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="flex-1 sm:flex-none h-9 text-xs sm:text-sm">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Télécharger</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="roadmap" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="roadmap" className="text-xs sm:text-sm px-2">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Feuille de</span> Route
            </TabsTrigger>
            <TabsTrigger value="trajet" className="text-xs sm:text-sm px-2">
              <Route className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Trajet
            </TabsTrigger>
            <TabsTrigger value="setlist" className="text-xs sm:text-sm px-2">
              <Music className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Setlist
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="mt-3 sm:mt-4">
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 bg-white rounded-lg">
          {/* En-tête */}
          <div className="text-center border-b pb-3 sm:pb-4">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">FEUILLE DE ROUTE</h1>
            <h2 className="text-sm sm:text-xl text-gray-700 mt-1 sm:mt-2">{stop.city} - {stop.venue}</h2>
            <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mt-2 ${getStatusColor(stop.status)}`}>
              {stop.status === 'confirmed' ? 'CONFIRMÉ' : 
               stop.status === 'pending' ? 'EN ATTENTE' : 
               'ANNULÉ'}
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {/* Lieu */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 flex items-center text-sm sm:text-base">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-600 flex-shrink-0" />
                Lieu et Adresse
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">{stop.venue || 'Non défini'}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{stop.address || 'Adresse non définie'}</p>
            </div>

            {/* Date et Horaires */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 flex items-center text-sm sm:text-base">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-600 flex-shrink-0" />
                Date et Horaires
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">{new Date(stop.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {(stop.meetingPointTime || stop.meetingPointLocation) && (
                  <div className="w-full mb-1 bg-purple-50 dark:bg-purple-950/30 rounded px-2 py-1">
                    <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 uppercase font-medium">📍 RDV: </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground">
                      {stop.meetingPointTime || ''} {stop.meetingPointLocation ? `— ${stop.meetingPointLocation}` : ''}
                    </span>
                    {stop.departureToShowTime && (
                      <span className="ml-3 text-[10px] sm:text-xs text-muted-foreground">
                        🚗 Départ spectacle: <span className="font-medium">{stop.departureToShowTime}</span>
                      </span>
                    )}
                  </div>
                )}
                <div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Spectacle: </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{stop.time || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Arrivée: </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{stop.checkInTime || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Départ: </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{stop.departureTime || '-'}</span>
                </div>
              </div>
            </div>

            {/* Capacité et Contact - 2 cols sur mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center text-xs sm:text-sm">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0" />
                  Capacité
                </h3>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stop.capacity || 0}</p>
                <p className="text-[10px] sm:text-xs text-gray-500">personnes</p>
                {stop.ticketsAvailable && (
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{stop.ticketsAvailable} billets</p>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center text-xs sm:text-sm">
                  <span className="mr-1 sm:mr-2">📞</span>
                  Contact
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 truncate">{stop.localContact || 'Non défini'}</p>
                <p className="text-[10px] sm:text-xs text-gray-600 truncate">{stop.localContactPhone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Casting */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🎭 Casting</h3>
            {stop.artistLineup.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {stop.artistLineup.map((artist, index) => {
                    const artistUser = getUserById(artist.userId);
                    const isCurrentUser = artist.userId === user?.id;
                    return (
                      <div key={index} className={`flex items-center gap-2 px-2 py-1.5 rounded-full text-xs sm:text-sm ${isCurrentUser ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50'}`}>
                        <span className="text-gray-700">{artistUser?.name || 'Artiste inconnu'}</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${artist.confirmed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        {isCurrentUser && !artist.confirmed && (
                          <span className="text-[10px] text-muted-foreground">(vous)</span>
                        )}
                        {isCurrentUser && artist.confirmed && (
                          <span className="text-[10px] text-green-600">(confirmé)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(() => {
                  const currentUserInLineup = stop.artistLineup.find(a => a.userId === user?.id);
                  if (!currentUserInLineup) return null;
                  return (
                    <Button
                      size="sm"
                      variant={currentUserInLineup.confirmed ? "outline" : "default"}
                      className="mt-2"
                      onClick={async () => {
                        try {
                          const { error } = await supabase.rpc('confirm_roadshow_attendance', {
                            stop_id: stop.id,
                            is_confirmed: !currentUserInLineup.confirmed
                          });
                          if (error) throw error;
                          toast.success(currentUserInLineup.confirmed ? 'Présence annulée' : 'Présence confirmée !');
                          currentUserInLineup.confirmed = !currentUserInLineup.confirmed;
                          setExpenseTitle(prev => prev + '');
                        } catch {
                          toast.error('Erreur lors de la confirmation');
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {currentUserInLineup.confirmed ? 'Annuler ma confirmation' : 'Confirmer ma présence'}
                    </Button>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">Aucun artiste assigné</p>
            )}
          </div>

          {/* Hébergement et Transport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">🏨 Hébergement</h3>
              <p className="text-xs sm:text-sm text-gray-700 truncate">{stop.accommodation || 'Non défini'}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 truncate">{stop.accommodationAddress || '-'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">🚐 Transport</h3>
              <p className="text-xs sm:text-sm text-gray-700">{stop.transport || 'Non défini'}</p>
            </div>
          </div>

          {/* Trajet & Frais de déplacement */}
          <TourStopTravelInfo
            stopId={stop.id}
            stopAddress={stop.address}
            stopCity={stop.city}
          />

          {/* Invitations */}
          {stop.invitations && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">🎟️ Invitations</h3>
              <p className="text-xs sm:text-sm text-gray-700 bg-purple-50 p-2 sm:p-3 rounded whitespace-pre-wrap">{stop.invitations}</p>
            </div>
          )}

          {/* Notes */}
          {stop.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">📝 Notes</h3>
              <p className="text-xs sm:text-sm text-gray-700 bg-yellow-50 p-2 sm:p-3 rounded whitespace-pre-wrap">{stop.notes}</p>
            </div>
          )}

          {/* Équipe technique */}
          {stop.crew && stop.crew.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🎵 Équipe Technique</h3>
              <div className="flex flex-wrap gap-2">
                {stop.crew.map((crewId) => {
                  const user = getUserById(crewId);
                  return (
                    <span key={crewId} className="px-2 py-1 bg-gray-100 rounded-full text-xs sm:text-sm text-gray-700">
                      {user?.name || 'Équipe inconnue'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Équipement */}
          {stop.equipment && stop.equipment.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🔧 Équipement</h3>
              <div className="flex flex-wrap gap-2">
                {stop.equipment.map((eq, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm">
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes de frais */}
          <div className="border-t pt-3 sm:pt-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600" />
                Frais ({expenses.length})
              </h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                {showAddExpense ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
                <span className="ml-1 hidden sm:inline">{showAddExpense ? 'Annuler' : 'Ajouter'}</span>
              </Button>
            </div>

            {/* Add expense form */}
            {showAddExpense && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 space-y-2 sm:space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="expense-title" className="text-xs sm:text-sm">Titre *</Label>
                    <Input
                      id="expense-title"
                      value={expenseTitle}
                      onChange={(e) => setExpenseTitle(e.target.value)}
                      placeholder="Ex: Repas"
                      className="bg-white h-8 sm:h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-amount" className="text-xs sm:text-sm">Montant (€)</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-white h-8 sm:h-10 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expense-description" className="text-xs sm:text-sm">Description</Label>
                  <Textarea
                    id="expense-description"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="Détails..."
                    rows={2}
                    className="bg-white text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-file" className="text-xs sm:text-sm">Fichier *</Label>
                  <Input
                    id="expense-file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="bg-white h-8 sm:h-10 text-xs sm:text-sm"
                  />
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Aperçu" 
                      className="mt-2 max-h-20 sm:max-h-32 rounded border"
                    />
                  )}
                  {expenseFile && !previewUrl && (
                    <p className="text-xs text-muted-foreground mt-1">
                      📄 {expenseFile.name}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleAddExpense}
                  disabled={!expenseTitle || !expenseFile || expenseLoading}
                  className="w-full h-8 sm:h-10 text-xs sm:text-sm"
                >
                  {expenseLoading ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            )}

            {/* Expenses list with visual preview */}
            {expenses.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="bg-gray-50 rounded-lg overflow-hidden border">
                    {/* Visual preview */}
                    <div className="aspect-square bg-gray-200 relative overflow-hidden">
                      {expense.file_type === 'image' ? (
                        <img 
                          src={expense.file_url} 
                          alt={expense.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                          <span className="absolute bottom-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">PDF</span>
                        </div>
                      )}
                      {/* Overlay actions */}
                      <div className="absolute top-1 right-1 flex gap-0.5">
                        <a 
                          href={expense.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
                        </a>
                        <button 
                          onClick={() => handleDeleteExpense(expense)}
                          className="p-1 bg-white/90 rounded-full hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-2">
                      <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{expense.title}</p>
                      {expense.amount && (
                        <p className="text-xs sm:text-sm font-semibold text-purple-600">
                          {expense.amount}€
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <FileText className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-1 opacity-50" />
                <p className="text-xs sm:text-sm">Aucune note de frais</p>
              </div>
            )}
          </div>

          {/* Entités liées */}
          {(connections.contacts.length > 0 || connections.events.length > 0 || 
            connections.quotes.length > 0 || connections.contracts.length > 0) && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">🔗 Entités Liées</h3>
              
              {connections.contacts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Contact className="h-3 w-3 mr-1" />
                    Contacts ({connections.contacts.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {connections.contacts.map((contact) => (
                      <Badge key={contact.id} variant="outline">
                        {contact.title}
                        {contact.role && <span className="ml-1 text-xs">({contact.role})</span>}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {connections.events.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Événements ({connections.events.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {connections.events.map((event) => (
                      <Badge key={event.id} variant="outline">
                        {event.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {connections.quotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Devis ({connections.quotes.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {connections.quotes.map((quote) => (
                      <Badge 
                        key={quote.id} 
                        variant="outline"
                        className="cursor-default"
                      >
                        {quote.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {connections.contracts.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    Contrats ({connections.contracts.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {connections.contracts.map((contract) => (
                      <Badge key={contract.id} variant="outline">
                        {contract.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
          </TabsContent>

          <TabsContent value="trajet" className="mt-3 sm:mt-4">
            <div className="space-y-4 p-2 sm:p-4 bg-white rounded-lg">
              <TourStopRouteMap
                stopId={stop.id}
                stopAddress={stop.address}
                stopCity={stop.city}
                height="400px"
              />
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
