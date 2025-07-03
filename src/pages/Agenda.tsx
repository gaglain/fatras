
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Settings, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Agenda: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Vérifier si Google Calendar est déjà connecté
    const savedConnection = localStorage.getItem('googleCalendarConnected');
    if (savedConnection === 'true') {
      setIsConnected(true);
    }
  }, []);

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      // Simulation de la connexion OAuth Google Calendar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sauvegarder l'état de connexion
      localStorage.setItem('googleCalendarConnected', 'true');
      setIsConnected(true);
      toast.success('Connexion à Google Calendar réussie !');
    } catch (error) {
      toast.error('Erreur lors de la connexion à Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectGoogleCalendar = () => {
    localStorage.removeItem('googleCalendarConnected');
    setIsConnected(false);
    toast.success('Déconnexion de Google Calendar réussie');
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
          {isConnected ? (
            <Button 
              onClick={handleDisconnectGoogleCalendar}
              variant="outline"
              style={{
                borderColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-bg, #1632f4)'
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Déconnecter Google Calendar
            </Button>
          ) : (
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
          )}
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

      {/* Connection Status */}
      {isConnected && (
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid #10b981'
        }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">Google Calendar connecté</span>
            </div>
          </CardContent>
        </Card>
      )}

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
              {isConnected ? 'Synchronisation active' : 'Aucun événement planifié'}
            </h3>
            <p className="mb-4" style={{ color: 'var(--app-text, #666666)' }}>
              {isConnected 
                ? 'Vos événements Google Calendar seront synchronisés automatiquement'
                : 'Commencez par créer votre premier événement ou connectez Google Calendar'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
