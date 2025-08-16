import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
        });
        if (error) throw error;
        toast.success('Compte créé avec succès ! Vérifiez votre email.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Connexion réussie !');
        
        // Redirection immédiate vers le dashboard
        console.log('🔄 Redirecting to dashboard...');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          {isSignUp ? 'Créer un compte' : 'Connexion'}
        </h2>
        <p className="text-sm mt-1 text-muted-foreground">
          {isSignUp 
            ? 'Créez votre compte Fatras Booking' 
            : 'Connectez-vous à votre compte Fatras Booking'
          }
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground">
                Prénom
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="bg-background text-foreground border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground">
                Nom
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="bg-background text-foreground border-input"
              />
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background text-foreground border-input"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-background text-foreground border-input"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Chargement...' : (isSignUp ? 'Créer le compte' : 'Se connecter')}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-primary"
        >
          {isSignUp 
            ? 'Déjà un compte ? Se connecter' 
            : 'Pas de compte ? Créer un compte'
          }
        </Button>
      </div>
    </div>
  );
};
