import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const NylasEmailTest = () => {
  const { accounts, sendEmail, isLoading } = useNylasEmail();
  const [testEmail, setTestEmail] = useState('');
  const [subject, setSubject] = useState('Test d\'envoi Nylas - pro1.mail.ovh.net');
  const [content, setContent] = useState('Ceci est un email de test pour vérifier la configuration SMTP via Nylas.');
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  // Trouver le compte booking@fatras.net
  const bookingAccount = accounts.find(acc => acc.email === 'booking@fatras.net');

  const handleTestSend = async () => {
    if (!bookingAccount) {
      toast.error('Compte booking@fatras.net non trouvé');
      return;
    }

    if (!testEmail) {
      toast.error('Veuillez entrer une adresse email de destination');
      return;
    }

    setLastResult(null);
    try {
      console.log('🧪 Test d\'envoi via', bookingAccount.email, 'vers', testEmail);
      const result = await sendEmail(bookingAccount.id, {
        to: testEmail,
        subject,
        content,
        html: `<p>${content}</p><hr><p><small>Envoyé le ${new Date().toLocaleString('fr-FR')}</small></p>`
      });

      console.log('✅ Résultat:', result);
      setLastResult({ success: true, message: 'Email envoyé avec succès!' });
      toast.success('Email de test envoyé!');
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setLastResult({ 
        success: false, 
        message: error.message || 'Erreur inconnue' 
      });
      toast.error(`Erreur: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test d'envoi Nylas - booking@fatras.net</CardTitle>
        <CardDescription>
          Test de la configuration SMTP pour pro1.mail.ovh.net (port 465 SSL)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!bookingAccount ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Compte booking@fatras.net non trouvé. Veuillez d'abord connecter le compte dans l'onglet Nylas.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Compte trouvé : {bookingAccount.email} (ID: {bookingAccount.id})
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="testEmail">Email de destination</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="destinataire@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleTestSend} 
              disabled={isLoading || !testEmail}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer l\'email de test'
              )}
            </Button>

            {lastResult && (
              <Alert variant={lastResult.success ? 'default' : 'destructive'}>
                {lastResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {lastResult.message}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
