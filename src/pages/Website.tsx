import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Music, Play, Download, Phone, Mail, Instagram, Facebook, ArrowRight, Eye, Star, Menu, X, Truck, ShoppingBag, Settings, Upload, Palette } from 'lucide-react';
import { BlockEditor } from '@/components/BlockEditor/BlockEditor';
import { Block } from '@/components/BlockEditor/types';

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

type PageType = 'home' | 'artists' | 'artist-detail' | 'contact' | 'tour' | 'shop';

interface NavigationProps {
  setCurrentPage: (page: PageType) => void;
}

interface ThemeSettings {
  logo: string | null;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: PageType) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  themeSettings: ThemeSettings;
  setThemeSettings: (settings: ThemeSettings) => void;
  isBlockEditor?: boolean;
  setIsBlockEditor?: (value: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  setCurrentPage, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  themeSettings, 
  setThemeSettings,
  isBlockEditor,
  setIsBlockEditor
}) => {
  const [showCustomizer, setShowCustomizer] = useState(false);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setThemeSettings({ ...themeSettings, logo: logoUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCustomColors = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', themeSettings.primaryColor);
    root.style.setProperty('--secondary-color', themeSettings.secondaryColor);
    root.style.setProperty('--accent-color', themeSettings.accentColor);
  };

  React.useEffect(() => {
    applyCustomColors();
  }, [themeSettings]);

  return (
    <>
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {themeSettings.logo ? (
                  <img src={themeSettings.logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }}>
                    <Music className="h-5 w-5 text-white" />
                  </div>
                )}
                <h1 className="text-xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }}>
                  {themeSettings.siteName}
                </h1>
              </div>
            </div>
            
            {/* Menu desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setCurrentPage('home')} 
                className={`text-sm font-medium transition-colors ${currentPage === 'home' ? 'text-[var(--primary-color)]' : 'text-gray-700'}`}
                style={{ color: currentPage === 'home' ? themeSettings.primaryColor : undefined }}
              >
                Accueil
              </button>
              <button 
                onClick={() => setCurrentPage('artists')} 
                className={`text-sm font-medium transition-colors ${currentPage === 'artists' ? 'text-[var(--primary-color)]' : 'text-gray-700'}`}
                style={{ color: currentPage === 'artists' ? themeSettings.primaryColor : undefined }}
              >
                Artistes
              </button>
              <button 
                onClick={() => setCurrentPage('tour')} 
                className={`text-sm font-medium transition-colors ${currentPage === 'tour' ? 'text-[var(--primary-color)]' : 'text-gray-700'}`}
                style={{ color: currentPage === 'tour' ? themeSettings.primaryColor : undefined }}
              >
                Tournée
              </button>
              <button 
                onClick={() => setCurrentPage('shop')} 
                className={`text-sm font-medium transition-colors ${currentPage === 'shop' ? 'text-[var(--primary-color)]' : 'text-gray-700'}`}
                style={{ color: currentPage === 'shop' ? themeSettings.primaryColor : undefined }}
              >
                Boutique
              </button>
              <button 
                onClick={() => setCurrentPage('contact')} 
                className={`text-sm font-medium transition-colors ${currentPage === 'contact' ? 'text-[var(--primary-color)]' : 'text-gray-700'}`}
                style={{ color: currentPage === 'contact' ? themeSettings.primaryColor : undefined }}
              >
                Contact
              </button>
              {setIsBlockEditor && (
                <button 
                  onClick={() => setIsBlockEditor(!isBlockEditor)}
                  className={`text-sm font-medium transition-colors px-3 py-1 rounded-md ${isBlockEditor ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {isBlockEditor ? 'Mode Standard' : 'Mode Éditeur'}
                </button>
              )}
              <button 
                onClick={() => setShowCustomizer(true)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </nav>
            
            {/* Bouton menu mobile */}
            <div className="md:hidden flex items-center space-x-2">
              <button 
                onClick={() => setShowCustomizer(true)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button 
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-md">
              <nav className="flex flex-col space-y-4">
                <button 
                  onClick={() => {
                    setCurrentPage('home');
                    setMobileMenuOpen(false);
                  }} 
                  className={`text-left text-sm font-medium transition-colors hover:text-pink-500 ${currentPage === 'home' ? 'text-pink-500' : 'text-gray-700'}`}
                >
                  Accueil
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('artists');
                    setMobileMenuOpen(false);
                  }} 
                  className={`text-left text-sm font-medium transition-colors hover:text-pink-500 ${currentPage === 'artists' ? 'text-pink-500' : 'text-gray-700'}`}
                >
                  Artistes
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('tour');
                    setMobileMenuOpen(false);
                  }} 
                  className={`text-left text-sm font-medium transition-colors hover:text-pink-500 ${currentPage === 'tour' ? 'text-pink-500' : 'text-gray-700'}`}
                >
                  Tournée
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('shop');
                    setMobileMenuOpen(false);
                  }} 
                  className={`text-left text-sm font-medium transition-colors hover:text-pink-500 ${currentPage === 'shop' ? 'text-pink-500' : 'text-gray-700'}`}
                >
                  Boutique
                </button>
                <button 
                  onClick={() => {
                    setCurrentPage('contact');
                    setMobileMenuOpen(false);
                  }} 
                  className={`text-left text-sm font-medium transition-colors hover:text-pink-500 ${currentPage === 'contact' ? 'text-pink-500' : 'text-gray-700'}`}
                >
                  Contact
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Panneau de personnalisation */}
      {showCustomizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCustomizer(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Personnaliser le site
              </h2>
              <Button variant="ghost" onClick={() => setShowCustomizer(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo du site</label>
                <div className="flex items-center space-x-4">
                  {themeSettings.logo ? (
                    <img src={themeSettings.logo} alt="Logo" className="w-12 h-12 object-contain rounded-lg border" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {themeSettings.logo ? 'Changer' : 'Ajouter'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Nom du site */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du site</label>
                <Input
                  value={themeSettings.siteName}
                  onChange={(e) => setThemeSettings({ ...themeSettings, siteName: e.target.value })}
                  placeholder="Nom de votre site"
                />
              </div>

              {/* Couleurs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Couleurs du thème</label>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Couleur principale</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded border"
                      />
                      <Input
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Couleur secondaire</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={themeSettings.secondaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                        className="w-10 h-10 rounded border"
                      />
                      <Input
                        value={themeSettings.secondaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Couleur d'accent</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={themeSettings.accentColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, accentColor: e.target.value })}
                        className="w-10 h-10 rounded border"
                      />
                      <Input
                        value={themeSettings.accentColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, accentColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Prévisualisations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu</label>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border" style={{ background: `linear-gradient(135deg, ${themeSettings.primaryColor}20, ${themeSettings.secondaryColor}20)` }}>
                    <div className="flex items-center space-x-2">
                      {themeSettings.logo ? (
                        <img src={themeSettings.logo} alt="Logo" className="w-6 h-6 object-contain rounded" />
                      ) : (
                        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }}>
                          <Music className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <span className="font-semibold" style={{ color: themeSettings.primaryColor }}>
                        {themeSettings.siteName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setShowCustomizer(false)}
                className="w-full"
                style={{ background: `linear-gradient(135deg, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }}
              >
                Appliquer les modifications
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const Website: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    logo: null,
    siteName: 'ShowManager',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    accentColor: '#6366f1'
  });
  const [isBlockEditor, setIsBlockEditor] = useState(false);

  // Si on est en mode éditeur de blocs, on charge le composant WebsiteWithEditor
  if (isBlockEditor) {
    const { WebsiteWithEditor } = require('./WebsiteWithEditor');
    return <WebsiteWithEditor />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        themeSettings={themeSettings}
        setThemeSettings={setThemeSettings}
        isBlockEditor={isBlockEditor}
        setIsBlockEditor={setIsBlockEditor}
      />
      
      {/* Inject custom CSS variables */}
      <style>{`
        :root {
          --primary-color: ${themeSettings.primaryColor};
          --secondary-color: ${themeSettings.secondaryColor};
          --accent-color: ${themeSettings.accentColor};
        }
        
        .theme-gradient {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        }
        
        .theme-text {
          background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      
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
            {themeSettings.logo ? (
              <img src={themeSettings.logo} alt="Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain rounded" />
            ) : (
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${themeSettings.primaryColor}, ${themeSettings.secondaryColor})` }}>
                <Music className="h-3 w-3 md:h-4 md:w-4 text-white" />
              </div>
            )}
            <span className="text-lg md:text-xl font-bold">{themeSettings.siteName}</span>
          </div>
          <p className="text-gray-400 text-sm md:text-base">&copy; 2024 {themeSettings.siteName}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
