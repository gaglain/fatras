
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';

interface MerchItem {
  id: string;
  name: string;
  artist: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  revenue: number;
}

interface MerchSummary {
  totalRevenue: number;
  totalItemsSold: number;
  lowStockItems: number;
  topSellingItem: string;
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

export const Merchandise: React.FC = () => {
  const [merchItems, setMerchItems] = useState<MerchItem[]>(sampleMerchItems);
  const [showAddForm, setShowAddForm] = useState(false);

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
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Merch Item
        </Button>
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

      {/* Add Merch Item Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add Merchandise Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Item Name" />
              <Input placeholder="Artist" />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="">Category</option>
                  <option value="Apparel">Apparel</option>
                  <option value="Music">Music</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Posters">Posters</option>
                </select>
                <Input type="number" placeholder="Price ($)" />
              </div>
              <Input type="number" placeholder="Initial Stock Quantity" />
              <textarea 
                placeholder="Description (optional)"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
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
