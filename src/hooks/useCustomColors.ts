
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCustomColors = () => {
  useEffect(() => {
    console.log('🎨 Initializing custom colors hook');
    
    const loadAndApplyColors = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) {
          console.log('🎨 No authenticated user, skipping color loading');
          return;
        }

        // Charger les préférences utilisateur depuis la base de données
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.user.id)
          .maybeSingle();

        if (error) {
          console.error('🎨 Error loading user profile:', error);
          return;
        }

        if (!profile) {
          console.log('🎨 No user profile found');
          return;
        }

        // Récupérer les couleurs personnalisées depuis localStorage avec fallback sur les valeurs par défaut
        const savedColors = localStorage.getItem('customColors');
        let colors = {
          primary: '#8B5CF6',
          secondary: '#3B82F6',
          accent: '#10B981',
          background: '#FFFFFF',
          text: '#18181B'
        };

        if (savedColors) {
          try {
            colors = { ...colors, ...JSON.parse(savedColors) };
            console.log('🎨 Loaded saved colors:', colors);
          } catch (e) {
            console.error('🎨 Error parsing saved colors:', e);
          }
        }

        // Appliquer les couleurs aux variables CSS
        const root = document.documentElement;
        
        // Couleurs principales
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--secondary', colors.secondary);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--app-background', colors.background);
        root.style.setProperty('--app-text', colors.text);

        // Convertir hex en HSL pour les variables Tailwind
        const hexToHsl = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);

          const rNorm = r / 255;
          const gNorm = g / 255;
          const bNorm = b / 255;

          const max = Math.max(rNorm, gNorm, bNorm);
          const min = Math.min(rNorm, gNorm, bNorm);
          let h = 0;
          let s = 0;
          const l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
              case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
              case gNorm: h = (bNorm - rNorm) / d + 2; break;
              case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
          }

          return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
        };

        // Appliquer les couleurs en format HSL pour Tailwind
        try {
          root.style.setProperty('--primary-hsl', hexToHsl(colors.primary));
          root.style.setProperty('--secondary-hsl', hexToHsl(colors.secondary));
          root.style.setProperty('--accent-hsl', hexToHsl(colors.accent));
          
          console.log('🎨 Colors applied successfully');
        } catch (e) {
          console.error('🎨 Error converting colors to HSL:', e);
        }

        // Forcer un re-render des éléments en triggant une classe CSS
        document.body.classList.remove('colors-updated');
        setTimeout(() => document.body.classList.add('colors-updated'), 10);

      } catch (error) {
        console.error('🎨 Error in loadAndApplyColors:', error);
      }
    };

    // Charger les couleurs immédiatement
    loadAndApplyColors();

    // Écouter les changements de couleurs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customColors') {
        console.log('🎨 Colors changed in localStorage, reloading...');
        loadAndApplyColors();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🎨 Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadAndApplyColors();
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      subscription.unsubscribe();
    };
  }, []);
};
