import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, TrendingUp, DollarSign, ShoppingCart, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductVariation {
  type: 'size' | 'color' | 'gender';
  options: string[];
}

interface MerchItem {
  id: string;
  name: string;
  artist: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  revenue: number;
  variations?: ProductVariation[];
}

interface MerchSummary {
  totalRevenue: number;
  totalItemsSold: number;
  lowStockItems: number;
  topSellingItem: string;
}

interface Sale {
  id: string;
  productId: string;
  productName: string;
  buyerEmail: string;
  amount: number;
  variations?: any;
  date: string;
  paymentMethod: 'paypal' | 'card';
}

const sampleMerchItems: MerchItem[] = [
  {
    id: '1',
    name: 'Summer Tour T-Shirt',
    artist: 'The Midnight Express',
    category: 'Apparel',
    price: 25,
    stock: 150,
    sold: 89,
    revenue: 2225
  },
  {
    id: '2',
    name: 'Acoustic Sessions CD',
    artist: 'Sarah Mitchell',
    category: 'Music',
    price: 15,
    stock: 45,
    sold: 32,
    revenue: 480
  },
  {
    id: '3',
    name: 'Legends Never Die Hoodie',
    artist: 'Thunder Road',
    category: 'Apparel',
    price: 45,
    stock: 8,
    sold: 67,
    revenue: 3015
  },
  {
    id: '4',
    name: 'Band Logo Sticker Pack',
    artist: 'The Midnight Express',
    category: 'Accessories',
    price: 5,
    stock: 200,
    sold: 156,
    revenue: 780
  }
];

const sampleSales: Sale[] = [
  {
    id: '1',
    productId: '1',
    productName: 'Summer Tour T-Shirt',
    buyerEmail: 'john@example.com',
    amount: 25,
    variations: { size: 'L', color: 'Noir' },
    date: '2024-06-15T10:30:00Z',
    paymentMethod: 'paypal'
  }
];

