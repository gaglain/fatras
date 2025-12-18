
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type PageType = 'home' | 'artists' | 'artist-detail' | 'contact' | 'tour' | 'shop';

interface HeroProps {
  setCurrentPage: (page: PageType) => void;
  backgroundImage?: string;
}

export const Hero: React.FC<HeroProps> = ({ setCurrentPage, backgroundImage }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background image */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
      )}
      
      {/* Overlay that appears on hover */}
      <div 
        className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-30'
        }`}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 lg:mb-6 leading-tight tracking-tight">
          Fatras
        </h1>
        
        {/* Presentation text that appears on hover */}
        <div 
          className={`transition-all duration-500 ease-out ${
            isHovered 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-6 lg:mb-8 text-white/90 font-light tracking-wide">
            Spectacle de rue & de scène
          </p>
          <Button 
            onClick={() => setCurrentPage('artists')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 lg:px-8 py-3 text-base lg:text-lg"
          >
            Découvrir nos Spectacles
            <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
