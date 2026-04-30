import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIndividualEmailTracking } from './useIndividualEmailTracking';
import { logger } from '@/lib/logger';
import { invokeEdgeFunction } from '@/lib/edgeFunctionClient';

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    name: string;
    url?: string;
    content?: string;
    contentType?: string;
    filename?: string;
  }>;
}

export const useEmailSender = () => {
  const [sending, setSending] = useState(false);
  const { injectEmailTracking } = useIndividualEmailTracking();

  const sendEmail = async (emailData: EmailData) => {
    let emailRecordId: string | null = null;
    setSending(true);
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Trouver le contact correspondant à l'email destinataire (peut renvoyer 0 ou n résultats)
      const { data: contactRows } = await supabase
        .from('contacts')
        .select('id')
        .ilike('email', emailData.to[0])
        .limit(1);
      const contact = contactRows && contactRows[0] ? contactRows[0] : null;

      // Créer un enregistrement email pour obtenir l'ID de tracking
      const { data: emailRecord, error: emailError } = await supabase
        .from('emails')
        .insert({
          user_id: user.id,
          to_email: emailData.to[0],
          subject: emailData.subject,
          content: emailData.html,
          html_content: emailData.html,
          direction: 'sent',
          status: 'sending',
          contact_id: contact?.id || null // Lier au contact si trouvé
        })
        .select()
        .single();

      if (emailError || !emailRecord) {
        throw new Error('Erreur lors de la création de l\'enregistrement email');
      }

      emailRecordId = emailRecord.id;

      // Injecter le pixel de tracking et les liens trackés
      const trackedHtml = injectEmailTracking(emailRecord.id, emailData.html);

      // Vérifier si config SMTP existe pour utiliser SMTP, sinon fallback sur Resend
      const { data: smtpConfig } = await supabase
        .from('app_settings')
        .select('setting_key')
        .eq('user_id', user.id)
        .eq('setting_key', 'smtp_host')
        .single();

      let result;
      let provider = 'resend';

      if (smtpConfig) {
        logger.debug('📧 Envoi via SMTP configuré');
        const smtpResult = await invokeEdgeFunction<{ success: boolean; error?: string }>({
          functionName: 'send-email-smtp',
          body: {
            to: emailData.to,
            subject: emailData.subject,
            html: trackedHtml,
            from: emailData.from,
            userId: user.id,
          }
        });
        
        if (!smtpResult.success || !smtpResult.data?.success) {
          logger.warn('⚠️ Échec SMTP, fallback sur Resend:', smtpResult.error);
          const resendResult = await invokeEdgeFunction<{ success: boolean; error?: string }>({
            functionName: 'send-email-resend',
            body: {
              to: emailData.to,
              subject: emailData.subject,
              html: trackedHtml,
              from: emailData.from,
              userId: user.id,
              attachments: emailData.attachments,
            }
          });

          if (!resendResult.success || !resendResult.data?.success) {
            throw new Error(resendResult.error || resendResult.data?.error || 'Échec de l\'envoi via Resend');
          }
          result = resendResult.data;
        } else {
          result = smtpResult.data;
          provider = 'smtp';
        }
      } else {
        logger.debug('📧 Envoi via Resend (pas de SMTP configuré)');
        const resendResult = await invokeEdgeFunction<{ success: boolean; error?: string }>({
          functionName: 'send-email-resend',
          body: {
            to: emailData.to,
            subject: emailData.subject,
            html: trackedHtml,
            from: emailData.from,
            userId: user.id,
            attachments: emailData.attachments,
          }
        });

        if (!resendResult.success || !resendResult.data?.success) {
          throw new Error(resendResult.error || resendResult.data?.error || 'Échec de l\'envoi via Resend');
        }
        result = resendResult.data;
      }

      // Mettre à jour le statut de l'email
      await supabase
        .from('emails')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          provider: provider
        })
        .eq('id', emailRecord.id);

      // Tracer aussi dans email_analytics pour l'historique unifié des contacts
      if (contact?.id) {
        try {
          await supabase.from('email_analytics').insert({
            user_id: user.id,
            contact_id: contact.id,
            event_type: 'sent',
            event_data: { email_id: emailRecord.id, subject: emailData.subject, provider, source: 'individual' }
          });
        } catch (e) { logger.warn('Analytics insert failed', e); }
      }

      return result;
    } catch (error: unknown) {
      logger.error('Error sending email:', error);

      if (emailRecordId) {
        await supabase
          .from('emails')
          .update({
            status: 'failed'
          })
          .eq('id', emailRecordId);
      }

      throw error;
    } finally {
      setSending(false);
    }
  };

  const sendUserWelcomeEmail = async (userEmail: string, userName: string, tempPassword: string) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bienvenue sur Fatras !</h1>
        <p>Bonjour ${userName},</p>
        <p>Votre compte a été créé avec succès. Voici vos informations de connexion :</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email :</strong> ${userEmail}</p>
          <p><strong>Mot de passe temporaire :</strong> ${tempPassword}</p>
        </div>
        <p style="color: #ff6600;"><strong>Important :</strong> Veuillez changer votre mot de passe lors de votre première connexion.</p>
        <p>Connectez-vous dès maintenant pour accéder à votre espace de travail.</p>
        <p>Cordialement,<br>L'équipe Fatras</p>
      </div>
    `;

    try {
      await sendEmail({
        to: [userEmail],
        subject: 'Bienvenue sur Fatras - Vos informations de connexion',
        html
      });
      logger.debug('✅ Email de bienvenue envoyé et enregistré');
    } catch (error: unknown) {
      logger.error('❌ Erreur envoi email de bienvenue:', error);
      throw error;
    }
  };

  const sendTaskAssignmentEmail = async (
    assigneeEmail: string, 
    assigneeName: string, 
    taskTitle: string, 
    assignedBy: string,
    dueDate?: string
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Nouvelle tâche assignée</h1>
        <p>Bonjour ${assigneeName},</p>
        <p>Une nouvelle tâche vous a été assignée par ${assignedBy} :</p>
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
          <h3 style="margin: 0 0 10px 0; color: #3B82F6;">${taskTitle}</h3>
          ${dueDate ? `<p><strong>Date d'échéance :</strong> ${new Date(dueDate).toLocaleDateString('fr-FR')}</p>` : ''}
        </div>
        <p>Connectez-vous à Fatras pour voir tous les détails de cette tâche.</p>
        <p>Cordialement,<br>L'équipe Fatras</p>
      </div>
    `;

    return sendEmail({
      to: [assigneeEmail],
      subject: `Nouvelle tâche assignée : ${taskTitle}`,
      html
    });
  };

  return {
    sendEmail,
    sendUserWelcomeEmail,
    sendTaskAssignmentEmail,
    sending
  };
};