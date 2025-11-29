import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useEmailAutoSync = () => {
  const { user } = useAuth();
  const syncIntervalRef = useRef<number>();
  const lastSyncRef = useRef<number>(0);

  const syncEmails = async () => {
    if (!user) return;

    const now = Date.now();
    // Éviter les syncs trop fréquents
    if (now - lastSyncRef.current < 60000) return; // Min 1 minute entre syncs
    
    lastSyncRef.current = now;

    try {
      console.log('📧 Auto-sync: récupération des emails...');
      
      // Récupérer les comptes email actifs
      const { data: accounts } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('is_active', true);

      if (!accounts || accounts.length === 0) return;

      for (const account of accounts) {
        // Vérifier si l'utilisateur a accès à ce compte
        const hasAccess = account.user_id === user.id || account.is_organization_shared;
        if (!hasAccess) continue;

        try {
          if (account.provider === 'imap') {
            // Sync IMAP
            const { error } = await supabase.functions.invoke('sync-imap-emails', {
              body: { userId: account.user_id, action: 'sync' }
            });
            
            if (error) {
              console.error('Erreur sync IMAP:', error);
            }
          } else {
            // Sync Nylas (Gmail, Outlook)
            const { error } = await supabase.functions.invoke('nylas-email', {
              body: { action: 'sync', accountId: account.id }
            });
            
            if (error) {
              console.error('Erreur sync Nylas:', error);
            }
          }
        } catch (error) {
          console.error(`Erreur sync compte ${account.email}:`, error);
        }
      }
      
      console.log('✅ Auto-sync terminé');
    } catch (error) {
      console.error('❌ Erreur auto-sync:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Sync initial après 10 secondes
    const initialTimeout = setTimeout(syncEmails, 10000);

    // Puis sync périodique
    syncIntervalRef.current = window.setInterval(syncEmails, SYNC_INTERVAL);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user]);

  // Fonction de sync manuel
  const manualSync = async () => {
    toast.promise(syncEmails(), {
      loading: 'Synchronisation des emails...',
      success: 'Emails synchronisés',
      error: 'Erreur de synchronisation'
    });
  };

  return { manualSync };
};
