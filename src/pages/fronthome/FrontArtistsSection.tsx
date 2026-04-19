import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/OptimizedImage';
import { sanitizeHtml } from '@/lib/sanitize';

interface FrontArtistsSectionProps {
  artists: any[];
  title?: string;
}

export const FrontArtistsSection: React.FC<FrontArtistsSectionProps> = ({ artists, title }) => {
  return (
    <div className="py-12 px-4 bg-muted/20">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          {title || 'Nos Spectacles'}
        </h2>
        
        {Array.isArray(artists) && artists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                {artist.image && (
                  <div className="relative w-full bg-muted">
                    <OptimizedImage 
                      src={artist.image} 
                      alt={artist.name}
                      className="w-full h-auto"
                      objectFit="contain"
                      intrinsicWidth={600}
                      intrinsicHeight={400}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white mb-1">{artist.name}</h3>
                      {artist.genre && (
                        <Badge className="bg-primary/90 text-primary-foreground">{artist.genre}</Badge>
                      )}
                    </div>
                  </div>
                )}
                {!artist.image && (
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">{artist.name}</h3>
                    {artist.genre && (
                      <Badge variant="outline" className="mb-2">{artist.genre}</Badge>
                    )}
                  </CardContent>
                )}
                {artist.short_description && (
                  <CardContent className="p-4">
                    <div className="text-muted-foreground text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(artist.short_description) }} />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Aucun spectacle enregistré pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};
