import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { invokeEdgeFunction } from '@/lib/edgeFunctionClient';

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface EmailProvider {
  id: string;
  name: string;
  isActive: boolean;
  priority: number;
}

export const useEmailSystem = () => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [providers, setProviders] = useState<EmailProvider[]>([]);

  const getActiveProviders = async (): Promise<EmailProvider[]> => {
    if (!user) return [];

    try {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', user.id)
        .like('setting_key', 'email_%_active')
        .eq('setting_value', 'true');

      const activeProviders: EmailProvider[] = [];
      
      if (settings?.some(s => s.setting_key === 'email_ovh_active')) {
        activeProviders.push({ id: 'ovh', name: 'OVH SMTP', isActive: true, priority: 1 });
      }
      if (settings?.some(s => s.setting_key === 'email_resend_active')) {
        activeProviders.push({ id: 'resend', name: 'Resend', isActive: true, priority: 2 });
      }
      if (settings?.some(s => s.setting_key === 'email_gmail_active')) {
        activeProviders.push({ id: 'gmail', name: 'Gmail', isActive: true, priority: 3 });
      }

      return activeProviders.sort((a, b) => a.priority - b.priority);
    } catch (error: unknown) {
      logger.error('Erreur lors de la récupération des fournisseurs:', error);
      return [];
    }
  };

  const sendEmail = async (
    message: EmailMessage, 
    preferredProvider?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    setSending(true);
    
    try {
      const activeProviders = await getActiveProviders();
      
      if (activeProviders.length === 0) {
        throw new Error('Aucun fournisseur d\'email configuré');
      }

      let selectedProvider = activeProviders[0];
      if (preferredProvider) {
        const preferred = activeProviders.find(p => p.id === preferredProvider);
        if (preferred) selectedProvider = preferred;
      }

      logger.debug('Envoi email via:', selectedProvider.name);

      const emailData = { ...message, userId: user.id };

      let functionName = 'send-email';
      if (selectedProvider.id === 'ovh') functionName = 'send-email-ovh';
      else if (selectedProvider.id === 'resend') functionName = 'send-email-resend';

      const result = await invokeEdgeFunction<{ success: boolean; id?: string; error?: string }>({
        functionName,
        body: emailData,
      });

      if (!result.success || !result.data?.success) {
        throw new Error(result.error || result.data?.error || 'Erreur lors de l\'envoi');
      }

      await saveEmailToDatabase(message, selectedProvider.id, result.data.id);

      toast.success(`Email envoyé avec succès via ${selectedProvider.name}`);
      return { success: true, messageId: result.data.id };
    } catch (error: unknown) {
      logger.error('Erreur lors de l\'envoi:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur lors de l'envoi: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setSending(false);
    }
  };

  const sendViaProvider = async (
    message: EmailMessage,
    providerId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> => {
    return sendEmail(message, providerId);
  };

  const saveEmailToDatabase = async (
    message: EmailMessage,
    provider: string,
    messageId?: string
  ) => {
    try {
      const emailRecord = {
        user_id: user?.id,
        from_email: `noreply@${provider === 'ovh' ? 'votre-domaine.com' : 'resend.dev'}`,
        to_email: message.to.join(', '),
        cc_email: message.cc?.join(', ') || null,
        subject: message.subject,
        content: message.text || '',
        html_content: message.html,
        status: 'sent',
        metadata: { provider, messageId, fromName: message.fromName, replyTo: message.replyTo }
      };

      await supabase.from('emails').insert([emailRecord]);
    } catch (error: unknown) {
      logger.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const getEmailHistory = async (limit = 50) => {
    if (!user) return [];

    try {
      const { data: emails, error } = await supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return emails || [];
    } catch (error: unknown) {
      logger.error('Erreur lors de la récupération des emails:', error);
      return [];
    }
  };

  const testProvider = async (providerId: string): Promise<boolean> => {
    if (!user?.email) return false;

    const testMessage: EmailMessage = {
      to: [user.email],
      subject: `Test ${providerId.toUpperCase()} - ${new Date().toLocaleString()}`,
      html: `
        <h2>Test de configuration email</h2>
        <p>Bonjour,</p>
        <p>Ceci est un email de test pour vérifier la configuration de votre fournisseur <strong>${providerId.toUpperCase()}</strong>.</p>
        <p>Si vous recevez cet email, la configuration fonctionne correctement !</p>
        <hr>
        <p><small>Envoyé le ${new Date().toLocaleString()}</small></p>
      `,
      fromName: 'Test Email System'
    };

    const result = await sendViaProvider(testMessage, providerId);
    return result.success;
  };

  return {
    sending,
    providers,
    sendEmail,
    sendViaProvider,
    getActiveProviders,
    getEmailHistory,
    testProvider
  };
};
