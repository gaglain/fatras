
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOSettings {
  id?: string;
  site_title?: string;
  site_description?: string;
  site_keywords?: string;
  og_image?: string;
  twitter_card_type?: string;
  google_analytics_id?: string;
  google_search_console_id?: string;
  robots_txt?: string;
}

export const useWebsiteSEO = () => {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({});
  const [loading, setLoading] = useState(true);

  const loadSEOSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('website_seo')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setSeoSettings(data || {});
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSEOSettings = async (settings: SEOSettings) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Non authentifié');

      const { data: existing } = await supabase
        .from('website_seo')
        .select('id')
        .single();

      let result;
      if (existing) {
        result = await supabase
          .from('website_seo')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('website_seo')
          .insert([{ ...settings, user_id: user.data.user.id }])
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setSeoSettings(result.data);
      
      // Appliquer les changements SEO immédiatement
      applySEOToDocument(result.data);
      
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde SEO:', error);
      throw error;
    }
  };

  const applySEOToDocument = (seo: SEOSettings) => {
    if (seo.site_title) {
      document.title = seo.site_title;
    }

    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', seo.site_description || '');

    // Meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seo.site_keywords || '');

    // Open Graph
    if (seo.og_image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', seo.og_image);
    }
  };

  useEffect(() => {
    loadSEOSettings();
  }, []);

  useEffect(() => {
    if (seoSettings.site_title) {
      applySEOToDocument(seoSettings);
    }
  }, [seoSettings]);

  return {
    seoSettings,
    loading,
    saveSEOSettings,
    refreshSEO: loadSEOSettings
  };
};
