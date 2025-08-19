import React from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export const BackOfficeHeader: React.FC = () => {
  return (
    <header className="shadow-elegant relative border-b transition-all duration-300 bg-background border-border backdrop-blur-sm supports-[backdrop-filter]:bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <img
                src="/logo.svg"
                alt="Fatras Booking"
                className="h-8 w-8 lg:h-9 lg:w-9 object-contain"
                style={{ filter: "drop-shadow(0 2px 7px #1632f4)" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <span className="text-base lg:text-lg font-bold tracking-tight transition-colors duration-300 text-foreground">
                <span className="hidden sm:inline">Fatras Booking</span>
                <span className="sm:hidden">Fatras</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-full flex items-center justify-center">
                U
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground">
                Utilisateur
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};