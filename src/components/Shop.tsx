
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Star } from 'lucide-react';

const products = [
  {
    id: '1',
    name: 'T-Shirt The Midnight Express',
    price: 25,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    rating: 4.8,
    category: 'Vêtements'
  },
  {
    id: '2',
    name: 'Album Vinyl Sarah Mitchell',
    price: 35,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    rating: 4.9,
    category: 'Musique'
  },
  {
    id: '3',
    name: 'Casquette Thunder Road',
    price: 20,
    image: 'https://images.unsplash.com/photo-1588099768523-f4e6ee8d3c45?w=400',
    rating: 4.6,
    category: 'Accessoires'
  },
  {
    id: '4',
    name: 'Poster Concert Vintage',
    price: 15,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    rating: 4.7,
    category: 'Décoration'
  }
];

export const Shop: React.FC = () => {
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
          {products.map((product) => (
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
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {product.price}€
                  </span>
                  <Button size="sm">
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
