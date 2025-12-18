import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FrontLayout } from '@/components/FrontLayout';
import { supabase } from '@/integrations/supabase/client';

interface PageBlock {
  id: string;
  type: string;
  content: any;
}

interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  status: string;
  type?: string;
  blocks?: PageBlock[];
  content?: any; // JSON from Supabase
  seo?: {
    title?: string;
    description?: string;
  };
  meta_title?: string;
  meta_description?: string;
}

export const FrontDynamicPage: React.FC = () => {
  const params = useParams();
  // Supporte à la fois /:slug et /front/*
  const rawSlug = params.slug || params['*'] || '';
  const navigate = useNavigate();
  const [page, setPage] = useState<WebsitePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPage();
  }, [rawSlug]);

  const loadPage = async () => {
    setLoading(true);
    setNotFound(false);
    
    // Normaliser le slug (supprimer le / initial si présent)
    const normalizedSlug = rawSlug?.replace(/^\/+/, '') || '';
    console.log('📄 Loading page with slug:', normalizedSlug);
    
    try {
      // D'abord essayer de charger depuis Supabase
      // Chercher avec plusieurs variantes du slug (avec et sans /)
      const { data: supabasePages, error } = await supabase
        .from('website_pages')
        .select('*')
        .or(`slug.eq.${normalizedSlug},slug.eq./${normalizedSlug}`)
        .in('status', ['published', 'draft'])
        .limit(1);

      console.log('🔍 Supabase query result:', { error, pages: supabasePages });

      if (!error && supabasePages && supabasePages.length > 0) {
        console.log('✅ Page found in Supabase:', supabasePages[0].title);
        setPage(supabasePages[0]);
        setLoading(false);
        return;
      }

      // Fallback: charger depuis localStorage
      const savedPages = localStorage.getItem('websitePages');
      if (savedPages) {
        const parsed = JSON.parse(savedPages);
        const pages: WebsitePage[] = Array.isArray(parsed) ? parsed : [];
        
        console.log('🔍 Searching in localStorage, pages:', pages.map(p => ({ slug: p.slug, title: p.title, status: p.status })));
        
        // Trouver la page correspondante au slug
        const foundPage = pages.find((p: WebsitePage) => {
          const pageSlugNormalized = p.slug?.replace(/^\/+/, '') || '';
          return pageSlugNormalized === normalizedSlug || 
                 pageSlugNormalized.toLowerCase() === normalizedSlug.toLowerCase();
        });
        
        if (foundPage) {
          console.log('✅ Page found in localStorage:', foundPage.title);
          setPage(foundPage);
          setLoading(false);
          return;
        }
      }

      console.log('❌ Page not found for slug:', normalizedSlug);
      setNotFound(true);
    } catch (error) {
      console.error('Error loading page:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const renderBlock = (block: PageBlock) => {
    const content = block.content || {};
    
    switch (block.type) {
      case 'hero':
        return (
          <div
            key={block.id}
            className="relative py-16 lg:py-24 px-4"
            style={content.backgroundImage ? {
              backgroundImage: `url(${content.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)'
            }}
          >
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div className="container mx-auto text-center relative z-10">
              <h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 lg:mb-6"
                style={{ fontWeight: content.titleWeight || 'bold' }}
              >
                {content.title || 'Titre'}
              </h1>
              {content.subtitle && (
                <p 
                  className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 lg:mb-8 max-w-3xl mx-auto"
                  style={{ fontWeight: content.subtitleWeight || 'normal' }}
                >
                  {content.subtitle}
                </p>
              )}
              {content.showButton !== false && content.buttonText && (
                content.buttonLink?.startsWith('#') || content.buttonLink?.startsWith('http') ? (
                  <a 
                    href={content.buttonLink || '#'}
                    target={content.buttonLink?.startsWith('http') ? '_blank' : undefined}
                    rel={content.buttonLink?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center px-6 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors font-medium"
                  >
                    {content.buttonText}
                  </a>
                ) : (
                  <Link 
                    to={content.buttonLink || '/front'}
                    className="inline-flex items-center px-6 py-3 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors font-medium"
                  >
                    {content.buttonText}
                  </Link>
                )
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={block.id} className="py-8 lg:py-12 px-4 bg-background">
            <div className="container mx-auto max-w-4xl">
              <div 
                className={`prose prose-lg max-w-none text-${content.alignment || 'left'}`}
                style={{ 
                  fontSize: content.size === 'small' ? '0.875rem' : content.size === 'large' ? '1.125rem' : '1rem',
                  whiteSpace: 'pre-wrap' 
                }}
              >
                {content.content || content.text || 'Contenu du texte...'}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={block.id} className="py-8 lg:py-12 px-4 bg-background">
            <div className="container mx-auto">
              <div className={`text-${content.alignment || 'center'}`}>
                {content.src && (
                  <img
                    src={content.src}
                    alt={content.alt || ''}
                    className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                  />
                )}
                {content.caption && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {content.caption}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'artist-grid':
      case 'artists':
        return (
          <div key={block.id} className="py-12 lg:py-16 px-4 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
                {content.title || 'Nos Artistes'}
              </h2>
              {content.subtitle && (
                <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                  {content.subtitle}
                </p>
              )}
              <div className="text-center text-muted-foreground">
                <p>Les artistes seront affichés ici</p>
              </div>
            </div>
          </div>
        );

      case 'events':
      case 'events-list':
        return (
          <div key={block.id} className="py-12 lg:py-16 px-4 bg-background">
            <div className="container mx-auto">
              <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
                {content.title || 'Événements'}
              </h2>
              <div className="text-center text-muted-foreground">
                <p>Les événements seront affichés ici</p>
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div key={block.id} className="py-12 lg:py-16 px-4 bg-muted/20">
            <div className="container mx-auto max-w-2xl">
              <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
                {content.title || 'Contact'}
              </h2>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <p className="text-center text-muted-foreground">
                  Formulaire de contact
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={block.id} className="py-8 px-4 bg-background">
            <div className="container mx-auto">
              <div className="text-center text-muted-foreground">
                <p>Bloc de type: {block.type}</p>
              </div>
            </div>
          </div>
        );
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

  if (notFound || !page) {
    return (
      <FrontLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
            <p className="text-lg text-muted-foreground mb-6">Page non trouvée</p>
            <button
              onClick={() => navigate('/front')}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </FrontLayout>
    );
  }

  // Récupérer les blocs de la page (blocks ou content selon la source)
  const pageBlocks = page.blocks || page.content || [];

  return (
    <FrontLayout>
      <div className="min-h-screen">
        {/* En-tête de page si pas de bloc hero */}
        {!pageBlocks.some((b: PageBlock) => b.type === 'hero') && (
          <div className="py-12 lg:py-16 px-4 bg-muted/30">
            <div className="container mx-auto text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {page.title}
              </h1>
            </div>
          </div>
        )}

        {/* Rendu des blocs */}
        {pageBlocks.length > 0 ? (
          pageBlocks.map((block: PageBlock) => renderBlock(block))
        ) : (
          <div className="py-16 px-4">
            <div className="container mx-auto text-center text-muted-foreground">
              <p>Cette page n'a pas encore de contenu.</p>
              <p className="text-sm mt-2">Éditez la page dans le gestionnaire de site web pour ajouter des blocs.</p>
            </div>
          </div>
        )}
      </div>
    </FrontLayout>
  );
};
