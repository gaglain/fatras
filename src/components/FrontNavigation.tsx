
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
    <nav className="arc-front-header fixed top-0 left-0 right-0 z-50 h-20 bg-gradient-to-r from-background via-[#1a1f2e] to-[#222c45] shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo à gauche + navigation principale */}
          <div className="flex items-center space-x-8 h-full">
            {/* Logo personnalisable */}
            <Link to="/front" className="arc-logo flex items-center space-x-2 text-white font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity select-none">
              {/* Image ou texte logo, modifiable facilement : */}
              <img src="/logo.svg" alt="MusiConnect" className="h-9 w-9 object-contain" style={{filter: 'drop-shadow(0 2px 7px #6b21a8)'}} onError={(e: any) => { e.currentTarget.style.display='none' }} />
              <span>MusiConnect</span>
            </Link>
            {/* Navigation principale */}
            <div className="hidden md:flex items-center space-x-6 h-full">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`arc-nav-link px-4 py-2 rounded h-full flex items-center ${
                    location.pathname === item.path 
                      ? 'text-white bg-white/10 font-bold' 
                      : 'text-white/90 hover:text-white'
                  }`}
                  style={{ transition: 'all 0.14s' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          {/* À droite : Contact + Dark/Light */}
          <div className="flex items-center space-x-3">
            <Link
              to="/front/contact"
              className={`arc-nav-link px-4 py-2 rounded ${
                location.pathname === '/front/contact' 
                  ? 'text-white bg-white/10 font-bold' 
                  : 'text-white/90 hover:text-white'
              }`}
              style={{ transition: 'all 0.14s' }}
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
