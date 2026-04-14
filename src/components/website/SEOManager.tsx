import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, BarChart3, Save, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useWebsiteSEO } from '@/hooks/useWebsiteSEO';
import { SEOToolsTab } from './SEOToolsTab';

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
  ogImage: `${window.location.origin}/og-image.jpg`,
  twitterCard: 'summary_large_image',
  googleAnalyticsId: '',
  googleSearchConsoleId: '',
  enableSitemap: true,
  enableRobots: true,
  robotsContent: `User-agent: *\nAllow: /\n\nSitemap: ${window.location.origin}/sitemap.xml`
};

export const SEOManager: React.FC = () => {
  const navigate = useNavigate();
  const { seoSettings: dbSettings, loading, saveSEOSettings: saveToDb } = useWebsiteSEO();
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(defaultSEOSettings);
  const [pagesSEO, setPagesSEO] = useState<PageSEO[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'pages' | 'tools'>('general');

  useEffect(() => {
    if (dbSettings && Object.keys(dbSettings).length > 0) {
      setSeoSettings({
        siteName: dbSettings.site_title || '',
        siteDescription: dbSettings.site_description || '',
        keywords: dbSettings.site_keywords || '',
        ogImage: dbSettings.og_image || `${window.location.origin}/og-image.jpg`,
        twitterCard: (dbSettings.twitter_card_type as any) || 'summary_large_image',
        googleAnalyticsId: dbSettings.google_analytics_id || '',
        googleSearchConsoleId: dbSettings.google_search_console_id || '',
        enableSitemap: true, enableRobots: true,
        robotsContent: dbSettings.robots_txt || defaultSEOSettings.robotsContent
      });
    }
    const savedPages = localStorage.getItem('website_pages');
    if (savedPages) {
      try { setPagesSEO(JSON.parse(savedPages).map(analyzePage)); } catch {}
    }
  }, [dbSettings]);

  const analyzePage = (page: any): PageSEO => {
    const issues: string[] = [];
    let score = 100;
    const seoTitle = page.seo?.title || page.title || '';
    if (!seoTitle) { issues.push('Titre SEO manquant'); score -= 20; }
    else if (seoTitle.length < 30) { issues.push('Titre SEO trop court (< 30 caractères)'); score -= 10; }
    else if (seoTitle.length > 60) { issues.push('Titre SEO trop long (> 60 caractères)'); score -= 10; }
    const seoDescription = page.seo?.description || '';
    if (!seoDescription) { issues.push('Description SEO manquante'); score -= 20; }
    else if (seoDescription.length < 120) { issues.push('Description SEO trop courte (< 120 caractères)'); score -= 10; }
    else if (seoDescription.length > 160) { issues.push('Description SEO trop longue (> 160 caractères)'); score -= 10; }
    if (!(page.seo?.keywords)) { issues.push('Mots-clés manquants'); score -= 15; }
    if (!page.blocks?.length) { issues.push('Contenu de page vide'); score -= 25; }
    return { pageId: page.id, title: page.title, description: seoDescription, keywords: page.seo?.keywords || '', score: Math.max(0, score), issues };
  };

  const saveSEOSettings = async () => {
    try {
      await saveToDb({
        site_title: seoSettings.siteName, site_description: seoSettings.siteDescription,
        site_keywords: seoSettings.keywords, og_image: seoSettings.ogImage,
        twitter_card_type: seoSettings.twitterCard, google_analytics_id: seoSettings.googleAnalyticsId,
        google_search_console_id: seoSettings.googleSearchConsoleId, robots_txt: seoSettings.robotsContent
      });
      localStorage.setItem('website_seo', JSON.stringify(seoSettings));
      toast.success('Paramètres SEO sauvegardés');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
  };

  const getScoreColor = (score: number) => score >= 80 ? 'text-green-600 bg-green-100' : score >= 60 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
  const getScoreIcon = (score: number) => score >= 80 ? CheckCircle : AlertCircle;

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {(['general', 'pages', 'tools'] as const).map(tab => (
          <Button key={tab} variant={activeTab === tab ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab(tab)}>
            {tab === 'general' && <Search className="h-4 w-4 mr-2" />}
            {tab === 'pages' && <FileText className="h-4 w-4 mr-2" />}
            {tab === 'tools' && <BarChart3 className="h-4 w-4 mr-2" />}
            {tab === 'general' ? 'Général' : tab === 'pages' ? 'Pages' : 'Outils'}
          </Button>
        ))}
      </div>

      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>Paramètres SEO Généraux</CardTitle>
            <p className="text-sm text-muted-foreground">Configuration SEO globale de votre site</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium mb-2">Nom du site *</label><Input value={seoSettings.siteName} onChange={(e) => setSeoSettings(prev => ({ ...prev, siteName: e.target.value }))} placeholder="Nom de votre site" /></div>
                <div><label className="block text-sm font-medium mb-2">Description du site * <span className="text-xs text-muted-foreground ml-2">({seoSettings.siteDescription.length}/160)</span></label><Textarea value={seoSettings.siteDescription} onChange={(e) => setSeoSettings(prev => ({ ...prev, siteDescription: e.target.value }))} placeholder="Description générale" rows={3} maxLength={160} /></div>
                <div><label className="block text-sm font-medium mb-2">Mots-clés principaux</label><Input value={seoSettings.keywords} onChange={(e) => setSeoSettings(prev => ({ ...prev, keywords: e.target.value }))} placeholder="musique, artistes, événements" /><p className="text-xs text-muted-foreground mt-1">Séparez par des virgules</p></div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Image Open Graph</label>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => setSeoSettings(prev => ({ ...prev, ogImage: `${window.location.origin}/og-image.jpg` }))}>Utiliser l'image OG générée</Button>
                      <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setSeoSettings(prev => ({ ...prev, ogImage: reader.result as string })); reader.readAsDataURL(file); } }} />
                    </div>
                    {seoSettings.ogImage && (
                      <div className="relative w-full max-w-md">
                        <img src={seoSettings.ogImage} alt="Open Graph preview" className="w-full h-auto rounded border" />
                        <Button size="sm" variant="destructive" onClick={() => setSeoSettings(prev => ({ ...prev, ogImage: '' }))} className="absolute top-2 right-2">Supprimer</Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Format recommandé: 1200x630px</p>
                </div>
                <div><label className="block text-sm font-medium mb-2">Type de carte Twitter</label><select className="w-full px-3 py-2 border rounded-lg" value={seoSettings.twitterCard} onChange={(e) => setSeoSettings(prev => ({ ...prev, twitterCard: e.target.value as any }))}><option value="summary">Résumé</option><option value="summary_large_image">Résumé avec grande image</option></select></div>
                <div><label className="block text-sm font-medium mb-2">Google Analytics ID</label><Input value={seoSettings.googleAnalyticsId} onChange={(e) => setSeoSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))} placeholder="GA-XXXXXXXXX-X" /></div>
                <div><label className="block text-sm font-medium mb-2">Google Search Console ID</label><Input value={seoSettings.googleSearchConsoleId} onChange={(e) => setSeoSettings(prev => ({ ...prev, googleSearchConsoleId: e.target.value }))} placeholder="Votre ID Search Console" /></div>
              </div>
            </div>
            <div className="pt-4 border-t"><Button onClick={saveSEOSettings} className="w-full"><Save className="h-4 w-4 mr-2" />Sauvegarder les paramètres SEO</Button></div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'pages' && (
        <Card>
          <CardHeader><CardTitle>Analyse SEO des Pages</CardTitle><p className="text-sm text-muted-foreground">Score et optimisations pour chaque page</p></CardHeader>
          <CardContent>
            {pagesSEO.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><Info className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>Aucune page à analyser</p><p className="text-sm mt-2">Créez des pages dans le gestionnaire de site web</p></div>
            ) : (
              <div className="space-y-4">
                {pagesSEO.map((page) => {
                  const ScoreIcon = getScoreIcon(page.score);
                  return (
                    <Card key={page.pageId} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2"><h3 className="font-medium">{page.title}</h3><Badge className={getScoreColor(page.score)}><ScoreIcon className="h-3 w-3 mr-1" />{page.score}/100</Badge></div>
                            {page.description && <p className="text-sm text-muted-foreground mb-2">{page.description}</p>}
                            {page.issues.length > 0 && (
                              <div className="space-y-1"><p className="text-sm font-medium text-destructive">Problèmes détectés:</p>
                                <ul className="text-sm text-destructive space-y-1">{page.issues.map((issue, i) => (<li key={i} className="flex items-center"><AlertCircle className="h-3 w-3 mr-2" />{issue}</li>))}</ul>
                              </div>
                            )}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/website/pages/${page.pageId}`)}>Optimiser</Button>
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
        <SEOToolsTab settings={seoSettings} onSettingsChange={(updates) => setSeoSettings(prev => ({ ...prev, ...updates }))} />
      )}
    </div>
  );
};
