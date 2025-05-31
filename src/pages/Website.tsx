
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Music, ShoppingBag, Users, Star } from 'lucide-react';

const sampleShows = [
  {
    id: '1',
    title: 'Concert Acoustique - Sarah Mitchell',
    artist: 'Sarah Mitchell',
    description: 'Une soirée intimiste avec Sarah Mitchell et ses compositions originales.',
    image: '/placeholder.svg',
    nextDates: [
      { date: '2024-07-15', venue: 'Blue Note Jazz Club', city: 'Paris' },
      { date: '2024-07-22', venue: 'Le Café Concert', city: 'Lyon' }
    ],
    genre: 'Jazz',
    duration: '90 min',
    rating: 4.8
  },
  {
    id: '2',
    title: 'Rock Legends Tour',
    artist: 'Thunder Road',
    description: 'Le légendaire groupe Thunder Road revient sur scène avec leurs plus grands hits.',
    image: '/placeholder.svg',
    nextDates: [
      { date: '2024-08-10', venue: 'Olympia', city: 'Paris' },
      { date: '2024-08-15', venue: 'Radiant Bellevue', city: 'Lyon' }
    ],
    genre: 'Rock',
    duration: '120 min',
    rating: 4.9
  }
];

export const Website: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header du site web */}
      <header className="bg-purple-900 text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Music className="h-8 w-8" />
              <h1 className="text-2xl font-bold">ShowManager Spectacles</h1>
            </div>
            <nav className="flex space-x-6">
              <a href="#spectacles" className="hover:text-purple-200">Spectacles</a>
              <a href="#artistes" className="hover:text-purple-200">Artistes</a>
              <a href="#tournee" className="hover:text-purple-200">Tournée</a>
              <a href="#boutique" className="hover:text-purple-200">Boutique</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">Découvrez Nos Spectacles</h2>
          <p className="text-xl mb-8">Des expériences musicales inoubliables avec nos artistes talentueux</p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
            Voir les Prochaines Dates
          </Button>
        </div>
      </section>

      {/* Spectacles Section */}
      <section id="spectacles" className="py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Nos Spectacles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleShows.map((show) => (
              <Card key={show.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={show.image} 
                    alt={show.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-purple-600">
                    {show.genre}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{show.title}</CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{show.artist}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{show.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{show.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-500">Durée: {show.duration}</div>
                    <div className="text-sm font-medium">Prochaines dates:</div>
                    {show.nextDates.slice(0, 2).map((date, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>{new Date(date.date).toLocaleDateString()}</span>
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{date.venue}, {date.city}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Réserver des Places
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tournée Section */}
      <section id="tournee" className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Calendrier de Tournée</h3>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sampleShows.flatMap(show => 
                    show.nextDates.map((date, index) => (
                      <div key={`${show.id}-${index}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {new Date(date.date).getDate()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(date.date).toLocaleDateString('fr-FR', { month: 'short' })}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold">{show.title}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{date.venue}, {date.city}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Billets
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Boutique Section */}
      <section id="boutique" className="py-16">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12">Boutique</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['T-Shirts', 'Albums', 'Posters', 'Accessoires'].map((category) => (
              <Card key={category} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                  <h4 className="font-semibold mb-2">{category}</h4>
                  <p className="text-sm text-gray-600">Découvrez notre collection</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold mb-4">ShowManager</h5>
              <p className="text-gray-400">Votre partenaire pour des spectacles inoubliables</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Spectacles</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Concerts</li>
                <li>Théâtre</li>
                <li>Événements</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@showmanager.com</li>
                <li>Tél: +33 1 23 45 67 89</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Suivez-nous</h5>
              <div className="flex space-x-4">
                {/* Social media icons */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
