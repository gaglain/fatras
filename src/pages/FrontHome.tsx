
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
      {/* Hero Section with Arc-style gradient and static texture */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background with static grain texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-cyan-600"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 text-white">
              <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-200 bg-clip-text text-transparent">
                MusiConnect
              </span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto text-white/90 leading-relaxed">
              La plateforme complète pour gérer votre carrière musicale et vos événements
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/front/artists">
                <Button size="lg" className="arc-button text-lg px-8 py-4 w-full sm:w-auto">
                  Découvrir les Artistes
                </Button>
              </Link>
              <Link to="/front/events">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="arc-button-secondary border-white/30 text-white hover:bg-white/20 hover:text-white text-lg px-8 py-4 w-full sm:w-auto"
                >
                  Voir les Événements
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Arc cards */}
      <section className="py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Fonctionnalités Principales
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tout ce dont vous avez besoin pour gérer efficacement votre activité musicale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="arc-card text-center hover:scale-105 transition-all duration-500 group">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-gradient-to-br from-purple-100 to-cyan-50 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-10 w-10 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl lg:text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Arc gradient */}
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-purple-50"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.1) 1px, transparent 0)',
            backgroundSize: '30px 30px'
          }}
        ></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Rejoignez des milliers d'artistes et de professionnels de la musique qui utilisent MusiConnect
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="arc-button text-lg px-8 py-4">
              Accéder au Back-Office
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
