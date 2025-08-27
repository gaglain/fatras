import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Music, Users, Mail, Phone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FrontHome: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">BookingManager</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">À propos</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
              <Button onClick={handleLogin} variant="default">
                Connexion
              </Button>
            </nav>
            <Button onClick={handleLogin} className="md:hidden" size="sm">
              Connexion
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Gérez vos événements musicaux
            <span className="text-primary block">en toute simplicité</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Une solution complète pour organiser, planifier et gérer tous vos événements musicaux, 
            concerts et tournées avec efficacité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleLogin} size="lg" className="text-lg px-8">
              Commencer maintenant
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Découvrir les fonctionnalités
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Tout ce dont vous avez besoin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-primary" />
                  <CardTitle>Gestion d'événements</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Organisez et planifiez tous vos concerts, festivals et événements musicaux en un seul endroit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-primary" />
                  <CardTitle>Gestion des artistes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Centralisez toutes les informations de vos artistes, leurs contrats et leurs disponibilités.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-8 w-8 text-primary" />
                  <CardTitle>Tournées et roadshows</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Planifiez des tournées complètes avec gestion logistique, hébergement et transport.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Mail className="h-8 w-8 text-primary" />
                  <CardTitle>Gestion des contacts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Maintenez une base de données complète de tous vos contacts professionnels.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Globe className="h-8 w-8 text-primary" />
                  <CardTitle>Site web intégré</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Créez et gérez votre site web professionnel directement depuis la plateforme.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Music className="h-8 w-8 text-primary" />
                  <CardTitle>Show Bible</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Stockez et organisez tous vos documents techniques, riders et informations de spectacle.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-8 text-foreground">
              Une solution pensée pour les professionnels
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              BookingManager est né de l'expérience terrain des professionnels de l'événementiel musical. 
              Nous comprenons les défis uniques de votre secteur et avons créé une solution qui s'adapte 
              à votre workflow quotidien.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Événements organisés</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">100+</div>
                <p className="text-muted-foreground">Artistes gérés</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Support disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white/50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-8 text-foreground">
            Prêt à commencer ?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez les professionnels qui font confiance à BookingManager pour gérer leurs événements musicaux.
          </p>
          <Button onClick={handleLogin} size="lg" className="text-lg px-8">
            Démarrer gratuitement
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/40 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Music className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">BookingManager</span>
              </div>
              <p className="text-muted-foreground">
                La solution complète pour la gestion d'événements musicaux.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Gestion d'événements</li>
                <li>Gestion des artistes</li>
                <li>Tournées</li>
                <li>Contacts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Documentation</li>
                <li>Tutoriels</li>
                <li>FAQ</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@bookingmanager.fr</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+33 1 23 45 67 89</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 mt-8 text-center text-muted-foreground">
            <p>&copy; 2024 BookingManager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};