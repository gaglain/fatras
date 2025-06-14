
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

const topArtists = [
  { name: 'The Midnight Express', shows: 15, revenue: '45,000€', rating: 4.9 },
  { name: 'Sarah Mitchell', shows: 8, revenue: '18,500€', rating: 4.7 },
  { name: 'Thunder Road', shows: 12, revenue: '38,200€', rating: 4.8 },
];

export const TopArtistsCard: React.FC = () => {
  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900">
          <Star className="h-5 w-5 mr-2" />
          Top Artistes - Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topArtists.map((artist, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-brand-primary/30 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{artist.name}</h4>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">{artist.rating}</span>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Spectacles:</span>
                  <span className="font-medium text-gray-900">{artist.shows}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenus:</span>
                  <span className="font-medium text-green-600">{artist.revenue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
