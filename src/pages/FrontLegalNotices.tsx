
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LegalContent {
  legalNotices: string;
  termsOfService: string;
  privacyPolicy: string;
}

const defaultContent: LegalContent = {
  legalNotices: `
# Mentions Légales

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
L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
  `,
  termsOfService: `
# Conditions Générales de Vente

## Article 1 - Objet
Les présentes conditions générales de vente s'appliquent à toutes les ventes conclues sur le site web.

## Article 2 - Prix
Les prix sont indiqués en euros toutes taxes comprises.

## Article 3 - Commandes
Toute commande implique l'acceptation des présentes conditions générales de vente.
  `,
  privacyPolicy: `
# Politique de Confidentialité

## Collecte des données
Nous collectons uniquement les données nécessaires au bon fonctionnement du service.

## Utilisation des données
Vos données sont utilisées uniquement dans le cadre de la prestation de service.

## Conservation des données
Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées.
  `
};

export const FrontLegalNotices: React.FC = () => {
  const [content, setContent] = useState<LegalContent>(defaultContent);

  useEffect(() => {
    const savedContent = localStorage.getItem('legalContent');
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (error) {
        console.error('Erreur lors du chargement du contenu légal:', error);
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Mentions Légales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {content.legalNotices}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
