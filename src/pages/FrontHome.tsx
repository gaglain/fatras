
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Calendar, Users, ShoppingBag } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const FrontHome: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Accueil - MusiConnect"
        description="Découvrez notre plateforme de booking musical et explorez nos artistes, événements et services."
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Bienvenue sur MusiConnect
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Votre plateforme de booking musical complète. Découvrez nos artistes exceptionnels 
              et créons ensemble des expériences musicales inoubliables.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link to="/front/artists">Découvrir nos artistes</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/front/events">Voir les événements</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ce que nous offrons
              </h2>
              <p className="text-lg text-gray-600">
                Une plateforme complète pour tous vos besoins musicaux
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Music className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Artistes Exceptionnels</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Un roster d'artistes talentueux dans tous les genres musicaux
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Événements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Des concerts et spectacles organisés dans toute la France
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Booking Professionnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Service de booking complet pour vos événements privés et publics
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <ShoppingBag className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <CardTitle>Boutique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Merchandising et produits dérivés de nos artistes
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Prêt à découvrir la musique autrement ?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Contactez-nous pour organiser votre prochain événement musical
            </p>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link to="/front/contact">Nous contacter</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};
