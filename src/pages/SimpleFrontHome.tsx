import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Calendar, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export const SimpleFrontHome: React.FC = () => {
  const { siteName } = useSiteConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Debug banner temporaire */}
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center text-sm">
        <strong>DEBUG MODE:</strong> Site Name = "{siteName}" | 
        websiteDesign = {localStorage.getItem('websiteDesign') ? 'EXISTS' : 'MISSING'} | 
        websiteSettings = {localStorage.getItem('websiteSettings') ? 'EXISTS' : 'MISSING'}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Bienvenue sur</span>{' '}
                  <span className="block text-yellow-400 xl:inline">{siteName}</span>
                </h1>
                <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Plateforme de gestion artistique complète pour découvrir les talents, 
                  organiser des événements et créer des expériences musicales exceptionnelles.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                      <Link to="/front/artists">
                        Découvrir
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Services
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tout ce dont vous avez besoin
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Découvrez nos services pour une expérience musicale complète
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <Music className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Artistes</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Découvrez nos artistes talentueux et leurs créations uniques
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Événements</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Retrouvez tous nos événements et réservez votre place
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Contact</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Contactez-nous facilement pour tous vos besoins
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
