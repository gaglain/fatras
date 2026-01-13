
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  FileText, 
  Save, 
  Eye, 
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface LegalDocument {
  id: string;
  type: 'privacy' | 'terms' | 'legal' | 'cookies';
  title: string;
  content: string;
  isPublished: boolean;
  lastUpdated: string;
}

const defaultDocuments: LegalDocument[] = [
  {
    id: 'privacy',
    type: 'privacy',
    title: 'Politique de Confidentialité',
    content: `# Politique de Confidentialité

## 1. Collecte des informations
Nous collectons les informations que vous nous fournissez directement...

## 2. Utilisation des informations
Les informations collectées sont utilisées pour...

## 3. Partage des informations
Nous ne vendons, n'échangeons ni ne transférons...`,
    isPublished: false,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'terms',
    type: 'terms',
    title: 'Conditions Générales de Vente',
    content: `# Conditions Générales de Vente

## 1. Objet
Les présentes conditions générales...

## 2. Commandes
Toute commande implique...

## 3. Prix et paiement
Les prix sont indiqués...`,
    isPublished: false,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'legal',
    type: 'legal',
    title: 'Mentions Légales',
    content: `# Mentions Légales

## Éditeur du site
**Fatras**
Adresse : [À compléter]
Téléphone : [À compléter]
Email : [À compléter]

## Hébergeur
[Informations hébergeur à compléter]

## Propriété intellectuelle
Le contenu du site...`,
    isPublished: false,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'cookies',
    type: 'cookies',
    title: 'Politique de Cookies',
    content: `# Politique de Cookies

## Qu'est-ce qu'un cookie ?
Un cookie est un petit fichier...

## Types de cookies utilisés
Nous utilisons différents types...

## Gestion des cookies
Vous pouvez contrôler...`,
    isPublished: false,
    lastUpdated: new Date().toISOString()
  }
];

export const LegalManager: React.FC = () => {
  const [documents, setDocuments] = useState<LegalDocument[]>(defaultDocuments);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [cookieSettings, setCookieSettings] = useState({
    enableBanner: true,
    bannerText: 'Ce site utilise des cookies pour améliorer votre expérience. En continuant à naviguer, vous acceptez notre utilisation des cookies.',
    position: 'bottom' as 'top' | 'bottom',
    allowCustomization: true
  });

  useEffect(() => {
    const savedDocs = localStorage.getItem('legal_documents');
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch {
        // Parse error - use defaults
      }
    }

    const savedCookieSettings = localStorage.getItem('cookie_settings');
    if (savedCookieSettings) {
      try {
        setCookieSettings(JSON.parse(savedCookieSettings));
      } catch {
        // Parse error - use defaults
      }
    }
  }, []);

  const saveDocument = (doc: LegalDocument) => {
    const updatedDocs = documents.map(d => 
      d.id === doc.id 
        ? { ...doc, lastUpdated: new Date().toISOString() }
        : d
    );
    setDocuments(updatedDocs);
    localStorage.setItem('legal_documents', JSON.stringify(updatedDocs));
    setEditingDoc(null);
    toast.success('Document sauvegardé');
  };

  const togglePublish = (docId: string) => {
    const updatedDocs = documents.map(doc => 
      doc.id === docId 
        ? { ...doc, isPublished: !doc.isPublished, lastUpdated: new Date().toISOString() }
        : doc
    );
    setDocuments(updatedDocs);
    localStorage.setItem('legal_documents', JSON.stringify(updatedDocs));
    
    const doc = updatedDocs.find(d => d.id === docId);
    toast.success(doc?.isPublished ? 'Document publié' : 'Document dépublié');
  };

  const saveCookieSettings = () => {
    localStorage.setItem('cookie_settings', JSON.stringify(cookieSettings));
    toast.success('Paramètres cookies sauvegardés');
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'privacy': return Shield;
      case 'terms': return FileText;
      case 'legal': return FileText;
      case 'cookies': return Shield;
      default: return FileText;
    }
  };

  if (editingDoc) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Édition : {editingDoc.title}</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/front/legal/${editingDoc.type}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              <Button onClick={() => saveDocument(editingDoc)}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button variant="outline" onClick={() => setEditingDoc(null)}>
                Retour
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titre du document</label>
            <Input
              value={editingDoc.title}
              onChange={(e) => setEditingDoc(prev => prev ? { ...prev, title: e.target.value } : null)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Contenu (Markdown supporté)</label>
            <Textarea
              value={editingDoc.content}
              onChange={(e) => setEditingDoc(prev => prev ? { ...prev, content: e.target.value } : null)}
              rows={20}
              className="font-mono text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingDoc.isPublished}
              onCheckedChange={(checked) => setEditingDoc(prev => prev ? { ...prev, isPublished: checked } : null)}
            />
            <label className="text-sm font-medium">
              Publier ce document sur le site
            </label>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents Légaux</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gérez les mentions légales, CGV et politiques de votre site
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {documents.map((doc) => {
              const Icon = getDocumentIcon(doc.type);
              return (
                <Card key={doc.id} className="border">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-sm text-gray-500">
                          Modifié le {new Date(doc.lastUpdated).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={doc.isPublished ? 'default' : 'secondary'}>
                            {doc.isPublished ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Publié
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Brouillon
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingDoc(doc)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/front/legal/${doc.type}`, '_blank')}
                        disabled={!doc.isPublished}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button
                        variant={doc.isPublished ? "secondary" : "default"}
                        size="sm"
                        onClick={() => togglePublish(doc.id)}
                      >
                        {doc.isPublished ? 'Dépublier' : 'Publier'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bandeau de Cookies</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configuration du bandeau de consentement RGPD
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={cookieSettings.enableBanner}
              onCheckedChange={(checked) => setCookieSettings(prev => ({ ...prev, enableBanner: checked }))}
            />
            <label className="text-sm font-medium">Activer le bandeau de cookies</label>
          </div>

          {cookieSettings.enableBanner && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Message du bandeau</label>
                <Textarea
                  value={cookieSettings.bannerText}
                  onChange={(e) => setCookieSettings(prev => ({ ...prev, bannerText: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={cookieSettings.position}
                    onChange={(e) => setCookieSettings(prev => ({ 
                      ...prev, 
                      position: e.target.value as 'top' | 'bottom' 
                    }))}
                  >
                    <option value="bottom">En bas</option>
                    <option value="top">En haut</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={cookieSettings.allowCustomization}
                    onCheckedChange={(checked) => setCookieSettings(prev => ({ 
                      ...prev, 
                      allowCustomization: checked 
                    }))}
                  />
                  <label className="text-sm">Permettre la personnalisation</label>
                </div>
              </div>
            </>
          )}

          <Button onClick={saveCookieSettings} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres cookies
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
