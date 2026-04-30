import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useIndividualEmailTracking } from './useIndividualEmailTracking';
import { logger } from '@/lib/logger';
import { invokeEdgeFunction } from '@/lib/edgeFunctionClient';

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

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const invokeNylas = async <T = unknown>(action: string, extra?: Record<string, unknown>) => {
    return invokeEdgeFunction<T>({
      functionName: 'nylas-email',
      body: { action, ...extra },
    });
  };

  const connectAccount = async (provider: 'gmail' | 'outlook' | 'imap', config: EmailConfig) => {
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const result = await invokeNylas<{ success: boolean; authorization_url?: string; error?: string }>('connect', { provider, config });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.error || 'Failed to connect account');
      }

      if (result.data.authorization_url) {
        window.open(result.data.authorization_url, '_blank');
        toast.success('Complete the authorization in the new window');
      } else {
        toast.success('Account connected successfully!');
      }
      await loadAccounts();
      return result.data;
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
      const result = await invokeNylas<{ success: boolean; accounts?: EmailAccount[] }>('list_accounts');

      if (result.success && result.data?.accounts) {
        setAccounts(result.data.accounts);
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
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const result = await invokeNylas<{ success: boolean; syncedCount?: number; error?: string }>('sync', { accountId });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.error || 'Sync failed');
      }

      toast.success(`${result.data.syncedCount} nouveaux emails synchronisés`);
      return result.data;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Error in email sync:', err);
      toast.error(`Sync failed: ${err.message}`);
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
    attachments?: Array<{ name: string; url: string }>;
  }) => {
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const { data: contactRows } = await supabase
        .from('contacts')
        .select('id')
        .ilike('email', email.to)
        .limit(1);
      const contact = contactRows && contactRows[0] ? contactRows[0] : null;

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

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('email_signature')
        .eq('user_id', user.id)
        .single();

      const signature = profileData?.email_signature || '';
      let emailWithSignature = email.html 
        ? `${email.html}<br><br>${signature}`
        : `<div>${email.content.replace(/\n/g, '<br>')}<br><br>${signature}</div>`;

      if (emailRecord) {
        emailWithSignature = injectEmailTracking(emailRecord.id, emailWithSignature);
      }

      const { data: accountData } = await supabase
        .from('email_accounts')
        .select('email')
        .eq('id', accountId)
        .single();

      const fromEmail = accountData?.email || 'booking@fatras.net';

      const resendResult = await invokeEdgeFunction<{ success: boolean; error?: string }>({
        functionName: 'send-email-resend',
        body: {
          to: [email.to],
          subject: email.subject,
          html: emailWithSignature,
          fromName: 'Fatras',
          fromEmail,
          userId: user.id,
          attachments: email.attachments,
        }
      });

      if (!resendResult.success || !resendResult.data?.success) {
        throw new Error(resendResult.error || resendResult.data?.error || 'Échec de l\'envoi');
      }

      if (emailRecord) {
        await supabase
          .from('emails')
          .update({ status: 'sent', sent_at: new Date().toISOString(), provider: 'resend' })
          .eq('id', emailRecord.id);
      }
      toast.success('Email envoyé avec succès!');
      return { ...resendResult.data, provider: 'resend' };
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
    if (!user) throw new Error('User must be authenticated');

    setIsLoading(true);
    try {
      const result = await invokeNylas<{ success: boolean; message?: string }>('test', { accountId });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.message || 'Connection test failed');
      }

      toast.success('Connection test successful!');
      return result.data;
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
      const result = await invokeNylas<{ success: boolean; message?: string }>('test_imap', {
        config: { host: config.host, port: config.port ?? 993 }
      });
      if (result.data?.success) {
        toast.success('IMAP joignable');
      } else {
        toast.error(result.data?.message || 'IMAP non joignable');
      }
      return result.data;
    } finally {
      setIsLoading(false);
    }
  };

  const testSmtp = async (config: { host: string; port?: number }) => {
    if (!user) throw new Error('User must be authenticated');
    setIsLoading(true);
    try {
      const result = await invokeNylas<{ success: boolean; message?: string; connection_type?: string; host?: string; port?: number }>('test_smtp', {
        config: { 
          host: config.host, 
          port: config.port ?? 587,
          smtp_host: config.host,
          smtp_port: config.port ?? 587
        }
      });
      if (result.data?.success) {
        toast.success(`SMTP accessible via ${result.data.connection_type} sur ${result.data.host}:${result.data.port}`);
      } else {
        toast.error(result.data?.message || 'SMTP non joignable');
      }
      return result.data;
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async (accountId: string, testEmail: string) => {
    if (!user) throw new Error('User must be authenticated');
    setIsLoading(true);
    try {
      const result = await invokeNylas<{ success: boolean; message?: string }>('send_test_email', {
        accountId,
        testEmail
      });
      if (result.data?.success) {
        toast.success(`Email de test envoyé avec succès à ${testEmail}`);
      } else {
        toast.error(result.data?.message || 'Échec de l\'envoi du test');
      }
      return result.data;
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
