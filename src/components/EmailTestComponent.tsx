import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const EmailTestComponent = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testEmail = async () => {
    if (!email) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-email-ovh', {
        body: { to: email }
      });

      if (error) {
        throw error;
      }

      setResult(data);
      if (data.success) {
        toast.success('Email de test envoyé avec succès !');
      } else {
        toast.error('Échec de l\'envoi de l\'email de test');
      }
    } catch (error: any) {
      console.error('Erreur test email:', error);
      toast.error('Erreur lors du test email: ' + error.message);
      setResult({ error: error.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Test Configuration Email OVH</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-email">Adresse email de test</Label>
          <Input
            id="test-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
        
        <Button 
          onClick={testEmail} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Envoi en cours...' : 'Tester l\'envoi d\'email'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">
              Résultat du test: {result.success ? '✅ Succès' : '❌ Échec'}
            </h3>
            
            {result.config && (
              <div className="mb-2">
                <p><strong>Configuration:</strong></p>
                <ul className="list-disc list-inside text-sm">
                  <li>Host: {result.config.host}</li>
                  <li>Port: {result.config.port}</li>
                  <li>Username: {result.config.username}</li>
                </ul>
              </div>
            )}

            {result.responses && (
              <div className="mb-2">
                <p><strong>Réponses SMTP:</strong></p>
                <div className="text-xs bg-background p-2 rounded max-h-40 overflow-y-auto">
                  {result.responses.map((resp: string, index: number) => (
                    <div key={index} className="mb-1">{resp}</div>
                  ))}
                </div>
              </div>
            )}

            {result.error && (
              <div className="text-destructive">
                <p><strong>Erreur:</strong> {result.error}</p>
              </div>
            )}

            {result.message && (
              <p className="text-sm text-muted-foreground">{result.message}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};