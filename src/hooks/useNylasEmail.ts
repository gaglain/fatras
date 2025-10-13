import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
      console.log(`🔗 Connecting ${provider} account...`);

      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'connect',
          provider,
          config
        }
      });

      if (error) {
        console.error('❌ Connection error:', error);
        throw error;
      }

      console.log('✅ Connection result:', data);

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
    } catch (error: any) {
      console.error('❌ Error connecting account:', error);
      toast.error(`Connection failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccounts = async () => {
    if (!user) return;

    try {
      console.log('📋 Loading Nylas accounts...');
      
      // Récupérer les comptes via l'Edge Function Nylas
      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'list_accounts'
        }
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        throw error;
      }

      console.log('✅ Loaded accounts from Nylas:', data);
      
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      } else {
        setAccounts([]);
      }
    } catch (error: any) {
      console.error('❌ Error loading accounts:', error);
      toast.error(`Failed to load accounts: ${error.message}`);
    }
  };

  const syncEmails = async (accountId: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      console.log('🔄 Starting email sync...');

      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'sync',
          accountId
        }
      });

      if (error) {
        console.error('❌ Sync error:', error);
        throw error;
      }

      console.log('✅ Sync result:', data);

      if (data.success) {
        toast.success(`${data.syncedCount} nouveaux emails synchronisés`);
        return data;
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error('❌ Error in email sync:', error);
      toast.error(`Sync failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async (accountId: string, email: {
    to: string;
    subject: string;
    content: string;
    html?: string;
  }) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    try {
      console.log('📤 Sending email...');

      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'send',
          accountId,
          email
        }
      });

      if (error) {
        console.error('❌ Send error:', error);
        throw error;
      }

      console.log('✅ Send result:', data);

      if (data.success) {
        toast.success('Email sent successfully!');
        return data;
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error: any) {
      // If Nylas fails due to missing IMAP/SMTP grant settings, fallback to Resend
      const msg = String(error?.message || '');
      const needsGrantSettings = /grant is missing imap username|smtphost|smtpport/i.test(msg);
      if (needsGrantSettings) {
        try {
          console.warn('⚠️ Nylas grant settings missing. Falling back to Resend.');
          toast.message('Nylas indisponible, tentative via Resend…');
          const html = email.html ?? `<div>${email.content}</div>`;
          const { data: resendData, error: resendError } = await supabase.functions.invoke('send-email-resend', {
            body: {
              to: [email.to],
              subject: email.subject,
              html,
              from: 'Fatras <onboarding@resend.dev>',
              userId: user.id,
            }
          });
          if (resendError) throw resendError;
          if (resendData?.success) {
            toast.success('Email envoyé via Resend');
            return { ...resendData, provider: 'resend' };
          }
          throw new Error(resendData?.error || 'Resend fallback failed');
        } catch (fallbackErr: any) {
          console.error('❌ Resend fallback failed:', fallbackErr);
          toast.error(`Send failed (Resend): ${fallbackErr?.message || 'Unknown error'}`);
          throw fallbackErr;
        }
      }

      console.error('❌ Error sending email:', error);
      toast.error(`Send failed: ${msg}`);
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
      console.log('🔧 Testing connection...');

      const { data, error } = await supabase.functions.invoke('nylas-email', {
        body: {
          action: 'test',
          accountId
        }
      });

      if (error) {
        console.error('❌ Test error:', error);
        throw error;
      }

      console.log('✅ Test result:', data);

      if (data.success) {
        toast.success('Connection test successful!');
        return data;
      } else {
        throw new Error(data.message || 'Connection test failed');
      }
    } catch (error: any) {
      console.error('❌ Error testing connection:', error);
      toast.error(`Test failed: ${error.message}`);
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