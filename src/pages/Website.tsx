import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Music, Play, Download, Phone, Mail, Instagram, Facebook, ArrowRight, Eye, Star, Menu, X, Truck, ShoppingBag } from 'lucide-react';

const sampleArtists = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    image: '/placeholder.svg',
    bio: 'Groupe de rock emblématique avec plus de 10 ans de carrière et une présence scénique électrisante qui fait vibrer les foules du monde entier.',
    upcomingShows: 8,
    totalShows: 150,
    rating: 4.9,
    videos: [
      { title: 'Live at Madison Square', url: '/placeholder.svg', type: 'performance' },
      { title: 'Behind the Scenes', url: '/placeholder.svg', type: 'documentary' }
    ],
    audio: [
      { title: 'Greatest Hits Album', url: '/placeholder.svg', duration: '45:30' },
      { title: 'Live Session', url: '/placeholder.svg', duration: '23:15' }
    ],
    documents: [
      { title: 'Rider Technique', url: '/placeholder.svg', type: 'pdf' },
      { title: 'Set List', url: '/placeholder.svg', type: 'pdf' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    genre: 'Folk/Acoustique',
    image: '/placeholder.svg',
    bio: 'Artiste folk avec une voix envoûtante et des compositions originales qui touchent le cœur et racontent des histoires authentiques.',
    upcomingShows: 3,
    totalShows: 45,
    rating: 4.7,
    videos: [
      { title: 'Acoustic Session', url: '/placeholder.svg', type: 'performance' }
    ],
    audio: [
      { title: 'Folk Stories EP', url: '/placeholder.svg', duration: '28:45' }
    ],
    documents: [
      { title: 'Technical Rider', url: '/placeholder.svg', type: 'pdf' }
    ]
  }
];

const eventTypes = [
  { id: '1', name: 'Festival', description: 'Grands événements musicaux' },
  { id: '2', name: 'Concert', description: 'Concerts en salle' },
  { id: '3', name: 'Événement d\'entreprise', description: 'Événements corporatifs' },
  { id: '4', name: 'Événement privé', description: 'Fêtes privées' },
  { id: '5', name: 'Mariage', description: 'Cérémonies de mariage' }
];

const Header: React.FC<{ currentPage: string; setCurrentPage: (page: string) => void; mobileMenuOpen: boolean; setMobileMenuOpen: (open: boolean) => void }> = ({ currentPage, setCurrentPage, mobileMenuOpen, setMobileMenuOpen }) => (
  <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Music className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ShowManager
          </h1>
        </div>
        
        {/* Menu desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => setCurrentPage('home')} 
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            Accueil
          </button>
          <button 
            onClick={() => setCurrentPage('artists')} 
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'artists' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            Artistes
          </button>
          <button 
            onClick={() => setCurrentPage('tour')} 
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'tour' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            Tournée
          </button>
          <button 
            onClick={() => setCurrentPage('shop')} 
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'shop' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            Boutique
          </button>
          <button 
            onClick={() => setCurrentPage('contact')} 
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'contact' ? 'text-purple-600' : 'text-gray-600'}`}
          >
            Contact
          </button>
        </nav>
        
        {/* Bouton menu mobile */}
        <div className="md:hidden">
          <button 
            className="p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 py-4 bg-white">
          <nav className="flex flex-col space-y-4">
            <button 
              onClick={() => {
                setCurrentPage('home');
                setMobileMenuOpen(false);
              }} 
              className={`text-left text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              Accueil
            </button>
            <button 
              onClick={() => {
                setCurrentPage('artists');
                setMobileMenuOpen(false);
              }} 
              className={`text-left text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'artists' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              Artistes
            </button>
            <button 
              onClick={() => {
                setCurrentPage('tour');
                setMobileMenuOpen(false);
              }} 
              className={`text-left text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'tour' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              Tournée
            </button>
            <button 
              onClick={() => {
                setCurrentPage('shop');
                setMobileMenuOpen(false);
              }} 
              className={`text-left text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'shop' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              Boutique
            </button>
            <button 
              onClick={() => {
                setCurrentPage('contact');
                setMobileMenuOpen(false);
              }} 
              className={`text-left text-sm font-medium transition-colors hover:text-purple-600 ${currentPage === 'contact' ? 'text-purple-600' : 'text-gray-600'}`}
            >
              Contact
            </button>
          </nav>
        </div>
      )}
    </div>
  </header>
);

