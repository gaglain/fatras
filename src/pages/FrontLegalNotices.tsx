
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

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

export const FrontLegalNotices: React.FC = () => {
  const { currentUser, getUserPermissions } = useUser();
  const [content, setContent] = useState<LegalContent>(defaultContent);
  const [activeTab, setActiveTab] = useState<keyof LegalContent>('legalNotices');
  const [isEditing, setIsEditing] = useState(false);

  const permissions = getUserPermissions(currentUser);
  const canEdit = permissions.canManageWebsite;

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
    
    // Déclencher l'événement de sauvegarde pour la synchronisation
    const event = new CustomEvent('legalContentSaved');
    window.dispatchEvent(event);
    
    toast.success('Contenu légal sauvegardé avec succès');
    setIsEditing(false);
  };

  const cancelEdit = () => {
    const savedContent = localStorage.getItem('legalContent');
    if (savedContent) {
      try {
        const parsed = JSON.parse(savedContent);
        setContent({ ...defaultContent, ...parsed });
      } catch (error) {
        console.error('Erreur lors du rechargement:', error);
      }
    }
    setIsEditing(false);
  };

  const renderContent = (field: keyof LegalContent) => {
    const text = content[field];
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 mt-6">{line.substring(3)}</h2>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  const getTabTitle = (tab: keyof LegalContent) => {
    switch (tab) {
      case 'legalNotices': return 'Mentions Légales';
      case 'termsOfService': return 'CGV';
      case 'privacyPolicy': return 'Politique de Confidentialité';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Informations Légales</h1>
          {canEdit && (
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={cancelEdit}>
                    Annuler
                  </Button>
                  <Button onClick={saveContent} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          )}
        </div>

        {canEdit && isEditing && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">
                  Mode édition activé. Vous pouvez modifier le contenu légal ci-dessous.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Onglets */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {(['legalNotices', 'termsOfService', 'privacyPolicy'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {getTabTitle(tab)}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                {getTabTitle(activeTab)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canEdit && isEditing ? (
                <div className="space-y-4">
                  <Label htmlFor={activeTab}>
                    Contenu de {getTabTitle(activeTab).toLowerCase()}
                  </Label>
                  <Textarea
                    id={activeTab}
                    value={content[activeTab]}
                    onChange={(e) => handleInputChange(activeTab, e.target.value)}
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>
              ) : (
                <div className="prose max-w-none">
                  {renderContent(activeTab)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
