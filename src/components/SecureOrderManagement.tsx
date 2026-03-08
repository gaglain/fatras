import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { 
  Package, 
  Mail, 
  Calendar, 
  Euro, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2,
  ShoppingBag,
  User,
  MapPin,
  Search
} from 'lucide-react';
import { useSecureShopOrders, ShopOrder, ShopStats } from '@/hooks/useSecureShopOrders';
import { toast } from 'sonner';

export const SecureOrderManagement: React.FC = () => {
  const { 
    orders, 
    stats, 
    loading, 
    error, 
    updateOrderStatus, 
    deleteOrder,
    getGuestOrderByEmail,
    refreshOrders 
  } = useSecureShopOrders();

  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      completed: 'Terminée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success && selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      const success = await deleteOrder(orderId);
      if (success && selectedOrder?.id === orderId) {
        setIsDetailModalOpen(false);
        setSelectedOrder(null);
      }
    }
  };

  const handleSearchGuestOrder = async () => {
    if (!searchOrderId.trim() || !searchEmail.trim()) {
      toast.error('Veuillez saisir l\'ID de commande et l\'email');
      return;
    }

    const order = await getGuestOrderByEmail(searchOrderId, searchEmail);
    if (order) {
      setSelectedOrder(order);
      setIsDetailModalOpen(true);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (searchEmail && !order.customer_email.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    return true;
  });

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">Erreur: {error}</p>
            <Button onClick={refreshOrders} variant="outline" className="mt-2">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Commandes</p>
                  <h3 className="text-2xl font-bold">{stats.total_orders}</h3>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commandes Terminées</p>
                  <h3 className="text-2xl font-bold">{stats.completed_orders}</h3>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Panier Moyen</p>
                  <h3 className="text-2xl font-bold">{Number(stats.average_order_value).toFixed(2)}€</h3>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                  <h3 className="text-2xl font-bold">{Number(stats.total_revenue).toFixed(2)}€</h3>
                </div>
                <Euro className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Email Client</label>
              <Input
                placeholder="email@exemple.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En traitement</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">ID Commande (recherche invité)</label>
              <Input
                placeholder="ID de commande"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSearchGuestOrder} className="w-full">
                Rechercher Commande Invité
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Commandes ({filteredOrders.length})</span>
            <Button onClick={refreshOrders} variant="outline" size="sm">
              Actualiser
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Chargement des commandes...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{order.customer_name || 'Client anonyme'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{order.customer_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4" />
                          <span className="font-semibold">{order.total_amount}€</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="processing">En traitement</SelectItem>
                          <SelectItem value="shipped">Expédiée</SelectItem>
                          <SelectItem value="completed">Terminée</SelectItem>
                          <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail de commande */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détail de la commande {selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Informations client */}
              <div>
                <h3 className="font-semibold mb-3">Informations Client</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nom:</span> {selectedOrder.customer_name || 'Non spécifié'}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedOrder.customer_email}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div>
                    <span className="font-medium">Statut:</span> 
                    <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              {selectedOrder.customer_address && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse de Livraison
                  </h3>
                  <div className="text-sm bg-muted p-3 rounded">
                    <p>{selectedOrder.customer_address.street}</p>
                    <p>{selectedOrder.customer_address.postalCode} {selectedOrder.customer_address.city}</p>
                    <p>{selectedOrder.customer_address.country}</p>
                  </div>
                </div>
              )}

              {/* Articles commandés */}
              <div>
                <h3 className="font-semibold mb-3">Articles Commandés</h3>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.variation && (
                          <p className="text-sm text-muted-foreground">{item.variation}</p>
                        )}
                        <p className="text-sm">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</p>
                        <p className="text-sm text-muted-foreground">{item.price}€ / unité</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-muted-foreground">Aucun article trouvé</p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{selectedOrder.total_amount}€</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
                <Button onClick={() => setIsDetailModalOpen(false)} className="flex-1">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};