export const Merchandise: React.FC = () => {
  const { toast } = useToast();
  const [merchItems, setMerchItems] = useState<MerchItem[]>([
    {
      id: '1',
      name: 'Summer Tour T-Shirt',
      artist: 'The Midnight Express',
      category: 'Apparel',
      price: 25,
      stock: 150,
      sold: 89,
      revenue: 2225,
      variations: [
        { type: 'size', options: ['S', 'M', 'L', 'XL'] },
        { type: 'color', options: ['Noir', 'Blanc', 'Gris'] },
        { type: 'gender', options: ['Homme', 'Femme', 'Unisexe'] }
      ]
    },
    {
      id: '2',
      name: 'Acoustic Sessions CD',
      artist: 'Sarah Mitchell',
      category: 'Music',
      price: 15,
      stock: 45,
      sold: 32,
      revenue: 480
    },
    {
      id: '3',
      name: 'Legends Never Die Hoodie',
      artist: 'Thunder Road',
      category: 'Apparel',
      price: 45,
      stock: 8,
      sold: 67,
      revenue: 3015
    },
    {
      id: '4',
      name: 'Band Logo Sticker Pack',
      artist: 'The Midnight Express',
      category: 'Accessories',
      price: 5,
      stock: 200,
      sold: 156,
      revenue: 780
    }
  ]);
  const [sales, setSales] = useState<Sale[]>(sampleSales);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSalesPanel, setShowSalesPanel] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    artist: '',
    category: '',
    price: 0,
    stock: 0,
    variations: [] as ProductVariation[]
  });

  // Simulate new sale notification
  const simulateNewSale = () => {
    const newSale: Sale = {
      id: Date.now().toString(),
      productId: '1',
      productName: 'Summer Tour T-Shirt',
      buyerEmail: 'customer@example.com',
      amount: 25,
      variations: { size: 'M', color: 'Noir' },
      date: new Date().toISOString(),
      paymentMethod: 'paypal'
    };
    
    setSales(prev => [newSale, ...prev]);
    
    toast({
      title: "Nouvelle vente !",
      description: `${newSale.productName} vendu pour ${newSale.amount}€`,
    });
  };

  const addVariation = (type: 'size' | 'color' | 'gender') => {
    const defaultOptions = {
      size: ['S', 'M', 'L', 'XL'],
      color: ['Noir', 'Blanc', 'Gris'],
      gender: ['Homme', 'Femme', 'Unisexe']
    };

    setNewProduct(prev => ({
      ...prev,
      variations: [...prev.variations, { type, options: defaultOptions[type] }]
    }));
  };

  const removeVariation = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const summary: MerchSummary = {
    totalRevenue: merchItems.reduce((sum, item) => sum + item.revenue, 0),
    totalItemsSold: merchItems.reduce((sum, item) => sum + item.sold, 0),
    lowStockItems: merchItems.filter(item => item.stock < 20).length,
    topSellingItem: merchItems.reduce((top, item) => item.sold > top.sold ? item : top, merchItems[0])?.name || ''
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Merchandise Management</h1>
          <p className="text-gray-600 mt-2">Track inventory, sales, and revenue for artist merchandise</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={simulateNewSale} variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Simuler Vente
          </Button>
          <Button onClick={() => setShowSalesPanel(true)} variant="outline">
            Ventes ({sales.length})
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Merch Item
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${summary.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Items Sold</p>
                <p className="text-3xl font-bold text-blue-600">{summary.totalItemsSold}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{summary.lowStockItems}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Seller</p>
                <p className="text-lg font-bold text-purple-600 truncate">{summary.topSellingItem}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Merchandise Items */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {merchItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <Badge variant="outline">{item.category}</Badge>
                      {item.stock < 20 && (
                        <Badge className="bg-red-100 text-red-800">Low Stock</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{item.artist}</p>
                    
                    {/* Variations Display */}
                    {item.variations && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Variations disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                          {item.variations.map((variation, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium capitalize">{variation.type}:</span>
                              <span className="ml-1 text-gray-600">{variation.options.join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Price</p>
                        <p className="font-semibold text-green-600">${item.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">In Stock</p>
                        <p className="font-semibold">{item.stock}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sold</p>
                        <p className="font-semibold">{item.sold}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Revenue</p>
                        <p className="font-semibold text-green-600">${item.revenue}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Success Rate</p>
                        <p className="font-semibold">
                          {((item.sold / (item.sold + item.stock)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Restock</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales Panel */}
      {showSalesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historique des Ventes</CardTitle>
                <Button onClick={() => setShowSalesPanel(false)} variant="outline">Fermer</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{sale.productName}</h3>
                      <p className="text-sm text-gray-600">Client: {sale.buyerEmail}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(sale.date).toLocaleDateString()}
                      </p>
                      {sale.variations && (
                        <div className="text-sm text-gray-600 mt-1">
                          Variations: {Object.entries(sale.variations).map(([key, value]) => 
                            `${key}: ${value}`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{sale.amount}€</p>
                      <Badge className={sale.paymentMethod === 'paypal' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {sale.paymentMethod === 'paypal' ? 'PayPal' : 'Carte'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Merch Item Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add Merchandise Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Item Name" 
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({...prev, name: e.target.value}))}
              />
              <Input 
                placeholder="Artist" 
                value={newProduct.artist}
                onChange={(e) => setNewProduct(prev => ({...prev, artist: e.target.value}))}
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({...prev, category: e.target.value}))}
                >
                  <option value="">Category</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Music">Music</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Posters">Posters</option>
                </select>
                <Input 
                  type="number" 
                  placeholder="Price ($)" 
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({...prev, price: Number(e.target.value)}))}
                />
              </div>
              <Input 
                type="number" 
                placeholder="Initial Stock Quantity" 
                value={newProduct.stock}
                onChange={(e) => setNewProduct(prev => ({...prev, stock: Number(e.target.value)}))}
              />

              {/* Product Variations */}
              <div>
                <h4 className="font-medium mb-2">Variations du produit</h4>
                <div className="space-y-3">
                  {newProduct.variations.map((variation, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{variation.type}</span>
                        <Button size="sm" variant="outline" onClick={() => removeVariation(index)}>
                          Supprimer
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">{variation.options.join(', ')}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => addVariation('size')}>
                    + Taille
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addVariation('color')}>
                    + Couleur
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addVariation('gender')}>
                    + Genre
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
