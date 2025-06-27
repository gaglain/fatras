
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface LegalContent {
  legalNotices: string;
  termsOfService: string;
  privacyPolicy: string;
}

const defaultContent: LegalContent = {
  legalNotices: `# Mentions Légales

## Éditeur du site
[Nom de votre société]
[Adresse]
[Code postal] [Ville]
[Pays]

Téléphone : [Numéro de téléphone]
Email : [Email de contact]

## Hébergement
Ce site est hébergé par [Nom de l'hébergeur]
[Adresse de l'hébergeur]

## Propriété intellectuelle
L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.`,
  
  termsOfService: `# Conditions Générales de Vente

## Article 1 - Objet
Les présentes conditions générales de vente s'appliquent à toutes les ventes conclues sur le site web.

## Article 2 - Prix
Les prix sont indiqués en euros toutes taxes comprises.

## Article 3 - Commandes
Toute commande implique l'acceptation des présentes conditions générales de vente.`,
  
  privacyPolicy: `# Politique de Confidentialité

## Collecte des données
Nous collectons uniquement les données nécessaires au bon fonctionnement du service.

## Utilisation des données
Vos données sont utilisées uniquement dans le cadre de la prestation de service.

## Conservation des données
Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées.`
};

export const LegalContentManager: React.FC = () => {
  const [content, setContent] = useState<LegalContent>(defaultContent);

  useEffect(() => {
    const savedContent = localStorage.getItem('legalContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContent({ ...defaultContent, ...parsed });
      } catch (error) {
        console.error('Erreur lors du chargement du contenu légal:', error);
      }
    }
  }, []);

  const handleInputChange = (field: keyof LegalContent, value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const saveContent = () => {
    localStorage.setItem('legalContent', JSON.stringify(content));
    toast.success('Contenu légal sauvegardé avec succès');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Mentions Légales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="legalNotices">Contenu des mentions légales</Label>
            <Textarea
              id="legalNotices"
              value={content.legalNotices}
              onChange={(e) => handleInputChange('legalNotices', e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conditions Générales de Vente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="termsOfService">Contenu des CGV</Label>
            <Textarea
              id="termsOfService"
              value={content.termsOfService}
              onChange={(e) => handleInputChange('termsOfService', e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Politique de Confidentialité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="privacyPolicy">Contenu de la politique de confidentialité</Label>
            <Textarea
              id="privacyPolicy"
              value={content.privacyPolicy}
              onChange={(e) => handleInputChange('privacyPolicy', e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={saveContent} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder le contenu légal
        </Button>
      </div>
    </div>
  );
};