const Hero: React.FC<{ setCurrentPage: (page: string) => void }> = ({ setCurrentPage }) => (
  <section className="pt-20 pb-16 md:pb-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 min-h-screen flex items-center">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Des Spectacles
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block mt-2">
            Inoubliables
          </span>
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 md:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
          Découvrez nos artistes talentueux et créons ensemble des expériences musicales exceptionnelles pour vos événements
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            onClick={() => setCurrentPage('artists')}
          >
            Découvrir nos Artistes
            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-xl w-full sm:w-auto"
            onClick={() => setCurrentPage('contact')}
          >
            Nous Contacter
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const Artists: React.FC<{ setCurrentPage: (page: string) => void; setSelectedArtist: (artist: any) => void }> = ({ setCurrentPage, setSelectedArtist }) => (
  <section className="pt-20 pb-16 md:pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nos Artistes</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">Découvrez les talents qui font vibrer nos scènes</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {sampleArtists.map((artist) => (
          <Card key={artist.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-white rounded-2xl">
            <div className="relative">
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-full h-48 sm:h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 text-white">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{artist.name}</h3>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs md:text-sm">
                  {artist.genre}
                </Badge>
              </div>
              <div className="absolute top-4 md:top-6 right-4 md:right-6 flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 md:px-3 py-1">
                <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                <span className="text-white font-medium text-xs md:text-sm">{artist.rating}</span>
              </div>
            </div>
            
            <CardContent className="p-4 md:p-6">
              <p className="text-gray-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base line-clamp-3">{artist.bio}</p>
              
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-4 md:space-x-6 text-xs md:text-sm text-gray-500">
                  <div className="text-center">
                    <div className="font-bold text-purple-600 text-base md:text-lg">{artist.upcomingShows}</div>
                    <div className="text-xs">Prochains shows</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600 text-base md:text-lg">{artist.totalShows}</div>
                    <div className="text-xs">Total shows</div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setSelectedArtist(artist);
                  setCurrentPage('artist-detail');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl py-2 md:py-3 text-sm md:text-base"
              >
                <Eye className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Voir le Profil Complet
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const ArtistDetail: React.FC<{ artist: any; setCurrentPage: (page: string) => void }> = ({ artist, setCurrentPage }) => {
  if (!artist) return null;
  
  return (
    <div className="pt-20 pb-16 md:pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          onClick={() => setCurrentPage('artists')} 
          variant="outline" 
          className="mb-6 md:mb-8 rounded-xl"
        >
          ← Retour aux Artistes
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Artist Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 rounded-2xl shadow-xl border-0">
              <div className="relative">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-48 md:h-64 object-cover rounded-t-2xl" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-2xl" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h1 className="text-xl md:text-2xl font-bold">{artist.name}</h1>
                  <Badge className="bg-white/20 text-white border-white/30 mt-2 text-xs md:text-sm">
                    {artist.genre}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Biographie</h3>
                    <p className="text-gray-600 text-xs md:text-sm leading-relaxed">{artist.bio}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-purple-600">{artist.upcomingShows}</div>
                      <div className="text-xs text-gray-500">Prochains spectacles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl md:text-2xl font-bold text-purple-600">{artist.rating}</div>
                      <div className="text-xs text-gray-500">Note moyenne</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Content Sections */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Videos */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  Vidéos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artist.videos?.map((video: any, index: number) => (
                    <div key={index} className="relative group cursor-pointer">
                      <img 
                        src={video.url} 
                        alt={video.title}
                        className="w-full h-24 md:h-32 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <Play className="h-6 w-6 md:h-8 md:w-8 text-white" />
                      </div>
                      <div className="mt-2">
                        <p className="font-medium text-xs md:text-sm">{video.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{video.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audio */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
                  <Music className="mr-2 h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  Enregistrements Audio
                </h3>
                <div className="space-y-3">
                  {artist.audio?.map((track: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Music className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm md:text-base">{track.title}</p>
                          <p className="text-xs md:text-sm text-gray-500">{track.duration}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Play className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="rounded-2xl shadow-lg border-0">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center">
                  <Download className="mr-2 h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                  Documents Techniques
                </h3>
                <div className="space-y-3">
                  {artist.documents?.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Download className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm md:text-base">{doc.title}</p>
                          <p className="text-xs md:text-sm text-gray-500 uppercase">{doc.type}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg">
                        <Download className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contact: React.FC = () => {
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

  return (
    <section className="pt-20 pb-16 md:pb-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">Réservez nos artistes pour vos événements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <Card className="shadow-xl border-0 rounded-2xl">
            <CardContent className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-semibold mb-6">Demande de Booking</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Prénom *"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="Nom *"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <Input
                  placeholder="Téléphone *"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="rounded-xl"
                />

                <Input
                  type="email"
                  placeholder="Email *"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="rounded-xl"
                />

                <Input
                  placeholder="Nom de l'événement *"
                  value={contactForm.eventName}
                  onChange={(e) => setContactForm({ ...contactForm, eventName: e.target.value })}
                  className="rounded-xl"
                />

                <Select value={contactForm.eventType} onValueChange={(value) => setContactForm({ ...contactForm, eventType: value })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Type d'événement *" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Décrivez votre projet..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="min-h-[120px] rounded-xl"
                />

                <Button 
                  onClick={handleContactSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-base md:text-lg py-4 md:py-6 rounded-xl"
                  disabled={!contactForm.firstName || !contactForm.lastName || !contactForm.phone || !contactForm.email || !contactForm.eventName || !contactForm.eventType}
                >
                  Envoyer la Demande
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-xl border-0 rounded-2xl">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-semibold mb-6">Nos Coordonnées</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Téléphone</p>
                      <p className="text-gray-600 text-sm md:text-base">+33 1 23 45 67 89</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Email</p>
                      <p className="text-gray-600 text-sm md:text-base break-all">booking@showmanager.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">Adresse</p>
                      <p className="text-gray-600 text-sm md:text-base">123 Rue de la Musique<br />75001 Paris, France</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-semibold mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Instagram className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Facebook className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

const Tour: React.FC = () => (
  <section className="pt-20 pb-16 md:pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Dates de Tournée</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600">Rejoignez-nous lors de nos prochains spectacles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { date: '15 JUL 2024', venue: 'Olympia', city: 'Paris', status: 'available' },
          { date: '22 JUL 2024', venue: 'Zénith', city: 'Lyon', status: 'sold-out' },
          { date: '30 JUL 2024', venue: 'Palais des Sports', city: 'Marseille', status: 'available' },
          { date: '05 AUG 2024', venue: 'Arena', city: 'Montpellier', status: 'available' },
          { date: '12 AUG 2024', venue: 'Théâtre Antique', city: 'Orange', status: 'few-left' },
          { date: '20 AUG 2024', venue: 'Festival Rock', city: 'Nîmes', status: 'available' }
        ].map((show, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">{show.date}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{show.venue}</h3>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {show.city}
                  </p>
                </div>
                <Badge 
                  className={
                    show.status === 'sold-out' ? 'bg-red-100 text-red-800' :
                    show.status === 'few-left' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }
                >
                  {show.status === 'sold-out' ? 'Complet' : 
                   show.status === 'few-left' ? 'Dernières places' : 'Disponible'}
                </Badge>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                disabled={show.status === 'sold-out'}
              >
                {show.status === 'sold-out' ? 'Complet' : 'Réserver'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const Shop: React.FC = () => (
  <section className="pt-20 pb-16 md:pb-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Boutique</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600">Découvrez nos produits exclusifs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'T-Shirt Noir Logo', price: '25€', image: '/placeholder.svg', category: 'Vêtements' },
          { name: 'Hoodie Premium', price: '45€', image: '/placeholder.svg', category: 'Vêtements' },
          { name: 'Album Vinyl Collector', price: '35€', image: '/placeholder.svg', category: 'Musique' },
          { name: 'Casquette Snapback', price: '20€', image: '/placeholder.svg', category: 'Accessoires' },
          { name: 'Poster Dédicacé', price: '15€', image: '/placeholder.svg', category: 'Collectibles' },
          { name: 'Mug Céramique', price: '12€', image: '/placeholder.svg', category: 'Accessoires' },
          { name: 'CD Album Deluxe', price: '18€', image: '/placeholder.svg', category: 'Musique' },
          { name: 'Sac Tote Bag', price: '22€', image: '/placeholder.svg', category: 'Accessoires' }
        ].map((product, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg rounded-2xl overflow-hidden">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800">
                {product.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-purple-600">{product.price}</span>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export const Website: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'artists' | 'artist-detail' | 'contact' | 'tour' | 'shop'>('home');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      
      {currentPage === 'home' && (
        <>
          <Hero setCurrentPage={setCurrentPage} />
          <Artists setCurrentPage={setCurrentPage} setSelectedArtist={setSelectedArtist} />
        </>
      )}
      
      {currentPage === 'artists' && <Artists setCurrentPage={setCurrentPage} setSelectedArtist={setSelectedArtist} />}
      {currentPage === 'artist-detail' && <ArtistDetail artist={selectedArtist} setCurrentPage={setCurrentPage} />}
      {currentPage === 'tour' && <Tour />}
      {currentPage === 'shop' && <Shop />}
      {currentPage === 'contact' && <Contact />}
      
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Music className="h-3 w-3 md:h-4 md:w-4 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold">ShowManager</span>
          </div>
          <p className="text-gray-400 text-sm md:text-base">&copy; 2024 ShowManager. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
