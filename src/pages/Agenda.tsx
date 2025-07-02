
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Settings, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const Agenda: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      // Simulation de la connexion - à remplacer par votre logique d'authentification Google
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Connexion à Google Calendar réussie !');
    } catch (error) {
      toast.error('Erreur lors de la connexion à Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>
            Agenda
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Gérez vos événements et synchronisez avec Google Calendar
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleConnectGoogleCalendar}
            disabled={isConnecting}
            style={{
              backgroundColor: 'var(--app-button-bg, #1632f4)',
              color: 'var(--app-button-text, #ffffff)'
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isConnecting ? 'Connexion...' : 'Connecter Google Calendar'}
          </Button>
          <Button 
            style={{
              backgroundColor: 'var(--app-button-bg, #1632f4)',
              color: 'var(--app-button-text, #ffffff)'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Événement
          </Button>
        </div>
      </div>

      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
            Calendrier des Événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Aucun événement planifié
            </h3>
            <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
              Commencez par créer votre premier événement ou connectez Google Calendar
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
