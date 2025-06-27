
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LegalContent {
  legalNotices: string;
  termsOfService: string;
  privacyPolicy: string;
}

const defaultContent = {
  termsOfService: `
# Conditions Générales de Vente

## Article 1 - Objet
Les présentes conditions générales de vente s'appliquent à toutes les ventes conclues sur le site web.

## Article 2 - Prix
Les prix sont indiqués en euros toutes taxes comprises.

## Article 3 - Commandes
Toute commande implique l'acceptation des présentes conditions générales de vente.

## Article 4 - Livraison
Les délais de livraison sont donnés à titre indicatif et ne sont pas garantis.

## Article 5 - Garanties
Tous nos produits bénéficient de la garantie légale de conformité.

## Article 6 - Retours
Vous disposez d'un délai de 14 jours pour retourner votre commande.

## Article 7 - Responsabilité
Notre responsabilité est limitée au montant de la commande.

## Article 8 - Droit applicable
Les présentes conditions sont régies par le droit français.
  `
};

export const FrontTermsOfService: React.FC = () => {
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    const savedContent = localStorage.getItem('legalContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContent(prev => ({ ...prev, termsOfService: parsed.termsOfService || prev.termsOfService }));
      } catch (error) {
        console.error('Erreur lors du chargement des CGV:', error);
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Conditions Générales de Vente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {content.termsOfService}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
