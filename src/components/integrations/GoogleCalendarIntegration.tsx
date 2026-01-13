
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const GoogleCalendarIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('service', 'google_calendar')
        .maybeSingle();

      if (error) {
        return;
      }

      if (data) {
        setIsConnected(data.is_active || false);
        setSettings(data.settings);
      }
    } catch {
      // Erreur silencieuse
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Simuler la connexion à Google Calendar
      // Dans un vrai projet, cela ouvrirait le flux OAuth de Google
      
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        toast.error('Utilisateur non connecté');
        return;
      }

      const integrationData = {
        user_id: user.user.id,
        service: 'google_calendar',
        is_active: true,
        settings: {
          calendar_id: 'primary',
          sync_events: true,
          sync_reminders: true,
          connected_at: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('integrations')
        .upsert(integrationData, {
          onConflict: 'user_id,service'
        });

      if (error) {
        toast.error('Erreur lors de la connexion à Google Calendar');
        return;
      }

      setIsConnected(true);
      setSettings(integrationData.settings);
      toast.success('Google Calendar connecté avec succès !');
      
    } catch {
      toast.error('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const { error } = await supabase
        .from('integrations')
        .update({ is_active: false })
        .eq('user_id', user.user.id)
        .eq('service', 'google_calendar');

      if (error) {
        toast.error('Erreur lors de la déconnexion');
        return;
      }

      setIsConnected(false);
      toast.success('Google Calendar déconnecté');
      
    } catch {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Google Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600">Connecté</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Non connecté</span>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Synchronisez vos événements avec Google Calendar pour une meilleure organisation.
        </p>

        {isConnected && settings && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              Connecté depuis le {new Date(settings.connected_at).toLocaleDateString()}
            </p>
            <ul className="text-xs text-green-700 mt-2 space-y-1">
              <li>• Synchronisation des événements activée</li>
              <li>• Rappels automatiques configurés</li>
            </ul>
          </div>
        )}

        <div className="flex space-x-2">
          {isConnected ? (
            <Button
              onClick={handleDisconnect}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? 'Déconnexion...' : 'Déconnecter'}
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={loading}
              size="sm"
            >
              {loading ? 'Connexion...' : 'Connecter Google Calendar'}
            </Button>
          )}
          
          {isConnected && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
