import React, { useState, useEffect } from 'react';
import { FrontLayout } from '@/components/FrontLayout';
import { BlockEditor } from '@/components/website/BlockEditor';

export const FrontHome: React.FC = () => {
  const [homePageBlocks, setHomePageBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomePage();
  }, []);

  const loadHomePage = () => {
    try {
      // Charger la page d'accueil depuis le localStorage (ou PageManager)
      const savedPages = localStorage.getItem('websitePages');
      if (savedPages) {
        const pages = JSON.parse(savedPages);
        const homePage = pages.find((page: any) => page.type === 'home' || page.slug === '/');
        
        if (homePage && homePage.blocks) {
          console.log('🏠 Loading home page blocks:', homePage.blocks);
          setHomePageBlocks(homePage.blocks);
        } else {
          // Page d'accueil par défaut si aucune n'est configurée
          setHomePageBlocks([
            {
              id: 'hero-1',
              type: 'hero',
              content: {
                title: 'Bienvenue sur notre site',
                subtitle: 'Découvrez notre univers musical',
                backgroundImage: '',
                buttonText: 'Découvrir nos artistes',
                buttonLink: '/artists'
              }
            },
            {
              id: 'artists-grid-1', 
              type: 'artists-grid',
              content: {
                title: 'Nos Artistes',
                showAll: true
              }
            }
          ]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading home page:', error);
      // Fallback vers la page artistes
      setHomePageBlocks([
        {
          id: 'artists-fallback',
          type: 'artists-grid',
          content: {
            title: 'Nos Spectacles',
            showAll: true
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FrontLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </FrontLayout>
    );
  }

  return (
    <FrontLayout>
      <div className="min-h-screen">
        {homePageBlocks.map((block, index) => (
          <div key={block.id || index} className="block-container">
            {block.type === 'hero' && (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 px-4">
                <div className="container mx-auto text-center">
                  <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                    {block.content?.title || 'Bienvenue'}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                    {block.content?.subtitle || 'Découvrez notre univers'}
                  </p>
                  {block.content?.buttonText && (
                    <a 
                      href={block.content?.buttonLink || '#'}
                      className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {block.content.buttonText}
                    </a>
                  )}
                </div>
              </div>
            )}
            
            {block.type === 'artists-grid' && (
              <div className="py-12 px-4">
                <div className="container mx-auto">
                  <h2 className="text-3xl font-bold text-center mb-8">
                    {block.content?.title || 'Nos Artistes'}
                  </h2>
                  {/* Ici on pourrait intégrer FrontArtistCatalog ou un composant similaire */}
                  <div className="text-center text-muted-foreground">
                    <p>Liste des artistes (à intégrer avec la base de données)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </FrontLayout>
  );
};