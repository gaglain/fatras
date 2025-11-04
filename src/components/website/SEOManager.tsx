
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  FileText, 
  Image, 
  BarChart3, 
  Save,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useWebsiteSEO } from '@/hooks/useWebsiteSEO';

interface SEOSettings {
  siteName: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  googleAnalyticsId: string;
  googleSearchConsoleId: string;
  enableSitemap: boolean;
  enableRobots: boolean;
  robotsContent: string;
}

interface PageSEO {
  pageId: string;
  title: string;
  description: string;
  keywords: string;
  score: number;
  issues: string[];
}

const defaultSEOSettings: SEOSettings = {
  siteName: 'Fatras',
  siteDescription: 'Site officiel de Fatras - Découvrez notre univers musical',
  keywords: 'fatras, musique, artistes, événements, booking',
  ogImage: '',
  twitterCard: 'summary_large_image',
  googleAnalyticsId: '',
  googleSearchConsoleId: '',
  enableSitemap: true,
  enableRobots: true,
  robotsContent: `User-agent: *
Allow: /

Sitemap: ${window.location.origin}/sitemap.xml`
};

export const SEOManager: React.FC = () => {
  const { seoSettings: dbSettings, loading, saveSEOSettings: saveToDb } = useWebsiteSEO();
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(defaultSEOSettings);
  const [pagesSEO, setPagesSEO] = useState<PageSEO[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'pages' | 'tools'>('general');

  useEffect(() => {
    // Charger depuis la base de données
    if (dbSettings && Object.keys(dbSettings).length > 0) {
      setSeoSettings({
        siteName: dbSettings.site_title || '',
        siteDescription: dbSettings.site_description || '',
        keywords: dbSettings.site_keywords || '',
        ogImage: dbSettings.og_image || '',
        twitterCard: (dbSettings.twitter_card_type as any) || 'summary_large_image',
        googleAnalyticsId: dbSettings.google_analytics_id || '',
        googleSearchConsoleId: dbSettings.google_search_console_id || '',
        enableSitemap: true,
        enableRobots: true,
        robotsContent: dbSettings.robots_txt || defaultSEOSettings.robotsContent
      });
    }

    // Analyser les pages existantes
    const savedPages = localStorage.getItem('website_pages');
    console.log('🔍 [SEO] Pages brutes depuis localStorage:', savedPages);
    
    if (savedPages) {
      try {
        const pages = JSON.parse(savedPages);
        console.log('🔍 [SEO] Pages parsées:', pages);
        console.log('🔍 [SEO] Nombre de pages:', pages.length);
        
        const analyzedPages = pages.map((page: any) => {
          console.log('🔍 [SEO] Analyse de la page:', page.title);
          console.log('🔍 [SEO] Structure SEO de la page:', page.seo);
          return analyzePage(page);
        });
        
        console.log('✅ [SEO] Pages analysées:', analyzedPages);
        setPagesSEO(analyzedPages);
      } catch (error) {
        console.error('❌ [SEO] Erreur analyse pages:', error);
      }
    } else {
      console.log('⚠️ [SEO] Aucune page trouvée dans localStorage');
    }
  }, [dbSettings]);

  const analyzePage = (page: any): PageSEO => {
    const issues: string[] = [];
    let score = 100;

    console.log('📊 [SEO] Analyse détaillée de:', page.title);
    console.log('📊 [SEO] page.seo:', page.seo);

    // Analyse du titre
    const seoTitle = page.seo?.title || page.title || '';
    console.log('📊 [SEO] Titre trouvé:', seoTitle, 'Longueur:', seoTitle.length);
    
    if (!seoTitle || seoTitle.length === 0) {
      issues.push('Titre SEO manquant');
      score -= 20;
    } else if (seoTitle.length < 30) {
      issues.push('Titre SEO trop court (< 30 caractères)');
      score -= 10;
    } else if (seoTitle.length > 60) {
      issues.push('Titre SEO trop long (> 60 caractères)');
      score -= 10;
    }

    // Analyse de la description
    const seoDescription = page.seo?.description || '';
    console.log('📊 [SEO] Description trouvée:', seoDescription, 'Longueur:', seoDescription.length);
    
    if (!seoDescription || seoDescription.length === 0) {
      issues.push('Description SEO manquante');
      score -= 20;
    } else if (seoDescription.length < 120) {
      issues.push('Description SEO trop courte (< 120 caractères)');
      score -= 10;
    } else if (seoDescription.length > 160) {
      issues.push('Description SEO trop longue (> 160 caractères)');
      score -= 10;
    }

    // Analyse des mots-clés
    const seoKeywords = page.seo?.keywords || '';
    console.log('📊 [SEO] Mots-clés trouvés:', seoKeywords);
    
    if (!seoKeywords || seoKeywords.length === 0) {
      issues.push('Mots-clés manquants');
      score -= 15;
    }

    // Analyse du contenu
    const hasContent = page.blocks && page.blocks.length > 0;
    console.log('📊 [SEO] Contenu présent:', hasContent, 'Blocs:', page.blocks?.length);
    
    if (!hasContent) {
      issues.push('Contenu de page vide');
      score -= 25;
    }

    const result = {
      pageId: page.id,
      title: page.title,
      description: seoDescription,
      keywords: seoKeywords,
      score: Math.max(0, score),
      issues
    };

    console.log('📊 [SEO] Résultat analyse:', result);
    return result;
  };

  const saveSEOSettings = async () => {
    try {
      await saveToDb({
        site_title: seoSettings.siteName,
        site_description: seoSettings.siteDescription,
        site_keywords: seoSettings.keywords,
        og_image: seoSettings.ogImage,
        twitter_card_type: seoSettings.twitterCard,
        google_analytics_id: seoSettings.googleAnalyticsId,
        google_search_console_id: seoSettings.googleSearchConsoleId,
        robots_txt: seoSettings.robotsContent
      });
      
      // Aussi sauver dans localStorage pour compatibilité
      localStorage.setItem('website_seo', JSON.stringify(seoSettings));
      
      toast.success('Paramètres SEO sauvegardés');
    } catch (error) {
      console.error('Erreur sauvegarde SEO:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return AlertCircle;
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'general' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('general')}
        >
          <Search className="h-4 w-4 mr-2" />
          Général
        </Button>
        <Button
          variant={activeTab === 'pages' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('pages')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Pages
        </Button>
        <Button
          variant={activeTab === 'tools' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tools')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Outils
        </Button>
      </div>

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres SEO Généraux</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configuration SEO globale de votre site (comme Yoast SEO)
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom du site *</label>
                  <Input
                    value={seoSettings.siteName}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    placeholder="Nom de votre site"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description du site *
                    <span className="text-xs text-gray-500 ml-2">
                      ({seoSettings.siteDescription.length}/160)
                    </span>
                  </label>
                  <Textarea
                    value={seoSettings.siteDescription}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    placeholder="Description générale de votre site"
                    rows={3}
                    maxLength={160}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mots-clés principaux</label>
                  <Input
                    value={seoSettings.keywords}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="musique, artistes, événements"
                  />
                  <p className="text-xs text-gray-500 mt-1">Séparez par des virgules</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Image Open Graph</label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSeoSettings(prev => ({ ...prev, ogImage: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          } catch (error) {
                            console.error('Erreur upload image:', error);
                          }
                        }
                      }}
                    />
                    {seoSettings.ogImage && (
                      <div className="relative w-full max-w-md">
                        <img 
                          src={seoSettings.ogImage} 
                          alt="Open Graph preview" 
                          className="w-full h-auto rounded border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setSeoSettings(prev => ({ ...prev, ogImage: '' }))}
                          className="absolute top-2 right-2"
                        >
                          Supprimer
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format recommandé: 1200x630px</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Type de carte Twitter</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={seoSettings.twitterCard}
                    onChange={(e) => setSeoSettings(prev => ({ 
                      ...prev, 
                      twitterCard: e.target.value as 'summary' | 'summary_large_image' 
                    }))}
                  >
                    <option value="summary">Résumé</option>
                    <option value="summary_large_image">Résumé avec grande image</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                  <Input
                    value={seoSettings.googleAnalyticsId}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                    placeholder="GA-XXXXXXXXX-X"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Google Search Console ID</label>
                  <Input
                    value={seoSettings.googleSearchConsoleId}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, googleSearchConsoleId: e.target.value }))}
                    placeholder="Votre ID Search Console"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button onClick={saveSEOSettings} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les paramètres SEO
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'pages' && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse SEO des Pages</CardTitle>
            <p className="text-sm text-muted-foreground">
              Score et optimisations pour chaque page
            </p>
          </CardHeader>
          <CardContent>
            {pagesSEO.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Info className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune page à analyser</p>
                <p className="text-sm mt-2">Créez des pages dans le gestionnaire de site web pour voir leur analyse SEO</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pagesSEO.map((page) => {
                  const ScoreIcon = getScoreIcon(page.score);
                  return (
                    <Card key={page.pageId} className="border">
                      <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{page.title}</h3>
                            <Badge className={getScoreColor(page.score)}>
                              <ScoreIcon className="h-3 w-3 mr-1" />
                              {page.score}/100
                            </Badge>
                          </div>
                          
                          {page.description && (
                            <p className="text-sm text-gray-600 mb-2">{page.description}</p>
                          )}
                          
                          {page.issues.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-red-600">Problèmes détectés:</p>
                              <ul className="text-sm text-red-600 space-y-1">
                                {page.issues.map((issue, index) => (
                                  <li key={index} className="flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-2" />
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Ouvrir l'éditeur de page
                            window.location.href = `/website/pages/${page.pageId}`;
                          }}
                        >
                          Optimiser
                        </Button>
                      </div>
                    </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Robots.txt</CardTitle>
              <p className="text-sm text-muted-foreground">
                Contrôlez l'indexation de votre site
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={seoSettings.enableRobots}
                  onCheckedChange={(checked) => setSeoSettings(prev => ({ ...prev, enableRobots: checked }))}
                />
                <label className="text-sm font-medium">Activer robots.txt</label>
              </div>
              
              {seoSettings.enableRobots && (
                <Textarea
                  value={seoSettings.robotsContent}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, robotsContent: e.target.value }))}
                  rows={6}
                  className="font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sitemap XML</CardTitle>
              <p className="text-sm text-muted-foreground">
                Plan de site pour les moteurs de recherche
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={seoSettings.enableSitemap}
                  onCheckedChange={(checked) => setSeoSettings(prev => ({ ...prev, enableSitemap: checked }))}
                />
                <label className="text-sm font-medium">Générer automatiquement</label>
              </div>
              
              {seoSettings.enableSitemap && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Le sitemap sera disponible à l'adresse :
                  </p>
                  <code className="block p-2 bg-gray-100 rounded text-sm">
                    {window.location.origin}/sitemap.xml
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/sitemap.xml', '_blank')}
                  >
                    Voir le sitemap
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
