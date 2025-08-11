
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type PageType = 'home' | 'artists' | 'artist-detail' | 'contact' | 'tour' | 'shop';

interface HeroProps {
  setCurrentPage: (page: PageType) => void;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentPage }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 text-center text-white px-4 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 leading-tight">
          Créons des Moments Magiques
        </h1>
        <p className="text-lg sm:text-xl md:text-xl lg:text-2xl mb-6 lg:mb-8 text-gray-200 max-w-2xl mx-auto px-4">
          Découvrez nos artistes talentueux et créons ensemble des expériences musicales exceptionnelles pour vos événements
        </p>
        <Button 
          onClick={() => setCurrentPage('artists')}
          size="lg"
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 lg:px-8 py-3 text-base lg:text-lg w-full sm:w-auto"
        >
          <span className="hidden sm:inline">Découvrir nos Artistes</span>
          <span className="sm:hidden">Nos Artistes</span>
          <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
        </Button>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl"></div>
    </section>
  );
};
