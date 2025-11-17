import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WebsiteDesign {
  id?: string;
  user_id?: string;
  logo: string;
  site_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  header_bg: string;
  footer_bg: string;
  text_color: string;
  link_color: string;
  created_at?: string;
  updated_at?: string;
}

const defaultDesign: WebsiteDesign = {
  logo: '/logo.svg',
  site_name: 'MusiConnect',
  primary_color: '#1632f4',
  secondary_color: '#ec5f65',
  accent_color: '#f19e9c',
  header_bg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  footer_bg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  text_color: '#ffffff',
  link_color: '#60a5fa'
};

export const useWebsiteDesign = () => {
  const { user } = useAuthContext();
  const [design, setDesign] = useState<WebsiteDesign>(defaultDesign);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchDesign = async () => {
    if (!user) {
      setDesign(defaultDesign);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('website_designs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDesign({
          ...data,
          logo: data.logo || defaultDesign.logo,
          site_name: data.site_name,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          header_bg: data.header_bg,
          footer_bg: data.footer_bg,
          text_color: data.text_color,
          link_color: data.link_color
        });
      } else {
        setDesign(defaultDesign);
      }
    } catch (error) {
      console.error('Error fetching website design:', error);
      setDesign(defaultDesign);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesign();
  }, [user]);

  const updateDesign = (field: keyof WebsiteDesign, value: string) => {
    setDesign(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const saveDesign = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour sauvegarder le design');
      return false;
    }

    setSaving(true);
    try {
      const designData = {
        user_id: user.id,
        logo: design.logo,
        site_name: design.site_name,
        primary_color: design.primary_color,
        secondary_color: design.secondary_color,
        accent_color: design.accent_color,
        header_bg: design.header_bg,
        footer_bg: design.footer_bg,
        text_color: design.text_color,
        link_color: design.link_color
      };

      const { error } = await supabase
        .from('website_designs')
        .upsert([designData], {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Mettre à jour le titre immédiatement
      document.title = design.site_name;

      // Déclencher l'événement de synchronisation
      const event = new CustomEvent('siteConfigChanged', { 
        detail: design 
      });
      window.dispatchEvent(event);

      toast.success(`Design sauvegardé ! Site: "${design.site_name}"`);
      return true;
    } catch (error) {
      console.error('Error saving website design:', error);
      toast.error('Erreur lors de la sauvegarde du design');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetDesign = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('website_designs')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setDesign(defaultDesign);
      document.title = defaultDesign.site_name;
      
      const event = new CustomEvent('siteConfigChanged', { 
        detail: defaultDesign 
      });
      window.dispatchEvent(event);
      
      toast.success('Design réinitialisé');
      return true;
    } catch (error) {
      console.error('Error resetting website design:', error);
      toast.error('Erreur lors de la réinitialisation');
      return false;
    }
  };

  return {
    design,
    loading,
    saving,
    updateDesign,
    saveDesign,
    resetDesign,
    refetch: fetchDesign
  };
};