import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  template_id?: string;
  recipient_count: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  open_rate: number;
  click_rate: number;
  scheduled_at?: string;
  scheduled_for?: string;
  auto_send?: boolean;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  content: string;
  variables: any;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

interface Email {
  id: string;
  from_email: string;
  to_email: string;
  cc_email?: string;
  subject: string;
  content: string;
  html_content?: string;
  status: string;
  scheduled_at?: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  is_read: boolean;
  is_starred: boolean;
  attachments: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useEmailCampaigns = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campagnes d'email
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);

  // Charger les campagnes
  const fetchCampaigns = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des campagnes:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les templates
  const fetchTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .or(`user_id.eq.${user.id},is_system.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des templates:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  // Charger les emails
  const fetchEmails = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des emails:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  // Créer une campagne
  const createCampaign = async (campaignData: Partial<EmailCampaign> & { name: string; subject: string; content: string }) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignData.name,
          subject: campaignData.subject,
          content: campaignData.content,
          template_id: campaignData.template_id,
          user_id: user.id,
          status: 'draft',
          artist_id: (campaignData as any).artist_id || null,
          event_id: (campaignData as any).event_id || null
        })
        .select()
        .single();

      if (error) throw error;
      
      setCampaigns(prev => [data as EmailCampaign, ...prev]);
      return data;
    } catch (err) {
      console.error('Erreur lors de la création de la campagne:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une campagne
  const updateCampaign = async (id: string, updates: Partial<EmailCampaign>) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setCampaigns(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la campagne:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une campagne
  const deleteCampaign = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression de la campagne:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Créer un template
  const createTemplate = async (templateData: Partial<EmailTemplate> & { name: string; category: string; subject: string; content: string }) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: templateData.name,
          category: templateData.category,
          subject: templateData.subject,
          content: templateData.content,
          variables: templateData.variables || [],
          user_id: user.id,
          is_system: false
        })
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data as EmailTemplate, ...prev]);
      return data;
    } catch (err) {
      console.error('Erreur lors de la création du template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Créer un email
  const createEmail = async (emailData: Partial<Email> & { from_email: string; to_email: string; subject: string; content: string }) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emails')
        .insert({
          from_email: emailData.from_email,
          to_email: emailData.to_email,
          subject: emailData.subject,
          content: emailData.content,
          cc_email: emailData.cc_email,
          html_content: emailData.html_content,
          user_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      
      setEmails(prev => [data as Email, ...prev]);
      return data;
    } catch (err) {
      console.error('Erreur lors de la création de l\'email:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Marquer un email comme lu
  const markEmailAsRead = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setEmails(prev => prev.map(e => e.id === id ? { ...e, is_read: true } : e));
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
      throw err;
    }
  };

  // Basculer le statut étoilé d'un email
  const toggleEmailStarred = async (id: string) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    try {
      const email = emails.find(e => e.id === id);
      if (!email) return;

      const { error } = await supabase
        .from('emails')
        .update({ is_starred: !email.is_starred })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setEmails(prev => prev.map(e => 
        e.id === id ? { ...e, is_starred: !e.is_starred } : e
      ));
    } catch (err) {
      console.error('Erreur lors du basculement étoilé:', err);
      throw err;
    }
  };

  // Charger les données au montage
  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchTemplates();
      fetchEmails();
    }
  }, [user]);

  return {
    // État
    campaigns,
    templates,
    emails,
    loading,
    error,
    
    // Actions campagnes
    createCampaign,
    updateCampaign,
    deleteCampaign,
    fetchCampaigns,
    
    // Actions templates
    createTemplate,
    fetchTemplates,
    
    // Actions emails
    createEmail,
    markEmailAsRead,
    toggleEmailStarred,
    fetchEmails,
    
    // Utilitaires
    setError
  };
};