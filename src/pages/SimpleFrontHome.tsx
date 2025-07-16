
import React from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { useSimpleWebsiteSync } from '@/hooks/useSimpleWebsiteSync';

export const SimpleFrontHome: React.FC = () => {
  const { config } = useWebsiteConfig();
  const { forceReload } = useSimpleWebsiteSync();

  console.log('🏠 Home rendering with:', config.siteName);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 text-center text-white rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenue sur
          </h1>
          <h2 className="text-5xl md:text-7xl font-bold text-yellow-400 mb-6">
            {config.siteName}
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {config.siteDescription}
          </p>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-lg text-lg transition-colors">
            Découvrir
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
            SERVICES
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez nos services pour une expérience musicale complète
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Artistes */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Artistes</h3>
            <p className="text-gray-600 mb-4">
              Découvrez nos artistes talentueux et leurs créations uniques
            </p>
          </div>

          {/* Événements */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Événements</h3>
            <p className="text-gray-600 mb-4">
              Retrouvez tous nos événements et réservez votre place
            </p>
          </div>

          {/* Contact */}
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Contact</h3>
            <p className="text-gray-600 mb-4">
              Contactez-nous facilement pour tous vos besoins
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
