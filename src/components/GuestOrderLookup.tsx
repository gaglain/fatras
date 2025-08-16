import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Mail, Calendar, Euro, MapPin, ShoppingBag } from 'lucide-react';
import { useSecureShopOrders, ShopOrder } from '@/hooks/useSecureShopOrders';
import { toast } from 'sonner';

export const GuestOrderLookup: React.FC = () => {
  const { getGuestOrderByEmail } = useSecureShopOrders();
  const [searchData, setSearchData] = useState({
    orderId: '',
    email: ''
  });
  const [foundOrder, setFoundOrder] = useState<ShopOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearch = async () => {
    if (!searchData.orderId.trim() || !searchData.email.trim()) {
      toast.error('Veuillez saisir l\'ID de commande et votre email');
      return;
    }

    setIsSearching(true);
    try {
      const order = await getGuestOrderByEmail(searchData.orderId, searchData.email);
      if (order) {
        setFoundOrder(order);
        toast.success('Commande trouvée !');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Suivi de Commande</h1>
          <p className="text-lg text-gray-600">
            Retrouvez les détails de votre commande
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Rechercher ma commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="orderId">ID de Commande *</Label>
                <Input
                  id="orderId"
                  value={searchData.orderId}
                  onChange={(e) => setSearchData({ ...searchData, orderId: e.target.value })}
                  placeholder="ID de votre commande"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={searchData.email}
                  onChange={(e) => setSearchData({ ...searchData, email: e.target.value })}
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </Button>
          </CardContent>
        </Card>

        {foundOrder && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Commande {foundOrder.id}
                </span>
                <Badge className={getStatusColor(foundOrder.status)}>
                  {getStatusLabel(foundOrder.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Commandé le {new Date(foundOrder.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-lg">
                    {foundOrder.total_amount}€
                  </span>
                </div>
              </div>

              {/* Articles commandés */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Articles Commandés
                </h3>
                <div className="space-y-3">
                  {Array.isArray(foundOrder.items) ? foundOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.variation && (
                          <p className="text-sm text-gray-500">{item.variation}</p>
                        )}
                        <p className="text-sm">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</p>
                        <p className="text-sm text-gray-500">{item.price}€ / unité</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500">Aucun article trouvé</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{foundOrder.total_amount}€</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};