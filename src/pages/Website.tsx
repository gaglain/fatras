import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Music, ShoppingBag, Users, Star, Filter, Search, Heart, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sampleArtists = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    image: '/placeholder.svg',
    bio: 'Groupe de rock emblématique avec plus de 10 ans de carrière',
    upcomingShows: 8,
    totalShows: 150,
    rating: 4.9
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    genre: 'Folk/Acoustique',
    image: '/placeholder.svg',
    bio: 'Artiste folk avec une voix envoûtante et des compositions originales',
    upcomingShows: 3,
    totalShows: 45,
    rating: 4.7
  }
];

const sampleShows = [
  {
    id: '1',
    title: 'Concert Acoustique - Sarah Mitchell',
    artist: 'Sarah Mitchell',
    artistId: '2',
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
    artistId: '1',
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

const sampleMerchandise = [
  {
    id: '1',
    name: 'T-Shirt Tour 2024',
    artist: 'The Midnight Express',
    artistId: '1',
    price: 25,
    image: '/placeholder.svg',
    category: 'Apparel',
    variations: [
      { type: 'size', options: ['S', 'M', 'L', 'XL'] },
      { type: 'color', options: ['Noir', 'Blanc', 'Gris'] },
      { type: 'gender', options: ['Homme', 'Femme', 'Unisexe'] }
    ]
  },
  {
    id: '2',
    name: 'Album CD Acoustic Sessions',
    artist: 'Sarah Mitchell',
    artistId: '2',
    price: 15,
    image: '/placeholder.svg',
    category: 'Music'
  }
];

export const Website: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<'home' | 'artists' | 'artist-detail' | 'shows' | 'tour' | 'shop' | 'checkout' | 'contact'>('home');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [selectedArtistFilter, setSelectedArtistFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariations, setSelectedVariations] = useState<any>({});
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    eventName: '',
    eventType: '',
    message: ''
  });

  const handleContactSubmit = () => {
    console.log('Creating new contact from website:', contactForm);
    alert('Votre demande de booking a été envoyée avec succès ! Nous vous recontacterons bientôt.');
    setContactForm({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      eventName: '',
      eventType: '',
      message: ''
    });
  };

  const renderHeader = () => (
    <header className="bg-purple-900 text-white">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Music className="h-8 w-8" />
            <h1 className="text-2xl font-bold">ShowManager Spectacles</h1>
          </div>
          <nav className="flex space-x-6">
            <button onClick={() => setCurrentPage('home')} className="hover:text-purple-200">Accueil</button>
            <button onClick={() => setCurrentPage('artists')} className="hover:text-purple-200">Artistes</button>
            <button onClick={() => setCurrentPage('shows')} className="hover:text-purple-200">Spectacles</button>
            <button onClick={() => setCurrentPage('tour')} className="hover:text-purple-200">Tournée</button>
            <button onClick={() => setCurrentPage('shop')} className="hover:text-purple-200">Boutique</button>
            <button onClick={() => setCurrentPage('contact')} className="hover:text-purple-200">Contact</button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-white hover:text-purple-900"
              onClick={() => navigate('/')}
            >
              Back Office
            </Button>
            {cart.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage('checkout')}
                className="text-white border-white hover:bg-white hover:text-purple-900"
              >
                Panier ({cart.length})
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );

  const renderContact = () => (
    <section className="py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Contactez-nous pour vos événements</h2>
          <p className="text-xl text-gray-600">Vous souhaitez booker un de nos spectacles ? Contactez notre équipe !</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card>
            <CardHeader>
              <CardTitle>Demande de Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <Input
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <Input
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Téléphone *</label>
                <Input
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="Votre numéro de téléphone"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="Votre adresse email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom de l'événement *</label>
                <Input
                  value={contactForm.eventName}
                  onChange={(e) => setContactForm({ ...contactForm, eventName: e.target.value })}
                  placeholder="Nom de votre événement"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type d'événement *</label>
                <Select value={contactForm.eventType} onValueChange={(value) => setContactForm({ ...contactForm, eventType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type d'événement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="entreprise">Événement d'entreprise</SelectItem>
                    <SelectItem value="prive">Événement privé</SelectItem>
                    <SelectItem value="mariage">Mariage</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Décrivez votre projet, vos attentes, la date souhaitée..."
                  className="min-h-[120px]"
                />
              </div>

              <Button 
                onClick={handleContactSubmit}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!contactForm.firstName || !contactForm.lastName || !contactForm.phone || !contactForm.email || !contactForm.eventName || !contactForm.eventType}
              >
                Envoyer la Demande
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nos Coordonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-gray-600">+33 1 23 45 67 89</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">booking@showmanager.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-gray-600">123 Rue de la Musique<br />75001 Paris, France</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span>9h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span>10h00 - 16h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span>Fermé</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Réponse Rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Notre équipe s'engage à vous répondre dans les 24h ouvrées. 
                  Pour les demandes urgentes, n'hésitez pas à nous appeler directement.
                </p>
                <Badge className="bg-green-100 text-green-800">
                  Réponse sous 24h garantie
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white">
      {renderHeader()}
      
      {currentPage === 'home' && (
        <>
          <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-5xl font-bold mb-6">Découvrez Nos Spectacles</h2>
              <p className="text-xl mb-8">Des expériences musicales inoubliables avec nos artistes talentueux</p>
              <div className="space-x-4">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Voir les Prochaines Dates
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-purple-600"
                  onClick={() => setCurrentPage('contact')}
                >
                  Nous Contacter
                </Button>
              </div>
            </div>
          </section>
          {renderArtists()}
        </>
      )}
      
      {currentPage === 'artists' && renderArtists()}
      {currentPage === 'artist-detail' && renderArtistDetail()}
      {currentPage === 'contact' && renderContact()}
      {currentPage === 'shows' && (
        <div className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Nos Spectacles</h2>
              <select 
                className="border rounded-md px-4 py-2"
                value={selectedArtistFilter}
                onChange={(e) => setSelectedArtistFilter(e.target.value)}
              >
                <option value="all">Tous les artistes</option>
                {sampleArtists.map(artist => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </div>
            {renderShows()}
          </div>
        </div>
      )}
      {currentPage === 'tour' && (
        <div className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Calendrier de Tournée</h2>
              <select 
                className="border rounded-md px-4 py-2"
                value={selectedArtistFilter}
                onChange={(e) => setSelectedArtistFilter(e.target.value)}
              >
                <option value="all">Tous les artistes</option>
                {sampleArtists.map(artist => (
                  <option key={artist.id} value={artist.id}>{artist.name}</option>
                ))}
              </select>
            </div>
            {renderTour()}
          </div>
        </div>
      )}
      {currentPage === 'shop' && renderShop()}
      {currentPage === 'checkout' && renderCheckout()}
      
      {renderProductModal()}
      
      {renderFooter()}
    </div>
  );
};
