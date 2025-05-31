import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Music, ShoppingBag, Users, Star, Filter, Search, Heart } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState<'home' | 'artists' | 'artist-detail' | 'shows' | 'tour' | 'shop' | 'checkout'>('home');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [selectedArtistFilter, setSelectedArtistFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariations, setSelectedVariations] = useState<any>({});

  const filteredShows = selectedArtistFilter === 'all' 
    ? sampleShows 
    : sampleShows.filter(show => show.artistId === selectedArtistFilter);

  const filteredTour = selectedArtistFilter === 'all'
    ? sampleShows.flatMap(show => show.nextDates.map(date => ({ ...date, show })))
    : sampleShows.filter(show => show.artistId === selectedArtistFilter)
        .flatMap(show => show.nextDates.map(date => ({ ...date, show })));

  const filteredMerchandise = selectedCategory === 'all'
    ? sampleMerchandise
    : sampleMerchandise.filter(item => item.category === selectedCategory);

  const addToCart = (product: any) => {
    const cartItem = {
      ...product,
      variations: selectedVariations,
      quantity: 1,
      cartId: `${product.id}-${Date.now()}`
    };
    setCart(prev => [...prev, cartItem]);
    setSelectedProduct(null);
    setSelectedVariations({});
  };

  const initiatePayPalPayment = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log('Initiation paiement PayPal pour:', total, '€');
    // Simulation du paiement PayPal
    alert(`Redirection vers PayPal pour payer ${total}€`);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleArtists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {setSelectedArtist(artist); setCurrentPage('artist-detail');}}>
              <div className="relative">
                <img src={artist.image} alt={artist.name} className="w-full h-48 object-cover" />
                <Badge className="absolute top-2 right-2 bg-purple-600">{artist.genre}</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{artist.name}</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{artist.rating}</span>
                  <span>• {artist.totalShows} spectacles</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{artist.bio}</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Voir le Profil
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
    
    const artistShows = sampleShows.filter(show => show.artistId === selectedArtist.id);
    const artistMerch = sampleMerchandise.filter(item => item.artistId === selectedArtist.id);

    return (
      <div className="py-16">
        <div className="container mx-auto px-6">
          <Button onClick={() => setCurrentPage('artists')} variant="outline" className="mb-6">
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
                      <span>Spectacles à venir:</span>
                      <span className="font-semibold">{selectedArtist.upcomingShows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total spectacles:</span>
                      <span className="font-semibold">{selectedArtist.totalShows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Note:</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-semibold">{selectedArtist.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Spectacles</h3>
                <div className="grid gap-4">
                  {artistShows.map(show => (
                    <Card key={show.id}>
                      <CardContent className="p-4">
                        <h4 className="font-semibold">{show.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{show.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Durée: {show.duration}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{show.rating}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Merchandise</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artistMerch.map(item => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded mb-2" />
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-green-600 font-bold">{item.price}€</p>
                        <Button size="sm" className="w-full mt-2">Ajouter au Panier</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShop = () => (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Boutique</h2>
        
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Button 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Tous
          </Button>
          <Button 
            variant={selectedCategory === 'Apparel' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('Apparel')}
          >
            Vêtements
          </Button>
          <Button 
            variant={selectedCategory === 'Music' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('Music')}
          >
            Musique
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMerchandise.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <Button 
                  size="sm" 
                  variant="outline"
                  className="absolute top-2 right-2 bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.artist}</p>
                <p className="text-lg font-bold text-green-600 mb-3">{item.price}€</p>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setSelectedProduct(item)}
                >
                  Ajouter au Panier
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4">
          <CardHeader>
            <CardTitle>{selectedProduct.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded" />
            
            {selectedProduct.variations && selectedProduct.variations.map((variation: any) => (
              <div key={variation.type}>
                <label className="block text-sm font-medium mb-2 capitalize">{variation.type}</label>
                <div className="flex flex-wrap gap-2">
                  {variation.options.map((option: string) => (
                    <Button
                      key={option}
                      variant={selectedVariations[variation.type] === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedVariations(prev => ({ ...prev, [variation.type]: option }))}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={() => setSelectedProduct(null)} variant="outline" className="flex-1">
                Annuler
              </Button>
              <Button onClick={() => addToCart(selectedProduct)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Ajouter au Panier - {selectedProduct.price}€
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCheckout = () => (
    <section className="py-16">
      <div className="container mx-auto px-6 max-w-2xl">
        <h2 className="text-3xl font-bold mb-8">Mon Panier</h2>
        
        {cart.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Votre panier est vide</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.cartId}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.artist}</p>
                      {item.variations && Object.entries(item.variations).map(([key, value]) => (
                        <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded mr-1">
                          {key}: {value as string}
                        </span>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.price}€</p>
                      <Button variant="outline" size="sm" onClick={() => setCart(prev => prev.filter(c => c.cartId !== item.cartId))}>
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}€
                  </span>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={initiatePayPalPayment}
                >
                  Payer avec PayPal
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );

  const renderShows = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredShows.map((show) => (
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
  );

  const renderTour = () => (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {filteredTour.map((date, index) => (
              <div
                key={`${date.show.id}-${index}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {new Date(date.date).getDate()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(date.date).toLocaleDateString('fr-FR', {
                        month: 'short',
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{date.show.title}</h4>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFooter = () => (
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
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Voir les Prochaines Dates
              </Button>
            </div>
          </section>
          {renderArtists()}
        </>
      )}
      
      {currentPage === 'artists' && renderArtists()}
      {currentPage === 'artist-detail' && renderArtistDetail()}
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
