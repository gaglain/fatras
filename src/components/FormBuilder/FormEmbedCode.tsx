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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatTextForEmailHtml = (value: string) => escapeHtml(value).replace(/\n/g, '<br>');

export const FormEmbedCode: React.FC<FormEmbedCodeProps> = ({ form }) => {
  const [selectedType, setSelectedType] = useState<'website' | 'email'>('website');
  const formUrl = `${window.location.origin}/form/${form.id}`;

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
    const safeName = escapeHtml(form.name);
    const safeDescription = form.description ? formatTextForEmailHtml(form.description) : '';
    const safeButtonText = escapeHtml(form.settings?.submitButtonText || 'Remplir le formulaire');

    return `<!-- Formulaire ${safeName} pour Email -->
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif;">
  <tr>
    <td style="padding: 30px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
      <h2 style="color: #1a1a2e; font-size: 22px; margin: 0 0 12px 0;">${safeName}</h2>
      ${safeDescription ? `<p style="color: #64748b; font-size: 15px; line-height: 1.5; margin: 0 0 24px 0;">${safeDescription}</p>` : '<div style="height: 12px;"></div>'}
      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
        <tr>
          <td style="border-radius: 6px; background-color: #4f46e5;" align="center">
            <a href="${formUrl}" target="_blank"
               style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 6px;">
              ${safeButtonText}
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

  const generateEmailPlainText = () => {
    const sections = [form.name];

    if (form.description?.trim()) {
      sections.push(form.description.trim());
    }

    sections.push(`Accéder au formulaire : ${formUrl}`);
    return sections.join('\n\n');
  };

  const fallbackCopyText = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const copyTextToClipboard = async (text: string, successMessage = 'Code copié dans le presse-papier') => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopyText(text);
      }
      toast.success(successMessage);
    } catch {
      toast.error('Erreur lors de la copie');
    }
  };

  const websiteCode = generateWebsiteCode();
  const emailCode = generateEmailCode();
  const emailPlainText = generateEmailPlainText();

  const copyEmailToClipboard = async () => {
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([emailCode], { type: 'text/html' }),
            'text/plain': new Blob([emailPlainText], { type: 'text/plain' }),
          }),
        ]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailPlainText);
      } else {
        fallbackCopyText(emailPlainText);
      }

      toast.success('Bloc email copié, prêt à être collé dans votre modèle');
    } catch {
      toast.error('Erreur lors de la copie du bloc email');
    }
  };

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
                  className="font-mono text-sm bg-muted min-h-[120px]"
                />
                <Button
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyTextToClipboard(websiteCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
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
              Bloc d'intégration pour email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Aperçu du bloc à coller dans votre modèle :</Label>
              <div className="mt-2 overflow-x-auto rounded-lg border border-border bg-card p-4">
                <div dangerouslySetInnerHTML={{ __html: emailCode }} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={copyEmailToClipboard} className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copier le bloc email
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Important :</strong> utilisez ce bouton pour copier le bloc formaté.</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Collez-le directement dans votre éditeur d'email</li>
                <li>Ne copiez plus le code source manuellement, sinon il peut s'afficher comme texte brut</li>
                <li>Si l'éditeur cible n'accepte pas le HTML, une version texte lisible avec le lien sera utilisée</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-sm font-bold">i</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">URL directe du formulaire</h4>
              <p className="text-sm text-muted-foreground">
                Vous pouvez aussi partager directement ce lien :
              </p>
              <div className="flex items-center space-x-2">
                <code className="rounded bg-background px-2 py-1 text-sm">
                  {formUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTextToClipboard(formUrl, 'Lien copié dans le presse-papier')}
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