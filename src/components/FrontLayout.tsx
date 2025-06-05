
import React from 'react';
import { FrontNavigation } from './FrontNavigation';

interface FrontLayoutProps {
  children: React.ReactNode;
}

export const FrontLayout: React.FC<FrontLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FrontNavigation />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">MusiConnect</h3>
              <p className="text-gray-300">
                Votre plateforme de gestion musicale complète.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/front" className="hover:text-white">Accueil</a></li>
                <li><a href="/front/artists" className="hover:text-white">Artistes</a></li>
                <li><a href="/front/events" className="hover:text-white">Événements</a></li>
                <li><a href="/front/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Email: contact@musiconnect.com<br />
                Téléphone: +33 1 23 45 67 89
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 MusiConnect. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
