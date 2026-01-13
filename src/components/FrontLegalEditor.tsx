
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Edit, Eye, FileText } from 'lucide-react';
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

interface FrontLegalEditorProps {
  type: keyof LegalContent;
  title: string;
  canEdit?: boolean;
}

export const FrontLegalEditor: React.FC<FrontLegalEditorProps> = ({ 
  type, 
  title, 
  canEdit = false 
}) => {
  const [content, setContent] = useState<LegalContent>(defaultContent);
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    const savedContent = localStorage.getItem('legalContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        const merged = { ...defaultContent, ...parsed };
        setContent(merged);
        setCurrentValue(merged[type]);
      } catch {
        setCurrentValue(content[type]);
      }
    } else {
      setCurrentValue(content[type]);
    }
  }, [type]);

  const handleSave = () => {
    const updatedContent = { ...content, [type]: currentValue };
    setContent(updatedContent);
    localStorage.setItem('legalContent', JSON.stringify(updatedContent));
    
    // Déclencher l'événement de sauvegarde pour la synchronisation
    const event = new CustomEvent('legalContentSaved');
    window.dispatchEvent(event);
    
    toast.success('Contenu sauvegardé avec succès');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(content[type]);
    setIsEditing(false);
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 text-gray-900">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 mt-6 text-gray-800">{line.substring(3)}</h2>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2 text-gray-700">{line}</p>;
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-2xl text-gray-900">
              <FileText className="h-6 w-6 mr-3 text-blue-600" />
              {title}
            </CardTitle>
            {canEdit && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      Annuler
                    </Button>
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {canEdit && isEditing ? (
            <div className="space-y-4">
              <Label htmlFor="content" className="text-lg font-medium">
                Contenu ({title.toLowerCase()})
              </Label>
              <Textarea
                id="content"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                rows={25}
                className="font-mono text-sm border-2 border-gray-200 focus:border-blue-500"
                placeholder="Saisissez le contenu ici..."
              />
              <p className="text-sm text-gray-500">
                Utilisez # pour les titres principaux et ## pour les sous-titres
              </p>
            </div>
          ) : (
            <div className="prose max-w-none">
              {renderContent(currentValue)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
