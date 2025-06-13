
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
    return `<!-- Formulaire ${form.name} pour Email -->
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
  <tr>
    <td style="padding: 20px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
      <h2 style="color: #333333; font-family: Arial, sans-serif; margin: 0 0 20px 0;">${form.name}</h2>
      ${form.description ? `<p style="color: #666666; font-family: Arial, sans-serif; margin: 0 0 20px 0;">${form.description}</p>` : ''}
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${form.fields.map(field => {
          if (field.type === 'text' || field.type === 'email') {
            return `
        <tr>
          <td style="padding: 10px 0;">
            <label style="display: block; color: #333333; font-family: Arial, sans-serif; font-weight: bold; margin-bottom: 5px;">
              ${field.label}${field.required ? ' *' : ''}
            </label>
            <input type="${field.type}" name="${field.id}" placeholder="${field.placeholder || ''}" required="${field.required}" 
                   style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; box-sizing: border-box;">
          </td>
        </tr>`;
          } else if (field.type === 'textarea') {
            return `
        <tr>
          <td style="padding: 10px 0;">
            <label style="display: block; color: #333333; font-family: Arial, sans-serif; font-weight: bold; margin-bottom: 5px;">
              ${field.label}${field.required ? ' *' : ''}
            </label>
            <textarea name="${field.id}" placeholder="${field.placeholder || ''}" required="${field.required}" rows="4"
                      style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial, sans-serif; box-sizing: border-box; resize: vertical;"></textarea>
          </td>
        </tr>`;
          }
          return '';
        }).join('')}
        <tr>
          <td style="padding: 20px 0 0 0;">
            <a href="${window.location.origin}/form/${form.id}" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-family: Arial, sans-serif; font-weight: bold;">
              ${form.settings.submitButtonText}
            </a>
          </td>
        </tr>
      </table>
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
