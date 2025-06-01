
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Music, Play, Download, Phone, Mail, Instagram, Facebook, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sampleArtists = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    image: '/placeholder.svg',
    bio: 'Groupe de rock emblématique avec plus de 10 ans de carrière et une présence scénique électrisante.',
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
    bio: 'Artiste folk avec une voix envoûtante et des compositions originales qui touchent le cœur.',
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

export const Website: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<'home' | 'artists' | 'artist-detail' | 'contact'>('home');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
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
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Music className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ShowManager
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => setCurrentPage('home')} 
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Accueil
            </button>
            <button 
              onClick={() => setCurrentPage('artists')} 
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Artistes
            </button>
            <button 
              onClick={() => setCurrentPage('contact')} 
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Contact
            </button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Back Office
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );

  const renderHero = () => (
    <section className="pt-24 pb-16 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Des Spectacles
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Inoubliables
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Découvrez nos artistes talentueux et créons ensemble des expériences musicales exceptionnelles
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
              onClick={() => setCurrentPage('artists')}
            >
              Découvrir nos Artistes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg"
              onClick={() => setCurrentPage('contact')}
            >
              Nous Contacter
            </Button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderArtists = () => (
    <section className="pt-24 pb-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Nos Artistes</h2>
          <p className="text-xl text-gray-600">Découvrez les talents qui font vibrer nos scènes</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {sampleArtists.map((artist) => (
            <Card key={artist.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{artist.name}</h3>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {artist.genre}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 leading-relaxed">{artist.bio}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{artist.upcomingShows} prochains spectacles</span>
                    <span>★ {artist.rating}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    setSelectedArtist(artist);
                    setCurrentPage('artist-detail');
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir le Profil Complet
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
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Button 
            onClick={() => setCurrentPage('artists')} 
            variant="outline" 
            className="mb-8"
          >
            ← Retour aux Artistes
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Artist Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <div className="relative">
                  <img 
                    src={selectedArtist.image} 
                    alt={selectedArtist.name} 
                    className="w-full h-64 object-cover rounded-t-lg" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h1 className="text-2xl font-bold">{selectedArtist.name}</h1>
                    <Badge className="bg-white/20 text-white border-white/30 mt-2">
                      {selectedArtist.genre}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Biographie</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedArtist.bio}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedArtist.upcomingShows}</div>
                        <div className="text-xs text-gray-500">Prochains spectacles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{selectedArtist.rating}</div>
                        <div className="text-xs text-gray-500">Note moyenne</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Content Sections */}
            <div className="lg:col-span-2 space-y-8">
              {/* Videos */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Play className="mr-2 h-5 w-5 text-purple-600" />
                    Vidéos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedArtist.videos?.map((video, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img 
                          src={video.url} 
                          alt={video.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                        <div className="mt-2">
                          <p className="font-medium text-sm">{video.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{video.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Audio */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Music className="mr-2 h-5 w-5 text-purple-600" />
                    Enregistrements Audio
                  </h3>
                  <div className="space-y-3">
                    {selectedArtist.audio?.map((track, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Music className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{track.title}</p>
                            <p className="text-sm text-gray-500">{track.duration}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Download className="mr-2 h-5 w-5 text-purple-600" />
                    Documents Techniques
                  </h3>
                  <div className="space-y-3">
                    {selectedArtist.documents?.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Download className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-gray-500 uppercase">{doc.type}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
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

  const renderContact = () => (
    <section className="pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Contactez-nous</h2>
          <p className="text-xl text-gray-600">Réservez nos artistes pour vos événements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold mb-6">Demande de Booking</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Prénom *"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                  />
                  <Input
                    placeholder="Nom *"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                  />
                </div>

                <Input
                  placeholder="Téléphone *"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />

                <Input
                  type="email"
                  placeholder="Email *"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />

                <Input
                  placeholder="Nom de l'événement *"
                  value={contactForm.eventName}
                  onChange={(e) => setContactForm({ ...contactForm, eventName: e.target.value })}
                />

                <Select value={contactForm.eventType} onValueChange={(value) => setContactForm({ ...contactForm, eventType: value })}>
                  <SelectTrigger>
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
                  className="min-h-[120px]"
                />

                <Button 
                  onClick={handleContactSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
                  disabled={!contactForm.firstName || !contactForm.lastName || !contactForm.phone || !contactForm.email || !contactForm.eventName || !contactForm.eventType}
                >
                  Envoyer la Demande
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Nos Coordonnées</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-gray-600">+33 1 23 45 67 89</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">booking@showmanager.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-gray-600">123 Rue de la Musique<br />75001 Paris, France</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4">Suivez-nous</h3>
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Instagram className="h-6 w-6" />
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Facebook className="h-6 w-6" />
                  </div>
                </div>
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
          {renderHero()}
          {renderArtists()}
        </>
      )}
      
      {currentPage === 'artists' && renderArtists()}
      {currentPage === 'artist-detail' && renderArtistDetail()}
      {currentPage === 'contact' && renderContact()}
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Music className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">ShowManager</span>
          </div>
          <p className="text-gray-400">&copy; 2024 ShowManager. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
