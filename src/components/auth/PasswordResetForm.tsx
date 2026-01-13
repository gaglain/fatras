import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }

    setIsLoading(true);

    try {
      // Utilise l’Edge Function Resend (plus fiable que resetPasswordForEmail)
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email,
          resetUrl: `${window.location.origin}/auth/reset-password`,
        },
      });

      if (error) {
        toast.error("Erreur lors de l'envoi de l'email de réinitialisation");
      } else if (data && data.success === false) {
        toast.error(data.error || "Aucun utilisateur trouvé avec cet email");
      } else {
        setEmailSent(true);
        toast.success('Email de réinitialisation envoyé !');
      }
    } catch {
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Email envoyé !</CardTitle>
          <CardDescription>
            Nous avons envoyé un lien de réinitialisation à {email}. 
            Vérifiez votre boîte de réception et suivez les instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onBackToLogin} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Mot de passe oublié ?</CardTitle>
        <CardDescription>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </Button>

          <Button 
            type="button"
            onClick={onBackToLogin} 
            variant="ghost" 
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la connexion
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};