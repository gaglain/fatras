
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
    <Card className="hover:shadow-md transition-shadow" style={{
      background: 'var(--custom-cardBg, #ffffff)',
      color: 'var(--custom-cardText, #18181b)',
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center" style={{
          color: 'var(--custom-cardText, #18181b)'
        }}>
          <Star className="h-5 w-5 mr-2" style={{
            color: 'var(--custom-buttonBg, #1632f4)'
          }} />
          Top Artistes - Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topArtists.map((artist, index) => (
            <div key={index} className="p-4 rounded-lg hover:shadow-sm transition-all" style={{
              border: '1px solid rgba(0,0,0,0.1)',
              borderColor: 'rgba(0,0,0,0.1)'
            }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium" style={{
                  color: 'var(--custom-cardText, #18181b)'
                }}>
                  {artist.name}
                </h4>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm" style={{
                    color: 'var(--custom-text, #666666)'
                  }}>
                    {artist.rating}
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-sm" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                <div className="flex justify-between">
                  <span>Spectacles:</span>
                  <span className="font-medium" style={{
                    color: 'var(--custom-cardText, #18181b)'
                  }}>
                    {artist.shows}
                  </span>
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
