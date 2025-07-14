
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { HeroBlockContent } from '../types';

interface HeroBlockProps {
  content: HeroBlockContent;
  isEditing: boolean;
  onChange: (content: HeroBlockContent) => void;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({ content, isEditing, onChange }) => {
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [siteName, setSiteName] = useState('MusiConnect');

  // Charger le nom du site dynamiquement
  useEffect(() => {
    const loadSiteName = () => {
      const savedDesign = localStorage.getItem('websiteDesign');
      const savedSettings = localStorage.getItem('websiteSettings');
      
      let finalSiteName = 'MusiConnect';
      
      if (savedDesign) {
        try {
          const design = JSON.parse(savedDesign);
          if (design.siteName) finalSiteName = design.siteName;
        } catch (e) {
          console.error('Error parsing design:', e);
        }
      } else if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.siteName) finalSiteName = settings.siteName;
        } catch (e) {
          console.error('Error parsing settings:', e);
        }
      }
      
      setSiteName(finalSiteName);
      console.log('🎯 HERO BLOCK - Site name loaded:', finalSiteName);
    };

    loadSiteName();
    
    // Écouter les changements
    window.addEventListener('websiteDesignUpdated', loadSiteName);
    window.addEventListener('websiteDesignSaved', loadSiteName);
    window.addEventListener('websiteSettingsUpdated', loadSiteName);
    
    return () => {
      window.removeEventListener('websiteDesignUpdated', loadSiteName);
      window.removeEventListener('websiteDesignSaved', loadSiteName);
      window.removeEventListener('websiteSettingsUpdated', loadSiteName);
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const backgroundImage = e.target?.result as string;
        onChange({ ...content, backgroundImage });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isEditing && isEditingHero) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Image de fond</label>
              <div className="flex items-center space-x-4">
                <img src={content.backgroundImage} alt="Fond" className="w-20 h-20 object-cover rounded" />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="hero-bg-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('hero-bg-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Changer l'image
                  </Button>
                </div>
              </div>
            </div>
            
            <Input
              value={content.title}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
              placeholder="Titre principal"
            />
            
            <Textarea
              value={content.subtitle}
              onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
              placeholder="Sous-titre"
            />
            
            <Input
              value={content.buttonText || ''}
              onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
              placeholder="Texte du bouton"
            />
            
            <Input
              value={content.buttonLink || ''}
              onChange={(e) => onChange({ ...content, buttonLink: e.target.value })}
              placeholder="Lien du bouton"
            />
            
            <Button onClick={() => setIsEditingHero(false)}>
              Terminer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''}`}
      style={{
        backgroundImage: `url(${content.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={() => isEditing && setIsEditingHero(true)}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Bienvenue sur {siteName}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">{content.subtitle}</p>
        {content.buttonText && content.buttonLink && (
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
            {content.buttonText}
          </Button>
        )}
      </div>
    </section>
  );
};
