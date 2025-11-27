
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TourStop } from '@/types/roadshow.types';
import { MapPin, Calendar, Clock, Users, Download, Printer, FileText, DollarSign, Contact, CalendarDays, Plus, Trash2, Image as ImageIcon, Eye, X } from 'lucide-react';
import { useRoadshowExpenses, RoadshowExpense } from '@/hooks/useRoadshowExpenses';
import { useRoadshowEntityConnections, RoadshowEntityConnection } from '@/hooks/useRoadshowEntityConnections';
import { Badge } from '@/components/ui/badge';

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
  const { getExpenses, createExpense, deleteExpense, loading: expenseLoading } = useRoadshowExpenses();
  const { getRoadshowConnections } = useRoadshowEntityConnections();
  
  const [expenses, setExpenses] = useState<RoadshowExpense[]>([]);
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

  const handleDeleteExpense = async (expense: RoadshowExpense) => {
    if (confirm('Supprimer cette note de frais ?')) {
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
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-lg sm:text-xl">Aperçu - {stop.city}</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Imprimer</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Télécharger</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-2 sm:p-4 bg-white rounded-lg">
          {/* En-tête */}
          <div className="text-center border-b pb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">FEUILLE DE ROUTE</h1>
            <h2 className="text-lg sm:text-xl text-gray-700 mt-2">{stop.city} - {stop.venue}</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(stop.status)}`}>
              {stop.status === 'confirmed' ? 'CONFIRMÉ' : 
               stop.status === 'pending' ? 'EN ATTENTE' : 
               'ANNULÉ'}
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                  Lieu et Adresse
                </h3>
                <p className="text-gray-700">{stop.venue || 'Non défini'}</p>
                <p className="text-gray-600 text-sm">{stop.address || 'Adresse non définie'}</p>
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
                <p className="text-gray-600 text-sm">Spectacle: {stop.time || 'Non défini'}</p>
                <p className="text-gray-600 text-sm">Arrivée équipe: {stop.checkInTime || 'Non défini'}</p>
                <p className="text-gray-600 text-sm">Départ: {stop.departureTime || 'Non défini'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-purple-600" />
                  Capacité
                </h3>
                <p className="text-gray-700">Capacité totale: {stop.capacity || 0} personnes</p>
                <p className="text-gray-600 text-sm">Billets disponibles: {stop.ticketsAvailable || 'Non défini'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📞 Contact Local</h3>
                <p className="text-gray-700">{stop.localContact || 'Non défini'}</p>
                <p className="text-gray-600 text-sm">{stop.localContactPhone || 'Téléphone non défini'}</p>
              </div>
            </div>
          </div>

          {/* Casting */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">🎭 Casting</h3>
            {stop.artistLineup.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            ) : (
              <p className="text-gray-500 italic">Aucun artiste assigné</p>
            )}
          </div>

          {/* Hébergement et Transport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🏨 Hébergement</h3>
              <p className="text-gray-700">{stop.accommodation || 'Non défini'}</p>
              <p className="text-gray-600 text-sm">{stop.accommodationAddress || 'Adresse non définie'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🚐 Transport</h3>
              <p className="text-gray-700">{stop.transport || 'Non défini'}</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📝 Notes Importantes</h3>
            <p className="text-gray-700 bg-yellow-50 p-3 rounded">{stop.notes || 'Aucune note spécifique'}</p>
          </div>

          {/* Équipe technique */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">🎵 Équipe Technique</h3>
            {stop.crew && stop.crew.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stop.crew.map((crewId) => {
                  const user = getUserById(crewId);
                  return (
                    <div key={crewId} className="p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{user?.name || 'Équipe inconnue'}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic">Aucune équipe assignée</p>
            )}
          </div>

          {/* Notes de frais */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-purple-600" />
                Notes de Frais ({expenses.length})
              </h3>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowAddExpense(!showAddExpense)}
              >
                {showAddExpense ? <X className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                {showAddExpense ? 'Annuler' : 'Ajouter'}
              </Button>
            </div>

            {/* Add expense form */}
            {showAddExpense && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expense-title" className="text-sm">Titre *</Label>
                    <Input
                      id="expense-title"
                      value={expenseTitle}
                      onChange={(e) => setExpenseTitle(e.target.value)}
                      placeholder="Ex: Repas équipe"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-amount" className="text-sm">Montant (€)</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      step="0.01"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="expense-description" className="text-sm">Description</Label>
                  <Textarea
                    id="expense-description"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder="Détails..."
                    rows={2}
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label htmlFor="expense-file" className="text-sm">Fichier (Image ou PDF) *</Label>
                  <Input
                    id="expense-file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="bg-white"
                  />
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Aperçu" 
                      className="mt-2 max-h-32 rounded border"
                    />
                  )}
                  {expenseFile && !previewUrl && (
                    <p className="text-sm text-muted-foreground mt-1">
                      📄 {expenseFile.name}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleAddExpense}
                  disabled={!expenseTitle || !expenseFile || expenseLoading}
                  className="w-full sm:w-auto"
                >
                  {expenseLoading ? 'Ajout...' : 'Ajouter la note de frais'}
                </Button>
              </div>
            )}

            {/* Expenses list with visual preview */}
            {expenses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="bg-gray-50 rounded-lg overflow-hidden border">
                    {/* Visual preview */}
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      {expense.file_type === 'image' ? (
                        <img 
                          src={expense.file_url} 
                          alt={expense.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">PDF</span>
                        </div>
                      )}
                      {/* Overlay actions */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <a 
                          href={expense.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <Eye className="h-4 w-4 text-gray-700" />
                        </a>
                        <button 
                          onClick={() => handleDeleteExpense(expense)}
                          className="p-1.5 bg-white/90 rounded-full hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="font-medium text-gray-900 truncate">{expense.title}</p>
                      {expense.description && (
                        <p className="text-sm text-gray-600 truncate">{expense.description}</p>
                      )}
                      {expense.amount && (
                        <p className="text-sm font-semibold text-purple-600 mt-1">
                          {expense.amount}€
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucune note de frais</p>
                <p className="text-sm">Cliquez sur "Ajouter" pour créer une note de frais</p>
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
      </DialogContent>
    </Dialog>
  );
};
