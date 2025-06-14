
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FrontThemeToggle } from './FrontThemeToggle';

export const FrontNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/front', label: 'Accueil' },
    { path: '/front/artists', label: 'Artistes' },
    { path: '/front/events', label: 'Événements' },
    { path: '/front/shop', label: 'Boutique' },
  ];

  return (
    <nav className="arc-front-header fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo et Navigation Links à gauche */}
          <div className="flex items-center space-x-8">
            {/* Logo personnalisable */}
            <Link to="/front" className="arc-logo">
              MusiConnect
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`arc-nav-link px-4 py-2 ${
                    location.pathname === item.path 
                      ? 'text-white bg-white/10' 
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact et Theme Toggle à droite */}
          <div className="flex items-center space-x-4">
            <Link
              to="/front/contact"
              className={`arc-nav-link px-4 py-2 ${
                location.pathname === '/front/contact' 
                  ? 'text-white bg-white/10' 
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Contact
            </Link>
            <FrontThemeToggle variant="front" />
          </div>
        </div>
      </div>
    </nav>
  );
};
