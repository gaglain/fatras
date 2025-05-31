import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Music, ShoppingBag, Star, Heart, Phone, Mail } from 'lucide-react';
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

// Dynamic event types from the system
const eventTypes = [
  { id: '1', name: 'Festival', description: 'Grands événements musicaux' },
  { id: '2', name: 'Concert', description: 'Concerts en salle' },
  { id: '3', name: 'Événement d\'entreprise', description: 'Événements corporatifs' },
  { id: '4', name: 'Événement privé', description: 'Fêtes privées' },
  { id: '5', name: 'Mariage', description: 'Cérémonies de mariage' },
  { id: '6', name: 'Autre', description: 'Autre type d\'événement' }
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
    
    // Simulate creating contact in database
    const newContact = {
      id: `website-contact-${Date.now()}`,
      name: `${contactForm.firstName} ${contactForm.lastName}`,
      phone: contactForm.phone,
      email: contactForm.email,
      ownerId: 'system', // Will be assigned to appropriate user
      source: 'website' as const,
      eventName: contactForm.eventName,
      eventType: contactForm.eventType,
      message: contactForm.message,
      createdAt: new Date().toISOString()
    };
    
    console.log('New contact created:', newContact);
    
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

  const renderArtists = () => (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Artistes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sampleArtists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img src={artist.image} alt={artist.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xl font-bold">{artist.name}</h3>
                    <Badge variant="outline">{artist.genre}</Badge>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{artist.bio}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{artist.upcomingShows} prochains spectacles</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {artist.rating}
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedArtist(artist);
                    setCurrentPage('artist-detail');
                  }}
                  className="w-full"
                >
                  Voir Profil
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  const renderArtistDetail = () => {
    if (!selectedArtist) return null;
    
    return (
      <div className="py-16">
        <div className="container mx-auto px-6">
          <Button 
            onClick={() => setCurrentPage('artists')} 
            variant="outline" 
            className="mb-6"
          >
            ← Retour aux Artistes
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <img src={selectedArtist.image} alt={selectedArtist.name} className="w-full h-64 object-cover rounded-lg mb-4" />
                  <h1 className="text-2xl font-bold mb-2">{selectedArtist.name}</h1>
                  <Badge className="mb-4">{selectedArtist.genre}</Badge>
                  <p className="text-gray-600 mb-4">{selectedArtist.bio}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Prochains spectacles:</span>
                      <span className="font-medium">{selectedArtist.upcomingShows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total spectacles:</span>
                      <span className="font-medium">{selectedArtist.totalShows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Note:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{selectedArtist.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Prochains Spectacles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sampleShows.filter(show => show.artistId === selectedArtist.id).map((show) => (
                        <div key={show.id} className="border rounded-lg p-4">
                          <h4 className="font-medium">{show.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{show.description}</p>
                          <div className="space-y-1">
                            {show.nextDates.map((date, index) => (
                              <div key={index} className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(date.date).toLocaleDateString('fr-FR')} - {date.venue}, {date.city}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShows = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sampleShows.filter(show => selectedArtistFilter === 'all' || show.artistId === selectedArtistFilter).map((show) => (
        <Card key={show.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <img src={show.image} alt={show.title} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{show.title}</h3>
                <p className="text-gray-600 mb-3">{show.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <span>{show.genre}</span>
                  <span>{show.duration}</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {show.rating}
                  </div>
                </div>
                <div className="space-y-2">
                  {show.nextDates.map((date, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                      <span className="font-medium">{new Date(date.date).toLocaleDateString('fr-FR')}</span>
                      <span className="mx-2">-</span>
                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{date.venue}, {date.city}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTour = () => (
    <div className="space-y-6">
      {sampleShows.filter(show => selectedArtistFilter === 'all' || show.artistId === selectedArtistFilter).map((show) => (
        <Card key={show.id}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <span>{show.title}</span>
              <Badge>{show.artist}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {show.nextDates.map((date, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">{new Date(date.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{date.venue}</span>
                  </div>
                  <div className="text-sm text-gray-600">{date.city}</div>
                  <Button size="sm" className="w-full mt-3">Réserver</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderShop = () => (
    <div className="py-16">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Boutique</h2>
          <div className="flex space-x-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="Apparel">Vêtements</SelectItem>
                <SelectItem value="Music">Musique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleMerchandise.filter(item => selectedCategory === 'all' || item.category === selectedCategory).map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-2">{item.artist}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-purple-600">{item.price}€</span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <Button 
                  onClick={() => setSelectedProduct(item)}
                  className="w-full"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Voir Détails
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCheckout = () => (
    <div className="py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <h2 className="text-3xl font-bold mb-8">Panier</h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Votre panier est vide</p>
            <Button onClick={() => setCurrentPage('shop')} className="mt-4">
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.artist}</p>
                          {item.variations && (
                            <p className="text-sm text-gray-500">
                              {Object.entries(item.variations).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{item.price}€</p>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setCart(cart.filter((_, i) => i !== index))}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span>{cart.reduce((sum, item) => sum + item.price, 0)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison:</span>
                      <span>Gratuite</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>{cart.reduce((sum, item) => sum + item.price, 0)}€</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mb-2">Payer par PayPal</Button>
                  <Button variant="outline" className="w-full">Autre mode de paiement</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedProduct.name}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-lg" />
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">{selectedProduct.price}€</span>
              <Badge>{selectedProduct.category}</Badge>
            </div>
            <p className="text-gray-600">Par {selectedProduct.artist}</p>
            
            {selectedProduct.variations && (
              <div className="space-y-3">
                {selectedProduct.variations.map((variation) => (
                  <div key={variation.type}>
                    <label className="block text-sm font-medium mb-1 capitalize">{variation.type}</label>
                    <Select
                      value={selectedVariations[variation.type] || ''}
                      onValueChange={(value) => setSelectedVariations({
                        ...selectedVariations,
                        [variation.type]: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Choisir ${variation.type}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variation.options.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={() => {
                  setCart([...cart, { ...selectedProduct, variations: selectedVariations }]);
                  setSelectedProduct(null);
                  setSelectedVariations({});
                }}
                className="flex-1"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ajouter au Panier
              </Button>
              <Button variant="outline" className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Favoris
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFooter = () => (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-6 w-6" />
              <span className="text-xl font-bold">ShowManager</span>
            </div>
            <p className="text-gray-400">Votre partenaire pour des spectacles inoubliables</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Navigation</h4>
            <div className="space-y-2">
              <button onClick={() => setCurrentPage('artists')} className="block hover:text-purple-400">Artistes</button>
              <button onClick={() => setCurrentPage('shows')} className="block hover:text-purple-400">Spectacles</button>
              <button onClick={() => setCurrentPage('tour')} className="block hover:text-purple-400">Tournée</button>
              <button onClick={() => setCurrentPage('shop')} className="block hover:text-purple-400">Boutique</button>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-400">
              <p>+33 1 23 45 67 89</p>
              <p>contact@showmanager.com</p>
              <p>123 Rue de la Musique<br />75001 Paris</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Suivez-nous</h4>
            <div className="space-y-2 text-gray-400">
              <p>Facebook</p>
              <p>Instagram</p>
              <p>Twitter</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ShowManager. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
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
                    {eventTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
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
