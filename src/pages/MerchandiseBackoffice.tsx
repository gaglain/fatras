
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Eye,
  Settings
} from 'lucide-react';
import { Shop } from '@/components/Shop';

const mockProducts = [
  {
    id: 1,
    name: 'T-shirt Concert Tour 2024',
    price: 25.99,
    stock: 150,
    category: 'Vêtements',
    status: 'active',
    sales: 89
  },
  {
    id: 2,
    name: 'Poster Artiste Principal',
    price: 15.50,
    stock: 75,
    category: 'Décoration',
    status: 'active',
    sales: 34
  },
  {
    id: 3,
    name: 'CD Album Collector',
    price: 20.00,
    stock: 25,
    category: 'Musique',
    status: 'low_stock',
    sales: 67
  }
];

export const MerchandiseBackoffice: React.FC = () => {
  const [products] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'low_stock': return 'Stock faible';
      case 'out_of_stock': return 'Rupture';
      default: return 'Inconnu';
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{
            color: 'var(--custom-text, #18181b)'
          }}>
            Gestion Merchandise
          </h1>
          <p className="mt-2" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Gérez vos produits et visualisez la boutique publique
          </p>
        </div>
        <Button style={{
          backgroundColor: 'var(--custom-buttonBg, #1632f4)',
          color: 'var(--custom-buttonText, #ffffff)'
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management">
            <Settings className="h-4 w-4 mr-2" />
            Gestion
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Aperçu Boutique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card style={{
              background: 'var(--custom-cardBg, #ffffff)',
              color: 'var(--custom-cardText, #18181b)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8" style={{
                    color: 'var(--custom-buttonBg, #1632f4)'
                  }} />
                  <div>
                    <p className="text-2xl font-bold" style={{
                      color: 'var(--custom-cardText, #18181b)'
                    }}>
                      {products.length}
                    </p>
                    <p className="text-sm" style={{
                      color: 'var(--custom-text, #666666)'
                    }}>
                      Produits
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: 'var(--custom-cardBg, #ffffff)',
              color: 'var(--custom-cardText, #18181b)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8" style={{
                    color: 'var(--custom-buttonBg, #1632f4)'
                  }} />
                  <div>
                    <p className="text-2xl font-bold" style={{
                      color: 'var(--custom-cardText, #18181b)'
                    }}>
                      1,247€
                    </p>
                    <p className="text-sm" style={{
                      color: 'var(--custom-text, #666666)'
                    }}>
                      Revenus
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: 'var(--custom-cardBg, #ffffff)',
              color: 'var(--custom-cardText, #18181b)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-8 w-8" style={{
                    color: 'var(--custom-buttonBg, #1632f4)'
                  }} />
                  <div>
                    <p className="text-2xl font-bold" style={{
                      color: 'var(--custom-cardText, #18181b)'
                    }}>
                      190
                    </p>
                    <p className="text-sm" style={{
                      color: 'var(--custom-text, #666666)'
                    }}>
                      Ventes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{
              background: 'var(--custom-cardBg, #ffffff)',
              color: 'var(--custom-cardText, #18181b)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold" style={{
                      color: 'var(--custom-cardText, #18181b)'
                    }}>
                      250
                    </p>
                    <p className="text-sm" style={{
                      color: 'var(--custom-text, #666666)'
                    }}>
                      Stock Total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Management */}
          <Card style={{
            background: 'var(--custom-cardBg, #ffffff)',
            color: 'var(--custom-cardText, #18181b)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle style={{
                  color: 'var(--custom-cardText, #18181b)'
                }}>
                  Gestion des Produits
                </CardTitle>
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  style={{
                    color: 'var(--custom-text, #18181b)',
                    borderColor: 'var(--custom-buttonBg, #1632f4)'
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg" style={{
                    borderColor: 'rgba(0,0,0,0.1)'
                  }}>
                    <div className="flex-1">
                      <h3 className="font-medium" style={{
                        color: 'var(--custom-cardText, #18181b)'
                      }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm" style={{
                        color: 'var(--custom-text, #666666)'
                      }}>
                        <span>Prix: {product.price}€</span>
                        <span>Stock: {product.stock}</span>
                        <span>Ventes: {product.sales}</span>
                        <Badge className={getStatusColor(product.status)}>
                          {getStatusLabel(product.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" style={{
                        color: 'var(--custom-buttonBg, #1632f4)',
                        borderColor: 'var(--custom-buttonBg, #1632f4)'
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card style={{
            background: 'var(--custom-cardBg, #ffffff)',
            color: 'var(--custom-cardText, #18181b)',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
            <CardHeader>
              <CardTitle style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Aperçu de la Boutique Publique
              </CardTitle>
              <p style={{
                color: 'var(--custom-text, #666666)'
              }}>
                Voici comment vos clients voient la boutique
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4" style={{
                borderColor: 'rgba(0,0,0,0.1)',
                background: 'var(--custom-background, #ffffff)'
              }}>
                <Shop />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
