
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BackOfficeHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/front">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au site
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">Back-Office MusiConnect</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/preferences">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <User className="h-4 w-4 mr-2" />
              Profil
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
