import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useSecureShopOrders, CreateOrderData } from '@/hooks/useSecureShopOrders';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variation?: string;
  image?: string;
}

interface SecureShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const SecureShoppingCart: React.FC<SecureShoppingCartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const { createGuestOrder } = useSecureShopOrders();
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    }
  });

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerData.email.trim()) {
      toast.error('Veuillez saisir votre email');
      return;
    }

    if (!customerData.name.trim()) {
      toast.error('Veuillez saisir votre nom');
      return;
    }

    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }

    setIsProcessingOrder(true);

    try {
      const orderData: CreateOrderData = {
        customer_email: customerData.email,
        customer_name: customerData.name,
        total_amount: totalAmount,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variation: item.variation || null,
          image: item.image || null
        })),
        currency: 'EUR',
        customer_address: customerData.address.street ? customerData.address : null
      };

      const orderId = await createGuestOrder(orderData);

      if (orderId) {
        toast.success(`Commande créée avec succès ! ID: ${orderId}`);
        onClearCart();
        setCustomerData({
          email: '',
          name: '',
          address: {
            street: '',
            city: '',
            postalCode: '',
            country: 'France'
          }
        });
        onClose();
      }
    } catch {
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Panier ({totalItems} {totalItems > 1 ? 'articles' : 'article'})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Articles du panier */}
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Votre panier est vide</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.variation && (
                        <p className="text-sm text-muted-foreground">{item.variation}</p>
                      )}
                      <p className="font-semibold">{item.price}€</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{totalAmount.toFixed(2)}€</span>
                </div>
              </div>

              {/* Formulaire client */}
              <div className="space-y-4">
                <h3 className="font-semibold">Informations de livraison</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        email: e.target.value
                      })}
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerName">Nom complet *</Label>
                    <Input
                      id="customerName"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        name: e.target.value
                      })}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerStreet">Adresse</Label>
                  <Input
                    id="customerStreet"
                    value={customerData.address.street}
                    onChange={(e) => setCustomerData({
                      ...customerData,
                      address: { ...customerData.address, street: e.target.value }
                    })}
                    placeholder="Rue, numéro"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="customerCity">Ville</Label>
                    <Input
                      id="customerCity"
                      value={customerData.address.city}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        address: { ...customerData.address, city: e.target.value }
                      })}
                      placeholder="Ville"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPostalCode">Code postal</Label>
                    <Input
                      id="customerPostalCode"
                      value={customerData.address.postalCode}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        address: { ...customerData.address, postalCode: e.target.value }
                      })}
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerCountry">Pays</Label>
                    <Input
                      id="customerCountry"
                      value={customerData.address.country}
                      onChange={(e) => setCustomerData({
                        ...customerData,
                        address: { ...customerData.address, country: e.target.value }
                      })}
                      placeholder="France"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={onClearCart} className="flex-1">
                  Vider le panier
                </Button>
                <Button 
                  onClick={handleSubmitOrder} 
                  disabled={isProcessingOrder}
                  className="flex-1"
                >
                  {isProcessingOrder ? 'Traitement...' : `Commander (${totalAmount.toFixed(2)}€)`}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};