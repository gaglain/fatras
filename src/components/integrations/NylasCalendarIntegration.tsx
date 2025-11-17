import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { useNylasCalendarSync } from '@/hooks/useNylasCalendarSync';
import { supabase } from '@/integrations/supabase/client';

interface ExtendedEmailAccount {
  id: string;
  provider: string;
  email: string;
  is_active: boolean;
  last_sync_at: string;
  grant_id?: string;
  sync_status?: string;
}

export const NylasCalendarIntegration: React.FC = () => {
  const { user } = useAuth();
  const { accounts: emailAccounts, loadAccounts } = useNylasEmail();
  const { 
    isLoading, 
    calendars, 
    events, 
    syncCalendars, 
    listCalendars, 
    loadEvents,
    getUpcomingEvents 
  } = useNylasCalendarSync();

  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [accounts, setAccounts] = useState<ExtendedEmailAccount[]>([]);

  useEffect(() => {
    if (user) {
      loadAccounts();
      loadEvents();
      loadEmailAccountsWithGrants();
    }
  }, [user]);

  const loadEmailAccountsWithGrants = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      
      const accountsWithGrants = data?.map(account => ({
        ...account,
        grant_id: account.access_token || account.id,
        sync_status: account.is_active ? 'active' : 'inactive'
      })) || [];
      setAccounts(accountsWithGrants);
      
      // Auto-select preferred account (prefer non-IMAP like Gmail/Outlook)
      if (accountsWithGrants.length > 0 && !selectedAccount) {
        const preferred = accountsWithGrants.find(a => a.provider !== 'imap') || accountsWithGrants[0];
        setSelectedAccount(preferred.grant_id || preferred.id);
      }
    } catch (error) {
      console.error('Erreur chargement comptes:', error);
    }
  };

  const handleSyncCalendars = async () => {
    if (!selectedAccount) {
      toast.error('Veuillez sélectionner un compte email connecté');
      return;
    }

    try {
      await syncCalendars(selectedAccount);
    } catch (error) {
      console.error('Erreur sync calendriers:', error);
    }
  };

  const handleListCalendars = async () => {
    if (!selectedAccount) {
      toast.error('Veuillez sélectionner un compte email connecté');
      return;
    }

    try {
      await listCalendars(selectedAccount);
    } catch (error) {
      console.error('Erreur liste calendriers:', error);
    }
  };

  const connectedAccounts = accounts.filter(account => account.is_active);
  const upcomingEvents = getUpcomingEvents(3);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Synchronisation Calendrier Nylas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedAccounts.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucun compte email connecté. Veuillez d'abord connecter un compte email dans l'onglet Email.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Compte connecté :</label>
                <select 
                  value={selectedAccount} 
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {connectedAccounts.map((account) => (
                    <option key={account.id} value={account.grant_id || account.id}>
                      {account.email} ({account.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleListCalendars}
                  variant="outline"
                  disabled={isLoading || !selectedAccount}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Calendar className="h-4 w-4 mr-2" />
                  )}
                  Lister les calendriers
                </Button>

                <Button 
                  onClick={handleSyncCalendars}
                  disabled={isLoading || !selectedAccount}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Synchroniser
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {calendars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Calendriers disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calendars.map((calendar) => (
                <div key={calendar.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{calendar.name}</p>
                    <p className="text-sm text-muted-foreground">{calendar.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {calendar.read_only ? 'Lecture seule' : 'Lecture/Écriture'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Prochains événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>📅 {new Date(event.start_time).toLocaleDateString()}</span>
                    <span>🕐 {new Date(event.start_time).toLocaleTimeString()}</span>
                    {event.location && <span>📍 {event.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};