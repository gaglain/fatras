
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Si l'utilisateur est connecté, rediriger vers le dashboard
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center space-y-8 max-w-lg">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-foreground tracking-tight">
            Fatras Booking
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Système de gestion pour bookers professionnels
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full text-lg py-6"
            size="lg"
          >
            Se connecter
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Gérez vos contacts, événements et devis en toute simplicité
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
