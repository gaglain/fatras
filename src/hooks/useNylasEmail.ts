import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useIndividualEmailTracking } from './useIndividualEmailTracking';
import { logger } from '@/lib/logger';

interface EmailAccount {
  id: string;
  provider: string;
  email: string;
  is_active: boolean;
  last_sync_at: string;
}

interface EmailConfig {
  email: string;
  password?: string;
  host?: string;
  port?: number;
  ssl?: boolean;
}

export const useNylasEmail = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const { injectEmailTracking } = useIndividualEmailTracking();

  // Charger les comptes automatiquement quand l'utilisateur change
  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const connectAccount = async (provider: 'gmail' | 'outlook' | 'imap', config: EmailConfig) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      logger.debug(`Connecting ${provider} account...`);

      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'connect',
          provider,
          config
        }
      });

      if (error) {
        logger.error('Connection error:', error);
        throw error;
      }

      logger.debug('Connection result:', data);

      if (data.success) {
        if (data.authorization_url) {
          // OAuth flow - open authorization URL
          window.open(data.authorization_url, '_blank');
          toast.success('Complete the authorization in the new window');
        } else {
          toast.success('Account connected successfully!');
        }
        await loadAccounts();
        return data;
      } else {
        throw new Error(data.error || 'Failed to connect account');
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error connecting account:', err);
      toast.error(`Connection failed: ${err.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    if (!user) return;

    try {
      logger.debug('Loading Nylas accounts...');
      
      // Récupérer les comptes via l'Edge Function Nylas
      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'list_accounts'
        }
      });

      if (error) {
        logger.error('Edge Function error:', error);
        throw error;
      }

      logger.debug('Loaded accounts from Nylas:', data);
      
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error loading accounts:', err);
      toast.error(`Failed to load accounts: ${err.message}`);
    }
  };

  const syncEmails = async (accountId: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      logger.debug('Starting email sync...');

      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'sync',
          accountId
        }
      });

      if (error) {
        logger.error('Sync error:', error);
        throw error;
      }

      logger.debug('Sync result:', data);

      if (data.success) {
        toast.success(`${data.syncedCount} nouveaux emails synchronisés`);
        return data;
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error in email sync:', err);
      toast.error(`Sync failed: ${err.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Envoi direct via Resend (sans passer par Nylas qui ne fonctionne pas)
  const sendEmail = async (accountId: string, email: {
    to: string;
    subject: string;
    content: string;
    html?: string;
    attachments?: Array<{ name: string; url: string }>;
  }) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      logger.debug('Sending email via Resend...');

      // Trouver le contact correspondant à l'email destinataire
      const { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('email', email.to)
        .single();

      // Créer un enregistrement email pour obtenir l'ID de tracking
      const { data: emailRecord, error: emailError } = await supabase
        .from('emails')
        .insert({
          user_id: user.id,
          to_email: email.to,
          subject: email.subject,
          content: email.content,
          html_content: email.html || email.content,
          direction: 'sent',
          status: 'sending',
          contact_id: contact?.id || null
        })
        .select()
        .single();

      if (emailError || !emailRecord) {
        logger.error('Erreur création enregistrement email:', emailError);
      }

      // Charger la signature de l'utilisateur
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('email_signature')
        .eq('user_id', user.id)
        .single();

      const signature = profileData?.email_signature || '';
      let emailWithSignature = email.html 
        ? `${email.html}<br><br>${signature}`
        : `<div>${email.content.replace(/\n/g, '<br>')}<br><br>${signature}</div>`;

      // Injecter le pixel de tracking et les liens trackés si on a un enregistrement
      if (emailRecord) {
        emailWithSignature = injectEmailTracking(emailRecord.id, emailWithSignature);
      }

      // Récupérer l'email de l'expéditeur depuis le compte sélectionné
      const { data: accountData } = await supabase
        .from('email_accounts')
        .select('email')
        .eq('id', accountId)
        .single();

      const fromEmail = accountData?.email || 'booking@fatras.net';

      // Envoyer directement via Resend
      const { data: resendData, error: resendError } = await supabase.functions.invoke('send-email-resend', {
        body: {
          to: [email.to],
          subject: email.subject,
          html: emailWithSignature,
          fromName: 'Fatras',
          fromEmail: fromEmail,
          userId: user.id,
          attachments: email.attachments,
        }
      });

      if (resendError) throw resendError;
      
      if (resendData?.success) {
        // Mettre à jour le statut de l'email si on a un enregistrement
        if (emailRecord) {
          await supabase
            .from('emails')
            .update({ status: 'sent', sent_at: new Date().toISOString(), provider: 'resend' })
            .eq('id', emailRecord.id);
        }
        toast.success('Email envoyé avec succès!');
        return { ...resendData, provider: 'resend' };
      }
      
      throw new Error(resendData?.error || 'Échec de l\'envoi');
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error sending email:', err);
      toast.error(`Échec de l'envoi: ${err?.message || 'Erreur inconnue'}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const testConnection = async (accountId: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      logger.debug('Testing connection...');

      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'test',
          accountId
        }
      });

      if (error) {
        logger.error('Test error:', error);
        throw error;
      }

      logger.debug('Test result:', data);

      if (data.success) {
        toast.success('Connection test successful!');
        return data;
      } else {
        throw new Error(data.message || 'Connection test failed');
      }
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error testing connection:', err);
      toast.error(`Test failed: ${err.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testImap = async (config: { host: string; port?: number }) => {
    if (!user) throw new Error('User must be authenticated');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'test_imap',
          config: { host: config.host, port: config.port ?? 993 }
        }
      });
      if (error) throw error;
      if (data.success) {
        toast.success('IMAP joignable');
      } else {
        toast.error(data.message || 'IMAP non joignable');
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const testSmtp = async (config: { host: string; port?: number }) => {
    if (!user) throw new Error('User must be authenticated');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'test_smtp',
          config: { 
            host: config.host, 
            port: config.port ?? 587,
            smtp_host: config.host,
            smtp_port: config.port ?? 587
          }
        }
      });
      if (error) throw error;
      if (data.success) {
        toast.success(`SMTP accessible via ${data.connection_type} sur ${data.host}:${data.port}`);
      } else {
        toast.error(data.message || 'SMTP non joignable');
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async (accountId: string, testEmail: string) => {
    if (!user) throw new Error('User must be authenticated');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'send_test_email',
          accountId,
          testEmail
        }
      });
      if (error) throw error;
      if (data.success) {
        toast.success(`Email de test envoyé avec succès à ${testEmail}`);
      } else {
        toast.error(data.message || 'Échec de l\'envoi du test');
      }
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    accounts,
    isLoading,
    connectAccount,
    loadAccounts,
    syncEmails,
    sendEmail,
    testConnection,
    testImap,
    testSmtp,
    sendTestEmail
  };
};
