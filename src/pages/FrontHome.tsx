
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Calendar, Users, Star } from 'lucide-react';

export const FrontHome: React.FC = () => {
  const features = [
    {
      icon: Music,
      title: 'Gestion d\'Artistes',
      description: 'Gérez facilement vos artistes et leurs informations.'
    },
    {
      icon: Calendar,
      title: 'Événements',
      description: 'Organisez et suivez tous vos événements musicaux.'
    },
    {
      icon: Users,
      title: 'Contacts',
      description: 'Maintenez un carnet d\'adresses professionnel.'
    },
    {
      icon: Star,
      title: 'Suivi Performance',
      description: 'Analysez les performances de vos artistes.'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              MusiConnect
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              La plateforme complète pour gérer votre carrière musicale et vos événements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/front/artists">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Découvrir les Artistes
                </Button>
              </Link>
              <Link to="/front/events">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-purple-600">
                  Voir les Événements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre activité musicale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'artistes et de professionnels de la musique qui utilisent MusiConnect
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Accéder au Back-Office
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
