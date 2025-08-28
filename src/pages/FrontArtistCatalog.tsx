import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, MapPin, Calendar, Phone, Mail, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanySettings } from '@/hooks/useCompanySettings';

interface Artist {
  id: string;
  name: string;
  genre: string;
  current_tour: string;
  bio: string;
  image: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  status: string;
}

export const FrontArtistCatalog: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const companySettings = useCompanySettings();

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      // Récupérer tous les artistes actifs depuis toutes les entreprises
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des artistes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Chargement des spectacles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {companySettings.logo ? (
                <img 
                  src={companySettings.logo} 
                  alt={companySettings.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Music className="h-10 w-10 text-primary" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{companySettings.name}</h1>
                <p className="text-sm text-muted-foreground">Catalogue de spectacles</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Découvrez nos
            <span className="text-primary block">spectacles</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Un catalogue complet d'artistes et de spectacles pour tous vos événements.
            Trouvez l'artiste parfait pour votre occasion.
          </p>
        </div>
      </section>

      {/* Artists Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {artists.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Aucun spectacle disponible</h3>
              <p className="text-muted-foreground">Notre catalogue est en cours de mise à jour.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist) => (
                <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {artist.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{artist.name}</CardTitle>
                        <Badge variant="secondary" className="mt-2">
                          {artist.genre}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {artist.current_tour && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Tournée : {artist.current_tour}</span>
                      </div>
                    )}
                    
                    {artist.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {artist.bio}
                      </p>
                    )}

                    <div className="space-y-2 pt-4 border-t">
                      {artist.contact_email && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <a 
                            href={`mailto:${artist.contact_email}`}
                            className="text-primary hover:underline"
                          >
                            {artist.contact_email}
                          </a>
                        </div>
                      )}
                      
                      {artist.contact_phone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-primary" />
                          <a 
                            href={`tel:${artist.contact_phone}`}
                            className="text-primary hover:underline"
                          >
                            {artist.contact_phone}
                          </a>
                        </div>
                      )}
                      
                      {artist.website && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Globe className="h-4 w-4 text-primary" />
                          <a 
                            href={artist.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Site web
                          </a>
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Demander un devis
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8 text-foreground">
            Besoin d'informations ?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contactez-nous pour organiser votre événement avec l'un de nos artistes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              <Mail className="h-5 w-5 mr-2" />
              Nous contacter
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <Phone className="h-5 w-5 mr-2" />
              Appeler maintenant
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/40 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {companySettings.logo ? (
              <img 
                src={companySettings.logo} 
                alt={companySettings.name}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Music className="h-8 w-8 text-primary" />
            )}
            <span className="text-lg font-bold text-foreground">{companySettings.name}</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Votre partenaire pour des événements musicaux exceptionnels.
          </p>
          <div className="border-t border-border/40 pt-8 mt-8 text-center text-muted-foreground">
            <p>&copy; 2024 {companySettings.name}. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};