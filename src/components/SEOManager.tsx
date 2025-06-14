
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, AlertCircle, Globe } from 'lucide-react';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  focusKeyword: string;
}

interface SEOManagerProps {
  initialData?: SEOData;
  onSave: (data: SEOData) => void;
}

export const SEOManager: React.FC<SEOManagerProps> = ({ 
  initialData = {
    title: '',
    description: '',
    keywords: '',
    focusKeyword: ''
  },
  onSave 
}) => {
  const [seoData, setSeoData] = useState<SEOData>(initialData);
  const [analysis, setAnalysis] = useState({
    titleLength: 0,
    descriptionLength: 0,
    keywordDensity: 0,
    readability: 'good'
  });

  React.useEffect(() => {
    // Analyse SEO en temps réel
    const titleLength = seoData.title.length;
    const descriptionLength = seoData.description.length;
    const keywordDensity = seoData.focusKeyword && seoData.description ? 
      (seoData.description.toLowerCase().match(new RegExp(seoData.focusKeyword.toLowerCase(), 'g')) || []).length : 0;
    
    setAnalysis({
      titleLength,
      descriptionLength,
      keywordDensity,
      readability: descriptionLength > 120 && descriptionLength < 160 ? 'good' : 'warning'
    });
  }, [seoData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTitleStatus = () => {
    if (analysis.titleLength === 0) return { color: 'text-gray-500', text: 'Aucun titre' };
    if (analysis.titleLength < 30) return { color: 'text-red-600', text: 'Trop court' };
    if (analysis.titleLength > 60) return { color: 'text-red-600', text: 'Trop long' };
    return { color: 'text-green-600', text: 'Optimal' };
  };

  const getDescriptionStatus = () => {
    if (analysis.descriptionLength === 0) return { color: 'text-gray-500', text: 'Aucune description' };
    if (analysis.descriptionLength < 120) return { color: 'text-red-600', text: 'Trop courte' };
    if (analysis.descriptionLength > 160) return { color: 'text-red-600', text: 'Trop longue' };
    return { color: 'text-green-600', text: 'Optimale' };
  };

  const calculateSEOScore = () => {
    let score = 0;
    
    // Titre (30 points)
    if (analysis.titleLength >= 30 && analysis.titleLength <= 60) score += 30;
    else if (analysis.titleLength > 0) score += 15;
    
    // Description (30 points)
    if (analysis.descriptionLength >= 120 && analysis.descriptionLength <= 160) score += 30;
    else if (analysis.descriptionLength > 0) score += 15;
    
    // Mot-clé focus (20 points)
    if (seoData.focusKeyword) {
      score += 10;
      if (analysis.keywordDensity > 0) score += 10;
    }
    
    // Mots-clés (20 points)
    if (seoData.keywords) score += 20;
    
    return score;
  };

  const seoScore = calculateSEOScore();
  const titleStatus = getTitleStatus();
  const descriptionStatus = getDescriptionStatus();

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Analyse SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>
                  {seoScore}/100
                </div>
                <p className="text-sm text-gray-600">Score SEO</p>
              </div>
              <div className="flex space-x-2">
                {seoScore >= 80 && <Badge className="bg-green-100 text-green-800">Excellent</Badge>}
                {seoScore >= 60 && seoScore < 80 && <Badge className="bg-yellow-100 text-yellow-800">Bon</Badge>}
                {seoScore < 60 && <Badge className="bg-red-100 text-red-800">À améliorer</Badge>}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Titre SEO</span>
                <span className={`text-xs ${titleStatus.color}`}>
                  {titleStatus.text} ({analysis.titleLength}/60)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${analysis.titleLength >= 30 && analysis.titleLength <= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((analysis.titleLength / 60) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Description SEO</span>
                <span className={`text-xs ${descriptionStatus.color}`}>
                  {descriptionStatus.text} ({analysis.descriptionLength}/160)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${analysis.descriptionLength >= 120 && analysis.descriptionLength <= 160 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((analysis.descriptionLength / 160) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Form */}
      <Card>
        <CardHeader>
          <CardTitle>Optimisation SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre SEO *
            </label>
            <Input
              value={seoData.title}
              onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
              placeholder="Titre optimisé pour les moteurs de recherche"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">
              Le titre apparaîtra dans les résultats de recherche. Idéal: 30-60 caractères.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description SEO *
            </label>
            <Textarea
              value={seoData.description}
              onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
              placeholder="Description qui apparaîtra sous le titre dans les résultats de recherche"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              Cette description apparaîtra dans les résultats de recherche. Idéal: 120-160 caractères.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot-clé principal
            </label>
            <Input
              value={seoData.focusKeyword}
              onChange={(e) => setSeoData({ ...seoData, focusKeyword: e.target.value })}
              placeholder="booking artiste"
            />
            <p className="text-xs text-gray-500 mt-1">
              Le mot-clé principal sur lequel vous voulez positionner cette page.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mots-clés secondaires
            </label>
            <Input
              value={seoData.keywords}
              onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
              placeholder="booking, artiste, musique, concert, événement"
            />
            <p className="text-xs text-gray-500 mt-1">
              Séparez les mots-clés par des virgules.
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => onSave(seoData)}
              className="bg-brand-primary text-white hover:bg-brand-dark"
            >
              Sauvegarder les paramètres SEO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu Google */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Aperçu dans les résultats de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="text-blue-600 text-lg hover:underline cursor-pointer">
              {seoData.title || "Titre de la page"}
            </div>
            <div className="text-green-700 text-sm mt-1">
              https://monsite.com/ma-page
            </div>
            <div className="text-gray-700 text-sm mt-2">
              {seoData.description || "Description de la page qui apparaîtra dans les résultats de recherche Google."}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
