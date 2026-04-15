
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Code, Mail, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { FormData } from './types';

interface FormEmbedCodeProps {
  form: FormData;
}

export const FormEmbedCode: React.FC<FormEmbedCodeProps> = ({ form }) => {
  const [selectedType, setSelectedType] = useState<'website' | 'email'>('website');

  const generateWebsiteCode = () => {
    return `<!-- Formulaire ${form.name} -->
<div id="fatras-form-${form.id}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/embed/form/${form.id}.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;
  };

  const generateEmailCode = () => {
    const formUrl = `${window.location.origin}/form/${form.id}`;
    return `<!-- Formulaire ${form.name} pour Email -->
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td style="padding: 30px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
      <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 12px 0;">${form.name}</h2>
      ${form.description ? `<p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 24px 0;">${form.description}</p>` : '<div style="height: 12px;"></div>'}
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
        <tr>
          <td style="border-radius: 6px; background-color: #4f46e5;" align="center">
            <a href="${formUrl}" target="_blank"
               style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">
              ${form.settings?.submitButtonText || 'Remplir le formulaire'}
            </a>
          </td>
        </tr>
      </table>
      <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">
        Cliquez sur le bouton pour accéder au formulaire en ligne.
      </p>
    </td>
  </tr>
</table>`;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Code copié dans le presse-papier');
    }).catch(() => {
      toast.error('Erreur lors de la copie');
    });
  };

  const websiteCode = generateWebsiteCode();
  const emailCode = generateEmailCode();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Intégrer le formulaire</h3>
        <div className="flex space-x-4 mb-6">
          <Button
            variant={selectedType === 'website' ? 'default' : 'outline'}
            onClick={() => setSelectedType('website')}
            className="flex items-center"
          >
            <Globe className="h-4 w-4 mr-2" />
            Site Web
          </Button>
          <Button
            variant={selectedType === 'email' ? 'default' : 'outline'}
            onClick={() => setSelectedType('email')}
            className="flex items-center"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {selectedType === 'website' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Code d'intégration pour site web
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Code à copier-coller dans votre site :</Label>
              <div className="relative">
                <Textarea
                  value={websiteCode}
                  readOnly
                  className="font-mono text-sm bg-gray-50 min-h-[120px]"
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(websiteCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Instructions :</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Copiez le code ci-dessus</li>
                <li>Collez-le dans votre page HTML où vous voulez afficher le formulaire</li>
                <li>Le formulaire s'affichera automatiquement avec votre design</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedType === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Code d'intégration pour email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Code HTML pour vos campagnes email :</Label>
              <div className="relative">
                <Textarea
                  value={emailCode}
                  readOnly
                  className="font-mono text-sm bg-gray-50 min-h-[200px]"
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(emailCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Instructions :</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Copiez le code HTML ci-dessus</li>
                <li>Collez-le dans votre template d'email</li>
                <li>Le bouton redirigera vers le formulaire complet</li>
                <li>Compatible avec la plupart des clients email</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">i</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">URL directe du formulaire</h4>
              <p className="text-sm text-blue-700">
                Vous pouvez aussi partager directement ce lien :
              </p>
              <div className="flex items-center space-x-2">
                <code className="px-2 py-1 bg-white rounded text-sm">
                  {window.location.origin}/form/{form.id}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(`${window.location.origin}/form/${form.id}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
