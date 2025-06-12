
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Star } from 'lucide-react';

interface ProductVariation {
  id: string;
  size?: string;
  color?: string;
  gender?: string;
  price: number;
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  variations: ProductVariation[];
  rating: number;
}

const products: Product[] = [
  {
    id: '1',
    name: 'T-shirt Logo Band',
    description: 'T-shirt officiel avec logo du groupe',
    basePrice: 25.99,
    category: 'Vêtements',
    status: 'active',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    variations: [
      { id: '1a', size: 'S', color: 'Noir', gender: 'Unisexe', price: 25.99, stock: 10, sku: 'TSHIRT-S-NOIR' },
      { id: '1b', size: 'M', color: 'Noir', gender: 'Unisexe', price: 25.99, stock: 15, sku: 'TSHIRT-M-NOIR' },
      { id: '1c', size: 'L', color: 'Blanc', gender: 'Unisexe', price: 27.99, stock: 8, sku: 'TSHIRT-L-BLANC' }
    ]
  },
  {
    id: '2',
    name: 'Album Vinyle Collector',
    description: 'Edition limitée vinyle collector',
    basePrice: 35.00,
    category: 'Musique',
    status: 'active',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    variations: [
      { id: '2a', price: 35.00, stock: 20, sku: 'VINYL-COLLECTOR' }
    ]
  },
  {
    id: '3',
    name: 'Casquette Thunder Road',
    description: 'Casquette officielle de la tournée',
    basePrice: 20.00,
    category: 'Accessoires',
    status: 'active',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588099768523-f4e6ee8d3c45?w=400',
    variations: [
      { id: '3a', color: 'Noir', price: 20.00, stock: 25, sku: 'CAP-NOIR' },
      { id: '3b', color: 'Bleu', price: 20.00, stock: 18, sku: 'CAP-BLEU' }
    ]
  },
  {
    id: '4',
    name: 'Poster Concert Vintage',
    description: 'Poster de collection des concerts vintage',
    basePrice: 15.00,
    category: 'Décoration',
    status: 'active',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    variations: [
      { id: '4a', price: 15.00, stock: 30, sku: 'POSTER-VINTAGE' }
    ]
  }
];

export const Shop: React.FC = () => {
  const [selectedVariations, setSelectedVariations] = useState<{[productId: string]: string}>({});

  const handleVariationSelect = (productId: string, variationId: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [productId]: variationId
    }));
  };

  const getSelectedVariation = (product: Product) => {
    const selectedId = selectedVariations[product.id];
    return product.variations.find(v => v.id === selectedId) || product.variations[0];
  };

  const getDisplayPrice = (product: Product) => {
    const selectedVar = getSelectedVariation(product);
    return selectedVar ? selectedVar.price : product.basePrice;
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Boutique Officielle
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre collection exclusive de produits dérivés et souvenirs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.filter(p => p.status === 'active').map((product) => {
            const selectedVariation = getSelectedVariation(product);
            const hasVariations = product.variations.length > 1;
            
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-1 text-xs text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  {hasVariations && (
                    <div className="mb-3">
                      <Select 
                        value={selectedVariations[product.id] || product.variations[0].id}
                        onValueChange={(value) => handleVariationSelect(product.id, value)}
                      >
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variations.map((variation) => (
                            <SelectItem key={variation.id} value={variation.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {variation.size && `${variation.size} `}
                                  {variation.color && `${variation.color} `}
                                  {variation.gender && `(${variation.gender})`}
                                </span>
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
                      <span className="text-lg font-bold text-gray-900">
                        {getDisplayPrice(product)}€
                      </span>
                      {selectedVariation && (
                        <div className="text-xs text-gray-500">
                          Stock: {selectedVariation.stock}
                        </div>
                      )}
                    </div>
                    <Button size="sm" disabled={!selectedVariation || selectedVariation.stock === 0}>
                      <ShoppingBag className="h-4 w-4 mr-1" />
                      {selectedVariation && selectedVariation.stock > 0 ? 'Ajouter' : 'Rupture'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Voir Plus de Produits
          </Button>
        </div>
      </div>
    </div>
  );
};
