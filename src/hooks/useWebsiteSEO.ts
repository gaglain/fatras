import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

const getDefaultOgImage = () => {
  if (typeof window === 'undefined') return 'https://fatras.net/og-image.jpg';
  return `${window.location.origin}/og-image.jpg`;
};

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

      const existingOgFromHead =
        typeof document !== 'undefined'
          ? (document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content
          : undefined;

      const normalized = {
        ...(data || {}),
        og_image: (data || {}).og_image || existingOgFromHead || getDefaultOgImage(),
      } as SEOSettings;

      setSeoSettings(normalized);
    } catch (error) {
      logger.error('Erreur lors du chargement des paramètres SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSEOSettings = async (settings: SEOSettings) => {
    try {
      logger.debug('Sauvegarde SEO - Paramètres reçus:', settings);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Non authentifié');

      logger.debug('Utilisateur authentifié:', user.data.user.id);

      // Upload image to storage if it's a base64
      let ogImageUrl = settings.og_image;
      if (ogImageUrl && ogImageUrl.startsWith('data:image')) {
        logger.debug('Upload image OG en cours...');
        const base64Data = ogImageUrl.split(',')[1];
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const fileName = `og-image-${Date.now()}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('website-images')
          .upload(fileName, buffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          logger.error('Erreur upload image:', uploadError);
          throw uploadError;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('website-images')
          .getPublicUrl(fileName);
        
        ogImageUrl = publicUrl;
        logger.debug('Image OG uploadée:', ogImageUrl);
      }

      const settingsToSave = { ...settings, og_image: ogImageUrl };
      logger.debug('Paramètres à sauvegarder:', settingsToSave);

      const { data: existing, error: existingError } = await supabase
        .from('website_seo')
        .select('id')
        .maybeSingle();

      if (existingError) {
        logger.error('Erreur vérification existant:', existingError);
        throw existingError;
      }

      logger.debug('Enregistrement existant:', existing ? 'Oui' : 'Non');

      let result;
      if (existing) {
        logger.debug('Mise à jour de l\'enregistrement existant...');
        result = await supabase
          .from('website_seo')
          .update(settingsToSave)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        logger.debug('Création d\'un nouvel enregistrement...');
        result = await supabase
          .from('website_seo')
          .insert([{ ...settingsToSave, user_id: user.data.user.id }])
          .select()
          .single();
      }

      if (result.error) {
        logger.error('Erreur sauvegarde:', result.error);
        throw result.error;
      }

      logger.debug('SEO sauvegardé avec succès');
      
      setSeoSettings(result.data);
      
      // Appliquer les changements SEO immédiatement
      applySEOToDocument(result.data);
      
      return result.data;
    } catch (error) {
      logger.error('Erreur lors de la sauvegarde SEO:', error);
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
    const ogImageToApply = seo.og_image || getDefaultOgImage();
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', ogImageToApply);
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
