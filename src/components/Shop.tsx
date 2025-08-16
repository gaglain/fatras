
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Star, ShoppingCart } from 'lucide-react';
import { useBackofficeProducts } from '@/hooks/useBackofficeData';
import { SecureShoppingCart, CartItem } from '@/components/SecureShoppingCart';
import { toast } from 'sonner';

export const Shop: React.FC = () => {
  const { products, loading } = useBackofficeProducts();
  const [selectedVariations, setSelectedVariations] = useState<{[productId: string]: string}>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleVariationSelect = (productId: string, variationId: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [productId]: variationId
    }));
  };

  const getSelectedVariation = (product: any) => {
    if (!product.variations || product.variations.length === 0) return null;
    const selectedId = selectedVariations[product.id];
    return product.variations.find((v: any) => v.id === selectedId) || product.variations[0];
  };

  const getDisplayPrice = (product: any) => {
    const selectedVar = getSelectedVariation(product);
    return selectedVar ? selectedVar.price : product.price;
  };

  const getStock = (product: any) => {
    const selectedVar = getSelectedVariation(product);
    return selectedVar ? selectedVar.stockQuantity : product.stockQuantity || 0;
  };

  const addToCart = (product: any) => {
    const selectedVar = getSelectedVariation(product);
    const price = selectedVar ? selectedVar.price : product.price;
    const variationName = selectedVar ? selectedVar.name : undefined;
    
    const existingItemIndex = cartItems.findIndex(item => 
      item.id === product.id + (selectedVar ? `-${selectedVar.id}` : '')
    );

    if (existingItemIndex >= 0) {
      // Augmenter la quantité si l'article existe déjà
      const newCartItems = [...cartItems];
      newCartItems[existingItemIndex].quantity += 1;
      setCartItems(newCartItems);
    } else {
      // Ajouter un nouvel article
      const newItem: CartItem = {
        id: product.id + (selectedVar ? `-${selectedVar.id}` : ''),
        name: product.name,
        price: price,
        quantity: 1,
        variation: variationName,
        image: product.images?.[0]
      };
      setCartItems([...cartItems, newItem]);
    }
    
    toast.success(`${product.name} ajouté au panier`);
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen" style={{
        background: 'var(--custom-background, #f5f5f5)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeProducts = products.filter(p => p.status === 'active');

  return (
    <div className="pt-20 min-h-screen" style={{
      background: 'var(--custom-background, #f5f5f5)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold" style={{
              color: 'var(--custom-text, #18181b)'
            }}>
              Boutique Officielle
            </h1>
            {getTotalCartItems() > 0 && (
              <Button
                onClick={() => setIsCartOpen(true)}
                className="relative"
                style={{
                  backgroundColor: 'var(--custom-buttonBg, #1632f4)',
                  color: 'var(--custom-buttonText, #ffffff)'
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Panier
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {getTotalCartItems()}
                </span>
              </Button>
            )}
          </div>
          <p className="text-lg max-w-2xl mx-auto" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Découvrez notre collection exclusive de produits dérivés et souvenirs
          </p>
        </div>

        {activeProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: 'var(--custom-text, #666666)' }}>
              Aucun produit disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeProducts.map((product) => {
              const selectedVariation = getSelectedVariation(product);
              const hasVariations = product.variations && product.variations.length > 0;
              const stock = getStock(product);
              const displayPrice = getDisplayPrice(product);
              
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group border-0" style={{
                  background: 'var(--custom-cardBg, #ffffff)',
                  borderRadius: '8px'
                }}>
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={product.images?.[0] || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs border-0" style={{
                        background: 'var(--custom-buttonBg, #1632f4)',
                        color: 'var(--custom-buttonText, #ffffff)'
                      }}>
                        {product.category}
                      </Badge>
                      {/* Affichage d'une note par défaut */}
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="ml-1 text-xs" style={{
                          color: 'var(--custom-text, #666666)'
                        }}>4.5</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-2" style={{
                      color: 'var(--custom-cardText, #18181b)'
                    }}>
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="text-xs mb-2 line-clamp-2" style={{
                        color: 'var(--custom-text, #666666)'
                      }}>
                        {product.description}
                      </p>
                    )}
                    
                    {hasVariations && (
                      <div className="mb-3">
                        <Select 
                          value={selectedVariations[product.id] || product.variations[0].id}
                          onValueChange={(value) => handleVariationSelect(product.id, value)}
                        >
                          <SelectTrigger className="w-full text-xs border-0" style={{
                            background: 'var(--custom-background, #f5f5f5)',
                            color: 'var(--custom-text, #18181b)',
                            borderRadius: '4px'
                          }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent style={{
                            background: 'var(--custom-cardBg, #ffffff)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '4px'
                          }}>
                            {product.variations.map((variation: any) => (
                              <SelectItem key={variation.id} value={variation.id} style={{
                                color: 'var(--custom-cardText, #18181b)'
                              }}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{variation.name}</span>
                                  <span className="ml-2 font-medium">{variation.price}€</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold" style={{
                          color: 'var(--custom-cardText, #18181b)'
                        }}>
                          {displayPrice}€
                        </span>
                        <div className="text-xs" style={{
                          color: 'var(--custom-text, #666666)'
                        }}>
                          Stock: {stock}
                        </div>
                      </div>
                      <Button size="sm" disabled={stock === 0} className="border-0" 
                        style={{
                          backgroundColor: stock > 0 ? 'var(--custom-buttonBg, #1632f4)' : 'var(--custom-text, #999999)',
                          color: 'var(--custom-buttonText, #ffffff)',
                          borderRadius: '4px'
                        }}
                        onClick={() => addToCart(product)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        {stock > 0 ? 'Ajouter' : 'Rupture'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-0" style={{
            color: 'var(--custom-buttonBg, #1632f4)',
            borderColor: 'var(--custom-buttonBg, #1632f4)',
            background: 'transparent',
            borderRadius: '4px'
          }}>
            Voir Plus de Produits
          </Button>
        </div>

        {/* Panier sécurisé */}
        <SecureShoppingCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
        />
      </div>
    </div>
  );
};
