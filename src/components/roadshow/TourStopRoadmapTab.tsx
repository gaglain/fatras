import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TourStop } from '@/types/roadshow.types';
import { MapPin, Calendar, Users, FileText, Plus, Trash2, Eye, X, CheckCircle } from 'lucide-react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { TourStopTravelInfo } from './TourStopTravelInfo';
import { useRoadshowExpenses, RoadshowExpense } from '@/hooks/useRoadshowExpenses';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TourStopRoadmapTabProps {
  stop: TourStop;
  getUserById: (userId: string) => { name: string } | undefined;
  expenses: RoadshowExpense[];
  expenseLoading: boolean;
  fetchExpenses: () => void;
  createExpense: (stopId: string, title: string, file: File, description?: string, amount?: number) => Promise<boolean>;
  deleteExpense: (id: string, fileUrl: string) => Promise<boolean>;
}

export const TourStopRoadmapTab: React.FC<TourStopRoadmapTabProps> = ({
  stop, getUserById, expenses, expenseLoading, fetchExpenses, createExpense, deleteExpense,
}) => {
  const { user } = useAuth();
  const [showAddExpense, setShowAddExpense] = React.useState(false);
  const [expenseTitle, setExpenseTitle] = React.useState('');
  const [expenseDescription, setExpenseDescription] = React.useState('');
  const [expenseAmount, setExpenseAmount] = React.useState('');
  const [expenseFile, setExpenseFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const confirmAction = useConfirm();

  const resetForm = () => {
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
      if (file.type.startsWith('image/')) {
        setExpenseFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setExpenseFile(file);
        setPreviewUrl(null);
      } else {
        alert('Seuls les images et PDF sont acceptés');
      }
    }
  };

  const handleAddExpense = async () => {
    if (!expenseFile || !expenseTitle) return;
    const success = await createExpense(stop.id, expenseTitle, expenseFile, expenseDescription, expenseAmount ? parseFloat(expenseAmount) : undefined);
    if (success) { resetForm(); fetchExpenses(); }
  };

  const handleDeleteExpense = async (expense: RoadshowExpense) => {
    const ok = await confirmAction({ title: 'Supprimer', description: 'Supprimer cette note de frais ?', variant: 'destructive' });
    if (ok) { const success = await deleteExpense(expense.id, expense.file_url); if (success) fetchExpenses(); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 bg-white rounded-lg">
      {/* Header */}
      <div className="text-center border-b pb-3 sm:pb-4">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900">FEUILLE DE ROUTE</h1>
        <h2 className="text-sm sm:text-xl text-gray-700 mt-1 sm:mt-2">{stop.city} - {stop.venue}</h2>
        <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mt-2 ${getStatusColor(stop.status)}`}>
          {stop.status === 'confirmed' ? 'CONFIRMÉ' : stop.status === 'pending' ? 'EN ATTENTE' : 'ANNULÉ'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Lieu */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 flex items-center text-sm sm:text-base">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-600 flex-shrink-0" />Lieu et Adresse
          </h3>
          <p className="text-gray-700 text-sm sm:text-base">{stop.venue || 'Non défini'}</p>
          <p className="text-gray-600 text-xs sm:text-sm">{stop.address || 'Adresse non définie'}</p>
        </div>

        {/* Date */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 flex items-center text-sm sm:text-base">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-purple-600 flex-shrink-0" />Date et Horaires
          </h3>
          <p className="text-gray-700 text-sm sm:text-base">{new Date(stop.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {(stop.meetingPointTime || stop.meetingPointLocation) && (
              <div className="w-full mb-1 bg-purple-50 dark:bg-purple-950/30 rounded px-2 py-1">
                <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 uppercase font-medium">📍 RDV: </span>
                <span className="text-xs sm:text-sm font-medium text-foreground">{stop.meetingPointTime || ''} {stop.meetingPointLocation ? `— ${stop.meetingPointLocation}` : ''}</span>
                {stop.departureToShowTime && <span className="ml-3 text-[10px] sm:text-xs text-muted-foreground">🚗 Départ spectacle: <span className="font-medium">{stop.departureToShowTime}</span></span>}
              </div>
            )}
            {stop.checkInTime && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Arrivée: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.checkInTime}</span></div>}
            {stop.soundcheckTime && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Balance: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.soundcheckTime}</span></div>}
            {stop.doorsTime && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Portes: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.doorsTime}</span></div>}
            {stop.showStartTime && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Début show: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.showStartTime}</span></div>}
            <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Spectacle: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.time || '-'}</span></div>
            {stop.showEndTime && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Fin show: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.showEndTime}</span></div>}
            {stop.curfewTime && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Couvre-feu: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.curfewTime}</span></div>}
            {(stop.mealTime || stop.mealLocation) && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">🍽️ Repas: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.mealTime || ''}{stop.mealLocation ? ` — ${stop.mealLocation}` : ''}</span></div>}
            {stop.departureTime && <div><span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Départ: </span><span className="text-xs sm:text-sm font-medium text-foreground">{stop.departureTime}</span></div>}
          </div>
        </div>

        {/* Capacité et Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center text-xs sm:text-sm"><Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600 flex-shrink-0" />Capacité</h3>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{stop.capacity || 0}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">personnes</p>
            {stop.ticketsAvailable && <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{stop.ticketsAvailable} billets</p>}
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1 flex items-center text-xs sm:text-sm"><span className="mr-1 sm:mr-2">📞</span>Contact</h3>
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
                    {isCurrentUser && !artist.confirmed && <span className="text-[10px] text-muted-foreground">(vous)</span>}
                    {isCurrentUser && artist.confirmed && <span className="text-[10px] text-green-600">(confirmé)</span>}
                  </div>
                );
              })}
            </div>
            {(() => {
              const currentUserInLineup = stop.artistLineup.find(a => a.userId === user?.id);
              if (!currentUserInLineup) return null;
              return (
                <Button size="sm" variant={currentUserInLineup.confirmed ? "outline" : "default"} className="mt-2"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.rpc('confirm_roadshow_attendance', { stop_id: stop.id, is_confirmed: !currentUserInLineup.confirmed });
                      if (error) throw error;
                      toast.success(currentUserInLineup.confirmed ? 'Présence annulée' : 'Présence confirmée !');
                      currentUserInLineup.confirmed = !currentUserInLineup.confirmed;
                    } catch { toast.error('Erreur lors de la confirmation'); }
                  }}>
                  <CheckCircle className="h-4 w-4 mr-1" />{currentUserInLineup.confirmed ? 'Annuler ma confirmation' : 'Confirmer ma présence'}
                </Button>
              );
            })()}
          </div>
        ) : <p className="text-gray-500 italic text-sm">Aucun artiste assigné</p>}
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

      <TourStopTravelInfo stopId={stop.id} stopAddress={stop.address} stopCity={stop.city} />

      {stop.invitations && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">🎟️ Invitations</h3>
          <p className="text-xs sm:text-sm text-gray-700 bg-purple-50 p-2 sm:p-3 rounded whitespace-pre-wrap">{stop.invitations}</p>
        </div>
      )}

      {stop.notes && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">📝 Notes</h3>
          <p className="text-xs sm:text-sm text-gray-700 bg-yellow-50 p-2 sm:p-3 rounded whitespace-pre-wrap">{stop.notes}</p>
        </div>
      )}

      {stop.crew && stop.crew.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🎵 Équipe Technique</h3>
          <div className="flex flex-wrap gap-2">
            {stop.crew.map((crewId) => {
              const crewUser = getUserById(crewId);
              return <span key={crewId} className="px-2 py-1 bg-gray-100 rounded-full text-xs sm:text-sm text-gray-700">{crewUser?.name || 'Équipe inconnue'}</span>;
            })}
          </div>
        </div>
      )}

      {stop.equipment && stop.equipment.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">🔧 Équipement</h3>
          <div className="flex flex-wrap gap-2">
            {stop.equipment.map((eq, idx) => <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm">{eq}</span>)}
          </div>
        </div>
      )}

      {/* Notes de frais */}
      <div className="border-t pt-3 sm:pt-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-purple-600" />Frais ({expenses.length})
          </h3>
          <Button size="sm" variant="outline" onClick={() => setShowAddExpense(!showAddExpense)} className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3">
            {showAddExpense ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
            <span className="ml-1 hidden sm:inline">{showAddExpense ? 'Annuler' : 'Ajouter'}</span>
          </Button>
        </div>

        {showAddExpense && (
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3 space-y-2 sm:space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div><Label className="text-xs sm:text-sm">Titre *</Label><Input value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} placeholder="Ex: Repas" className="bg-white h-8 sm:h-10 text-sm" /></div>
              <div><Label className="text-xs sm:text-sm">Montant (€)</Label><Input type="number" step="0.01" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="0.00" className="bg-white h-8 sm:h-10 text-sm" /></div>
            </div>
            <div><Label className="text-xs sm:text-sm">Description</Label><Textarea value={expenseDescription} onChange={(e) => setExpenseDescription(e.target.value)} placeholder="Détails..." rows={2} className="bg-white text-sm" /></div>
            <div>
              <Label className="text-xs sm:text-sm">Fichier *</Label>
              <Input type="file" accept="image/*,.pdf" onChange={handleFileSelect} className="bg-white h-8 sm:h-10 text-xs sm:text-sm" />
              {previewUrl && <img src={previewUrl} alt="Aperçu" className="mt-2 max-h-20 sm:max-h-32 rounded border" />}
              {expenseFile && !previewUrl && <p className="text-xs text-muted-foreground mt-1">📄 {expenseFile.name}</p>}
            </div>
            <Button onClick={handleAddExpense} disabled={!expenseTitle || !expenseFile || expenseLoading} className="w-full h-8 sm:h-10 text-xs sm:text-sm">
              {expenseLoading ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        )}

        {expenses.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-gray-50 rounded-lg overflow-hidden border">
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  {expense.file_type === 'image' ? (
                    <img src={expense.file_url} alt={expense.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                      <span className="absolute bottom-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">PDF</span>
                    </div>
                  )}
                  <div className="absolute top-1 right-1 flex gap-0.5">
                    <a href={expense.file_url} target="_blank" rel="noopener noreferrer" className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors"><Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" /></a>
                    <button onClick={() => handleDeleteExpense(expense)} className="p-1 bg-white/90 rounded-full hover:bg-red-100 transition-colors"><Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" /></button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-medium text-gray-900 truncate text-xs sm:text-sm">{expense.title}</p>
                  {expense.amount && <p className="text-xs sm:text-sm font-semibold text-purple-600">{expense.amount}€</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
            <FileText className="h-6 w-6 sm:h-10 sm:w-10 mx-auto mb-1 opacity-50" /><p className="text-xs sm:text-sm">Aucune note de frais</p>
          </div>
        )}
      </div>
    </div>
  );
};
