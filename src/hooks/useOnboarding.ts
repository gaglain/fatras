import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/UnifiedAuthContext';
import { logger } from '@/lib/logger';

export const useOnboarding = () => {
  const { user } = useAuthContext();
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed_at')
          .eq('id', user.id)
          .maybeSingle();
        if (error) throw error;
        if (!cancelled) setCompleted(!!data?.onboarding_completed_at);
      } catch (e) {
        logger.error('useOnboarding load error', e);
        if (!cancelled) setCompleted(true); // fail-safe: don't loop the tour
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const markCompleted = useCallback(async () => {
    if (!user?.id) return;
    setCompleted(true);
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', user.id);
    } catch (e) {
      logger.error('useOnboarding mark error', e);
    }
  }, [user?.id]);

  const resetCompleted = useCallback(async () => {
    if (!user?.id) return;
    setCompleted(false);
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed_at: null })
        .eq('id', user.id);
    } catch (e) {
      logger.error('useOnboarding reset error', e);
    }
  }, [user?.id]);

  return { completed, loading, markCompleted, resetCompleted };
};
