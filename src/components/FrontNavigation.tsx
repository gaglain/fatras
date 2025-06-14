
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const FrontNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Accueil', href: '/front' },
    { label: 'Artistes', href: '/front/artists' },
    { label: 'Événements', href: '/front/events' },
    { label: 'Contact', href: '/front/contact' },
  ];

  return (
    <header className="arc-front-header fixed top-0 left-0 right-0 z-50">
      <nav className="arc-nav relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/front" className="arc-logo text-2xl font-bold tracking-tight text-white">
                MusiConnect
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="arc-nav-link px-3 py-2 text-sm font-medium text-white hover:text-accent-pink"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/dashboard">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="arc-button-secondary bg-white text-brand-primary border-white hover:bg-accent-red hover:text-white hover:border-accent-red"
                  >
                    Back-Office
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:bg-white/10"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3 bg-brand-dark rounded-2xl mt-4 border border-white/20">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-white block px-4 py-3 rounded-xl text-base font-medium hover:bg-white/10 hover:text-accent-pink"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="arc-button-secondary mt-3 ml-4 bg-white text-brand-primary border-white hover:bg-accent-red hover:text-white"
                  >
                    Back-Office
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
