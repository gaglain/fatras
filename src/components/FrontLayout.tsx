
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FrontNavigation } from './FrontNavigation';

interface FrontLayoutProps {
  children?: React.ReactNode;
}

export const FrontLayout: React.FC<FrontLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen arc-front-bg">
      <FrontNavigation />
      <main className="flex-1 pt-20">
        {children || <Outlet />}
      </main>
      <footer className="arc-footer text-white py-12 mt-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(147, 51, 234, 0.1) 1px, transparent 0)',
              backgroundSize: '30px 30px'
            }}
          ></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold arc-text-primary">
                MusiConnect
              </h3>
              <p className="arc-text-secondary leading-relaxed">
                Votre plateforme de gestion musicale complète.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold arc-text-primary">Liens rapides</h3>
              <ul className="space-y-3 arc-text-secondary">
                <li><a href="/" className="hover:text-blue-400 transition-colors duration-300">Accueil</a></li>
                <li><a href="/artists" className="hover:text-blue-400 transition-colors duration-300">Artistes</a></li>
                <li><a href="/events" className="hover:text-blue-400 transition-colors duration-300">Événements</a></li>
                <li><a href="/contact" className="hover:text-blue-400 transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold arc-text-primary">Contact</h3>
              <div className="arc-text-secondary space-y-2">
                <p>Email: contact@musiconnect.com</p>
                <p>Téléphone: +33 1 23 45 67 89</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700/50 mt-12 pt-8 text-center arc-text-secondary">
            <p>&copy; 2024 MusiConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
