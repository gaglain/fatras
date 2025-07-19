import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export const useEmailSender = () => {
  const [sending, setSending] = useState(false);

  const sendEmail = async (emailData: EmailData) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
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

    return sendEmail({
      to: [userEmail],
      subject: 'Bienvenue sur Fatras - Vos informations de connexion',
      html
    });
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